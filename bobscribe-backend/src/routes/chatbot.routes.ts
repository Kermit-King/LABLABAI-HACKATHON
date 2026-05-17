import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { chatbotService } from '../services/chatbot.service.js';
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

interface ChatRequestBody {
  question: string;
  context: ChatContext;
  chatHistory?: ChatMessage[];
}

/**
 * Chatbot Routes
 * Handles context-aware chat interactions
 */
export async function chatbotRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/chatbot/ask
   * Ask a question based on the analyzed context
   */
  fastify.post<{
    Body: ChatRequestBody;
  }>('/ask', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { question, context, chatHistory } = request.body as ChatRequestBody;

      // Validate request
      if (!question || !question.trim()) {
        return reply.code(400).send({
          success: false,
          error: 'Question is required',
        });
      }

      if (!context || !context.transcript) {
        return reply.code(400).send({
          success: false,
          error: 'Context with transcript is required',
        });
      }

      fastify.log.info('Processing chat question');

      // Get response from chatbot service
      const response = await chatbotService.getChatResponse({
        question,
        context,
        chatHistory,
      });

      return reply.code(200).send({
        success: true,
        data: response,
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Chat request error');
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process chat request',
      });
    }
  });

  /**
   * GET /api/v1/chatbot/health
   * Chatbot service health check
   */
  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const isHealthy = await chatbotService.healthCheck();
      return reply.code(isHealthy ? 200 : 503).send({
        success: isHealthy,
        service: 'chatbot',
        status: isHealthy ? 'healthy' : 'unhealthy',
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Chatbot health check error');
      return reply.code(503).send({
        success: false,
        service: 'chatbot',
        status: 'unhealthy',
      });
    }
  });
}

// Made with Bob