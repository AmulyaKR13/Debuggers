import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

// OTP model
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull(), // 'REGISTRATION', 'PASSWORD_RESET'
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOtpSchema = createInsertSchema(otpCodes).omit({
  id: true,
  createdAt: true,
});

// Skill model
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // 'TECHNICAL', 'SOFT', etc.
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

// UserSkill model
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skillId: integer("skill_id").notNull(),
  proficiency: integer("proficiency").notNull(), // 1-5
  lastUsed: timestamp("last_used"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSkillSchema = createInsertSchema(userSkills).omit({
  id: true,
  updatedAt: true,
});

// Task model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdByUserId: integer("created_by_user_id").notNull(),
  assignedToUserId: integer("assigned_to_user_id"),
  status: text("status").notNull().default("TODO"), // 'TODO', 'IN_PROGRESS', 'COMPLETED'
  priority: text("priority").notNull().default("MEDIUM"), // 'LOW', 'MEDIUM', 'HIGH'
  dueDate: timestamp("due_date"),
  aiMatchScore: real("ai_match_score"),
  requiredSkills: json("required_skills").$type<number[]>(), // Array of skill IDs
  cognitiveLoad: integer("cognitive_load"), // 1-10
  sentimentScore: real("sentiment_score"), // -1 to 1
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  aiMatchScore: true,
  sentimentScore: true,
});

// Availability model
export const availabilities = pgTable("availabilities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // 'AVAILABLE', 'LIMITED', 'UNAVAILABLE'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAvailabilitySchema = createInsertSchema(availabilities).omit({
  id: true,
  createdAt: true,
});

// UserAnalytics model
export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cognitiveLoad: integer("cognitive_load"), // 1-10
  sentimentScore: real("sentiment_score"), // -1 to 1
  workloadPercentage: real("workload_percentage"), // 0-100
  activeTasks: integer("active_tasks"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = z.infer<typeof insertOtpSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Availability = typeof availabilities.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

export type UserAnalytic = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytic = z.infer<typeof insertUserAnalyticsSchema>;
