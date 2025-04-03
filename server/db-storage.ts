import { db } from './db';
import { IStorage } from './storage';
import { eq, and, desc } from 'drizzle-orm';
import { 
  User, InsertUser, 
  OtpCode, InsertOtpCode, 
  Skill, InsertSkill, 
  UserSkill, InsertUserSkill, 
  Task, InsertTask, 
  Availability, InsertAvailability, 
  UserAnalytic, InsertUserAnalytic,
  users, otpCodes, skills, userSkills, tasks, availabilities, userAnalytics
} from '@shared/schema';

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserVerificationStatus(id: number, isVerified: boolean): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ isVerified })
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }
  
  async clearUsersAndOtpCodes(): Promise<void> {
    // Delete all OTP codes
    await db.delete(otpCodes);
    
    // Delete all users
    await db.delete(users);
  }
  
  // OTP operations
  async createOtpCode(otpData: InsertOtpCode): Promise<OtpCode> {
    const result = await db.insert(otpCodes).values(otpData).returning();
    return result[0];
  }

  async getOtpByEmailAndCode(email: string, code: string): Promise<OtpCode | undefined> {
    const result = await db.select()
      .from(otpCodes)
      .where(and(
        eq(otpCodes.email, email),
        eq(otpCodes.code, code)
      ));
    
    return result[0];
  }

  async deleteOtpCode(id: number): Promise<void> {
    await db.delete(otpCodes).where(eq(otpCodes.id, id));
  }
  
  // Skill operations
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const result = await db.select().from(skills).where(eq(skills.id, id));
    return result[0];
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const result = await db.insert(skills).values(skill).returning();
    return result[0];
  }
  
  // UserSkill operations
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return await db.select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
  }

  async createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    const result = await db.insert(userSkills).values(userSkill).returning();
    return result[0];
  }

  async updateUserSkill(id: number, proficiency: number): Promise<UserSkill | undefined> {
    const result = await db.update(userSkills)
      .set({ proficiency })
      .where(eq(userSkills.id, id))
      .returning();
    
    return result[0];
  }
  
  // Task operations
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return await db.select()
      .from(tasks)
      .where(eq(tasks.assignedToUserId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    // Insert values directly to avoid type issues
    const result = await db.insert(tasks).values({
      title: task.title,
      description: task.description,
      createdByUserId: task.createdByUserId,
      assignedToUserId: task.assignedToUserId,
      status: task.status || "TODO",
      priority: task.priority || "MEDIUM",
      dueDate: task.dueDate,
      requiredSkills: task.requiredSkills,
      cognitiveLoad: task.cognitiveLoad,
    }).returning();
    
    return result[0];
  }

  async updateTaskStatus(id: number, status: string): Promise<Task | undefined> {
    const result = await db.update(tasks)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    
    return result[0];
  }

  async updateTaskAssignment(id: number, userId: number, aiMatchScore: number): Promise<Task | undefined> {
    const result = await db.update(tasks)
      .set({ 
        assignedToUserId: userId,
        aiMatchScore,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    
    return result[0];
  }
  
  // Availability operations
  async getUserAvailability(userId: number): Promise<Availability | undefined> {
    const result = await db.select()
      .from(availabilities)
      .where(eq(availabilities.userId, userId));
    
    return result[0];
  }

  async createAvailability(availability: InsertAvailability): Promise<Availability> {
    const result = await db.insert(availabilities).values(availability).returning();
    return result[0];
  }

  async updateAvailability(id: number, status: string): Promise<Availability | undefined> {
    const result = await db.update(availabilities)
      .set({ status })
      .where(eq(availabilities.id, id))
      .returning();
    
    return result[0];
  }
  
  // UserAnalytics operations
  async getUserAnalytics(userId: number): Promise<UserAnalytic[]> {
    return await db.select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, userId))
      .orderBy(desc(userAnalytics.recordedAt));
  }

  async createUserAnalytics(analytics: InsertUserAnalytic): Promise<UserAnalytic> {
    const result = await db.insert(userAnalytics).values(analytics).returning();
    return result[0];
  }
}