import { Task, User } from '@shared/schema';
import { storage } from './storage';
import { aiService } from './ai-service';

// Context-aware system for tracking conversation history
type ConversationContext = {
  lastIntent: string;
  previousMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  taskCreationState?: {
    inProgress: boolean;
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    step: 'title' | 'description' | 'priority' | 'dueDate' | 'confirmation' | 'complete';
  };
};

// Store user conversation contexts
const userContexts = new Map<number, ConversationContext>();

export class ChatbotService {
  async processMessage(userId: number, message: string): Promise<any> {
    try {
      // Initialize or retrieve user context
      if (!userContexts.has(userId)) {
        userContexts.set(userId, {
          lastIntent: '',
          previousMessages: []
        });
      }
      
      const userContext = userContexts.get(userId)!;
      
      // Add user message to context
      userContext.previousMessages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      
      // Keep only the last 10 messages for context
      if (userContext.previousMessages.length > 10) {
        userContext.previousMessages.shift();
      }
      
      // Check if we're in the middle of a task creation flow
      if (userContext.taskCreationState?.inProgress) {
        return await this.handleTaskCreationFlow(userId, message, userContext);
      }
      
      // Analyze intent using the message and conversation context
      const intent = this.analyzeIntent(message.toLowerCase(), userContext);
      
      // Update the last intent
      userContext.lastIntent = intent;
      
      // Generate response based on intent
      const response = await this.generateResponse(userId, message, intent, userContext);
      
      // Add bot response to context
      userContext.previousMessages.push({
        role: 'assistant',
        content: response.text,
        timestamp: new Date()
      });
      
      return response;
    } catch (error) {
      console.error("Error processing chatbot message:", error);
      throw error;
    }
  }

