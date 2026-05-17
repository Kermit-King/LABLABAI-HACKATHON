import { env } from '../config/env.js';
import type { TechnicalTask, GithubIssue, BobPrompt } from '../types/intent.js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  transcript: string;
  systemBlueprint?: TechnicalTask;
  githubIssues?: GithubIssue[];
  bobPrompt?: BobPrompt;
}

interface ChatRequest {
  question: string;
  context: ChatContext;
  chatHistory?: ChatMessage[];
}

interface ChatResponse {
  answer: string;
  timestamp: string;
}

/**
 * Chatbot Service
 * Provides context-aware chat responses using Watsonx.ai
 */
class ChatbotService {
  private readonly apiUrl: string;
  private readonly projectId: string;
  private readonly apiKey: string;
  private readonly modelId: string;

  constructor() {
    this.apiUrl = env.WATSONX_URL;
    this.projectId = env.WATSONX_PROJECT_ID;
    this.apiKey = env.WATSONX_APIKEY;
    this.modelId = env.WATSONX_MODEL_ID;
  }

 
  private async getAccessToken(): Promise<string> {
    const tokenUrl = 'https://iam.cloud.ibm.com/identity/token';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: this.apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

 
  private buildSystemPrompt(context: ChatContext): string {
    let prompt = `You are a helpful AI assistant for the NATS (Notes-to-Action Task Synthesizer) project planning tool. Your role is to answer questions about the analyzed meeting transcript and generated outputs.

IMPORTANT RULES:
1. Answer ONLY based on the provided context below
2. If information is not in the context, clearly state "I don't have that information in the current context"
3. Be concise, technical, and helpful
4. Reference specific sections when answering (e.g., "According to the System Blueprint..." or "In GitHub Issue #2...")
5. If asked about implementation details, refer to the NATS Console prompts
6. When providing code examples, ALWAYS wrap them in markdown code blocks with the language specified:
   \`\`\`typescript
   your code here
   \`\`\`
7. Use appropriate language tags: typescript, javascript, python, java, etc.

AVAILABLE CONTEXT:
`;

    // Add meeting transcript
    if (context.transcript) {
      prompt += `\n## Meeting Transcript:\n${context.transcript}\n`;
    }

    // Add System Blueprint
    if (context.systemBlueprint) {
      prompt += `\n## System Blueprint:\n`;
      prompt += `Task ID: ${context.systemBlueprint.id}\n`;
      prompt += `Title: ${context.systemBlueprint.title}\n`;
      prompt += `Description: ${context.systemBlueprint.description}\n`;
      prompt += `Risk Level: ${context.systemBlueprint.riskLevel}\n`;
      
      if (context.systemBlueprint.affectedFiles?.length > 0) {
        prompt += `\nAffected Files:\n`;
        context.systemBlueprint.affectedFiles.forEach(file => {
          prompt += `- ${file.path}: ${file.changeType} - ${file.description}\n`;
        });
      }

      if (context.systemBlueprint.implementationOrder?.length > 0) {
        prompt += `\nImplementation Steps:\n`;
        context.systemBlueprint.implementationOrder.forEach(step => {
          prompt += `${step.order}. ${step.description}\n`;
          if (step.files.length > 0) {
            prompt += `   Files: ${step.files.join(', ')}\n`;
          }
        });
      }
    }

    // Add GitHub Issues
    if (context.githubIssues && context.githubIssues.length > 0) {
      prompt += `\n## GitHub Issues:\n`;
      context.githubIssues.forEach(issue => {
        prompt += `\nIssue #${issue.id}: ${issue.title}\n`;
        prompt += `Tags: ${issue.tags.join(', ')}\n`;
        prompt += `Description: ${issue.description}\n`;
        prompt += `Priority: ${issue.priority}\n`;
        prompt += `Estimated Effort: ${issue.estimatedEffort}\n`;
        
        if (issue.acceptanceCriteria?.length > 0) {
          prompt += `Acceptance Criteria:\n`;
          issue.acceptanceCriteria.forEach(ac => {
            prompt += `- ${ac.description}\n`;
          });
        }
      });
    }

    // Add NATS Console Prompts
    if (context.bobPrompt) {
      prompt += `\n## NATS Console Implementation Guide:\n`;
      prompt += `System Context:\n${context.bobPrompt.systemContext}\n\n`;
      prompt += `Task Breakdown:\n${context.bobPrompt.taskBreakdown}\n\n`;
      prompt += `File Instructions:\n${context.bobPrompt.fileInstructions}\n\n`;
      prompt += `Acceptance Criteria:\n${context.bobPrompt.acceptanceCriteria}\n\n`;
      if (context.bobPrompt.additionalNotes) {
        prompt += `Additional Notes:\n${context.bobPrompt.additionalNotes}\n`;
      }
    }

    prompt += `\n\nNow answer the user's question based on this context.`;
    
    return prompt;
  }

  
  private buildMessages(systemPrompt: string, question: string, chatHistory?: ChatMessage[]): any[] {
    const messages: any[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add chat history (last 5 messages to stay within token limits)
    if (chatHistory && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-5);
      messages.push(...recentHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add current question
    messages.push({
      role: 'user',
      content: question
    });

    return messages;
  }

  /**
   * Get chat response from Watsonx.ai
   */
  async getChatResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.context);
      const messages = this.buildMessages(systemPrompt, request.question, request.chatHistory);

      console.log('Sending chat request to Watsonx.ai...');
      console.log('Question:', request.question);
      console.log('Context available:', {
        hasTranscript: !!request.context.transcript,
        hasBlueprint: !!request.context.systemBlueprint,
        hasIssues: !!request.context.githubIssues,
        hasPrompt: !!request.context.bobPrompt
      });

      // Get IAM access token
      const accessToken = await this.getAccessToken();

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          project_id: this.projectId,
          model_id: this.modelId,
          messages: messages,
          parameters: {
            max_tokens: 2048,
            temperature: 0.3,
            top_p: 0.9,
            presence_penalty: 0.2,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Watsonx.ai API error:', errorText);
        throw new Error(`Watsonx.ai API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      // Extract answer from response
      let answer = '';
      if (data.choices && data.choices.length > 0) {
        answer = data.choices[0].message?.content || '';
      } else if (data.results && data.results.length > 0) {
        answer = data.results[0].generated_text || '';
      }

      if (!answer) {
        throw new Error('No response generated from Watsonx.ai');
      }

      console.log('Chat response generated successfully');

      return {
        answer: answer.trim(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Chatbot service error:', error);
      throw new Error(`Failed to get chat response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple test request
      const testResponse = await this.getChatResponse({
        question: 'Hello',
        context: {
          transcript: 'Test transcript'
        }
      });
      return !!testResponse.answer;
    } catch (error) {
      console.error('Chatbot health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();

// Made with Bob