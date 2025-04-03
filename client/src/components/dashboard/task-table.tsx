import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Task, useUpdateTaskStatus } from "@/lib/ai-services";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TaskTableProps {
  tasks: Task[];
  limit?: number;
}

export default function TaskTable({ tasks, limit }: TaskTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const updateTaskStatus = useUpdateTaskStatus();
  const { toast } = useToast();
  
  const itemsPerPage = limit || 8;
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  
  const handleStatusChange = async (taskId: number, status: string) => {
    try {
      await updateTaskStatus.mutateAsync({ id: taskId, status });
      toast({
        title: "Status updated",
        description: "Task status has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Failed to update status",
        description: "There was an error updating the task status",
        variant: "destructive",
      });
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Badge variant="destructive">High</Badge>;
      case "MEDIUM":
        return <Badge variant="default" className="bg-amber-500">Medium</Badge>;
      case "LOW":
        return <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-500">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-none">To Do</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-none">In Progress</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none">Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-none">Unknown</Badge>;
    }
  };
  
  const getAIMatchBadge = (score?: number) => {
    if (!score) return (
      <div className="text-sm text-primary font-medium">
        Finding match...
      </div>
    );
    
    if (score >= 90) {
      return (
        <div className="flex items-center">
          <span className="text-green-500 font-medium">{score}%</span>
          <span className="material-icons text-green-500 text-sm ml-1">thumb_up</span>
        </div>
      );
    } else if (score >= 70) {
      return (
        <div className="flex items-center">
          <span className="text-amber-500 font-medium">{score}%</span>
          <span className="material-icons text-amber-500 text-sm ml-1">thumbs_up_down</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <span className="text-red-500 font-medium">{score}%</span>
          <span className="material-icons text-red-500 text-sm ml-1">thumb_down</span>
        </div>
      );
    }
  };
  
  const displayedTasks = tasks
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>AI Match</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <span className="material-icons text-4xl text-gray-400 mb-2">assignment</span>
                  <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No tasks found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Get started by creating a new task</p>
                </TableCell>
              </TableRow>
            ) : (
              displayedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="text-xs text-gray-500">{task.description ? task.description.substring(0, 30) + (task.description.length > 30 ? '...' : '') : ''}</div>
                  </TableCell>
                  <TableCell>
                    {task.assignedToUserId ? (
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="ml-2 text-sm font-medium">User #{task.assignedToUserId}</div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">AI</div>
                        <div className="ml-2 text-sm font-medium text-amber-500">Needs Assignment</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'Not set'}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(task.priority)}
                  </TableCell>
                  <TableCell>
                    {getAIMatchBadge(task.aiMatchScore)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(task.status)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <Button
                      variant="link" 
                      className="text-primary hover:text-primary/90 p-0"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDialogOpen(true);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {!limit && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, tasks.length)} of {tasks.length} tasks
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            {totalPages > 3 && currentPage < totalPages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Task Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-500">Description</h4>
                <p className="mt-1">{selectedTask?.description || "No description provided"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Priority</h4>
                  <div className="mt-1">{selectedTask && getPriorityBadge(selectedTask.priority)}</div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Due Date</h4>
                  <p className="mt-1">{selectedTask?.dueDate ? format(new Date(selectedTask.dueDate), 'MMM dd, yyyy') : 'Not set'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-500">Status</h4>
                <div className="mt-1">
                  <Select
                    defaultValue={selectedTask?.status}
                    onValueChange={(value) => {
                      if (selectedTask) {
                        handleStatusChange(selectedTask.id, value);
                      }
                    }}
                    disabled={updateTaskStatus.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedTask?.aiMatchScore && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">AI Match Score</h4>
                  <div className="mt-1 flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedTask.aiMatchScore >= 90 ? 'bg-green-500' : 
                          selectedTask.aiMatchScore >= 70 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${selectedTask.aiMatchScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{selectedTask.aiMatchScore}%</span>
                  </div>
                </div>
              )}
              
              {selectedTask?.cognitiveLoad && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Cognitive Load</h4>
                  <div className="mt-1 flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedTask.cognitiveLoad <= 3 ? 'bg-green-500' : 
                          selectedTask.cognitiveLoad <= 7 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${(selectedTask.cognitiveLoad / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{selectedTask.cognitiveLoad}/10</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
