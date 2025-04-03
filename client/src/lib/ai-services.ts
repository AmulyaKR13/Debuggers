import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";

// Types for dashboard stats
export type DashboardStats = {
  activeTasks: number;
  teamAvailability: number;
  completionRate: number;
  teamSentiment: string;
  activeTrend: number;
  availabilityTrend: number;
  completionTrend: number;
  sentimentTrend: number;
};

// Types for AI insights
export type CognitiveLoadAnalysis = {
  design: number;
  development: number;
  research: number;
  testing: number;
  management: number;
};

export type SentimentAnalysis = {
  score: number;
  status: string;
};

export type AIRecommendation = {
  type: string;
  title: string;
  description: string;
};

export type AIInsights = {
  cognitiveLoadAnalysis: CognitiveLoadAnalysis;
  sentimentAnalysis: SentimentAnalysis;
  recommendations: AIRecommendation[];
};

// Types for NBM system status
export type NBMComponent = {
  name: string;
  status: string;
  performance: number;
};

export type NBMStatus = {
  status: string;
  components: NBMComponent[];
};

// Types for activity timeline
export type Activity = {
  type: string;
  title: string;
  time: string;
  reason?: string;
  recommendation?: string;
  solution?: string;
  action?: string;
};

// Types for team members
export type TeamMember = {
  id: number;
  name: string;
  role: string;
  status: string;
  avatar: string;
  skills: string[];
  workload: number;
  activeTasks: number;
  insight: string;
};

// Types for tasks
export type Task = {
  id: number;
  title: string;
  description?: string;
  createdByUserId: number;
  assignedToUserId?: number;
  status: string;
  priority: string;
  dueDate?: string;
  aiMatchScore?: number;
  requiredSkills?: number[];
  cognitiveLoad?: number;
  sentimentScore?: number;
  createdAt: string;
  updatedAt: string;
};

// Query hooks
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });
};

export const useAIInsights = () => {
  return useQuery<AIInsights>({
    queryKey: ["/api/dashboard/ai-insights"],
  });
};

export const useNBMStatus = () => {
  return useQuery<NBMStatus>({
    queryKey: ["/api/dashboard/nbm-status"],
  });
};

export const useActivities = () => {
  return useQuery<Activity[]>({
    queryKey: ["/api/dashboard/activities"],
  });
};

export const useTeamMembers = () => {
  return useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });
};

export const useTasks = () => {
  return useQuery<Task[]>({
    queryKey: ["/api/user/tasks"],
  });
};

// Mutation hooks
export const useCreateTask = () => {
  return useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/tasks"] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/tasks"] });
    },
  });
};

export const useUpdateAvailability = () => {
  return useMutation({
    mutationFn: async (data: { status: string; startDate: Date; endDate?: Date }) => {
      const response = await apiRequest("POST", "/api/user/availability", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/availability"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });
};
