import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ConflictIssue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdBy: {
    id: number;
    name: string;
    avatar: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    avatar: string;
  };
  participants: Array<{
    id: number;
    name: string;
    avatar: string;
  }>;
  category: string;
  created: string;
  updated: string;
  aiRecommendation?: string;
}

interface ConflictType {
  id: string;
  name: string;
  description: string;
  commonResolutions: string[];
  successRate: number;
}

export default function ConflictResolutionPage() {
  const [issues, setIssues] = useState<ConflictIssue[]>(generateMockIssues());
  const [conflictTypes, setConflictTypes] = useState<ConflictType[]>(generateConflictTypes());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'task_allocation'
  });
  const { toast } = useToast();

  // Helper function to generate mock issues
  function generateMockIssues(): ConflictIssue[] {
    return [
      {
        id: 'conf-001',
        title: 'Task priority disagreement',
        description: 'Team members disagree on which tasks should be prioritized for the current sprint.',
        status: 'in_progress',
        priority: 'high',
        createdBy: {
          id: 1,
          name: 'Likhitha Reddy',
          avatar: 'https://ui-avatars.com/api/?name=Likhitha+Reddy&background=0D8ABC&color=fff'
        },
        assignedTo: {
          id: 3,
          name: 'ARYAN PATEL',
          avatar: 'https://ui-avatars.com/api/?name=ARYAN+PATEL&background=1F8A28&color=fff'
        },
        participants: [
          {
            id: 1,
            name: 'Likhitha Reddy',
            avatar: 'https://ui-avatars.com/api/?name=Likhitha+Reddy&background=0D8ABC&color=fff'
          },
          {
            id: 2,
            name: 'Vipul Sahni',
            avatar: 'https://ui-avatars.com/api/?name=Vipul+Sahni&background=A32CC4&color=fff'
          }
        ],
        category: 'Task Allocation',
        created: '2023-08-15T10:30:00Z',
        updated: '2023-08-16T14:45:00Z',
        aiRecommendation: 'Use the priority matrix to objectively evaluate task importance based on impact and urgency. Schedule a 30-minute facilitated discussion focused on aligning sprint goals with business objectives.'
      },
      {
        id: 'conf-002',
        title: 'Conflicting implementation approaches',
        description: 'Disagreement on the best technical approach for implementing the new authentication system.',
        status: 'open',
        priority: 'medium',
        createdBy: {
          id: 2,
          name: 'Vipul Sahni',
          avatar: 'https://ui-avatars.com/api/?name=Vipul+Sahni&background=A32CC4&color=fff'
        },
        participants: [
          {
            id: 2,
            name: 'Vipul Sahni',
            avatar: 'https://ui-avatars.com/api/?name=Vipul+Sahni&background=A32CC4&color=fff'
          },
          {
            id: 3,
            name: 'ARYAN PATEL',
            avatar: 'https://ui-avatars.com/api/?name=ARYAN+PATEL&background=1F8A28&color=fff'
          },
          {
            id: 4,
            name: 'Kanchan Saxena',
            avatar: 'https://ui-avatars.com/api/?name=Kanchan+Saxena&background=DE4B09&color=fff'
          }
        ],
        category: 'Technical Decision',
        created: '2023-08-14T15:20:00Z',
        updated: '2023-08-14T15:20:00Z',
        aiRecommendation: 'Create a decision matrix with weighted criteria (security, maintainability, performance, timeline). Have each team member score each approach, then discuss areas of significant divergence.'
      },
      {
        id: 'conf-003',
        title: 'Resource allocation disagreement',
        description: 'Team leads disagree on how to allocate developer resources between ongoing maintenance and new feature development.',
        status: 'resolved',
        priority: 'high',
        createdBy: {
          id: 3,
          name: 'ARYAN PATEL',
          avatar: 'https://ui-avatars.com/api/?name=ARYAN+PATEL&background=1F8A28&color=fff'
        },
        assignedTo: {
          id: 3,
          name: 'ARYAN PATEL',
          avatar: 'https://ui-avatars.com/api/?name=ARYAN+PATEL&background=1F8A28&color=fff'
        },
        participants: [
          {
            id: 1,
            name: 'Likhitha Reddy',
            avatar: 'https://ui-avatars.com/api/?name=Likhitha+Reddy&background=0D8ABC&color=fff'
          },
          {
            id: 3,
            name: 'ARYAN PATEL',
            avatar: 'https://ui-avatars.com/api/?name=ARYAN+PATEL&background=1F8A28&color=fff'
          }
        ],
        category: 'Resource Allocation',
        created: '2023-08-10T09:15:00Z',
        updated: '2023-08-12T16:30:00Z',
        aiRecommendation: 'Implement a 70/20/10 allocation model (70% product development, 20% maintenance, 10% innovation) with quarterly reviews. Create a shared backlog where business value is clearly quantified for both maintenance and feature work.'
      }
    ];
  }

  // Helper function to generate conflict types
  function generateConflictTypes(): ConflictType[] {
    return [
      {
        id: 'conf-type-1',
        name: 'Task Allocation Conflicts',
        description: 'Disagreements about how tasks should be distributed among team members.',
        commonResolutions: [
          'Use objective skill matching criteria',
          'Implement workload balancing tools',
          'Rotate challenging tasks among team members',
          'Create transparent allocation processes'
        ],
        successRate: 86
      },
      {
        id: 'conf-type-2',
        name: 'Technical Approach Conflicts',
        description: 'Disagreements about implementation methods, technologies, or architectural decisions.',
        commonResolutions: [
          'Create weighted decision matrices',
          'Run small proof-of-concept implementations',
          'Seek external expert opinions',
          'Document trade-offs transparently'
        ],
        successRate: 79
      },
      {
        id: 'conf-type-3',
        name: 'Priority Conflicts',
        description: 'Disagreements about which tasks or features should be prioritized.',
        commonResolutions: [
          'Implement objective prioritization frameworks',
          'Quantify business impact of each option',
          'Schedule regular priority alignment meetings',
          'Create escalation paths for critical disagreements'
        ],
        successRate: 83
      },
      {
        id: 'conf-type-4',
        name: 'Resource Allocation Conflicts',
        description: 'Disagreements about how to distribute limited resources across projects or initiatives.',
        commonResolutions: [
          'Create allocation models with percentage guidelines',
          'Implement quarterly resource planning',
          'Establish clear escalation processes',
          'Provide transparent visibility into allocation decisions'
        ],
        successRate: 81
      }
    ];
  }

  // Handle creating a new issue
  const handleCreateIssue = () => {
    // Validate inputs
    if (!newIssue.title || !newIssue.description) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    // Create new issue
    const issue: ConflictIssue = {
      id: `conf-${Date.now().toString().slice(-3)}`,
      title: newIssue.title,
      description: newIssue.description,
      status: 'open',
      priority: newIssue.priority as 'low' | 'medium' | 'high',
      createdBy: {
        id: 3,
        name: 'ARYAN PATEL',
        avatar: 'https://ui-avatars.com/api/?name=ARYAN+PATEL&background=1F8A28&color=fff'
      },
      participants: [
        {
          id: 3,
          name: 'ARYAN PATEL',
          avatar: 'https://ui-avatars.com/api/?name=ARYAN+PATEL&background=1F8A28&color=fff'
        }
      ],
      category: getCategory(newIssue.category),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      aiRecommendation: generateAIRecommendation(newIssue.category)
    };
    
    // Add to issues list
    setIssues([issue, ...issues]);
    
    // Close dialog and reset form
    setIsCreateDialogOpen(false);
    setNewIssue({
      title: '',
      description: '',
      priority: 'medium',
      category: 'task_allocation'
    });
    
    // Show success message
    toast({
      title: 'Issue Created',
      description: 'The conflict issue has been created successfully',
    });
  };

  // Get category name from key
  const getCategory = (key: string): string => {
    const categories: Record<string, string> = {
      'task_allocation': 'Task Allocation',
      'technical_decision': 'Technical Decision',
      'priority': 'Priority',
      'resource_allocation': 'Resource Allocation'
    };
    return categories[key] || 'Other';
  };

  // Generate AI recommendation based on category
  const generateAIRecommendation = (category: string): string => {
    const recommendations: Record<string, string> = {
      'task_allocation': 'Analyze skill matching scores and cognitive load metrics for all involved team members. Consider reassigning tasks based on optimal skill alignment and current workload balance.',
      'technical_decision': 'Create a decision matrix with weighted criteria (performance, maintainability, security, timeline). Schedule a structured discussion focused on data-driven evaluation.',
      'priority': 'Implement a quantitative assessment using impact vs. effort scores. Schedule a facilitated meeting to align on clear evaluation criteria before discussing specific prioritization.',
      'resource_allocation': 'Run a resource optimization analysis to identify the most efficient allocation pattern. Create clear metrics to measure the business impact of each allocation approach.'
    };
    return recommendations[category] || 'Schedule a structured discussion with clear agenda and decision framework.';
  };

  // Handle updating an issue's status
  const handleStatusUpdate = (id: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    const updatedIssues = issues.map(issue => {
      if (issue.id === id) {
        return {
          ...issue,
          status: newStatus,
          updated: new Date().toISOString(),
          assignedTo: newStatus !== 'open' ? {
            id: 3,
            name: 'ARYAN PATEL',
            avatar: 'https://ui-avatars.com/api/?name=ARYAN+PATEL&background=1F8A28&color=fff'
          } : undefined
        };
      }
      return issue;
    });
    
    setIssues(updatedIssues);
    
    toast({
      title: 'Status Updated',
      description: `Issue status changed to ${newStatus.replace('_', ' ')}`,
    });
  };

  return (
    <DashboardLayout title="Conflict Resolution">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Conflict Resolution Center</h2>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered tools for identifying, addressing, and resolving team conflicts.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <span className="material-icons mr-2">add</span>
            New Issue
          </Button>
        </div>

        <Tabs defaultValue="issues">
          <TabsList className="w-full">
            <TabsTrigger value="issues">Active Issues</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="patterns">Conflict Patterns</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Active Issues Tab */}
          <TabsContent value="issues" className="pt-6">
            <div className="space-y-6">
              {issues.filter(issue => issue.status !== 'resolved').map(issue => (
                <Card key={issue.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-2/3 pr-6">
                        <div className="flex items-center mb-4">
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium 
                            ${issue.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                              issue.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}
                          >
                            {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
                          </div>
                          <div className="mx-2 h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {issue.category}
                          </div>
                          <div className="mx-2 h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium 
                            ${issue.status === 'open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                              issue.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}
                          >
                            {issue.status === 'in_progress' ? 'In Progress' : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {issue.description}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <span className="material-icons text-gray-400 text-sm mr-1">schedule</span>
                          <span>Created {new Date(issue.created).toLocaleDateString()}</span>
                          {issue.updated !== issue.created && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Updated {new Date(issue.updated).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center">
                          <div className="mr-6 mb-3">
                            <div className="text-xs text-gray-500 mb-1">Created by</div>
                            <div className="flex items-center">
                              <img src={issue.createdBy.avatar} alt={issue.createdBy.name} className="w-6 h-6 rounded-full mr-2" />
                              <span className="text-sm">{issue.createdBy.name}</span>
                            </div>
                          </div>
                          
                          {issue.assignedTo && (
                            <div className="mr-6 mb-3">
                              <div className="text-xs text-gray-500 mb-1">Assigned to</div>
                              <div className="flex items-center">
                                <img src={issue.assignedTo.avatar} alt={issue.assignedTo.name} className="w-6 h-6 rounded-full mr-2" />
                                <span className="text-sm">{issue.assignedTo.name}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-1">Participants</div>
                            <div className="flex -space-x-2">
                              {issue.participants.map(participant => (
                                <img 
                                  key={participant.id}
                                  src={participant.avatar} 
                                  alt={participant.name} 
                                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" 
                                  title={participant.name}
                                />
                              ))}
                              <button className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-1/3 pt-6 md:pt-0 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6">
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <span className="material-icons text-blue-500 mr-1 text-sm">psychology</span>
                          AI Resolution Recommendation
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {issue.aiRecommendation}
                        </p>
                        
                        <div className="space-y-2">
                          {issue.status === 'open' && (
                            <Button 
                              className="w-full" 
                              onClick={() => handleStatusUpdate(issue.id, 'in_progress')}
                            >
                              Start Resolution Process
                            </Button>
                          )}
                          
                          {issue.status === 'in_progress' && (
                            <Button 
                              className="w-full" 
                              onClick={() => handleStatusUpdate(issue.id, 'resolved')}
                            >
                              Mark as Resolved
                            </Button>
                          )}
                          
                          <Button variant="outline" className="w-full">
                            Schedule Meeting
                          </Button>
                          
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {issues.filter(issue => issue.status !== 'resolved').length === 0 && (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="material-icons text-4xl text-gray-400 mb-2">check_circle</span>
                  <h3 className="text-lg font-medium mb-2">No Active Conflicts</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    There are no active conflicts requiring resolution.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Create New Issue
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Resolved Issues Tab */}
          <TabsContent value="resolved" className="pt-6">
            <div className="space-y-6">
              {issues.filter(issue => issue.status === 'resolved').map(issue => (
                <Card key={issue.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-2/3 pr-6">
                        <div className="flex items-center mb-4">
                          <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Resolved
                          </div>
                          <div className="mx-2 h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {issue.category}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {issue.description}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <span className="material-icons text-gray-400 text-sm mr-1">schedule</span>
                          <span>Created {new Date(issue.created).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>Resolved {new Date(issue.updated).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center">
                          <div className="mr-6 mb-3">
                            <div className="text-xs text-gray-500 mb-1">Created by</div>
                            <div className="flex items-center">
                              <img src={issue.createdBy.avatar} alt={issue.createdBy.name} className="w-6 h-6 rounded-full mr-2" />
                              <span className="text-sm">{issue.createdBy.name}</span>
                            </div>
                          </div>
                          
                          {issue.assignedTo && (
                            <div className="mr-6 mb-3">
                              <div className="text-xs text-gray-500 mb-1">Resolved by</div>
                              <div className="flex items-center">
                                <img src={issue.assignedTo.avatar} alt={issue.assignedTo.name} className="w-6 h-6 rounded-full mr-2" />
                                <span className="text-sm">{issue.assignedTo.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="md:w-1/3 pt-6 md:pt-0 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6">
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <span className="material-icons text-green-500 mr-1 text-sm">check_circle</span>
                          Resolution Summary
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          The conflict was successfully resolved using a structured approach to resource allocation. A 70/20/10 model was implemented with quarterly reviews, creating better alignment.
                        </p>
                        
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full">
                            View Resolution Details
                          </Button>
                          
                          <Button variant="outline" className="w-full" onClick={() => handleStatusUpdate(issue.id, 'open')}>
                            Reopen Issue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {issues.filter(issue => issue.status === 'resolved').length === 0 && (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="material-icons text-4xl text-gray-400 mb-2">history</span>
                  <h3 className="text-lg font-medium mb-2">No Resolved Conflicts</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    There are no resolved conflicts in the history.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Conflict Patterns Tab */}
          <TabsContent value="patterns" className="pt-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Common Conflict Types & Resolution Patterns</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The AI has identified these common conflict patterns and effective resolution strategies based on historical data.
                  </p>
                  
                  <div className="space-y-6">
                    {conflictTypes.map(type => (
                      <div key={type.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                          <div className="flex justify-between">
                            <h4 className="font-semibold">{type.name}</h4>
                            <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              {type.successRate}% Success Rate
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {type.description}
                          </p>
                        </div>
                        
                        <div className="p-4">
                          <h5 className="text-sm font-medium mb-2">Common Resolution Strategies</h5>
                          <ul className="space-y-2">
                            {type.commonResolutions.map((resolution, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                                {resolution}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Team Conflict Analytics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="material-icons text-green-600 dark:text-green-400 mr-2">trending_down</span>
                        <h4 className="font-medium text-green-700 dark:text-green-400">Decreasing Trend</h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Overall conflict rate has decreased by 28% in the last quarter due to proactive conflict management.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="material-icons text-amber-600 dark:text-amber-400 mr-2">priority_high</span>
                        <h4 className="font-medium text-amber-700 dark:text-amber-400">Common Trigger</h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Task allocation remains the most common conflict trigger, accounting for 42% of all reported issues.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="material-icons text-blue-600 dark:text-blue-400 mr-2">schedule</span>
                        <h4 className="font-medium text-blue-700 dark:text-blue-400">Resolution Time</h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Average resolution time has improved from 5.2 days to 2.8 days using AI-guided resolution processes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="pt-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Conflict Resolution Resources</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20">
                        <h4 className="font-medium text-blue-700 dark:text-blue-400 flex items-center">
                          <span className="material-icons mr-2">menu_book</span>
                          Frameworks & Templates
                        </h4>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="flex items-start">
                          <span className="material-icons text-gray-500 mr-2 mt-0.5">description</span>
                          <div>
                            <h5 className="text-sm font-medium">Decision Matrix Template</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Structured approach for evaluating options objectively
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="material-icons text-gray-500 mr-2 mt-0.5">description</span>
                          <div>
                            <h5 className="text-sm font-medium">RACI Matrix Template</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Clarify roles and responsibilities to prevent conflicts
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="material-icons text-gray-500 mr-2 mt-0.5">description</span>
                          <div>
                            <h5 className="text-sm font-medium">Conflict Resolution Meeting Agenda</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Structured format for productive resolution discussions
                            </p>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          View All Templates
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-medium text-green-700 dark:text-green-400 flex items-center">
                          <span className="material-icons mr-2">school</span>
                          Training Resources
                        </h4>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="flex items-start">
                          <span className="material-icons text-gray-500 mr-2 mt-0.5">play_circle</span>
                          <div>
                            <h5 className="text-sm font-medium">Effective Conflict Mediation</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              20-minute video course on mediation techniques
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="material-icons text-gray-500 mr-2 mt-0.5">article</span>
                          <div>
                            <h5 className="text-sm font-medium">Non-Violent Communication Guide</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Practical techniques for productive discussions
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="material-icons text-gray-500 mr-2 mt-0.5">quiz</span>
                          <div>
                            <h5 className="text-sm font-medium">Conflict Resolution Assessment</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Evaluate your conflict resolution skills
                            </p>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          Access Training
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">AI-Powered Conflict Resolution Tools</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border dark:border-gray-700 rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="material-icons">psychology</span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">AI Conflict Analyzer</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                            Upload conversation transcripts or documentation to receive AI-generated insights on underlying causes and potential resolution paths.
                          </p>
                          <Button>
                            Launch Analyzer
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border dark:border-gray-700 rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="material-icons">question_answer</span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Resolution Statement Generator</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                            AI tool that helps craft balanced resolution statements incorporating perspectives from all parties while focusing on constructive outcomes.
                          </p>
                          <Button>
                            Generate Statement
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border dark:border-gray-700 rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="material-icons">calendar_month</span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Mediation Scheduler</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                            AI-powered scheduling tool that finds optimal times for all participants, prepares necessary documentation, and sends structured agendas.
                          </p>
                          <Button>
                            Schedule Mediation
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Issue Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Conflict Issue</DialogTitle>
            <DialogDescription>
              Document a conflict that needs resolution. This will initiate the AI-assisted resolution process.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issue-title">Issue Title</Label>
              <input
                id="issue-title"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Brief description of the conflict"
                value={newIssue.title}
                onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issue-description">Description</Label>
              <Textarea
                id="issue-description"
                placeholder="Detailed description of the conflict situation"
                value={newIssue.description}
                onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                className="min-h-32"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup 
                value={newIssue.priority} 
                onValueChange={(value) => setNewIssue({...newIssue, priority: value})}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="priority-medium" />
                  <Label htmlFor="priority-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high">High</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Conflict Category</Label>
              <RadioGroup 
                value={newIssue.category} 
                onValueChange={(value) => setNewIssue({...newIssue, category: value})}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="task_allocation" id="category-task" />
                  <Label htmlFor="category-task">Task Allocation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technical_decision" id="category-technical" />
                  <Label htmlFor="category-technical">Technical Decision</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="priority" id="category-priority" />
                  <Label htmlFor="category-priority">Priority</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resource_allocation" id="category-resource" />
                  <Label htmlFor="category-resource">Resource Allocation</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateIssue}>
              Create Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}