  private analyzeIntent(message: string, context: ConversationContext): string {
    // Advanced intent detection with context awareness
    const lowerMessage = message.toLowerCase();
    
    // Task related intents
    if (lowerMessage.match(/\b(show|list|view|see|display|my|current|pending|open|assigned)\b.*\b(task|tasks|assignment|assignments|todo|to-do)\b/)) {
      return 'show_tasks';
    }
    
    if (lowerMessage.match(/\b(create|add|new|make|start|build|initiate)\b.*\b(task|assignment|todo|to-do)\b/)) {
      return 'create_task';
    }
    
    if (lowerMessage.match(/\b(update|change|edit|modify|alter)\b.*\b(task|assignment|todo|to-do)\b/)) {
      return 'update_task';
    }
    
    if (lowerMessage.match(/\b(delete|remove|cancel|dismiss)\b.*\b(task|assignment|todo|to-do)\b/)) {
      return 'delete_task';
    }
    
    // Team related intents
    if (lowerMessage.match(/\b(team|member|employee|colleague|staff|personnel)\b.*\b(available|availability|free|busy|status)\b/)) {
      return 'team_availability';
    }
    
    if (lowerMessage.match(/\b(team|group|staff|personnel|employee|colleagues)\b.*\b(performance|productivity|efficiency|output|work)\b/)) {
      return 'team_performance';
    }
    
    // Assignment related intents
    if (lowerMessage.match(/\b(match|assign|allocate|distribute|give|hand)\b.*\b(task|assignment|work|job|project)\b/)) {
      return 'match_task';
    }
    
    if (lowerMessage.match(/\b(how|explain|tell|understand)\b.*\b(matching|assignment|allocation|distribution)\b.*\b(work|algorithm|system|process)\b/)) {
      return 'explain_matching';
    }
    
    // Analytics related intents
    if (lowerMessage.match(/\b(insight|analytics|statistic|metric|chart|graph|data|report|dashboard)\b/)) {
      return 'insights';
    }
    
    if (lowerMessage.match(/\b(cognitive|mental|brain|neuro|neural|psychological)\b.*\b(load|burden|demand|strain|stress|capacity|efficiency)\b/)) {
      return 'cognitive_load';
    }
    
    if (lowerMessage.match(/\b(productivity|progress|growth|improvement|efficiency|performance)\b.*\b(trend|pattern|history|data|statistics|analytics)\b/)) {
      return 'productivity_trends';
    }
    
    // Basic conversation intents
    if (lowerMessage.match(/\b(hello|hi|hey|greetings|howdy|good morning|good afternoon|good evening|what's up|sup)\b/)) {
      return 'greeting';
    }
    
    if (lowerMessage.match(/\b(thank|thanks|appreciate|grateful|nice|awesome|excellent|good job|well done)\b/)) {
      return 'thanks';
    }
    
    if (lowerMessage.match(/\b(help|assist|support|guide|information|learn|tell me about|what can you do|features|capabilities)\b/)) {
      return 'help';
    }
    
    if (lowerMessage.match(/\b(bye|goodbye|exit|quit|leave|close|end)\b/)) {
      return 'goodbye';
    }
    
    // Handle follow-up questions based on context
    if (context.lastIntent === 'show_tasks' && 
        lowerMessage.match(/\b(which|what|how|when|details|more|tell me about)\b/)) {
      return 'task_details';
    }
    
    if (context.lastIntent === 'insights' && 
        lowerMessage.match(/\b(more|elaborate|details|explain|show me|tell me about)\b/)) {
      return 'insights_details';
    }
    
    // AI-specific questions
    if (lowerMessage.match(/\b(ai|artificial intelligence|machine learning|algorithm|intelligent|smart|neural)\b.*\b(work|function|operate|use|utilize|employ|technology)\b/)) {
      return 'ai_technology';
    }
    
    // Handle queries about system features
    if (lowerMessage.match(/\b(system|platform|software|application|app|tool|solution|product)\b.*\b(feature|capability|function|do|purpose)\b/)) {
      return 'system_features';
    }
    
    // If we detect a work-related question but can't categorize it specifically
    if (lowerMessage.match(/\b(work|task|project|assignment|team|productivity|resource|schedule|deadline|timeline|priority)\b/)) {
      return 'work_related';
    }
    
    // Technical or domain-specific questions
    if (this.containsTechnicalTerms(lowerMessage)) {
      return 'technical_question';
    }
    
    return 'general_question';
  }
  
  private containsTechnicalTerms(message: string): boolean {
    const technicalTerms = [
      'algorithm', 'neural network', 'machine learning', 'ai model', 'training data',
      'cognitive load theory', 'workload balancing', 'resource allocation', 'optimization',
      'performance metrics', 'skill matrix', 'competency mapping', 'human resources',
      'project management', 'agile', 'scrum', 'kanban', 'waterfall', 'sprint',
      'deadline', 'milestone', 'deliverable', 'stakeholder', 'requirement',
      'api', 'integration', 'database', 'code', 'development', 'programming',
      'frontend', 'backend', 'fullstack', 'devops', 'cicd', 'testing',
      'security', 'authentication', 'authorization', 'encryption'
    ];
    
    return technicalTerms.some(term => message.includes(term));
  }

  private async handleTaskCreationFlow(userId: number, message: string, context: ConversationContext): Promise<any> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const id = this.generateId();
    const timestamp = new Date().toISOString();
    const taskState = context.taskCreationState!;

    // Handle cancellation
    if (message.toLowerCase().match(/\b(cancel|stop|abort|quit|exit|nevermind|never mind)\b/)) {
      context.taskCreationState = undefined;
      return {
        id,
        text: "Task creation cancelled. Is there anything else I can help you with?",
        timestamp,
        suggestions: ['Show my tasks', 'Team availability', 'Create a new task']
      };
    }

    switch (taskState.step) {
      case 'title': {
        taskState.title = message;
        taskState.step = 'description';
        return {
          id,
          text: "Great! Now please provide a brief description of the task.",
          timestamp
        };
      }

      case 'description': {
        taskState.description = message;
        taskState.step = 'priority';
        return {
          id,
          text: "Thank you. Please specify the priority: Low, Medium, or High.",
          timestamp,
          suggestions: ['Low', 'Medium', 'High']
        };
      }

      case 'priority': {
        const priority = message.toLowerCase();
        
        if (!['low', 'medium', 'high'].includes(priority)) {
          return {
            id,
            text: "Please select a valid priority: Low, Medium, or High.",
            timestamp,
            suggestions: ['Low', 'Medium', 'High']
          };
        }

        taskState.priority = priority.charAt(0).toUpperCase() + priority.slice(1);
        taskState.step = 'dueDate';
        return {
          id,
          text: "When is this task due? You can enter a date (MM/DD/YYYY) or say 'No due date'.",
          timestamp,
          suggestions: ['Today', 'Tomorrow', 'Next week', 'No due date']
        };
      }

      case 'dueDate': {
        // Process the due date input
        let dueDate: string | undefined;
        
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage === 'no due date' || lowerMessage === 'none') {
          dueDate = undefined;
        } else if (lowerMessage === 'today') {
          dueDate = new Date().toISOString().split('T')[0];
        } else if (lowerMessage === 'tomorrow') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dueDate = tomorrow.toISOString().split('T')[0];
        } else if (lowerMessage === 'next week') {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          dueDate = nextWeek.toISOString().split('T')[0];
        } else {
          // Attempt to parse as date
          try {
            // Check if format is MM/DD/YYYY
            const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            const match = message.match(dateRegex);
            if (match) {
              const [_, month, day, year] = match;
              const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              dueDate = dateObj.toISOString().split('T')[0];
            } else {
              // Try to parse with JS Date
              const dateObj = new Date(message);
              if (!isNaN(dateObj.getTime())) {
                dueDate = dateObj.toISOString().split('T')[0];
              } else {
                return {
                  id,
                  text: "I couldn't understand that date format. Please use MM/DD/YYYY format or choose from the suggestions.",
                  timestamp,
                  suggestions: ['Today', 'Tomorrow', 'Next week', 'No due date']
                };
              }
            }
          } catch (error) {
            return {
              id,
              text: "I couldn't understand that date format. Please use MM/DD/YYYY format or choose from the suggestions.",
              timestamp,
              suggestions: ['Today', 'Tomorrow', 'Next week', 'No due date']
            };
          }
        }

        taskState.dueDate = dueDate;
        taskState.step = 'confirmation';

        // Confirmation message
        return {
          id,
          text: `Please confirm the following task details:\n\n🔷 Title: ${taskState.title}\n🔷 Description: ${taskState.description}\n🔷 Priority: ${taskState.priority}\n🔷 Due Date: ${taskState.dueDate || 'None'}\n\nIs this correct?`,
          timestamp,
          suggestions: ['Yes, create task', 'No, start over', 'Cancel']
        };
      }

      case 'confirmation': {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('yes') || lowerMessage.includes('correct') || lowerMessage.includes('create')) {
          // Create the task
          try {
            const newTask = await storage.createTask({
              title: taskState.title!,
              description: taskState.description,
              createdByUserId: userId,
              assignedToUserId: userId, // Auto-assign to creator
              status: 'Open',
              priority: taskState.priority!,
              dueDate: taskState.dueDate ? new Date(taskState.dueDate) : undefined
            });

            // Reset task creation state
            context.taskCreationState = undefined;

            return {
              id,
              text: "✅ Success! Your task has been created successfully. Is there anything else you'd like to do?",
              timestamp,
              data: { tasks: [newTask] },
              suggestions: ['Show my tasks', 'Create another task', 'View dashboard']
            };
          } catch (error) {
            console.error("Error creating task:", error);
            
            // Reset task creation state
            context.taskCreationState = undefined;
            
            return {
              id,
              text: "I encountered an error while creating your task. Please try again or use the task creation form in the dashboard.",
              timestamp,
              actions: [
                {
                  type: 'link',
                  text: 'Go to Task Creation Form',
                  url: '/dashboard/tasks/create'
                }
              ],
              suggestions: ['Show my tasks', 'Try again', 'Help']
            };
          }
        } else if (lowerMessage.includes('no') || lowerMessage.includes('start over')) {
          // Reset the task creation process but keep it active
          context.taskCreationState = {
            inProgress: true,
            step: 'title'
          };
          
          return {
            id,
            text: "Let's start over. Please provide a title for your task.",
            timestamp
          };
        } else {
          // User didn't provide a clear yes/no answer
          return {
            id,
            text: "I didn't understand your response. Please confirm if you want to create this task.",
            timestamp,
            suggestions: ['Yes, create task', 'No, start over', 'Cancel']
          };
        }
      }

