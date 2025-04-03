import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { DashboardStats, AIInsights } from '@/lib/ai-services';
import { useToast } from '@/hooks/use-toast';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard stats
        const statsResponse = await apiRequest<DashboardStats>('GET', '/api/dashboard/stats');
        setStats(statsResponse);

        // Fetch AI insights
        const insightsResponse = await apiRequest<AIInsights>('GET', '/api/dashboard/ai-insights');
        setInsights(insightsResponse);

        // Generate mock historical data
        const mockHistorical = generateHistoricalData();
        setHistoricalData(mockHistorical);

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analytics data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Helper function to generate historical data
  const generateHistoricalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map(month => ({
      month,
      taskCompletion: Math.floor(Math.random() * 40) + 60, // 60-100%
      teamAvailability: Math.floor(Math.random() * 30) + 70, // 70-100%
      cognitiveBalance: Math.floor(Math.random() * 25) + 75, // 75-100%
      sentiment: Math.floor(Math.random() * 30) + 70, // 70-100%
    }));
  };

  return (
    <DashboardLayout title="Analytics">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Task Allocation Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analytics on task allocation, team performance, and AI-driven insights.
          </p>
        </div>

        <Tabs defaultValue="performance">
          <TabsList className="w-full">
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            <TabsTrigger value="cognitive">Cognitive Load</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
          </TabsList>

          {/* Performance Metrics Tab */}
          <TabsContent value="performance" className="pt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-52" />
                <Skeleton className="h-52" />
                <Skeleton className="h-52" />
                <Skeleton className="h-52" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Task Completion Rate */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Task Completion Rate</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center">
                        <span className="text-3xl font-bold">{stats?.completionRate || 0}%</span>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className={`material-icons ${stats?.completionTrend && stats.completionTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats?.completionTrend && stats.completionTrend > 0 ? 'trending_up' : 'trending_down'}
                        </span>
                        <span className={`ml-1 ${stats?.completionTrend && stats.completionTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats?.completionTrend ? Math.abs(stats.completionTrend) : 0}% from last month
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Availability */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Team Availability</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex items-center justify-center">
                        <span className="text-3xl font-bold">{stats?.teamAvailability || 0}%</span>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className={`material-icons ${stats?.availabilityTrend && stats.availabilityTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats?.availabilityTrend && stats.availabilityTrend > 0 ? 'trending_up' : 'trending_down'}
                        </span>
                        <span className={`ml-1 ${stats?.availabilityTrend && stats.availabilityTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats?.availabilityTrend ? Math.abs(stats.availabilityTrend) : 0}% from last month
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Tasks */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Active Tasks</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full border-8 border-amber-500 flex items-center justify-center">
                        <span className="text-3xl font-bold">{stats?.activeTasks || 0}</span>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className={`material-icons ${stats?.activeTrend && stats.activeTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats?.activeTrend && stats.activeTrend > 0 ? 'trending_up' : 'trending_down'}
                        </span>
                        <span className={`ml-1 ${stats?.activeTrend && stats.activeTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats?.activeTrend ? Math.abs(stats.activeTrend) : 0}% from last month
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Sentiment */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Team Sentiment</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center">
                        <span className="text-lg font-bold">{stats?.teamSentiment || "Neutral"}</span>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className={`material-icons ${stats?.sentimentTrend && stats.sentimentTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats?.sentimentTrend && stats.sentimentTrend > 0 ? 'trending_up' : 'trending_down'}
                        </span>
                        <span className={`ml-1 ${stats?.sentimentTrend && stats.sentimentTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats?.sentimentTrend ? Math.abs(stats.sentimentTrend) : 0}% from last month
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Cognitive Load Tab */}
          <TabsContent value="cognitive" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Cognitive Load Distribution</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The cognitive load analysis shows the mental effort required across different task types.
                    Lower percentages indicate better balance and reduced risk of burnout.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Design Tasks</span>
                        <span className={`text-sm font-medium ${insights?.cognitiveLoadAnalysis.design && insights.cognitiveLoadAnalysis.design > 75 ? 'text-red-500' : 'text-green-500'}`}>
                          {insights?.cognitiveLoadAnalysis.design || 0}%
                        </span>
                      </div>
                      <Progress value={insights?.cognitiveLoadAnalysis.design || 0} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Development Tasks</span>
                        <span className={`text-sm font-medium ${insights?.cognitiveLoadAnalysis.development && insights.cognitiveLoadAnalysis.development > 75 ? 'text-red-500' : 'text-green-500'}`}>
                          {insights?.cognitiveLoadAnalysis.development || 0}%
                        </span>
                      </div>
                      <Progress value={insights?.cognitiveLoadAnalysis.development || 0} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Research Tasks</span>
                        <span className={`text-sm font-medium ${insights?.cognitiveLoadAnalysis.research && insights.cognitiveLoadAnalysis.research > 75 ? 'text-red-500' : 'text-green-500'}`}>
                          {insights?.cognitiveLoadAnalysis.research || 0}%
                        </span>
                      </div>
                      <Progress value={insights?.cognitiveLoadAnalysis.research || 0} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Testing Tasks</span>
                        <span className={`text-sm font-medium ${insights?.cognitiveLoadAnalysis.testing && insights.cognitiveLoadAnalysis.testing > 75 ? 'text-red-500' : 'text-green-500'}`}>
                          {insights?.cognitiveLoadAnalysis.testing || 0}%
                        </span>
                      </div>
                      <Progress value={insights?.cognitiveLoadAnalysis.testing || 0} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Management Tasks</span>
                        <span className={`text-sm font-medium ${insights?.cognitiveLoadAnalysis.management && insights.cognitiveLoadAnalysis.management > 75 ? 'text-red-500' : 'text-green-500'}`}>
                          {insights?.cognitiveLoadAnalysis.management || 0}%
                        </span>
                      </div>
                      <Progress value={insights?.cognitiveLoadAnalysis.management || 0} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <h4 className="flex items-center text-amber-800 dark:text-amber-300 font-medium">
                      <span className="material-icons mr-2">info</span>
                      Optimization Recommendation
                    </h4>
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                      The research team is experiencing a higher cognitive load than other departments. Consider redistributing research tasks or providing additional resources.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sentiment Analysis Tab */}
          <TabsContent value="sentiment" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Team Sentiment Analysis</h3>
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-48 h-48 rounded-full border-8 border-green-500 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{insights?.sentimentAnalysis.score || 0}%</span>
                      <span className="text-xl font-medium text-gray-600 dark:text-gray-400">
                        {insights?.sentimentAnalysis.status || "Neutral"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Positive Factors</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        <li>Clear task allocation</li>
                        <li>Effective team communication</li>
                        <li>Balanced workload distribution</li>
                        <li>Recognition of achievements</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">Areas for Improvement</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        <li>Meeting efficiency</li>
                        <li>Deadline expectations</li>
                        <li>Feedback frequency</li>
                        <li>Resource allocation</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">Recommendations</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        <li>Implement feedback cycles</li>
                        <li>Schedule team building activities</li>
                        <li>Review task assignment criteria</li>
                        <li>Enhance skill development</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Methodology</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sentiment analysis is performed using NeurAllocate's advanced AI algorithms that analyze communication patterns, task completion rates, and team feedback. The system continually learns from interactions to provide increasingly accurate sentiment mapping.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Historical Data Tab */}
          <TabsContent value="historical" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">6-Month Performance Trends</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Month</th>
                          <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Task Completion</th>
                          <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Team Availability</th>
                          <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Cognitive Balance</th>
                          <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Team Sentiment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicalData.map((data, index) => (
                          <tr key={index} className="border-b dark:border-gray-700">
                            <td className="px-4 py-3">{data.month}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Progress value={data.taskCompletion} className="h-2 w-24 mr-2" />
                                <span>{data.taskCompletion}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Progress value={data.teamAvailability} className="h-2 w-24 mr-2" />
                                <span>{data.teamAvailability}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Progress value={data.cognitiveBalance} className="h-2 w-24 mr-2" />
                                <span>{data.cognitiveBalance}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Progress value={data.sentiment} className="h-2 w-24 mr-2" />
                                <span>{data.sentiment}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="flex items-center text-blue-800 dark:text-blue-300 font-medium">
                      <span className="material-icons mr-2">insights</span>
                      Trend Analysis
                    </h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      Overall metrics show an improving trend in the last quarter, with task completion and team sentiment showing the most significant gains. Cognitive balance has been consistently improving due to the AI-powered task allocation system.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}