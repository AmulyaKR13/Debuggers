import { 
  users, 
  tasks, 
  skills, 
  userSkills, 
  availabilities,
  otpCodes,
  userAnalytics,
  type User, 
  type InsertUser,
  type Task,
  type InsertTask,
  type Skill,
  type InsertSkill,
  type UserSkill,
  type InsertUserSkill,
  type Availability,
  type InsertAvailability,
  type OtpCode,
  type InsertOtpCode,
  type UserAnalytic,
  type InsertUserAnalytic
} from "@shared/schema";
import crypto from 'crypto';

// IStorage interface for our application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerificationStatus(id: number, isVerified: boolean): Promise<User | undefined>;
  
  // OTP operations
  createOtpCode(otpData: InsertOtpCode): Promise<OtpCode>;
  getOtpByEmailAndCode(email: string, code: string): Promise<OtpCode | undefined>;
  deleteOtpCode(id: number): Promise<void>;
  
  // Skill operations
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  
  // UserSkill operations
  getUserSkills(userId: number): Promise<UserSkill[]>;
  createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  updateUserSkill(id: number, proficiency: number): Promise<UserSkill | undefined>;
  
  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUser(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(id: number, status: string): Promise<Task | undefined>;
  updateTaskAssignment(id: number, userId: number, aiMatchScore: number): Promise<Task | undefined>;
  
  // Availability operations
  getUserAvailability(userId: number): Promise<Availability | undefined>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, status: string): Promise<Availability | undefined>;
  
  // UserAnalytics operations
  getUserAnalytics(userId: number): Promise<UserAnalytic[]>;
  createUserAnalytics(analytics: InsertUserAnalytic): Promise<UserAnalytic>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private otpCodes: Map<number, OtpCode>;
  private skills: Map<number, Skill>;
  private userSkills: Map<number, UserSkill>;
  private tasks: Map<number, Task>;
  private availabilities: Map<number, Availability>;
  private userAnalytics: Map<number, UserAnalytic>;
  
  private currentUserId: number;
  private currentOtpId: number;
  private currentSkillId: number;
  private currentUserSkillId: number;
  private currentTaskId: number;
  private currentAvailabilityId: number;
  private currentUserAnalyticsId: number;

  constructor() {
    this.users = new Map();
    this.otpCodes = new Map();
    this.skills = new Map();
    this.userSkills = new Map();
    this.tasks = new Map();
    this.availabilities = new Map();
    this.userAnalytics = new Map();
    
    this.currentUserId = 1;
    this.currentOtpId = 1;
    this.currentSkillId = 1;
    this.currentUserSkillId = 1;
    this.currentTaskId = 1;
    this.currentAvailabilityId = 1;
    this.currentUserAnalyticsId = 1;
    
    this.seedData();
  }

  // Seed some initial data
  private seedData() {
    // Add skills
    const skillsData: InsertSkill[] = [
      { name: 'JavaScript', category: 'TECHNICAL' },
      { name: 'React', category: 'TECHNICAL' },
      { name: 'Node.js', category: 'TECHNICAL' },
      { name: 'UI Design', category: 'TECHNICAL' },
      { name: 'UX Research', category: 'TECHNICAL' },
      { name: 'Project Management', category: 'SOFT' },
      { name: 'Communication', category: 'SOFT' },
      { name: 'Problem Solving', category: 'SOFT' }
    ];
    
    skillsData.forEach(skill => this.createSkill(skill));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { 
      ...user, 
      id,
      isVerified: false,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserVerificationStatus(id: number, isVerified: boolean): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, isVerified };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // OTP methods
  async createOtpCode(otpData: InsertOtpCode): Promise<OtpCode> {
    const id = this.currentOtpId++;
    const newOtp: OtpCode = { 
      ...otpData, 
      id,
      createdAt: new Date() 
    };
    this.otpCodes.set(id, newOtp);
    return newOtp;
  }

  async getOtpByEmailAndCode(email: string, code: string): Promise<OtpCode | undefined> {
    return Array.from(this.otpCodes.values()).find(
      (otp) => otp.email.toLowerCase() === email.toLowerCase() && otp.code === code,
    );
  }

  async deleteOtpCode(id: number): Promise<void> {
    this.otpCodes.delete(id);
  }
  
  // Skill methods
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.currentSkillId++;
    const newSkill: Skill = { ...skill, id };
    this.skills.set(id, newSkill);
    return newSkill;
  }
  
  // UserSkill methods
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return Array.from(this.userSkills.values()).filter(
      (userSkill) => userSkill.userId === userId,
    );
  }

  async createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    const id = this.currentUserSkillId++;
    const newUserSkill: UserSkill = { 
      ...userSkill, 
      id, 
      updatedAt: new Date() 
    };
    this.userSkills.set(id, newUserSkill);
    return newUserSkill;
  }

  async updateUserSkill(id: number, proficiency: number): Promise<UserSkill | undefined> {
    const userSkill = this.userSkills.get(id);
    if (!userSkill) return undefined;
    
    const updatedUserSkill: UserSkill = { 
      ...userSkill, 
      proficiency, 
      updatedAt: new Date() 
    };
    this.userSkills.set(id, updatedUserSkill);
    return updatedUserSkill;
  }
  
  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedToUserId === userId || task.createdByUserId === userId,
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const newTask: Task = { 
      ...task, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTaskStatus(id: number, status: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { 
      ...task, 
      status, 
      updatedAt: new Date() 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateTaskAssignment(id: number, userId: number, aiMatchScore: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { 
      ...task, 
      assignedToUserId: userId,
      aiMatchScore,
      updatedAt: new Date() 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  // Availability methods
  async getUserAvailability(userId: number): Promise<Availability | undefined> {
    return Array.from(this.availabilities.values()).find(
      (availability) => availability.userId === userId,
    );
  }

  async createAvailability(availability: InsertAvailability): Promise<Availability> {
    const id = this.currentAvailabilityId++;
    const newAvailability: Availability = { 
      ...availability, 
      id, 
      createdAt: new Date() 
    };
    this.availabilities.set(id, newAvailability);
    return newAvailability;
  }

  async updateAvailability(id: number, status: string): Promise<Availability | undefined> {
    const availability = this.availabilities.get(id);
    if (!availability) return undefined;
    
    const updatedAvailability: Availability = { 
      ...availability, 
      status 
    };
    this.availabilities.set(id, updatedAvailability);
    return updatedAvailability;
  }
  
  // UserAnalytics methods
  async getUserAnalytics(userId: number): Promise<UserAnalytic[]> {
    return Array.from(this.userAnalytics.values()).filter(
      (analytics) => analytics.userId === userId,
    );
  }

  async createUserAnalytics(analytics: InsertUserAnalytic): Promise<UserAnalytic> {
    const id = this.currentUserAnalyticsId++;
    const newAnalytics: UserAnalytic = { 
      ...analytics, 
      id, 
      timestamp: new Date() 
    };
    this.userAnalytics.set(id, newAnalytics);
    return newAnalytics;
  }
}

// Create and export a singleton instance
export const storage = new MemStorage();
