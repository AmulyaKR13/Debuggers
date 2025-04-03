import { Task, User, UserSkill, Skill, UserAnalytic } from '@shared/schema';
import { storage } from './storage';

// AI Service simulates intelligent AI-powered functionality without requiring external APIs
export class AIService {
  // Match a task to the most suitable user based on skills, workload, and cognitive fit
  async matchTaskToUser(taskId: number): Promise<{userId: number; score: number}> {
    const task = await storage.getTask(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Get all users
    const allUsers = await this.getAllUsers();
    if (allUsers.length === 0) {
      throw new Error("No users available for task assignment");
    }
    
    // Calculate match scores for each user
    const matchScores = await Promise.all(
      allUsers.map(async (user) => {
        const score = await this.calculateMatchScore(task, user.id);
        return { userId: user.id, score };
      })
    );
    
    // Sort by score (highest first) and get the best match
    matchScores.sort((a, b) => b.score - a.score);
    return matchScores[0];
  }
  
  // Calculate a match score between a task and a user (0-100)
  async calculateMatchScore(task: Task, userId: number): Promise<number> {
    // Get user skills
    const userSkills = await storage.getUserSkills(userId);
    
    // Get user availability
    const availability = await storage.getUserAvailability(userId);
    const isAvailable = availability?.status === "AVAILABLE";
    
    // Get user analytics for cognitive load assessment
    const analytics = await storage.getUserAnalytics(userId);
    
    // Get current workload
    const userTasks = await storage.getTasksByUser(userId);
    const activeTaskCount = userTasks.filter(t => 
      t.status !== "COMPLETED" && t.status !== "CANCELLED"
    ).length;
    
    // Base score starts at 50
    let score = 50;
    
    // Skill match (up to +30 points)
    if (task.requiredSkills && task.requiredSkills.length > 0) {
      const skillMatch = this.calculateSkillMatch(userSkills, task.requiredSkills);
      score += skillMatch * 30;
    } else {
      // If no specific skills required, give partial boost
      score += 15;
    }
    
    // Availability impact (up to +20 points)
    if (isAvailable) {
      score += 20;
    } else {
      // Significantly reduce score if not available
      score -= 40;
    }
    
    // Workload consideration (up to +20 points)
    // Prefer users with fewer active tasks
    if (activeTaskCount < 3) {
      score += 20;
    } else if (activeTaskCount < 5) {
      score += 10;
    } else if (activeTaskCount >= 8) {
      score -= 20;
    }
    
    // Cognitive load consideration (up to +20 points)
    const cognitiveLoad = this.assessCognitiveLoad(analytics, task);
    score += cognitiveLoad * 20;
    
    // Ensure the score is between 0-100
    return Math.max(0, Math.min(100, score));
  }
  
  // Calculate how well user skills match required skills (0-1)
  private calculateSkillMatch(userSkills: UserSkill[], requiredSkillIds: number[]): number {
    if (userSkills.length === 0 || requiredSkillIds.length === 0) {
      return 0;
    }
    
    // Count how many required skills the user has
    const matchedSkills = userSkills.filter(userSkill => 
      requiredSkillIds.includes(userSkill.skillId)
    );
    
    // Calculate average proficiency for matched skills
    const avgProficiency = matchedSkills.reduce(
      (sum, skill) => sum + skill.proficiency, 
      0
    ) / Math.max(1, matchedSkills.length);
    
    // Weight by both number of matched skills and their proficiency
    const coverageRatio = matchedSkills.length / requiredSkillIds.length;
    const normalizedProficiency = avgProficiency / 5; // Assuming proficiency is 1-5
    
    return (coverageRatio * 0.6) + (normalizedProficiency * 0.4);
  }
  
  // Assess cognitive fit based on task properties and user analytics (0-1)
  private assessCognitiveLoad(analytics: UserAnalytic[], task: Task): number {
    // Default to moderate cognitive match if no analytics available
    if (!analytics || analytics.length === 0) {
      return 0.5;
    }
    
    // Simulate cognitive load analysis based on task properties
    const taskComplexity = this.estimateTaskComplexity(task);
    
    // Get the most recent analytics for relevant metrics
    const recentPerformance = analytics
      .filter(a => a.metric === "PERFORMANCE" || a.metric === "FOCUS")
      .sort((a, b) => {
        return new Date(b.recordedAt || 0).getTime() - new Date(a.recordedAt || 0).getTime();
      })[0];
    
    if (!recentPerformance) {
      return 0.5;
    }
    
    // Calculate cognitive fit - match high performance users with complex tasks
    // and lower performance users with simpler tasks
    const performanceLevel = recentPerformance.value / 100; // Normalize to 0-1
    
    if (taskComplexity > 0.7) {
      // Complex task - higher performance is better match
      return performanceLevel;
    } else if (taskComplexity < 0.3) {
      // Simple task - prefer matching with less-burdened team members
      return 1 - (performanceLevel * 0.5); // Still favor higher performers slightly
    } else {
      // Medium complexity - moderate preference for higher performers
      return 0.5 + (performanceLevel * 0.3);
    }
  }
  
  // Estimate task complexity based on description, priority, etc. (0-1)
  private estimateTaskComplexity(task: Task): number {
    let complexity = 0.5; // Default to medium complexity
    
    // High priority often correlates with complexity
    if (task.priority === "HIGH") {
      complexity += 0.2;
    } else if (task.priority === "LOW") {
      complexity -= 0.1;
    }
    
    // Use description length as a weak signal of complexity
    if (task.description) {
      const wordCount = task.description.split(' ').length;
      if (wordCount > 50) {
        complexity += 0.1;
      } else if (wordCount < 10) {
        complexity -= 0.1;
      }
    }
    
    // Cognitive load adjustment based on task properties
    if (task.cognitiveLoad) {
      complexity = (complexity * 0.5) + (task.cognitiveLoad / 100 * 0.5);
    }
    
    // Ensure the complexity is between 0-1
    return Math.max(0, Math.min(1, complexity));
  }
  
  // Generate artificial intelligence insights for the dashboard
  async generateInsights(): Promise<any> {
    // Get all tasks and users for analysis
    const tasks = await storage.getTasks();
    const users = await this.getAllUsers();
    
    // Generate cognitive load analysis by skill category
    const cognitiveLoadAnalysis = {
      design: this.generateRandomMetric(65, 15),
      development: this.generateRandomMetric(78, 10),
      research: this.generateRandomMetric(45, 20),
      testing: this.generateRandomMetric(60, 15),
      management: this.generateRandomMetric(70, 10)
    };
    
    // Generate simulated team sentiment analysis
    const sentimentScore = this.generateRandomMetric(72, 15);
    let sentimentStatus = "Neutral";
    if (sentimentScore > 75) sentimentStatus = "Positive";
    else if (sentimentScore < 50) sentimentStatus = "Negative";
    
    // Generate personalized recommendations based on current system state
    const completedTaskCount = tasks.filter(t => t.status === "COMPLETED").length;
    const pendingTaskCount = tasks.filter(t => t.status === "PENDING").length;
    const inProgressTaskCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
    
    const recommendations = [];
    
    // Add workload-based recommendations
    if (pendingTaskCount > inProgressTaskCount * 2) {
      recommendations.push({
        type: "WORKLOAD",
        title: "Workload Imbalance Detected",
        description: "Consider starting more pending tasks to balance the team workload."
      });
    }
    
    // Add cognitive load recommendations
    const highestLoad = Math.max(
      cognitiveLoadAnalysis.design,
      cognitiveLoadAnalysis.development,
      cognitiveLoadAnalysis.research,
      cognitiveLoadAnalysis.testing,
      cognitiveLoadAnalysis.management
    );
    
    if (highestLoad > 75) {
      const category = Object.entries(cognitiveLoadAnalysis)
        .find(([_, value]) => value === highestLoad)?.[0];
        
      recommendations.push({
        type: "COGNITIVE",
        title: `High Cognitive Load in ${category?.charAt(0).toUpperCase()}${category?.slice(1)}`,
        description: `Consider reallocating some ${category} tasks to reduce team cognitive burden.`
      });
    }
    
    // Add skill development recommendations if the team is small
    if (users.length < 5) {
      recommendations.push({
        type: "SKILLS",
        title: "Skill Diversification Needed",
        description: "Your team would benefit from developing cross-functional skills to handle diverse tasks."
      });
    }
    
    // Add sentiment-based recommendation if sentiment is low
    if (sentimentScore < 60) {
      recommendations.push({
        type: "WELLNESS",
        title: "Team Wellbeing Alert",
        description: "Consider implementing wellness activities to improve team sentiment and productivity."
      });
    }
    
    return {
      cognitiveLoadAnalysis,
      sentimentAnalysis: {
        score: sentimentScore,
        status: sentimentStatus
      },
      recommendations: recommendations.slice(0, 3) // Limit to top 3 recommendations
    };
  }
  
  // Generate simulated NBM (Neuro-Behavioral Matching) system status
  async generateNBMStatus(): Promise<any> {
    const components = [
      {
        name: "Cognitive Pattern Analyzer",
        status: this.getRandomStatus(0.9), // 90% chance of being operational
        performance: this.generateRandomMetric(92, 5)
      },
      {
        name: "Task Matching Engine",
        status: this.getRandomStatus(0.95),
        performance: this.generateRandomMetric(88, 7)
      },
      {
        name: "Learning Adaptation Module",
        status: this.getRandomStatus(0.85),
        performance: this.generateRandomMetric(78, 10)
      },
      {
        name: "Real-time Optimization",
        status: this.getRandomStatus(0.8),
        performance: this.generateRandomMetric(85, 8)
      }
    ];
    
    // Overall system status depends on component statuses
    const operationalCount = components.filter(c => c.status === "OPERATIONAL").length;
    const status = operationalCount >= 3 ? "OPERATIONAL" : "DEGRADED";
    
    return {
      status,
      components
    };
  }
  
  // Generate simulated activity timeline
  async generateActivityTimeline(): Promise<any[]> {
    const activities = [
      {
        type: "TASK_ALLOCATION",
        title: "AI-Optimized Task Allocation",
        time: this.getRandomPastTime(2),
        reason: "Cognitive pattern analysis indicated optimal match"
      },
      {
        type: "SYSTEM_ADJUSTMENT",
        title: "Learning Model Adaptation",
        time: this.getRandomPastTime(5),
        action: "Pattern recognition weights adjusted"
      },
      {
        type: "WORKLOAD_OPTIMIZATION",
        title: "Team Workload Rebalanced",
        time: this.getRandomPastTime(12),
        recommendation: "Shifted 3 tasks to maintain optimal cognitive load"
      },
      {
        type: "PERFORMANCE_INSIGHT",
        title: "Productivity Pattern Detected",
        time: this.getRandomPastTime(18),
        insight: "Morning hours show 27% higher deep work capacity"
      },
      {
        type: "SKILL_DEVELOPMENT",
        title: "Skill Gap Identification",
        time: this.getRandomPastTime(24),
        solution: "Recommended targeted learning path for 2 team members"
      }
    ];
    
    // Return a subset of activities
    return activities.slice(0, Math.floor(Math.random() * 2) + 3);
  }
  
  // Generate dashboard statistics 
  async generateDashboardStats(): Promise<any> {
    const tasks = await storage.getTasks();
    const users = await this.getAllUsers();
    
    // Calculate real metrics where possible
    const activeTasks = tasks.filter(t => 
      t.status !== "COMPLETED" && t.status !== "CANCELLED"
    ).length;
    
    // Calculate availability percentage
    let availableCount = 0;
    for (const user of users) {
      const availability = await storage.getUserAvailability(user.id);
      if (availability?.status === "AVAILABLE") {
        availableCount++;
      }
    }
    const teamAvailability = users.length > 0 
      ? Math.round((availableCount / users.length) * 100) 
      : 0;
    
    // Calculate completion rate
    const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
    const completionRate = tasks.length > 0 
      ? Math.round((completedTasks / tasks.length) * 100) 
      : 0;
    
    return {
      activeTasks,
      teamAvailability,
      completionRate,
      teamSentiment: this.generateTeamSentiment(),
      activeTrend: this.generateRandomTrend(10),
      availabilityTrend: this.generateRandomTrend(5),
      completionTrend: this.generateRandomTrend(8),
      sentimentTrend: this.generateRandomTrend(5)
    };
  }

  // Analyze a task's cognitive requirements
  async analyzeTaskCognitive(taskId: number): Promise<any> {
    const task = await storage.getTask(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Return simulated cognitive analysis results
    return {
      cognitiveLoad: this.generateRandomMetric(65, 15),
      focusRequirement: this.generateRandomMetric(70, 10),
      complexityLevel: this.generateRandomMetric(60, 20),
      creativityDemand: this.generateRandomMetric(55, 25),
      technicalPrecision: this.generateRandomMetric(75, 15)
    };
  }
  
  // Generate personalized skill recommendations for a user
  async generateSkillRecommendations(userId: number): Promise<any> {
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get user's current skills
    const userSkills = await storage.getUserSkills(userId);
    const userSkillIds = userSkills.map(skill => skill.skillId);
    
    // Get user's tasks
    const userTasks = await storage.getTasksByUser(userId);
    
    // Get all available skills
    const allSkills = await storage.getSkills();
    
    // Find skills the user doesn't have yet
    const newSkills = allSkills.filter(skill => 
      !userSkillIds.includes(skill.id)
    );
    
    // Create personalized recommendations based on patterns
    const recommendations = [];
    
    // 1. Primary recommendation based on task history
    if (userTasks.length > 0) {
      const recentTasks = [...userTasks].sort((a, b) => 
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      ).slice(0, 5);
      
      // Simulate finding a skill need pattern
      const randomSkill = newSkills[Math.floor(Math.random() * newSkills.length)];
      
      if (randomSkill) {
        recommendations.push({
          skillId: randomSkill.id,
          skillName: randomSkill.name,
          recommendationType: "PRIMARY",
          confidence: this.generateRandomMetric(85, 10),
          reason: `Based on your recent ${recentTasks.length} tasks, adding ${randomSkill.name} would complement your existing skillset.`
        });
      }
    }
    
    // 2. Secondary recommendations based on current skills
    if (userSkills.length > 0 && newSkills.length > 0) {
      // Get 2 random complementary skills
      const shuffledSkills = [...newSkills].sort(() => 0.5 - Math.random());
      const complementarySkills = shuffledSkills.slice(0, 2);
      
      complementarySkills.forEach(skill => {
        recommendations.push({
          skillId: skill.id,
          skillName: skill.name,
          recommendationType: "SECONDARY",
          confidence: this.generateRandomMetric(70, 15),
          reason: `${skill.name} pairs well with your existing skills and would expand your capabilities.`
        });
      });
    }
    
    // 3. Career growth recommendation
    if (newSkills.length > 0) {
      const growthSkill = newSkills[Math.floor(Math.random() * newSkills.length)];
      
      recommendations.push({
        skillId: growthSkill.id,
        skillName: growthSkill.name,
        recommendationType: "CAREER_GROWTH",
        confidence: this.generateRandomMetric(75, 10),
        reason: `Adding ${growthSkill.name} to your profile could open up new task categories and career opportunities.`
      });
    }
    
    // 4. Add learning resources
    const enhancedRecommendations = recommendations.map(rec => {
      return {
        ...rec,
        learningResources: this.generateLearningResources(rec.skillName)
      };
    });
    
    return {
      userId,
      currentSkillCount: userSkills.length,
      recommendations: enhancedRecommendations,
      analysisTimestamp: new Date().toISOString()
    };
  }
  
  // Generate mock learning resources for a skill
  private generateLearningResources(skillName: string): any[] {
    const resources = [
      {
        type: "COURSE",
        title: `Complete ${skillName} Masterclass`,
        provider: "Udemy",
        duration: "12 hours",
        level: "Beginner to Intermediate"
      },
      {
        type: "BOOK",
        title: `${skillName} for Professionals`,
        author: "Tech Publishing Group",
        pages: 320,
        level: "Intermediate to Advanced"
      },
      {
        type: "TUTORIAL",
        title: `Quick Start with ${skillName}`,
        source: "Mozilla Developer Network",
        duration: "4 hours",
        level: "Beginner"
      }
    ];
    
    // Return a subset of resources
    return resources.slice(0, Math.floor(Math.random() * 2) + 1);
  }
  
  // Helper method to get a random team sentiment
  private generateTeamSentiment(): string {
    const sentiments = ["Positive", "Neutral", "Motivated", "Focused", "Energetic"];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }
  
  // Helper method to generate a random metric within a range
  private generateRandomMetric(baseline: number, variance: number): number {
    return Math.round(baseline + (Math.random() * variance * 2) - variance);
  }
  
  // Helper method to generate a random trend (-range to +range)
  private generateRandomTrend(range: number): number {
    return Math.round((Math.random() * range * 2) - range);
  }
  
  // Helper method to get random system status with probability
  private getRandomStatus(operationalProbability: number): string {
    return Math.random() < operationalProbability ? "OPERATIONAL" : "DEGRADED";
  }
  
  // Helper method to get a random time in the past few hours
  private getRandomPastTime(maxHoursAgo: number): string {
    const now = new Date();
    const hoursAgo = Math.random() * maxHoursAgo;
    now.setHours(now.getHours() - hoursAgo);
    
    return now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Generate enhanced team members with AI-calculated insights
  async generateTeamMembers(): Promise<any[]> {
    const users = await this.getAllUsers();
    const enhancedTeamMembers = [];
    
    for (const user of users) {
      try {
        // Get user skills
        const userSkills = await storage.getUserSkills(user.id);
        
        // Get user tasks
        const userTasks = await storage.getTasksByUser(user.id);
        const activeTasks = userTasks.filter(t => 
          t.status !== "COMPLETED" && t.status !== "CANCELLED"
        );
        
        // Get user availability
        const availability = await storage.getUserAvailability(user.id);
        const status = availability?.status || "AVAILABLE";
        
        // Generate an AI insight about this team member
        const insight = this.generatePersonalizedInsight(user, userSkills.length, activeTasks.length);
        
        // Calculate an estimated workload (0-100)
        const workload = Math.min(100, activeTasks.length * 15 + 
          this.generateRandomMetric(40, 15));
        
        // Get skills to display
        const skills = await Promise.all(
          userSkills.map(async (userSkill) => {
            const skill = await storage.getSkill(userSkill.skillId);
            return skill ? skill.name : null;
          })
        );
        
        // Create enhanced team member object
        enhancedTeamMembers.push({
          id: user.id,
          name: user.name,
          email: user.email,
          role: this.determineRole(skills.filter(s => s !== null)),
          status,
          avatar: user.avatar || this.getDefaultAvatar(user.id),
          skills: skills.filter(s => s !== null),
          workload,
          activeTasks: activeTasks.length,
          insight
        });
      } catch (error) {
        console.error(`Error enhancing team member ${user.id}:`, error);
      }
    }
    
    return enhancedTeamMembers;
  }
  
  // Generate a personalized insight for a team member
  private generatePersonalizedInsight(user: User, skillCount: number, taskCount: number): string {
    const insights = [
      `Strong match for ${this.getRandomSkillDomain()} tasks based on cognitive profile`,
      `Consider reducing workload to optimize cognitive efficiency`,
      `Shows high adaptability across diverse task types`,
      `Would benefit from skill cross-training in related domains`,
      `High performance under time-constrained conditions`,
      `Optimal cognitive match for complex problem-solving tasks`,
      `Recent performance metrics indicate increased stress levels`,
      `Would benefit from more structured task allocation`,
      `Shows excellent capability for mentoring junior team members`,
      `Recent pattern suggests preference for sequential task completion`
    ];
    
    // Select an insight that makes sense for this user's state
    if (taskCount > 5) {
      return insights[1];
    } else if (skillCount < 2) {
      return insights[3];
    } else {
      // Select a random appropriate insight
      const appropriateInsights = [0, 2, 4, 5, 7, 8, 9];
      const index = appropriateInsights[Math.floor(Math.random() * appropriateInsights.length)];
      return insights[index];
    }
  }
  
  // Determine a role based on user skills
  private determineRole(skills: string[]): string {
    if (!skills || skills.length === 0) {
      return "Team Member";
    }
    
    // Common role mappings
    const skillToRoleMap: Record<string, string> = {
      'React': 'Frontend Developer',
      'UI Design': 'UI/UX Designer',
      'Wireframing': 'UI/UX Designer',
      'Node.js': 'Backend Developer',
      'Express': 'Backend Developer',
      'MongoDB': 'Database Specialist',
      'PostgreSQL': 'Database Specialist',
      'API Design': 'System Architect',
      'Python': 'Data Scientist',
      'Machine Learning': 'AI Specialist',
      'Project Management': 'Project Manager',
      'Agile': 'Scrum Master',
      'Testing': 'QA Engineer',
      'DevOps': 'DevOps Engineer',
      'AWS': 'Cloud Engineer'
    };
    
    // Check for skill matches
    for (const skill of skills) {
      if (skillToRoleMap[skill]) {
        return skillToRoleMap[skill];
      }
    }
    
    // Fallback to general roles
    if (skills.some(s => s.toLowerCase().includes('design'))) {
      return 'Designer';
    } else if (skills.some(s => s.toLowerCase().includes('develop'))) {
      return 'Developer';
    } else if (skills.some(s => s.toLowerCase().includes('test'))) {
      return 'QA Specialist';
    } else {
      return 'Team Member';
    }
  }
  
  // Get a random skill domain for insights
  private getRandomSkillDomain(): string {
    const domains = ['frontend', 'backend', 'design', 'research', 'analytics', 'architecture', 'documentation'];
    return domains[Math.floor(Math.random() * domains.length)];
  }
  
  // Get a default avatar based on user ID
  private getDefaultAvatar(id: number): string {
    const avatars = [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    ];
    
    return avatars[id % avatars.length];
  }
  
  // Helper method to get all users for task allocation
  private async getAllUsers(): Promise<User[]> {
    // In a real implementation, this would fetch from the database
    // For this demo, we'll create some simulated users
    const users: User[] = [];
    
    for (let id = 1; id <= 5; id++) {
      try {
        const user = await storage.getUser(id);
        if (user) {
          users.push(user);
        }
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
      }
    }
    
    return users;
  }
}

// Create a singleton instance of the AIService
export const aiService = new AIService();