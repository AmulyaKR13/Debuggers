import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AIStatusCard from "@/components/dashboard/ai-status-card";
import StatCard from "@/components/dashboard/stat-card";
import AIInsightsPanel from "@/components/dashboard/ai-insights";
import NbmSystemCard from "@/components/dashboard/nbm-system-card";
import ActivityTimeline from "@/components/dashboard/activity-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStats, useAIInsights, useNBMStatus, useActivities, useTasks } from "@/lib/ai-services";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/ui/theme-provider";
import TaskTable from "@/components/dashboard/task-table";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: aiInsights, isLoading: insightsLoading } = useAIInsights();
  const { data: nbmStatus, isLoading: nbmLoading } = useNBMStatus();
  const { data: activities, isLoading: activitiesLoading } = useActivities();
  const { data: tasks, isLoading: tasksLoading } = useTasks();

  return (
    <DashboardLayout title="Dashboard">
      {/* AI Status Card */}
      <AIStatusCard />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </>
        ) : (
          <>
            <StatCard
              title="Active Tasks"
              value={stats?.activeTasks || 0}
              icon="task"
              iconColor="text-primary"
              trend={stats?.activeTrend}
              trendLabel="from last week"
            />
            <StatCard
              title="Team Availability"
              value={`${stats?.teamAvailability || 0}%`}
              icon="people"
              iconColor="text-green-500"
              trend={stats?.availabilityTrend}
              trendLabel="from last week"
            />
            <StatCard
              title="Completion Rate"
              value={`${stats?.completionRate || 0}%`}
              icon="assignment_turned_in"
              iconColor="text-amber-500"
              trend={stats?.completionTrend}
              trendLabel="from last month"
            />
            <StatCard
              title="Team Sentiment"
              value={stats?.teamSentiment || "Neutral"}
              icon="sentiment_satisfied"
              iconColor="text-violet-500"
              trend={stats?.sentimentTrend}
              trendLabel="from last analysis"
            />
          </>
        )}
      </div>

      {/* Insights Tabs */}
      <div className="mb-6">
        <Tabs defaultValue="ai-insights">
          <TabsList className="border-b border-gray-200 dark:border-gray-700 w-full justify-start rounded-none">
            <TabsTrigger value="ai-insights" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary pb-2">
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary pb-2">
              Current Tasks
            </TabsTrigger>
            <TabsTrigger value="team" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary pb-2">
              Team Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-insights" className="py-4">
            {insightsLoading ? (
              <Skeleton className="h-96 rounded-lg" />
            ) : (
              <AIInsightsPanel insights={aiInsights} />
            )}
          </TabsContent>
          
          <TabsContent value="tasks" className="py-4">
            {tasksLoading ? (
              <Skeleton className="h-96 rounded-lg" />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                <TaskTable tasks={tasks || []} limit={4} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="team" className="py-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Team Analysis</h3>
                <div className="flex space-x-2">
                  <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1.5 rounded-md text-sm flex items-center">
                    <span className="material-icons text-sm mr-1">filter_list</span> Filter
                  </button>
                  <button className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md text-sm flex items-center">
                    <span className="material-icons text-sm mr-1">person_add</span> Add Member
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-4">Team Expertise Distribution</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-72 flex items-center justify-center">
                  <div className="w-full h-full flex flex-col justify-between">
                    <div className="text-center text-gray-500 dark:text-gray-400 mb-2">Team Skill Distribution</div>
                    <div className="flex-1 flex items-center justify-center">
                      <svg viewBox="0 0 200 200" className="w-full max-w-md">
                        {/* Web shape outline */}
                        <polygon points="100,10 160,40 180,100 160,160 100,190 40,160 20,100 40,40" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                        {/* Inner web shapes */}
                        <polygon points="100,40 130,60 140,100 130,140 100,160 70,140 60,100 70,60" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
                        <polygon points="100,70 115,80 120,100 115,120 100,130 85,120 80,100 85,80" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
                        {/* Skill coverage shape */}
                        <polygon points="100,20 150,45 170,100 140,150 100,170 55,145 40,100 60,50" fill="hsl(216, 92%, 60%)" fillOpacity="0.2" stroke="hsl(216, 92%, 60%)" strokeWidth="1.5" />
                        {/* Axes */}
                        <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
                        <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
                        <line x1="40" y1="40" x2="160" y2="160" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
                        <line x1="160" y1="40" x2="40" y2="160" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
                        {/* Axis labels */}
                        <text x="100" y="5" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">Design</text>
                        <text x="190" y="100" textAnchor="end" fontSize="8" fill="currentColor" opacity="0.7">Development</text>
                        <text x="100" y="195" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">Research</text>
                        <text x="10" y="100" textAnchor="start" fontSize="8" fill="currentColor" opacity="0.7">Management</text>
                        <text x="40" y="35" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">QA</text>
                        <text x="160" y="35" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">DevOps</text>
                        <text x="160" y="165" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">Backend</text>
                        <text x="40" y="165" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">Frontend</text>
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">AI Analysis:</span> Team has strong coverage in Design and Development skills, but could benefit from additional Research expertise. Consider upskilling or new hires in this area.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* NeuroBehavioral Matching and Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {nbmLoading ? (
          <Skeleton className="h-96 rounded-lg" />
        ) : (
          <NbmSystemCard nbmStatus={nbmStatus} />
        )}
        
        {activitiesLoading ? (
          <Skeleton className="h-96 rounded-lg" />
        ) : (
          <ActivityTimeline activities={activities || []} />
        )}
      </div>
    </DashboardLayout>
  );
}
