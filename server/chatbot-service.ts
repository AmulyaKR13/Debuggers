import { Task, User } from '@shared/schema';
import { storage } from './storage';
import { aiService } from './ai-service';

export class ChatbotService {
  async processMessage(userId: number, message: string): Promise<any> {
    try {
      const intent = this.analyzeIntent(message.toLowerCase());
      return await this.generateResponse(userId, message, intent);
    } catch (error) {
      console.error("Error processing chatbot message:", error);
      throw error;
    }
  }

  private analyzeIntent(message: string): string {
    // Simple keyword-based intent detection
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('task') && (lowerMessage.includes('show') || lowerMessage.includes('list') || lowerMessage.includes('my'))) {
      return 'show_tasks';
    }
    
    if (lowerMessage.includes('creat') && lowerMessage.includes('task')) {
      return 'create_task';
    }
    
    if (lowerMessage.includes('team') && lowerMessage.includes('availab')) {
      return 'team_availability';
    }
    
    if (lowerMessage.includes('match') || lowerMessage.includes('assign')) {
      return 'match_task';
    }
    
    if (lowerMessage.includes('insight') || lowerMessage.includes('analytics') || lowerMessage.includes('stat')) {
      return 'insights';
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting';
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return 'thanks';
    }
    
    if (lowerMessage.includes('help')) {
      return 'help';
    }
    
    return 'unknown';
  }

  private async generateResponse(userId: number, message: string, intent: string): Promise<any> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const id = this.generateId();
    const timestamp = new Date().toISOString();

    switch (intent) {
      case 'show_tasks': {
        const tasks = await storage.getTasksByUser(userId);
        return {
          id,
          text: `Here are your current tasks, ${user.name}:`,
          timestamp,
          suggestions: ['Create a task', 'Team availability', 'Task insights'],
          data: { tasks }
        };
      }
      
      case 'create_task': {
        return {
          id,
          text: "To create a new task, please provide the following details:\n- Task title\n- Description\n- Priority (Low, Medium, High)\n- Due date (optional)",
          timestamp,
          actions: [
            {
              type: 'link',
              text: 'Go to Task Creation Form',
              url: '/dashboard/tasks/create'
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
          suggestions: ['Show my tasks', 'Task insights', 'Help']
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
          suggestions: ['Show my tasks', 'Team availability', 'Help']
        };
      }
      
      case 'greeting': {
        return {
          id,
          text: `Hello ${user.name}! How can I assist you today with task management?`,
          timestamp,
          suggestions: ['Show my tasks', 'Team availability', 'Create a task', 'Help']
        };
      }
      
      case 'thanks': {
        return {
          id,
          text: "You're welcome! Is there anything else I can help you with?",
          timestamp,
          suggestions: ['Show my tasks', 'Team availability', 'Help']
        };
      }
      
      case 'help': {
        return {
          id,
          text: "I can help you with the following:\n- Viewing your tasks\n- Creating new tasks\n- Checking team availability\n- Understanding AI task matching\n- Accessing insights and analytics\n\nJust ask me what you need!",
          timestamp,
          suggestions: ['Show my tasks', 'Team availability', 'Create a task']
        };
      }
      
      default: {
        return {
          id,
          text: "I'm not sure I understand. Could you rephrase your question or choose from one of the suggested options?",
          timestamp,
          suggestions: ['Show my tasks', 'Team availability', 'Help']
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