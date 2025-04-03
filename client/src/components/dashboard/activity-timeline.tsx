import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "@/lib/ai-services";

interface ActivityTimelineProps {
  activities: Activity[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p>No recent activities</p>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ai_allocation":
        return { icon: "psychology", color: "bg-blue-100 dark:bg-blue-900/30 text-primary" };
      case "task_completed":
        return { icon: "task_alt", color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" };
      case "upskill":
        return { icon: "school", color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" };
      case "conflict":
        return { icon: "warning", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" };
      case "sentiment":
        return { icon: "mood_bad", color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" };
      default:
        return { icon: "notifications", color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" };
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Latest Activities</h3>
        
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          {activities.map((activity, index) => {
            const { icon, color } = getActivityIcon(activity.type);
            const isLast = index === activities.length - 1;
            
            return (
              <div key={index} className={`relative pl-8 ${isLast ? "" : "pb-5"}`}>
                <div className={`absolute left-0 top-2 h-6 w-6 rounded-full ${color} flex items-center justify-center`}>
                  <span className="material-icons text-sm">{icon}</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium">{activity.title}</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                  {activity.reason && (
                    <div className="mt-1 text-xs text-blue-500">Reason: {activity.reason}</div>
                  )}
                  {activity.recommendation && (
                    <div className="mt-1 text-xs text-violet-500">{activity.recommendation}</div>
                  )}
                  {activity.solution && (
                    <div className="mt-1 text-xs text-amber-500">{activity.solution}</div>
                  )}
                  {activity.action && (
                    <div className="mt-1 text-xs text-red-500">{activity.action}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button variant="link" className="text-primary hover:text-primary/90">
            View All Activities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
