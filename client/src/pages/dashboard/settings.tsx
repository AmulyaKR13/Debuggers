import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ui/theme-provider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
    toast({
      title: 'Theme Updated',
      description: `Theme changed to ${newTheme}`,
    });
  };

  // Handle password change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'All password fields are required',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    // Simulate successful password change
    toast({
      title: 'Success',
      description: 'Your password has been updated successfully',
    });
    
    // Clear form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Handle data export
  const handleExportData = () => {
    // Close dialog
    setIsExportDialogOpen(false);
    
    // Simulate export with a toast notification
    toast({
      title: 'Data Export Initiated',
      description: 'Your data export has started. You will receive an email with your data shortly.',
    });
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    // Close dialog
    setIsDeleteDialogOpen(false);
    
    // Simulate account deletion with a toast notification
    toast({
      title: 'Account Deletion Request Submitted',
      description: 'Your account deletion request has been submitted. You will receive a confirmation email.',
    });
  };

  return (
    <DashboardLayout title="Settings">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="account">
          <TabsList className="w-full">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="pt-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Account Information</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value="aryan_patel" 
                          disabled 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="account-email">Email</Label>
                        <Input 
                          id="account-email" 
                          type="email" 
                          value="aapatel_08@yahoo.com" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Connected Accounts</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-4">
                          <span className="material-icons">alternate_email</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Google</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Not connected
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>
                    
                    <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex items-center justify-center mr-4">
                          <span className="material-icons">hub</span>
                        </div>
                        <div>
                          <h4 className="font-medium">GitHub</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Not connected
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-4">
                          <span className="material-icons">timeline</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Slack</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Not connected
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="pt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6">Theme Settings</h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme-select">Application Theme</Label>
                    <Select 
                      value={theme} 
                      onValueChange={handleThemeChange}
                    >
                      <SelectTrigger id="theme-select" className="w-full md:w-1/3">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Choose how NeurAllocate looks to you. Select a single theme, or sync with your system.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${theme === 'light' ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="h-24 mb-4 bg-white border rounded-md flex items-center justify-center">
                        <div className="w-12 h-6 rounded-full bg-blue-600"></div>
                      </div>
                      <h4 className="font-medium text-center">Light Mode</h4>
                    </div>
                    
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${theme === 'dark' ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="h-24 mb-4 bg-gray-900 border border-gray-700 rounded-md flex items-center justify-center">
                        <div className="w-12 h-6 rounded-full bg-blue-500"></div>
                      </div>
                      <h4 className="font-medium text-center">Dark Mode</h4>
                    </div>
                    
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${theme === 'system' ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                      onClick={() => handleThemeChange('system')}
                    >
                      <div className="h-24 mb-4 bg-gradient-to-r from-white to-gray-900 border rounded-md flex items-center justify-center">
                        <div className="w-12 h-6 rounded-full bg-blue-600 bg-opacity-75"></div>
                      </div>
                      <h4 className="font-medium text-center">System Default</h4>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="pt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6">Notification Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Communication Channels</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h5 className="font-medium">Email Notifications</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive notifications via email
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                      
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h5 className="font-medium">Web Push Notifications</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive push notifications in your browser
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      </div>
                      
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h5 className="font-medium">In-App Notifications</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive notifications within the application
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Notification Types</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h5 className="font-medium">Task Assignments</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            When a task is assigned to you
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                      
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h5 className="font-medium">Status Updates</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            When a task status changes
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                      
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h5 className="font-medium">Comments & Mentions</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            When someone comments or mentions you
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                      
                      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                        <div>
                          <h5 className="font-medium">Team Updates</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Changes to team structure or availability
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">System Notifications</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            System updates and maintenance alerts
                          </p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>
                      Save Notification Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="pt-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Change Password</h3>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input 
                          id="current-password" 
                          type="password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input 
                          id="new-password" 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Two-Factor Authentication</h3>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="flex items-center text-blue-700 dark:text-blue-400 font-medium">
                        <span className="material-icons mr-2">info</span>
                        Why use Two-Factor Authentication?
                      </h4>
                      <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                        Two-factor authentication adds an additional layer of security to your account by requiring both something you know (your password) and something you have (your phone or security key).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Sessions & Activity</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start p-4 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="material-icons">computer</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Current Session</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Chrome on Windows • IP: 192.168.1.1
                            </p>
                          </div>
                          <div className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Last activity: Just now
                        </p>
                      </div>
                    </div>
                    
                    <Button className="w-full" variant="outline">View All Device Activity</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="pt-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Data Management</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Export Your Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Download a copy of your data including tasks, assignments, and profile information.
                      </p>
                      <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
                        <span className="material-icons mr-2">download</span>
                        Request Data Export
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t dark:border-gray-700">
                      <h4 className="font-medium mb-2 text-red-600 dark:text-red-400">Danger Zone</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                        <span className="material-icons mr-2">delete_forever</span>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">AI Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                      <div>
                        <h4 className="font-medium">AI Task Allocation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow AI to automatically assign tasks based on skills and workload
                        </p>
                      </div>
                      <div className="h-6 w-12 rounded-full bg-green-500"></div>
                    </div>
                    
                    <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                      <div>
                        <h4 className="font-medium">Cognitive Load Monitoring</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow AI to analyze and monitor your cognitive workload
                        </p>
                      </div>
                      <div className="h-6 w-12 rounded-full bg-green-500"></div>
                    </div>
                    
                    <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                      <div>
                        <h4 className="font-medium">Skill Development Recommendations</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive AI-generated skill improvement recommendations
                        </p>
                      </div>
                      <div className="h-6 w-12 rounded-full bg-green-500"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Sentiment Analysis</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow AI to analyze sentiment and satisfaction levels
                        </p>
                      </div>
                      <div className="h-6 w-12 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button>
                      Save AI Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Export Data Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Your Data</DialogTitle>
            <DialogDescription>
              Request a complete export of your account data. This includes tasks, assignments, profile information, and interaction history.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg my-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              The export process may take up to 24 hours to complete. You will receive an email with a secure download link when your data is ready.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData}>
              Request Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Your Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg my-4">
            <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Are you absolutely sure?</h4>
            <p className="text-sm text-red-700 dark:text-red-400">
              This will delete all of your data including:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 mt-2">
              <li>Personal profile information</li>
              <li>Task assignments and history</li>
              <li>Skills and performance data</li>
              <li>All settings and preferences</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">Type "DELETE" to confirm</Label>
            <Input 
              id="confirm-delete" 
              placeholder="DELETE" 
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}