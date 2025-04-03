import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  bio: string;
  joined: string;
  skills: Array<{
    name: string;
    proficiency: number;
  }>;
  stats: {
    tasksCompleted: number;
    avgCompletionTime: string;
    tasksInProgress: number;
    successRate: number;
  };
  preferences: {
    taskTypes: string[];
    workHours: {
      start: string;
      end: string;
    };
    availability: string;
    notificationPreferences: {
      email: boolean;
      inApp: boolean;
      taskAssignment: boolean;
      statusUpdates: boolean;
      dailySummary: boolean;
    };
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    department: '',
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Try to fetch the user profile
        const user = await apiRequest<any>('GET', '/api/user/me');
        
        // Create a profile with the user data or generate a mock profile
        const profileData = generateProfileData(user);
        setProfile(profileData);
        
        // Set form data
        setFormData({
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio,
          department: profileData.department,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Generate mock profile data if fetch fails
        const mockProfile = generateProfileData();
        setProfile(mockProfile);
        
        // Set form data
        setFormData({
          name: mockProfile.name,
          email: mockProfile.email,
          bio: mockProfile.bio,
          department: mockProfile.department,
        });
        
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  // Helper function to generate profile data
  const generateProfileData = (userData?: any): UserProfile => {
    if (userData && userData.name) {
      // Use actual user data if available
      return {
        id: userData.id || 3,
        name: userData.name,
        email: userData.email || 'user@example.com',
        role: userData.role || 'Team Lead',
        department: userData.department || 'Engineering',
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=1F8A28&color=fff`,
        bio: userData.bio || 'Experienced team lead with a focus on AI-powered task allocation and team coordination.',
        joined: userData.joined || '2023-01-15',
        skills: [
          { name: 'Project Management', proficiency: 85 },
          { name: 'Team Leadership', proficiency: 90 },
          { name: 'JavaScript', proficiency: 75 },
          { name: 'React', proficiency: 80 },
          { name: 'Node.js', proficiency: 70 }
        ],
        stats: {
          tasksCompleted: 42,
          avgCompletionTime: '2d 4h',
          tasksInProgress: 3,
          successRate: 94
        },
        preferences: {
          taskTypes: ['Development', 'Code Review', 'Planning'],
          workHours: {
            start: '9:00',
            end: '17:00'
          },
          availability: 'Available',
          notificationPreferences: {
            email: true,
            inApp: true,
            taskAssignment: true,
            statusUpdates: true,
            dailySummary: false
          }
        }
      };
    }
    
    // Default mock profile if no user data is available
    return {
      id: 3,
      name: 'ARYAN PATEL',
      email: 'aapatel_08@yahoo.com',
      role: 'Team Lead',
      department: 'Engineering',
      avatar: 'https://ui-avatars.com/api/?name=ARYAN+PATEL&background=1F8A28&color=fff',
      bio: 'Experienced team lead with a focus on AI-powered task allocation and team coordination.',
      joined: '2023-01-15',
      skills: [
        { name: 'Project Management', proficiency: 85 },
        { name: 'Team Leadership', proficiency: 90 },
        { name: 'JavaScript', proficiency: 75 },
        { name: 'React', proficiency: 80 },
        { name: 'Node.js', proficiency: 70 }
      ],
      stats: {
        tasksCompleted: 42,
        avgCompletionTime: '2d 4h',
        tasksInProgress: 3,
        successRate: 94
      },
      preferences: {
        taskTypes: ['Development', 'Code Review', 'Planning'],
        workHours: {
          start: '9:00',
          end: '17:00'
        },
        availability: 'Available',
        notificationPreferences: {
          email: true,
          inApp: true,
          taskAssignment: true,
          statusUpdates: true,
          dailySummary: false
        }
      }
    };
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call to update profile
      // await apiRequest('PATCH', '/api/user/profile', formData);
      
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
          department: formData.department
        });
      }
      
      // Exit edit mode
      setIsEditing(false);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile information',
        variant: 'destructive',
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
        department: profile.department,
      });
    }
    setIsEditing(false);
  };

  return (
    <DashboardLayout title="Profile">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">User Profile</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile information, skills, and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="skills">Skills & Expertise</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : profile ? (
              <Card>
                <CardContent className="p-6">
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 flex flex-col items-center">
                          <div className="relative">
                            <img 
                              src={profile.avatar} 
                              alt={profile.name} 
                              className="w-32 h-32 rounded-full mb-4" 
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                            >
                              <span className="material-icons text-lg">edit</span>
                            </Button>
                          </div>
                          
                          <div className="text-center mt-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Member since</div>
                            <div>{new Date(profile.joined).toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        <div className="md:w-2/3 space-y-4 mt-6 md:mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input 
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="role">Role</Label>
                              <Input 
                                id="role" 
                                value={profile.role} 
                                disabled 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="department">Department</Label>
                              <Input 
                                id="department" 
                                name="department" 
                                value={formData.department} 
                                onChange={handleChange} 
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea 
                              id="bio" 
                              name="bio" 
                              value={formData.bio} 
                              onChange={handleChange} 
                              rows={4} 
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 flex flex-col items-center">
                        <img 
                          src={profile.avatar} 
                          alt={profile.name} 
                          className="w-32 h-32 rounded-full mb-4" 
                        />
                        
                        <h3 className="text-xl font-semibold">{profile.name}</h3>
                        <div className="text-gray-600 dark:text-gray-400 mb-2">{profile.role}</div>
                        
                        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center">
                          <span className="material-icons text-sm mr-1">check_circle</span>
                          Verified
                        </div>
                        
                        <div className="text-center mt-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Member since</div>
                          <div>{new Date(profile.joined).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3 pt-6 md:pt-0">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</h4>
                            <div>{profile.email}</div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Department</h4>
                            <div>{profile.department}</div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Bio</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              {profile.bio}
                            </p>
                          </div>
                          
                          <div className="pt-4">
                            <Button onClick={() => setIsEditing(true)}>
                              <span className="material-icons mr-2">edit</span>
                              Edit Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-10">
                <p>No profile information available</p>
              </div>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : profile ? (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Skills & Expertise</h3>
                      <Button>
                        <span className="material-icons mr-2">add</span>
                        Add Skill
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {profile.skills.map((skill, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">{skill.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Proficiency: {skill.proficiency}%
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Progress value={skill.proficiency} className="h-2 flex-1 mr-2" />
                            <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0">
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Skill Recommendations</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start p-4 border rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="material-icons">code</span>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">TypeScript</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Based on your current skills and team needs, improving TypeScript proficiency would enhance your contribution to current projects.
                          </p>
                          <div className="mt-2">
                            <Button size="sm">
                              <span className="material-icons mr-1 text-sm">add</span>
                              Add to Skills
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-4 border rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="material-icons">psychology</span>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">AI/ML Fundamentals</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Understanding the fundamentals of AI and ML would complement your leadership role and help you better manage AI-powered task allocation.
                          </p>
                          <div className="mt-2">
                            <Button size="sm">
                              <span className="material-icons mr-1 text-sm">add</span>
                              Add to Skills
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-10">
                <p>No skills information available</p>
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : profile ? (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Performance Metrics</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">{profile.stats.tasksCompleted}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {profile.stats.avgCompletionTime}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion Time</div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                          {profile.stats.tasksInProgress}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Tasks In Progress</div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {profile.stats.successRate}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">AI-Generated Performance Insights</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="flex items-center text-blue-700 dark:text-blue-400 font-medium">
                          <span className="material-icons mr-2">insights</span>
                          Task Completion Patterns
                        </h4>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          You complete tasks most efficiently in the morning between 9-11am. Consider scheduling complex tasks during this peak productivity window.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="flex items-center text-green-700 dark:text-green-400 font-medium">
                          <span className="material-icons mr-2">trending_up</span>
                          Strengths
                        </h4>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          Your code review tasks have a 98% acceptance rate, significantly above team average. You also excel at project planning and task distribution.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="flex items-center text-amber-700 dark:text-amber-400 font-medium">
                          <span className="material-icons mr-2">construction</span>
                          Areas for Improvement
                        </h4>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          Documentation tasks take 30% longer than average. Consider adopting templates or allocating specific time blocks for documentation work.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-10">
                <p>No performance data available</p>
              </div>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : profile ? (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Work Preferences</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Preferred Task Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferences.taskTypes.map((type, index) => (
                            <div 
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm"
                            >
                              {type}
                            </div>
                          ))}
                          <Button variant="outline" size="sm" className="rounded-full">
                            <span className="material-icons text-sm mr-1">add</span>
                            Add
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Preferred Working Hours</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Label htmlFor="work-start" className="text-xs">Start</Label>
                              <Input 
                                id="work-start" 
                                type="time" 
                                defaultValue={profile.preferences.workHours.start} 
                              />
                            </div>
                            <div className="mt-5">to</div>
                            <div className="flex-1">
                              <Label htmlFor="work-end" className="text-xs">End</Label>
                              <Input 
                                id="work-end" 
                                type="time" 
                                defaultValue={profile.preferences.workHours.end} 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Availability Status</h4>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" className="w-full justify-start">
                              <span className="material-icons text-green-500 mr-2">check_circle</span>
                              Available
                            </Button>
                            <Button variant="outline" size="icon">
                              <span className="material-icons">expand_more</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive notifications via email
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                      
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h4 className="font-medium">In-App Notifications</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive notifications within the application
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                      
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h4 className="font-medium">Task Assignment Alerts</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Be notified when a new task is assigned to you
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                      
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h4 className="font-medium">Status Update Notifications</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive alerts when task statuses change
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Daily Summary</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive a daily summary of task activities
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button>
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-10">
                <p>No preferences data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}