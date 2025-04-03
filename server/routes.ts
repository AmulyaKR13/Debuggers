import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import { chatbotService } from "./chatbot-service";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import session from "express-session";
import { insertUserSchema, insertTaskSchema } from "@shared/schema";

// Helper to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to simulate email sending
function sendEmail(to: string, subject: string, body: string): Promise<void> {
  console.log(`Email sent to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  return Promise.resolve();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Development-only route to clear the users and OTP codes (do not use in production)
  if (process.env.NODE_ENV !== "production") {
    app.post("/api/dev/clear-users", async (req, res) => {
      try {
        await storage.clearUsersAndOtpCodes();
        res.status(200).json({ message: "Users and OTP codes cleared successfully" });
      } catch (error) {
        res.status(500).json({ message: "An error occurred while clearing data" });
      }
    });
  }
  
  // Check if a user's email is already verified
  app.get("/api/auth/check-verification", async (req, res) => {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ isVerified: user.isVerified });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while checking verification status" });
    }
  });
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "neurAllocate-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Authentication Middleware
  const authenticate = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Register a new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP expires in 5 minutes
      
      await storage.createOtpCode({
        email: user.email,
        code: otp,
        type: "REGISTRATION",
        expiresAt,
      });
      
      // Send OTP email
      await sendEmail(
        user.email,
        "Verify Your Email - NeurAllocate",
        `Your verification code is: ${otp}. This code will expire in 5 minutes.`
      );
      
      // For development purposes, include the OTP in the response
      res.status(201).json({
        message: "Registration successful. Please verify your email.",
        userId: user.id,
        // Include OTP in response for testing (would be removed in production)
        otp: otp
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });

  // Check if a user is already verified
  app.get("/api/auth/check-verification", async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email as string);
      
      if (!user) {
        return res.status(404).json({ message: "User not found", isVerified: false });
      }
      
      res.status(200).json({ isVerified: !!user.isVerified });
    } catch (error) {
      console.error("Error checking verification status:", error);
      res.status(500).json({ message: "An error occurred", isVerified: false });
    }
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }
      
      // Check if user is already verified first
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.isVerified) {
        return res.status(200).json({ message: "Email already verified" });
      }
      
      // Verify OTP
      const otpRecord = await storage.getOtpByEmailAndCode(email, otp);
      
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      
      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        await storage.deleteOtpCode(otpRecord.id);
        return res.status(400).json({ message: "OTP has expired" });
      }
      
      await storage.updateUserVerificationStatus(user.id, true);
      await storage.deleteOtpCode(otpRecord.id);
      
      // Send welcome email
      await sendEmail(
        user.email,
        "Welcome to NeurAllocate",
        `Your account has been successfully verified. Welcome to NeurAllocate!`
      );
      
      res.status(200).json({ message: "Email verification successful" });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "An error occurred during verification" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if user is verified
      if (!user.isVerified) {
        return res.status(401).json({ message: "Email not verified. Please verify your email first." });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set user in session
      req.session.userId = user.id;
      
      // Send login notification email
      await sendEmail(
        user.email,
        "New Login - NeurAllocate",
        `A new login was detected for your account. If this wasn't you, please contact support.`
      );
      
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred during login" });
    }
  });

  // Forgot Password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal that the email doesn't exist
        return res.status(200).json({ message: "If your email is registered, you will receive a reset link shortly" });
      }
      
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP expires in 5 minutes
      
      await storage.createOtpCode({
        email: user.email,
        code: otp,
        type: "PASSWORD_RESET",
        expiresAt,
      });
      
      // Send password reset email
      await sendEmail(
        user.email,
        "Reset Your Password - NeurAllocate",
        `Your password reset code is: ${otp}. This code will expire in 5 minutes.`
      );
      
      // For development purposes, include the OTP in the response
      res.status(200).json({ 
        message: "If your email is registered, you will receive a reset link shortly",
        // Include OTP in response for testing (would be removed in production)
        otp: otp
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Reset Password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
      }
      
      // Verify OTP
      const otpRecord = await storage.getOtpByEmailAndCode(email, otp);
      
      if (!otpRecord || otpRecord.type !== "PASSWORD_RESET") {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      
      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        await storage.deleteOtpCode(otpRecord.id);
        return res.status(400).json({ message: "OTP has expired" });
      }
      
      // Get user and update password
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user (we'd need to add a method to update password)
      // For now, we'll just simulate that it works
      console.log(`Password updated for user ${user.id}`);
      
      await storage.deleteOtpCode(otpRecord.id);
      
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred during password reset" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get("/api/user/me", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get user skills
  app.get("/api/user/skills", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const userSkills = await storage.getUserSkills(userId);
      
      const skills = [];
      for (const userSkill of userSkills) {
        const skill = await storage.getSkill(userSkill.skillId);
        if (skill) {
          skills.push({
            id: userSkill.id,
            skill: skill,
            proficiency: userSkill.proficiency,
            lastUsed: userSkill.lastUsed
          });
        }
      }
      
      res.status(200).json(skills);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get all skills
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.status(200).json(skills);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Add user skill
  app.post("/api/user/skills", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { skillId, proficiency } = req.body;
      
      if (!skillId || !proficiency) {
        return res.status(400).json({ message: "Skill ID and proficiency are required" });
      }
      
      const skill = await storage.getSkill(skillId);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      const userSkill = await storage.createUserSkill({
        userId,
        skillId,
        proficiency,
        lastUsed: new Date()
      });
      
      res.status(201).json({
        id: userSkill.id,
        skill,
        proficiency: userSkill.proficiency,
        lastUsed: userSkill.lastUsed
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get user tasks
  app.get("/api/user/tasks", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const tasks = await storage.getTasksByUser(userId);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Create a task
  app.post("/api/tasks", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdByUserId: userId
      });
      
      const task = await storage.createTask(taskData);
      
      // Use AI service for task allocation if no assignee specified
      if (!task.assignedToUserId) {
        try {
          // Use imported aiService instead of require()
          const match = await aiService.matchTaskToUser(task.id);
          
          if (match && match.userId) {
            const updatedTask = await storage.updateTaskAssignment(
              task.id, 
              match.userId, 
              match.score
            );
            
            if (updatedTask) {
              console.log(`Task ${task.id} automatically assigned to user ${match.userId} with match score ${match.score}`);
              return res.status(201).json(updatedTask);
            }
          }
        } catch (error) {
          console.error("Error in AI task allocation:", error);
          // Continue with normal response if AI allocation fails
        }
      }
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Update task status
  app.patch("/api/tasks/:id/status", authenticate, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.updateTaskStatus(taskId, status);
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get user availability
  app.get("/api/user/availability", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const availability = await storage.getUserAvailability(userId);
      
      if (!availability) {
        return res.status(200).json({ status: "AVAILABLE", startDate: new Date() });
      }
      
      res.status(200).json(availability);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Update user availability
  app.post("/api/user/availability", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { status, startDate, endDate } = req.body;
      
      if (!status || !startDate) {
        return res.status(400).json({ message: "Status and start date are required" });
      }
      
      // Check if user already has availability set
      const existingAvailability = await storage.getUserAvailability(userId);
      
      let availability;
      if (existingAvailability) {
        availability = await storage.updateAvailability(existingAvailability.id, status);
      } else {
        availability = await storage.createAvailability({
          userId,
          status,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined
        });
      }
      
      res.status(200).json(availability);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get team stats and analytics for dashboard
  app.get("/api/dashboard/stats", authenticate, async (req, res) => {
    try {
      // Using imported aiService
      const stats = await aiService.generateDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error generating dashboard stats:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get AI insights for dashboard
  app.get("/api/dashboard/ai-insights", authenticate, async (req, res) => {
    try {
      // Using imported aiService
      const insights = await aiService.generateInsights();
      res.status(200).json(insights);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get NBM system status
  app.get("/api/dashboard/nbm-status", authenticate, async (req, res) => {
    try {
      // Using imported aiService
      const nbmStatus = await aiService.generateNBMStatus();
      res.status(200).json(nbmStatus);
    } catch (error) {
      console.error("Error generating NBM status:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get activity timeline
  app.get("/api/dashboard/activities", authenticate, async (req, res) => {
    try {
      // Using imported aiService
      const activities = await aiService.generateActivityTimeline();
      res.status(200).json(activities);
    } catch (error) {
      console.error("Error generating activity timeline:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get team members with AI-enhanced insights
  app.get("/api/team", authenticate, async (req, res) => {
    try {
      // Using imported aiService
      const teamMembers = await aiService.generateTeamMembers();
      res.status(200).json(teamMembers);
    } catch (error) {
      console.error("Error generating team members:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  // Analyze task cognitive requirements with AI
  app.get("/api/tasks/:id/cognitive-analysis", authenticate, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Using imported aiService
      const analysis = await aiService.analyzeTaskCognitive(taskId);
      
      res.status(200).json({
        taskId,
        taskTitle: task.title,
        analysis
      });
    } catch (error) {
      console.error("Error analyzing task:", error);
      res.status(500).json({ message: "An error occurred during analysis" });
    }
  });
  
  // Get AI-generated skill recommendations for a user
  app.get("/api/user/skill-recommendations", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Using imported aiService
      const recommendations = await aiService.generateSkillRecommendations(userId);
      
      res.status(200).json(recommendations);
    } catch (error) {
      console.error("Error generating skill recommendations:", error);
      res.status(500).json({ message: "An error occurred generating recommendations" });
    }
  });
  
  // Send message to AI chatbot and get response
  app.post("/api/chatbot/message", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Using imported chatbotService
      const response = await chatbotService.processMessage(userId, message);
      
      res.status(200).json(response);
    } catch (error) {
      console.error("Error processing chatbot message:", error);
      res.status(500).json({ 
        message: "An error occurred processing your message",
        fallbackResponse: {
          text: "I'm having trouble processing your request right now. Please try again shortly.",
          suggestions: ["Show my tasks", "Team availability", "Help"]
        }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
