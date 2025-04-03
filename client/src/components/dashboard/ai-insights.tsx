import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIInsights } from "@/lib/ai-services";
import { useToast } from "@/hooks/use-toast";

interface AIInsightsPanelProps {
  insights?: AIInsights;
}

export default function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const { toast } = useToast();
  
  const handleApplyRecommendation = (title: string) => {
    toast({
      title: "Recommendation Applied",
      description: `Successfully applied: ${title}`,
    });
  };

  if (!insights) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p>No AI insights available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Neuro-Behavioral AI Insights</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cognitive Load Chart */}
          <div>
            <h4 className="text-md font-semibold mb-2">Team Cognitive Load Analysis</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg h-64 flex items-center justify-center">
              <div className="w-full h-full flex flex-col justify-between">
                <div className="text-center text-gray-500 dark:text-gray-400 mb-2">Team Cognitive Load Distribution</div>
                <div className="flex-1 flex items-end">
                  <div className="w-1/5 mx-1 bg-green-500 rounded-t-md h-[30%]"></div>
                  <div className="w-1/5 mx-1 bg-green-400 rounded-t-md h-[45%]"></div>
                  <div className="w-1/5 mx-1 bg-yellow-400 rounded-t-md h-[65%]"></div>
                  <div className="w-1/5 mx-1 bg-orange-400 rounded-t-md h-[35%]"></div>
                  <div className="w-1/5 mx-1 bg-red-500 rounded-t-md h-[25%]"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Design</span>
                  <span>Development</span>
                  <span>Research</span>
                  <span>Testing</span>
                  <span>Management</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Research team members are experiencing higher cognitive load than other departments. AI recommends redistributing research tasks.</p>
          </div>
          
          {/* Sentiment Analysis */}
          <div>
            <h4 className="text-md font-semibold mb-2">Team Sentiment Analysis</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg h-64 flex items-center justify-center">
              <div className="w-full h-full flex flex-col justify-between">
                <div className="text-center text-gray-500 dark:text-gray-400 mb-2">Overall Team Sentiment</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-8 border-green-500 flex items-center justify-center relative">
                    <div className="text-3xl font-bold text-gray-800 dark:text-white">{insights.sentimentAnalysis.score}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{insights.sentimentAnalysis.status}</div>
                    <div className="absolute h-1 w-16 bg-gray-800 dark:bg-white bottom-4 left-12 rotate-45 origin-left"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Negative</span>
                  <span>Neutral</span>
                  <span>Positive</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Team sentiment improved after implementing AI-based task allocation. Satisfaction with work-life balance has increased.</p>
          </div>
        </div>
        
        {/* AI Recommendations */}
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-2">AI Recommendations</h4>
          <div className="space-y-3">
            {insights.recommendations.map((recommendation, index) => {
              let bgColor = "bg-blue-50 dark:bg-blue-900/20";
              let iconColor = "text-primary";
              let icon = "psychology";
              
              if (recommendation.type === "upskill") {
                bgColor = "bg-violet-50 dark:bg-violet-900/20";
                iconColor = "text-violet-500";
                icon = "school";
              } else if (recommendation.type === "conflict") {
                bgColor = "bg-amber-50 dark:bg-amber-900/20";
                iconColor = "text-amber-500";
                icon = "mediation";
              }
              
              return (
                <div key={index} className={`flex items-start p-3 ${bgColor} rounded-md`}>
                  <span className={`material-icons ${iconColor} mt-0.5 mr-2`}>{icon}</span>
                  <div>
                    <p className="text-sm font-medium">{recommendation.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{recommendation.description}</p>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className={`ml-auto bg-white dark:bg-gray-800 ${iconColor}`}
                    onClick={() => handleApplyRecommendation(recommendation.title)}
                  >
                    Apply
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
