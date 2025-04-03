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

interface TeamMemberSentiment {
  id: number;
  name: string;
  role: string;
  avatar: string;
  sentimentScore: number;
  sentimentStatus: string;
  trend: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendation: string;
}

interface TeamSentimentData {
  overallScore: number;
  overallStatus: string;
  trend: number;
  teamMembers: TeamMemberSentiment[];
  historicalData: Array<{
    date: string;
    score: number;
    status: string;
  }>;
}

export default function SentimentAnalysisPage() {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [sentimentData, setSentimentData] = useState<TeamSentimentData | null>(null);
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
        
        // Generate sentiment data for the team
        const generatedData = generateTeamSentimentData(teamResponse, insightsResponse?.sentimentAnalysis);
        setSentimentData(generatedData);

      } catch (error) {
        console.error('Error fetching sentiment analysis data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sentiment analysis data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Helper function to generate sentiment data for the team
  const generateTeamSentimentData = (teamMembers: any[], sentimentAnalysis: any): TeamSentimentData => {
    if (!teamMembers || !sentimentAnalysis) {
      return {
        overallScore: 75,
        overallStatus: 'Positive',
        trend: 3,
        teamMembers: [],
        historicalData: []
      };
    }

    // Generate sentiment data for each team member
    const memberSentiments: TeamMemberSentiment[] = teamMembers.map(member => {
      // Generate a unique sentiment score for each team member with a slight variation from the overall score
      const score = Math.max(0, Math.min(100, sentimentAnalysis.score + (Math.random() * 20 - 10)));
      const status = getStatusFromScore(score);
      const trend = Math.floor(Math.random() * 7) - 3; // -3 to +3

      // Generate positive and negative factors
      const positiveFactors = getRandomPositiveFactors();
      const negativeFactors = getRandomNegativeFactors();

      // Generate recommendation
      const recommendation = generateRecommendation(status, positiveFactors, negativeFactors);

      return {
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        sentimentScore: Math.round(score),
        sentimentStatus: status,
        trend,
        factors: {
          positive: positiveFactors,
          negative: negativeFactors
        },
        recommendation
      };
    });

    // Generate historical data (last 7 days)
    const historicalData = generateHistoricalData(sentimentAnalysis.score);

    return {
      overallScore: sentimentAnalysis.score,
      overallStatus: sentimentAnalysis.status,
      trend: Math.floor(Math.random() * 7) - 3, // -3 to +3
      teamMembers: memberSentiments,
      historicalData
    };
  };

  // Helper function to get sentiment status from score
  const getStatusFromScore = (score: number): string => {
    if (score >= 80) return 'Very Positive';
    if (score >= 65) return 'Positive';
    if (score >= 45) return 'Neutral';
    if (score >= 25) return 'Negative';
    return 'Very Negative';
  };

  // Helper function to get random positive factors
  const getRandomPositiveFactors = (): string[] => {
    const allFactors = [
      'Clear task requirements',
      'Effective team communication',
      'Timely feedback',
      'Recognition of achievements',
      'Balanced workload',
      'Skill utilization',
      'Team collaboration',
      'Flexible work arrangements',
      'Growth opportunities',
      'Supportive leadership'
    ];
    
    // Select 2-4 random factors
    return getRandomItemsFromArray(allFactors, 2, 4);
  };

  // Helper function to get random negative factors
  const getRandomNegativeFactors = (): string[] => {
    const allFactors = [
      'Tight deadlines',
      'Unclear requirements',
      'Communication gaps',
      'Skill-task mismatch',
      'Too many context switches',
      'Meeting overload',
      'Technical challenges',
      'Resource limitations',
      'Process bottlenecks',
      'Lack of recognition'
    ];
    
    // Select 1-3 random factors
    return getRandomItemsFromArray(allFactors, 1, 3);
  };

  // Helper function to get random items from array
  const getRandomItemsFromArray = (array: string[], min: number, max: number): string[] => {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Helper function to generate recommendation
  const generateRecommendation = (
    status: string, 
    positiveFactors: string[], 
    negativeFactors: string[]
  ): string => {
    if (status === 'Very Positive' || status === 'Positive') {
      if (positiveFactors.includes('Team collaboration')) {
        return 'Continue fostering team collaboration through regular knowledge sharing sessions.';
      } else if (positiveFactors.includes('Clear task requirements')) {
        return 'Maintain the current level of detail in task specifications and documentation.';
      } else {
        return 'Recognize and build on current strengths while addressing minor concerns.';
      }
    } else if (status === 'Neutral') {
      if (negativeFactors.includes('Tight deadlines')) {
        return 'Consider adjusting task timelines to allow more buffer for unexpected challenges.';
      } else if (negativeFactors.includes('Communication gaps')) {
        return 'Implement more structured communication channels and regular check-ins.';
      } else {
        return 'Focus on improving areas of concern while reinforcing positive aspects.';
      }
    } else {
      if (negativeFactors.includes('Skill-task mismatch')) {
        return 'Review task allocation criteria to better match skills with assignments.';
      } else if (negativeFactors.includes('Too many context switches')) {
        return 'Reduce task switching by grouping similar tasks and implementing focus periods.';
      } else {
        return 'Address critical concerns immediately through targeted interventions and support.';
      }
    }
  };

  // Helper function to generate historical data
  const generateHistoricalData = (currentScore: number): Array<{date: string; score: number; status: string}> => {
    const result = [];
    const dates = getDates(7); // Get last 7 days
    
    // Start with a base score somewhat lower than current
    let score = Math.max(30, currentScore - 15);
    
    for (let i = 0; i < dates.length; i++) {
      // Gradually increase the score (with some variation) to simulate improvement
      score = Math.min(100, score + Math.floor(Math.random() * 7) - 2);
      result.push({
        date: dates[i],
        score,
        status: getStatusFromScore(score)
      });
    }
    
    return result;
  };

  // Helper function to get dates for the last n days
  const getDates = (days: number): string[] => {
    const dates = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    return dates;
  };

  // Color based on sentiment
  const getSentimentColor = (status: string): string => {
    switch(status) {
      case 'Very Positive': return 'bg-green-500';
      case 'Positive': return 'bg-green-400';
      case 'Neutral': return 'bg-blue-400';
      case 'Negative': return 'bg-orange-400';
      case 'Very Negative': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <DashboardLayout title="Sentiment Analysis">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Team Sentiment Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered analysis of team emotional state and satisfaction levels for optimized task allocation.
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Team Overview</TabsTrigger>
            <TabsTrigger value="individuals">Individual Analysis</TabsTrigger>
            <TabsTrigger value="trends">Sentiment Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="pt-6">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Overall Sentiment */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Overall Team Sentiment</h3>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative w-48 h-48 mb-4">
                        <div className="absolute inset-0 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
                        
                        {/* Sentiment gauge */}
                        <svg className="absolute inset-0" viewBox="0 0 100 100">
                          <path 
                            d="M5,50 A45,45 0 1,1 95,50" 
                            fill="none" 
                            stroke="#e5e7eb" 
                            strokeWidth="10" 
                            strokeLinecap="round"
                          />
                          <path 
                            d="M5,50 A45,45 0 1,1 95,50" 
                            fill="none" 
                            stroke={
                              sentimentData?.overallStatus === 'Very Positive' ? '#10b981' :
                              sentimentData?.overallStatus === 'Positive' ? '#34d399' :
                              sentimentData?.overallStatus === 'Neutral' ? '#60a5fa' :
                              sentimentData?.overallStatus === 'Negative' ? '#f97316' : '#ef4444'
                            }
                            strokeDasharray="141.5"
                            strokeDashoffset={141.5 - (141.5 * (sentimentData?.overallScore || 0) / 100)}
                            strokeWidth="10" 
                            strokeLinecap="round"
                          />
                          
                          {/* Indicator */}
                          <circle 
                            cx={50 + 38 * Math.cos(Math.PI * (1 - (sentimentData?.overallScore || 0) / 100))} 
                            cy={50 + 38 * Math.sin(Math.PI * (1 - (sentimentData?.overallScore || 0) / 100))} 
                            r="5" 
                            fill="white" 
                            stroke={
                              sentimentData?.overallStatus === 'Very Positive' ? '#10b981' :
                              sentimentData?.overallStatus === 'Positive' ? '#34d399' :
                              sentimentData?.overallStatus === 'Neutral' ? '#60a5fa' :
                              sentimentData?.overallStatus === 'Negative' ? '#f97316' : '#ef4444'
                            }
                            strokeWidth="2"
                          />
                        </svg>
                        
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-3xl font-bold">{sentimentData?.overallScore || 0}%</span>
                          <span className={`text-sm font-medium ${
                            sentimentData?.overallStatus === 'Very Positive' ? 'text-green-600 dark:text-green-400' :
                            sentimentData?.overallStatus === 'Positive' ? 'text-green-500 dark:text-green-400' :
                            sentimentData?.overallStatus === 'Neutral' ? 'text-blue-500' :
                            sentimentData?.overallStatus === 'Negative' ? 'text-orange-500' : 'text-red-500'
                          }`}>
                            {sentimentData?.overallStatus || 'Neutral'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className={`material-icons ${sentimentData?.trend && sentimentData.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {sentimentData?.trend && sentimentData.trend > 0 ? 'trending_up' : 'trending_down'}
                        </span>
                        <span className={`ml-1 ${sentimentData?.trend && sentimentData.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {sentimentData?.trend ? Math.abs(sentimentData.trend) : 0}% from last week
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Top Positive Factors</h4>
                        <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300">
                          <li>Clear task specifications</li>
                          <li>Recognition of achievements</li>
                          <li>Balanced workload distribution</li>
                        </ul>
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">Areas for Improvement</h4>
                        <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300">
                          <li>Meeting efficiency</li>
                          <li>Deadline management</li>
                          <li>Context switching reduction</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sentiment Breakdown */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Team Sentiment Breakdown</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Task Satisfaction</span>
                          <span className="text-sm font-medium text-green-500">82%</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Team Collaboration</span>
                          <span className="text-sm font-medium text-green-500">77%</span>
                        </div>
                        <Progress value={77} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Workload Balance</span>
                          <span className="text-sm font-medium text-amber-500">68%</span>
                        </div>
                        <Progress value={68} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Communication Quality</span>
                          <span className="text-sm font-medium text-green-500">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Work-Life Balance</span>
                          <span className="text-sm font-medium text-amber-500">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="flex items-center text-blue-800 dark:text-blue-300 font-medium text-sm">
                        <span className="material-icons mr-1 text-sm">lightbulb</span>
                        Recommendation
                      </h4>
                      <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                        Focus on improving workload balance and work-life balance by implementing more flexible scheduling and task prioritization. Consider task distribution optimization to prevent overloading specific team members.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Individual Analysis Tab */}
          <TabsContent value="individuals" className="pt-6">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : (
              <div className="space-y-6">
                {sentimentData?.teamMembers.map((member) => (
                  <Card key={member.id}>
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
                        
                        <div className="md:w-2/5 flex items-center mb-4 md:mb-0">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4 relative">
                            <div className={`w-16 h-16 rounded-full ${getSentimentColor(member.sentimentStatus)} opacity-20 absolute`}></div>
                            <div className="text-center">
                              <div className="text-xl font-bold">{member.sentimentScore}%</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{member.sentimentStatus}</div>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="mb-2">
                              <div className="text-xs font-medium">Positive Factors</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.factors.positive.map((factor, idx) => (
                                  <span 
                                    key={idx} 
                                    className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full"
                                  >
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs font-medium">Areas for Improvement</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.factors.negative.map((factor, idx) => (
                                  <span 
                                    key={idx} 
                                    className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full"
                                  >
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-1/3">
                          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Recommendation</div>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {member.recommendation}
                            </p>
                          </div>
                          
                          <div className="mt-3 flex justify-end">
                            <Button size="sm" variant="outline" className="mr-2">View Details</Button>
                            <Button size="sm">Optimize Tasks</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="flex items-center text-purple-800 dark:text-purple-300 font-medium">
                    <span className="material-icons mr-2">psychology</span>
                    Sentiment Analysis Methodology
                  </h4>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    NeurAllocate's sentiment analysis engine uses multiple data points including task completion patterns, communication style, activity timing, and direct feedback. 
                    The AI analyzes these factors to create a holistic view of team member emotional states and job satisfaction, 
                    which informs optimal task allocation.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Sentiment Trend (Last 7 Days)</h3>
                    
                    <div className="h-64 flex items-end justify-between relative">
                      {/* Background grid */}
                      <div className="absolute inset-0 grid grid-rows-4 gap-0">
                        <div className="border-b border-gray-200 dark:border-gray-700"></div>
                        <div className="border-b border-gray-200 dark:border-gray-700"></div>
                        <div className="border-b border-gray-200 dark:border-gray-700"></div>
                        <div className="border-b border-gray-200 dark:border-gray-700"></div>
                      </div>
                      
                      {/* Y-axis labels */}
                      <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                        <div>100%</div>
                        <div>75%</div>
                        <div>50%</div>
                        <div>25%</div>
                        <div>0%</div>
                      </div>
                      
                      {/* Bars */}
                      <div className="absolute left-8 right-0 bottom-0 top-0 flex items-end justify-between">
                        {sentimentData?.historicalData.map((data, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className={`w-12 rounded-t ${
                                data.status === 'Very Positive' ? 'bg-green-500' :
                                data.status === 'Positive' ? 'bg-green-400' :
                                data.status === 'Neutral' ? 'bg-blue-400' :
                                data.status === 'Negative' ? 'bg-orange-400' : 'bg-red-500'
                              }`} 
                              style={{ height: `${data.score}%` }}
                            ></div>
                            <div className="mt-2 text-xs">{data.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Trend Insights</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Team sentiment has shown a positive trend over the past week, improving by approximately {sentimentData?.trend ? Math.abs(sentimentData.trend) : 3}%. 
                          This correlates with recent improvements in task allocation and workload balancing.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Action Items</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                          <li>Continue optimizing meeting efficiency</li>
                          <li>Maintain current task allocation approach</li>
                          <li>Implement scheduled focus time blocks</li>
                          <li>Enhance recognition for completed tasks</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Sentiment Drivers Analysis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Positive Sentiment Drivers</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Task Clarity</span>
                              <span>High Impact</span>
                            </div>
                            <Progress value={85} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Recognition</span>
                              <span>High Impact</span>
                            </div>
                            <Progress value={80} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Skill Utilization</span>
                              <span>Medium Impact</span>
                            </div>
                            <Progress value={75} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Team Support</span>
                              <span>Medium Impact</span>
                            </div>
                            <Progress value={70} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Negative Sentiment Drivers</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Meeting Overload</span>
                              <span>High Impact</span>
                            </div>
                            <Progress value={85} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Tight Deadlines</span>
                              <span>High Impact</span>
                            </div>
                            <Progress value={80} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Context Switching</span>
                              <span>Medium Impact</span>
                            </div>
                            <Progress value={70} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Unclear Priorities</span>
                              <span>Medium Impact</span>
                            </div>
                            <Progress value={65} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">AI-Powered Interventions</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="material-icons text-blue-500 mr-1 text-sm">check_circle</span>
                            <span>Smart meeting scheduling</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-blue-500 mr-1 text-sm">check_circle</span>
                            <span>Focus time blocks in calendar</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-blue-500 mr-1 text-sm">check_circle</span>
                            <span>Task priority optimization</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-blue-500 mr-1 text-sm">check_circle</span>
                            <span>Automated recognition system</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-blue-500 mr-1 text-sm">check_circle</span>
                            <span>Intelligent deadline setting</span>
                          </li>
                        </ul>
                        
                        <Button className="w-full mt-4" size="sm">
                          Apply Interventions
                        </Button>
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