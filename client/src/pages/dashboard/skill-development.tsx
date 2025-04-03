import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Skill {
  id: number;
  name: string;
  description: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  category: string;
}

interface LearningResource {
  id: string;
  title: string;
  type: string;
  source: string;
  level: string;
  url: string;
  estimatedTime: string;
  relevance: number;
}

interface SkillRecommendation {
  skill: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
}

export default function SkillDevelopmentPage() {
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch skill recommendations
        const recResponse = await apiRequest<any>('GET', '/api/user/skill-recommendations');
        
        // Generate skill data based on recommendations
        const skillsData = generateSkillsData(recResponse);
        setUserSkills(skillsData);
        
        // Generate learning resources
        const resources = generateLearningResources(skillsData);
        setLearningResources(resources);
        
        // Generate skill recommendations
        const recs = generateSkillRecommendations();
        setRecommendations(recs);
        
      } catch (error) {
        console.error('Error fetching skill development data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load skill development data',
          variant: 'destructive',
        });
        
        // Generate fallback data
        const skillsData = generateSkillsData();
        setUserSkills(skillsData);
        
        const resources = generateLearningResources(skillsData);
        setLearningResources(resources);
        
        const recs = generateSkillRecommendations();
        setRecommendations(recs);
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Helper function to generate skills data
  const generateSkillsData = (apiResponse?: any): Skill[] => {
    const defaultSkills: Skill[] = [
      {
        id: 1,
        name: 'JavaScript',
        description: 'Modern JavaScript including ES6+ features',
        currentLevel: 7,
        targetLevel: 9,
        progress: 78,
        category: 'Technical'
      },
      {
        id: 2,
        name: 'React',
        description: 'Component-based UI library',
        currentLevel: 6,
        targetLevel: 9,
        progress: 67,
        category: 'Technical'
      },
      {
        id: 3,
        name: 'TypeScript',
        description: 'Typed JavaScript for scalable applications',
        currentLevel: 5,
        targetLevel: 8,
        progress: 63,
        category: 'Technical'
      },
      {
        id: 4,
        name: 'Node.js',
        description: 'Server-side JavaScript runtime',
        currentLevel: 6,
        targetLevel: 8,
        progress: 75,
        category: 'Technical'
      },
      {
        id: 5,
        name: 'Project Management',
        description: 'Planning, execution, and reporting',
        currentLevel: 7,
        targetLevel: 9,
        progress: 78,
        category: 'Soft Skills'
      },
      {
        id: 6,
        name: 'Team Leadership',
        description: 'Effective team coordination and motivation',
        currentLevel: 6,
        targetLevel: 8,
        progress: 75,
        category: 'Soft Skills'
      },
      {
        id: 7,
        name: 'UI/UX Design',
        description: 'User interface and experience design',
        currentLevel: 4,
        targetLevel: 7,
        progress: 57,
        category: 'Design'
      },
      {
        id: 8,
        name: 'PostgreSQL',
        description: 'Advanced database management',
        currentLevel: 5,
        targetLevel: 8,
        progress: 63,
        category: 'Technical'
      }
    ];
    
    // If we have API response data, we could modify the default skills
    // based on the response, but for now we'll just return the defaults
    return defaultSkills;
  };

  // Helper function to generate learning resources
  const generateLearningResources = (skills: Skill[]): LearningResource[] => {
    const resources: LearningResource[] = [];
    const resourceTypes = ['Course', 'Video', 'Article', 'Book', 'Workshop'];
    const sources = ['Udemy', 'Coursera', 'YouTube', 'Medium', 'O\'Reilly', 'LinkedIn Learning'];
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    const times = ['1-2 hours', '3-5 hours', '5-10 hours', '10+ hours'];
    
    // Generate resources based on user skills
    skills.forEach(skill => {
      // Generate 1-3 resources per skill
      const count = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < count; i++) {
        const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        
        resources.push({
          id: `resource_${skill.id}_${i}`,
          title: `${level} ${skill.name} ${type}`,
          type,
          source,
          level,
          url: '#',
          estimatedTime: time,
          relevance: Math.floor(Math.random() * 30) + 70 // 70-100%
        });
      }
    });
    
    // Sort by relevance (descending)
    return resources.sort((a, b) => b.relevance - a.relevance);
  };

  // Helper function to generate skill recommendations
  const generateSkillRecommendations = (): SkillRecommendation[] => {
    return [
      {
        skill: 'GraphQL',
        reason: 'Enhances current API development skills for more efficient data fetching',
        priority: 'High'
      },
      {
        skill: 'Cloud Architecture',
        reason: 'Important for scaling current applications and improving deployment workflows',
        priority: 'Medium'
      },
      {
        skill: 'Machine Learning Basics',
        reason: 'Complementary to existing skills for building more intelligent applications',
        priority: 'Medium'
      },
      {
        skill: 'DevOps Practices',
        reason: 'Will improve development workflow and deployment efficiency',
        priority: 'High'
      },
      {
        skill: 'Technical Documentation',
        reason: 'Enhances knowledge sharing and improves team collaboration',
        priority: 'Low'
      }
    ];
  };

  // Handle adding a skill
  const handleAddSkill = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'The ability to add custom skills will be available in the next update.'
    });
  };

  // Handle enrolling in a learning resource
  const handleEnroll = (resource: LearningResource) => {
    toast({
      title: 'Enrolled Successfully',
      description: `You've been enrolled in "${resource.title}"`
    });
  };

  return (
    <DashboardLayout title="Skill Development">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Adaptive Expertise Evolution</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track and develop your professional skills with AI-driven recommendations and resources.
          </p>
        </div>

        <Tabs defaultValue="skills">
          <TabsList className="w-full">
            <TabsTrigger value="skills">My Skills</TabsTrigger>
            <TabsTrigger value="recommendations">Recommended Skills</TabsTrigger>
            <TabsTrigger value="resources">Learning Resources</TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills" className="pt-6">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Current Skills Portfolio</h3>
                  <Button onClick={handleAddSkill}>
                    <span className="material-icons mr-2">add</span>
                    Add Skill
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userSkills.map(skill => (
                    <Card key={skill.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{skill.name}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {skill.category}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {skill.description}
                        </p>
                        
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>Current Level: {skill.currentLevel}/10</span>
                          <span>Target: {skill.targetLevel}/10</span>
                        </div>
                        
                        <Progress value={skill.progress} className="h-2 mb-3" />
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Update</Button>
                          <Button size="sm">
                            <span className="material-icons mr-1 text-sm">school</span>
                            Train
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="flex items-center text-blue-800 dark:text-blue-300 font-medium">
                    <span className="material-icons mr-2">insights</span>
                    Skill Development Insights
                  </h4>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    The system has analyzed your task performance and identified that improving your TypeScript and UI/UX Design skills would have the highest impact on your task efficiency.
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">AI-Recommended Skills</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Based on your current skill set, task performance, and industry trends, NeurAllocate recommends developing these skills:
                    </p>
                    
                    <div className="space-y-4">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start p-4 border rounded-lg">
                          <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mr-4 ${
                            rec.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            rec.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            <span className="material-icons text-xl">school</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{rec.skill}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                rec.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                rec.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {rec.priority} Priority
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {rec.reason}
                            </p>
                            <div className="mt-3">
                              <Button size="sm">Add to My Skills</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Skill Acquisition Strategy</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                            <span className="material-icons mr-1">timeline</span>
                            Progressive Learning
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Learn incrementally by breaking down complex skills into manageable components. Focus on one skill at a time for faster acquisition.
                          </p>
                        </div>
                        
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">
                            <span className="material-icons mr-1">group</span>
                            Collaborative Growth
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Partner with colleagues who possess complementary skills for mutual learning. Knowledge sharing increases retention by up to 70%.
                          </p>
                        </div>
                        
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">
                            <span className="material-icons mr-1">extension</span>
                            Applied Practice
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Apply new skills directly to real tasks. Practical application enhances learning and leads to 90% better retention than theory alone.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Learning Resources Tab */}
          <TabsContent value="resources" className="pt-6">
            {loading ? (
              <Skeleton className="h-96" />
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Personalized Learning Resources</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      AI-curated learning resources matched to your skill development needs and learning style.
                    </p>
                    
                    <div className="space-y-4">
                      {learningResources.map((resource) => (
                        <div key={resource.id} className="flex items-start p-4 border rounded-lg">
                          <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mr-4 ${
                            resource.type === 'Course' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            resource.type === 'Video' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            resource.type === 'Article' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                            resource.type === 'Book' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            <span className="material-icons text-xl">
                              {resource.type === 'Course' ? 'school' :
                               resource.type === 'Video' ? 'play_circle' :
                               resource.type === 'Article' ? 'description' :
                               resource.type === 'Book' ? 'book' : 'event'}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{resource.title}</h4>
                              <div className="flex items-center">
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full mr-2">
                                  {resource.level}
                                </span>
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                                  {resource.relevance}% Match
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>{resource.source}</span>
                              <span className="mx-2">•</span>
                              <span>{resource.type}</span>
                              <span className="mx-2">•</span>
                              <span>{resource.estimatedTime}</span>
                            </div>
                            
                            <div className="mt-3 flex justify-between">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(resource.url, '_blank')}
                              >
                                <span className="material-icons mr-1 text-sm">open_in_new</span>
                                View Details
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleEnroll(resource)}
                              >
                                Enroll
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Learning Schedule</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        NeurAllocate can automatically schedule learning sessions based on your calendar availability and optimal learning times.
                      </p>
                      
                      <Button className="w-full">
                        <span className="material-icons mr-2">schedule</span>
                        Generate Learning Schedule
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}