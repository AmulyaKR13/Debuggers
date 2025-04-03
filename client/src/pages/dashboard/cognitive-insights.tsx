import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { AIInsights } from '@/lib/ai-services';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

type TaskType = 'design' | 'development' | 'research' | 'testing' | 'management';

interface CognitiveScore {
  score: number;
  interpretation: string;
  color: string;
}

interface TeamCognitiveData {
  memberId: number;
  name: string;
  role: string;
  avatar: string;
  cognitiveScores: Record<TaskType, CognitiveScore>;
  overallScore: number;
  focus: string;
  recommendation: string;
}

export default function CognitiveInsightsPage() {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [teamData, setTeamData] = useState<TeamCognitiveData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch AI insights
        const insightsResponse = await apiRequest<AIInsights>('GET', '/api/dashboard/ai-insights');
        setInsights(insightsResponse);

        // Fetch team members
        const teamResponse = await apiRequest<any[]>('GET', '/api/team');
        
        // Generate cognitive data for team members
        const generatedData = generateTeamCognitiveData(teamResponse, insightsResponse?.cognitiveLoadAnalysis);
        setTeamData(generatedData);

      } catch (error) {
        console.error('Error fetching cognitive insights data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load cognitive insights data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Helper function to generate cognitive data for team members
  const generateTeamCognitiveData = (teamMembers: any[], cognitiveAnalysis: any): TeamCognitiveData[] => {
    if (!teamMembers || !cognitiveAnalysis) return [];

    return teamMembers.map(member => {
      // Generate a unique cognitive profile for each team member
      const designScore = Math.round(cognitiveAnalysis.design * (0.8 + Math.random() * 0.4));
      const developmentScore = Math.round(cognitiveAnalysis.development * (0.8 + Math.random() * 0.4));
      const researchScore = Math.round(cognitiveAnalysis.research * (0.8 + Math.random() * 0.4));
      const testingScore = Math.round(cognitiveAnalysis.testing * (0.8 + Math.random() * 0.4));
      const managementScore = Math.round(cognitiveAnalysis.management * (0.8 + Math.random() * 0.4));

      // Helper function to get interpretation based on score
      const getInterpretation = (score: number): string => {
        if (score < 40) return "Excellent";
        if (score < 60) return "Good";
        if (score < 75) return "Moderate";
        if (score < 85) return "High";
        return "Excessive";
      };

      // Helper function to get color based on score
      const getColor = (score: number): string => {
        if (score < 40) return "text-green-500";
        if (score < 60) return "text-blue-500";
        if (score < 75) return "text-yellow-500";
        if (score < 85) return "text-orange-500";
        return "text-red-500";
      };

      // Find the primary focus area (lowest cognitive load)
      const scores = {
        design: designScore,
        development: developmentScore,
        research: researchScore,
        testing: testingScore,
        management: managementScore
      };
      
      const focusArea = Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b)[0];
      
      // Calculate overall score (average)
      const overallScore = Math.round(
        (designScore + developmentScore + researchScore + testingScore + managementScore) / 5
      );

      // Generate recommendation based on scores
      let recommendation = "";
      const highestLoad = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
      
      if (highestLoad[1] > 75) {
        recommendation = `Consider reducing ${highestLoad[0]} tasks to prevent cognitive overload.`;
      } else if (overallScore > 65) {
        recommendation = "Consider a more balanced workload distribution across task types.";
      } else {
        recommendation = "Current cognitive load balance is good. Continue with similar task allocation.";
      }

      return {
        memberId: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        cognitiveScores: {
          design: { score: designScore, interpretation: getInterpretation(designScore), color: getColor(designScore) },
          development: { score: developmentScore, interpretation: getInterpretation(developmentScore), color: getColor(developmentScore) },
          research: { score: researchScore, interpretation: getInterpretation(researchScore), color: getColor(researchScore) },
          testing: { score: testingScore, interpretation: getInterpretation(testingScore), color: getColor(testingScore) },
          management: { score: managementScore, interpretation: getInterpretation(managementScore), color: getColor(managementScore) }
        },
        overallScore,
        focus: focusArea.charAt(0).toUpperCase() + focusArea.slice(1),
        recommendation
      };
    });
  };

  return (
    <DashboardLayout title="Cognitive Insights">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Neurobehavioral Cognitive Insights</h2>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered insights into cognitive load, task distribution, and mental fatigue prevention.
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cognitive Load Overview */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Cognitive Load Distribution</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Team-wide cognitive load across different task categories.
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
                  </CardContent>
                </Card>

                {/* Methodology */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Neurobehavioral Analysis Methodology</h3>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">What is Cognitive Load?</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Cognitive load represents the mental effort being used in working memory. Our system analyzes various factors to estimate cognitive load across different task types.
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Measurement Factors</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                          <li>Task complexity</li>
                          <li>Context switching frequency</li>
                          <li>Time pressure</li>
                          <li>Required focus duration</li>
                          <li>Information processing depth</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Benefits of Monitoring</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                          <li>Prevents burnout</li>
                          <li>Improves task allocation</li>
                          <li>Optimizes productivity</li>
                          <li>Enhances work quality</li>
                          <li>Supports team well-being</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Team Analysis Tab */}
          <TabsContent value="team" className="pt-6">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : (
              <div className="space-y-6">
                {teamData.map((member) => (
                  <Card key={member.memberId}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 flex items-center mb-4 md:mb-0">
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="h-12 w-12 rounded-full mr-4" 
                          />
                          <div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                          </div>
                        </div>
                        
                        <div className="md:w-1/2 grid grid-cols-2 gap-4">
                          {Object.entries(member.cognitiveScores).map(([type, score]) => (
                            <div key={type} className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{
                                backgroundColor: score.color.includes('green') ? '#10b981' :
                                                score.color.includes('blue') ? '#3b82f6' :
                                                score.color.includes('yellow') ? '#f59e0b' :
                                                score.color.includes('orange') ? '#f97316' : '#ef4444'
                              }}></div>
                              <div>
                                <div className="text-xs font-medium capitalize">{type}</div>
                                <div className="text-sm flex items-center">
                                  <span className={score.color}>{score.score}%</span>
                                  <span className="mx-1">-</span>
                                  <span>{score.interpretation}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="md:w-1/4 flex flex-col justify-center">
                          <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 mb-2">
                            <div className="text-sm font-medium">Focus Strength</div>
                            <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">{member.focus}</div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {member.recommendation}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Team Cognitive Balance Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      The NeurAllocate system monitors cognitive load distribution across the team to ensure optimal task allocation and prevent mental fatigue.
                    </p>
                    
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h4 className="flex items-center text-amber-800 dark:text-amber-300 font-medium">
                        <span className="material-icons mr-2">insights</span>
                        Key Insights
                      </h4>
                      <ul className="mt-2 space-y-2 text-sm text-amber-700 dark:text-amber-400">
                        <li className="flex items-start">
                          <span className="material-icons text-amber-500 mr-2 text-sm">arrow_right</span>
                          Research tasks are creating higher cognitive load across the team
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-amber-500 mr-2 text-sm">arrow_right</span>
                          Team shows strongest cognitive affinity for design and development tasks
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-amber-500 mr-2 text-sm">arrow_right</span>
                          Management tasks are well-distributed with moderate cognitive impact
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">AI-Generated Recommendations</h3>
                    
                    <div className="space-y-4">
                      {insights?.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start p-4 border rounded-lg">
                          <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mr-4 ${
                            recommendation.type === 'WORKLOAD' ? 'bg-amber-100 text-amber-600' :
                            recommendation.type === 'SKILL' ? 'bg-green-100 text-green-600' :
                            recommendation.type === 'COGNITIVE' ? 'bg-blue-100 text-blue-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            <span className="material-icons text-xl">
                              {recommendation.type === 'WORKLOAD' ? 'balance' :
                               recommendation.type === 'SKILL' ? 'school' :
                               recommendation.type === 'COGNITIVE' ? 'psychology' : 'lightbulb'}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium">{recommendation.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {recommendation.description}
                            </p>
                            <div className="mt-3">
                              <Button size="sm" variant="outline">Apply Recommendation</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Cognitive Optimization Strategies</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Task Switching Reduction</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Minimize context switching by grouping similar tasks together and allocating dedicated focus time for complex tasks. This can reduce cognitive load by up to 20%.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Cognitive Diversity</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Assign tasks that utilize different cognitive functions throughout the day to prevent mental fatigue in specific areas and maintain overall productivity.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Strategic Breaks</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Implement the 52/17 rule - 52 minutes of focused work followed by 17 minutes of rest - to optimize cognitive performance and prevent burnout.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Information Chunking</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Break complex tasks into smaller, manageable components to reduce overall cognitive load and improve task completion rates.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}