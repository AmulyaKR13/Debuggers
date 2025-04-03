import { TeamMember } from "@/lib/ai-services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface TeamCardProps {
  member: TeamMember;
}

export default function TeamCard({ member }: TeamCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none">
            Available
          </Badge>
        );
      case "LIMITED":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-none">
            Limited
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none">
            Unavailable
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-none">
            Unknown
          </Badge>
        );
    }
  };
  
  const getWorkloadColor = (workload: number) => {
    if (workload < 70) return "bg-green-500";
    if (workload < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="bg-gray-50 dark:bg-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start">
          <img className="h-12 w-12 rounded-full" src={member.avatar} alt={member.name} />
          <div className="ml-3">
            <h4 className="text-md font-semibold">{member.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
          </div>
          <div className="ml-auto">
            {getStatusBadge(member.status)}
          </div>
        </div>
        
        <div className="mt-4">
          <h5 className="text-xs font-semibold uppercase text-gray-500">Skills</h5>
          <div className="mt-1 flex flex-wrap gap-1">
            {member.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-none">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <h5 className="text-xs font-semibold uppercase text-gray-500">Current Workload</h5>
          <Progress value={member.workload} className="mt-1 h-2 bg-gray-200 dark:bg-gray-700">
            <div 
              className={`h-full ${getWorkloadColor(member.workload)} rounded-full`} 
              style={{ width: `${member.workload}%` }}
            ></div>
          </Progress>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{member.workload}% Allocated</span>
            <span>{member.activeTasks} Active Tasks</span>
          </div>
        </div>
        
        <div className="mt-4">
          <h5 className="text-xs font-semibold uppercase text-gray-500">AI Insights</h5>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="material-icons text-xs text-primary align-text-bottom">auto_awesome</span> {member.insight}
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-primary hover:text-primary/90 p-0">
                View Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{member.name} - Profile</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center mb-4">
                  <img className="h-16 w-16 rounded-full" src={member.avatar} alt={member.name} />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                    <div className="mt-1">{getStatusBadge(member.status)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Workload</h4>
                    <Progress value={member.workload} className="mt-1 h-2 bg-gray-200 dark:bg-gray-700">
                      <div 
                        className={`h-full ${getWorkloadColor(member.workload)} rounded-full`} 
                        style={{ width: `${member.workload}%` }}
                      ></div>
                    </Progress>
                    <p className="mt-1 text-sm">{member.workload}% Allocated</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Active Tasks</h4>
                    <p className="mt-1 text-sm">{member.activeTasks} tasks</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500">Skills</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-none">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">AI Analysis</h4>
                  <p className="mt-1 text-sm">{member.insight}</p>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>Additional profile details will be available in future updates.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