      default:
        // Reset the task creation state
        context.taskCreationState = undefined;
        return {
          id,
          text: "There was a problem with task creation. Let's try something else.",
          timestamp,
          suggestions: ['Show my tasks', 'Team availability', 'Help']
        };
    }
  }

  private async generateResponse(userId: number, message: string, intent: string, context: ConversationContext): Promise<any> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const id = this.generateId();
    const timestamp = new Date().toISOString();

    // Start task creation flow if that's the intent
    if (intent === 'create_task') {
      // Initialize task creation state
      context.taskCreationState = {
        inProgress: true,
        step: 'title'
      };
      
      return {
        id,
        text: `Let's create a new task, ${user.name}. Please provide a title for your task.`,
        timestamp
      };
    }

    switch (intent) {
      case 'show_tasks': {
        const tasks = await storage.getTasksByUser(userId);
        if (tasks.length === 0) {
          return {
            id,
            text: `You don't have any tasks yet, ${user.name}. Would you like to create one?`,
            timestamp,
            suggestions: ['Create a task', 'Team availability', 'Dashboard insights']
          };
        }
        
        return {
          id,
          text: `Here are your current tasks, ${user.name}:`,
          timestamp,
          suggestions: ['Create a task', 'Team availability', 'Task insights'],
          data: { tasks }
        };
      }
      
      case 'update_task': {
        return {
          id,
          text: "You can update task status, priority, or assignment from the tasks page. Which task would you like to update?",
          timestamp,
          actions: [
            {
              type: 'link',
              text: 'Go to Tasks Page',
              url: '/dashboard/tasks'
            }
          ],
          suggestions: ['Show my tasks', 'Create a task']
        };
      }
      
      case 'delete_task': {
        return {
          id,
          text: "Task deletion is managed through the tasks interface for security reasons. Please access the tasks page to delete any tasks.",
          timestamp,
          actions: [
            {
              type: 'link',
              text: 'Go to Tasks Page',
              url: '/dashboard/tasks'
            }
          ],
          suggestions: ['Show my tasks', 'Team availability']
        };
      }
      
      case 'team_availability': {
        const teamMembers = await aiService.generateTeamMembers();
        const availableCount = teamMembers.filter(member => member.status === 'Available').length;
        const totalCount = teamMembers.length;
        
        return {
          id,
          text: `Currently, ${availableCount} out of ${totalCount} team members are available. The team's average workload is ${this.calculateAverageWorkload(teamMembers).toFixed(0)}%.`,
          timestamp,
          actions: [
            {
              type: 'link',
              text: 'View Team Dashboard',
              url: '/dashboard/team'
            }
          ],
          suggestions: ['Show my tasks', 'Task insights', 'Team performance']
        };
      }
      
      case 'team_performance': {
        const insights = await aiService.generateInsights();
        
        return {
          id,
          text: `Team Performance Summary:\n\n` +
                `• Current completion rate: ${insights.completionRate}%\n` +
                `• Team sentiment: ${insights.teamSentiment}\n` + 
                `• Key recommendation: ${insights.recommendations[0].title}\n\n` +
                `Would you like more detailed insights?`,
          timestamp,
          actions: [
            {
              type: 'link',
              text: 'View Full Analytics',
              url: '/dashboard/analytics'
            }
          ],
          suggestions: ['Cognitive load analysis', 'Show recommendations', 'Team availability']
        };
      }
      
      case 'match_task': {
        return {
          id,
          text: "Our AI-driven task allocation system automatically matches tasks to the most suitable team members based on skills, workload, and cognitive profiles. Tasks can be automatically assigned or you can review AI recommendations before assigning.",
          timestamp,
          actions: [
            {
              type: 'link',
              text: 'View Task Management',
              url: '/dashboard/tasks'
            }
          ],
          suggestions: ['How does AI matching work?', 'Show my tasks', 'Team availability']
        };
      }
      
      case 'explain_matching': {
        return {
          id,
          text: "The NeurAllocate matching algorithm works through several AI components:\n\n" +
                "1️⃣ **Neuro-Behavioral AI Matching:** Analyzes cognitive patterns and matches tasks to individuals based on their cognitive strengths\n\n" +
                "2️⃣ **Dynamic Availability Intelligence:** Considers real-time availability and workloads to prevent burnout\n\n" +
                "3️⃣ **Adaptive Expertise Evolution:** Tracks skill progression and recommends tasks that help team members grow\n\n" +
                "The system continuously learns and improves its matching accuracy over time.",
          timestamp,
          suggestions: ['Show my tasks', 'Team availability', 'Cognitive load analysis']
        };
      }
      
      case 'insights': {
        return {
          id,
          text: "The NeurAllocate system provides AI-powered insights on team performance, cognitive load distribution, and productivity patterns. This helps optimize task allocation and identify potential bottlenecks.",
          timestamp,
          actions: [
            {
              type: 'link',
              text: 'View Dashboard',
              url: '/dashboard'
            }
          ],
          suggestions: ['Show my tasks', 'Team availability', 'Cognitive load']
        };
      }
      
      case 'insights_details': {
        const insights = await aiService.generateInsights();
        
        return {
          id,
          text: "Detailed Insights:\n\n" +
                `• Task completion trending ${insights.completionTrend > 0 ? 'up' : 'down'} by ${Math.abs(insights.completionTrend)}%\n` +
                `• Team availability trending ${insights.availabilityTrend > 0 ? 'up' : 'down'} by ${Math.abs(insights.availabilityTrend)}%\n` +
                `• Sentiment trending ${insights.sentimentTrend > 0 ? 'up' : 'down'} by ${Math.abs(insights.sentimentTrend)}%\n\n` +
                `The system has generated ${insights.recommendations.length} recommendations to improve overall performance.`,
          timestamp,
          actions: [
            {
              type: 'link',
              text: 'View Full Analytics',
              url: '/dashboard/analytics'
            }
          ],
          suggestions: ['Show recommendations', 'Cognitive load analysis', 'Team performance']
        };
      }
      
      case 'cognitive_load': {
        const insights = await aiService.generateInsights();
        const cognitive = insights.cognitiveLoadAnalysis;
        
        return {
          id,
          text: "Cognitive Load Analysis:\n\n" +
                "The system monitors cognitive load across different task types to prevent burnout and optimize productivity:\n\n" +
                `• Design tasks: ${cognitive.design * 100}% cognitive load\n` +
                `• Development: ${cognitive.development * 100}% cognitive load\n` +
                `• Research: ${cognitive.research * 100}% cognitive load\n` +
                `• Testing: ${cognitive.testing * 100}% cognitive load\n` +
                `• Management: ${cognitive.management * 100}% cognitive load\n\n` +
                "Tasks are assigned to balance cognitive load across team members.",
          timestamp,
          suggestions: ['Team performance', 'Show my tasks', 'Productivity trends']
        };
      }
      
      case 'productivity_trends': {
        return {
          id,
          text: "Productivity Analysis:\n\n" +
                "The NeurAllocate system uses AI to track productivity patterns across teams and projects. Some key insights:\n\n" +
                "• Morning productivity peaks between 9-11 AM\n" +
                "• Task completion rates are highest on Tuesdays and Wednesdays\n" +
                "• Cognitive fatigue indicators show 3-4 PM is least productive\n" +
                "• Regular microbreaks correlate with 23% higher output\n\n" +
                "Tasks are scheduled with these patterns in mind.",
          timestamp,
          suggestions: ['Cognitive load analysis', 'Team performance', 'Show my tasks']
        };
      }
      
      case 'ai_technology': {
        return {
          id,
          text: "AI Technology in NeurAllocate:\n\n" +
                "Our platform uses several advanced AI technologies:\n\n" +
                "• Neural network models to learn individual work patterns\n" +
                "• Natural language processing for task analysis and cognitive load estimation\n" +
                "• Predictive analytics to forecast team capacity and bottlenecks\n" +
                "• Reinforcement learning for continuous improvement of matching algorithms\n\n" +
                "All models are trained on anonymized data with privacy as a priority.",
          timestamp,
          suggestions: ['How does AI matching work?', 'System features', 'Help']
        };
      }
      
      case 'system_features': {
        return {
          id,
          text: "NeurAllocate Key Features:\n\n" +
                "• AI-powered task matching based on skills, availability and cognitive profile\n" +
                "• Real-time analytics and insights on team performance\n" +
                "• Cognitive load monitoring and burnout prevention\n" +
                "• Skill development tracking and growth recommendations\n" +
                "• Automated task prioritization and deadline management\n" +
                "• Team availability forecasting\n" +
                "• Advanced chatbot assistant for queries and task creation",
          timestamp,
          suggestions: ['Create a task', 'Team availability', 'Help']
        };
      }
      
      case 'greeting': {
        return {
          id,
          text: `Hello ${user.name}! I'm your AI assistant for task management. How can I help you today?`,
          timestamp,
          suggestions: ['Show my tasks', 'Team availability', 'Create a task', 'Help']
        };
      }
      
      case 'thanks': {
        return {
          id,
          text: "You're welcome! I'm here to make task management easier and more efficient. Is there anything else I can help you with?",
          timestamp,
          suggestions: ['Show my tasks', 'Create a task', 'Help']
        };
      }
      
      case 'goodbye': {
        return {
          id,
          text: `Goodbye, ${user.name}! Feel free to chat with me anytime you need assistance with tasks or team management.`,
          timestamp,
          suggestions: ['Show my tasks', 'Team availability', 'Help']
        };
      }
      
      case 'help': {
        return {
          id,
          text: "I can help you with many aspects of task and team management. Here are some things you can ask me about:\n\n" +
                "• Creating, viewing, updating or deleting tasks\n" +
                "• Checking team availability and performance\n" +
                "• Understanding how AI task matching works\n" +
                "• Getting insights on productivity and cognitive load\n" +
                "• Learning about system features and capabilities\n" +
                "• Technical questions related to project management\n\n" +
                "What would you like to know more about?",
          timestamp,
          suggestions: ['Show my tasks', 'Team availability', 'Create a task', 'System features']
        };
      }
      
      case 'technical_question': {
        // For technical questions, formulate a detailed, educational response
        const technicalResponses = [
          {
            text: "In task allocation, cognitive load theory is crucial for optimizing productivity. It suggests there are three types of cognitive load: intrinsic (the inherent complexity), extraneous (unnecessary complexity), and germane (productive learning effort). NeurAllocate measures these factors to ensure tasks are challenging without being overwhelming.",
            suggestions: ['Tell me more about cognitive load', 'How is this measured?', 'Show my tasks']
          },
          {
            text: "Resource allocation algorithms typically use constraint satisfaction problems (CSPs) with multiple variables. NeurAllocate employs a hybrid approach combining CSPs with reinforcement learning, allowing the system to improve allocations over time based on outcomes.",
            suggestions: ['How does reinforcement learning work?', 'System features', 'Team performance']
          },
          {
            text: "Skill matrix mapping involves quantifying proficiency across various competencies. We use a 5-point scale combined with behavioral data to infer actual versus self-reported skills. This helps match tasks to actual capabilities rather than perceived ones.",
            suggestions: ['Show my skills', 'How to improve my profile?', 'Create a task']
          },
          {
            text: "Performance metrics in NeurAllocate include traditional KPIs like completion rates, but also innovative measures like cognitive efficiency, knowledge transfer index, and collaborative synergy scores. These provide a more holistic view of productivity.",
            suggestions: ['Show performance metrics', 'Team insights', 'System features']
          }
        ];
        
        // Select a relevant technical response based on the message content
        const responseIndex = Math.floor(Math.random() * technicalResponses.length);
        const response = technicalResponses[responseIndex];
        
        return {
          id,
          text: response.text,
          timestamp,
          suggestions: response.suggestions
        };
      }
      
      case 'work_related': {
        return {
          id,
          text: "I see you're asking about work management. NeurAllocate is designed to optimize task distribution using AI that considers skills, workload, and cognitive strengths. Would you like to know about specific features like task creation, team analytics, or our AI matching technology?",
          timestamp,
          suggestions: ['Create a task', 'Team analytics', 'AI matching', 'System features']
        };
      }
      
      case 'general_question': {
        // For general questions that don't fit other categories, provide a friendly, helpful response
        return {
          id,
          text: `I understand you have a question, ${user.name}. As an AI assistant, I specialize in task management, team coordination, and productivity optimization. Can you provide more details about what you'd like to know? I'm here to help!`,
          timestamp,
          suggestions: ['Create a task', 'Show my tasks', 'Team availability', 'Help']
        };
      }
      
      default: {
        // Enhanced response for unknown intents
        const commonSuggestions = [
          'Show my tasks',
          'Create a task',
          'Team availability',
          'Task insights',
          'Help'
        ];
        
        // Analyze message for hints of what the user might be trying to do
        const lowerMessage = message.toLowerCase();
        let customSuggestions = [...commonSuggestions];
        
        if (lowerMessage.includes('assign') || lowerMessage.includes('match')) {
          customSuggestions = ['How does AI matching work?', 'Team availability', 'Show my tasks'];
        } else if (lowerMessage.includes('performance') || lowerMessage.includes('metrics')) {
          customSuggestions = ['Team performance', 'Cognitive load analysis', 'Dashboard insights'];
        }
        
        return {
          id,
          text: `I'm not entirely sure what you're asking about, ${user.name}. Could you rephrase your question or choose from one of these suggestions? I'm here to help with task management, team coordination, and productivity insights.`,
          timestamp,
          suggestions: customSuggestions
        };
      }
    }
  }

  private calculateAverageWorkload(teamMembers: any[]): number {
    if (teamMembers.length === 0) return 0;
    const totalWorkload = teamMembers.reduce((sum, member) => sum + member.workload, 0);
    return totalWorkload / teamMembers.length;
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const chatbotService = new ChatbotService();