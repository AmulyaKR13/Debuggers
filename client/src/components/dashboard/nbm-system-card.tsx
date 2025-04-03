import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { NBMStatus } from "@/lib/ai-services";

interface NbmSystemCardProps {
  nbmStatus?: NBMStatus;
}

export default function NbmSystemCard({ nbmStatus }: NbmSystemCardProps) {
  if (!nbmStatus) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p>NBM system status not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Neuro-Behavioral Matching</h3>
        <div className="flex items-center mb-4">
          <span className="material-icons text-lg text-primary mr-2">psychology</span>
          <div className="text-sm">
            <div className="font-medium">NBM Algorithm Status</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Running optimal matching calculations</div>
          </div>
          <div className="ml-auto">
            <span className="animate-pulse flex h-3 w-3 rounded-full bg-green-500"></span>
          </div>
        </div>
        
        <div className="space-y-4">
          {nbmStatus.components.map((component, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="flex items-center mb-1">
                <span className="text-sm font-medium">{component.name}</span>
                <span className={`ml-auto text-xs ${
                  component.status === "Active" ? "text-green-500" : 
                  component.status === "Learning" ? "text-amber-500" : 
                  "text-gray-500"
                }`}>
                  {component.status}
                </span>
              </div>
              <div className="flex items-center">
                <Progress value={component.performance} className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 mr-2" />
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{component.performance}%</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="link" className="text-primary hover:text-primary/90 p-0">
            View AI Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
