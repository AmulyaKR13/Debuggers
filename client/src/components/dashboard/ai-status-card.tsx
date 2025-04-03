import { Card, CardContent } from "@/components/ui/card";

export default function AIStatusCard() {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <span className="material-icons text-primary text-2xl">auto_awesome</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Task Allocation System</h2>
            <p className="text-gray-600 dark:text-gray-400">The AI is currently analyzing your team's performance and optimizing task distribution.</p>
          </div>
          <div className="ml-auto flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <span className="material-icons text-sm mr-1">check_circle</span> Active
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
