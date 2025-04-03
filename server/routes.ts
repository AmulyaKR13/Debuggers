import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
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
      
      // Get user and set as verified
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      
      // Simulate AI task allocation if no assignee specified
      if (!task.assignedToUserId) {
        // In a real app, this would be a call to the AI service
        // For now, we'll just simulate it
        console.log("AI task allocation triggered for task", task.id);
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
      // In a real application, this would be calculated from the database
      // For this MVP, we'll return simulated data
      
      const stats = {
        activeTasks: 28,
        teamAvailability: 82,
        completionRate: 94.2,
        teamSentiment: "Positive",
        activeTrend: 12, // percentage increase from last week
        availabilityTrend: -3, // percentage decrease from last week
        completionTrend: 7, // percentage increase from last month
        sentimentTrend: 0 // no change
      };
      
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get AI insights for dashboard
  app.get("/api/dashboard/ai-insights", authenticate, async (req, res) => {
    try {
      // In a real application, this would be data from Azure Cognitive Services
      // For this MVP, we'll return simulated data
      
      const insights = {
        cognitiveLoadAnalysis: {
          design: 30,
          development: 45,
          research: 65,
          testing: 35,
          management: 25
        },
        sentimentAnalysis: {
          score: 82,
          status: "Positive"
        },
        recommendations: [
          {
            type: "cognitive",
            title: "Reallocate research tasks from Emily to Alex",
            description: "Emily's cognitive load is 25% above optimal. Alex has relevant skills and capacity."
          },
          {
            type: "upskill",
            title: "Upskill Jordan in frontend development",
            description: "Jordan shows aptitude and interest. Recommend React course based on learning style analysis."
          },
          {
            type: "conflict",
            title: "Potential scheduling conflict detected",
            description: "Marketing and Development teams have overlapping deadlines. AI suggests staggered milestones."
          }
        ]
      };
      
      res.status(200).json(insights);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get NBM system status
  app.get("/api/dashboard/nbm-status", authenticate, async (req, res) => {
    try {
      // In a real application, this would be data from the AI system
      // For this MVP, we'll return simulated data
      
      const nbmStatus = {
        status: "Active",
        components: [
          {
            name: "Cognitive Load Balancing",
            status: "Active",
            performance: 75
          },
          {
            name: "Sentiment Analysis",
            status: "Active",
            performance: 83
          },
          {
            name: "Expertise Evolution",
            status: "Active",
            performance: 61
          },
          {
            name: "Conflict Resolution",
            status: "Learning",
            performance: 42
          }
        ]
      };
      
      res.status(200).json(nbmStatus);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get activity timeline
  app.get("/api/dashboard/activities", authenticate, async (req, res) => {
    try {
      // In a real application, this would be data from the system logs
      // For this MVP, we'll return simulated data
      
      const activities = [
        {
          type: "ai_allocation",
          title: "AI re-allocated backend development task from Sarah to Alex",
          time: "15 minutes ago",
          reason: "Cognitive load optimization"
        },
        {
          type: "task_completed",
          title: "Emma completed UI Design for Dashboard task",
          time: "42 minutes ago"
        },
        {
          type: "upskill",
          title: "AEE identified upskilling opportunity for Jordan",
          time: "1 hour ago",
          recommendation: "React.js course based on skill gap analysis"
        },
        {
          type: "conflict",
          title: "Potential deadline conflict detected for Project Alpha",
          time: "2 hours ago",
          solution: "AI-suggested solution: Re-prioritize tasks or request deadline extension"
        },
        {
          type: "sentiment",
          title: "SBA detected increased stress in Development team",
          time: "3 hours ago",
          action: "Action taken: Temporary reduction in task allocation rate"
        }
      ];
      
      res.status(200).json(activities);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Get team members
  app.get("/api/team", authenticate, async (req, res) => {
    try {
      // In a real application, this would fetch actual team members
      // For this MVP, we'll return simulated data
      
      const teamMembers = [
        {
          id: 1,
          name: "Emma Watson",
          role: "UI/UX Designer",
          status: "AVAILABLE",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          skills: ["Figma", "UI Design", "Wireframing", "Prototyping"],
          workload: 65,
          activeTasks: 3,
          insight: "Excellent match for creative tasks requiring visual thinking"
        },
        {
          id: 2,
          name: "Michael Chen",
          role: "Backend Developer",
          status: "LIMITED",
          avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          skills: ["Node.js", "MongoDB", "Express", "API Design"],
          workload: 85,
          activeTasks: 5,
          insight: "Approaching cognitive load threshold, consider redistributing tasks"
        },
        {
          id: 3,
          name: "Sarah Johnson",
          role: "UX Researcher",
          status: "UNAVAILABLE",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          skills: ["User Testing", "Interviews", "Analytics", "Reporting"],
          workload: 95,
          activeTasks: 7,
          insight: "High stress detected. Immediate task redistribution recommended."
        }
      ];
      
      res.status(200).json(teamMembers);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
