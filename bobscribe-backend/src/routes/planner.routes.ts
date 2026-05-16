import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { watsonSTTService } from '../services/watson.service.js';
import { watsonxService } from '../services/watsonx.service.js';
import type { AnalyzeRequest, AnalyzeResponse } from '../types/intent.js';

/**
 * Register planner routes
 */
export async function plannerRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/planner/analyze
   * Analyze transcript or audio and extract engineering intent
   */
  fastify.post<{
    Body: AnalyzeRequest;
    Reply: AnalyzeResponse;
  }>('/analyze', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let transcript: string;

      // Check if request is multipart (audio file upload)
      if (request.isMultipart()) {
        const data = await request.file();
        
        if (!data) {
          return reply.code(400).send({
            success: false,
            error: 'No audio file provided',
          });
        }

        // Get audio buffer
        const audioBuffer = await data.toBuffer();
        const contentType = data.mimetype;

        // Transcribe audio using Watson STT
        fastify.log.info('Transcribing audio file...');
        transcript = await watsonSTTService.transcribeAudio(audioBuffer, contentType);
        fastify.log.info(`Transcription complete: ${transcript.substring(0, 100)}...`);
      } else {
        // Handle plain text transcript
        const body = request.body as AnalyzeRequest;
        
        if (!body.transcript) {
          return reply.code(400).send({
            success: false,
            error: 'No transcript provided',
          });
        }

        transcript = body.transcript;
      }

      // Validate transcript
      if (!transcript || transcript.trim().length < 10) {
        return reply.code(400).send({
          success: false,
          error: 'Transcript is too short or empty',
        });
      }

      // Extract engineering intent using Watsonx.ai
      fastify.log.info('Extracting engineering intent...');
      const intentPayload = await watsonxService.extractIntent(transcript);
      fastify.log.info('Intent extraction complete');

      return reply.code(200).send({
        success: true,
        data: intentPayload,
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Error in /analyze endpoint:');
      
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  });

  /**
   * GET /api/v1/planner/health
   * Health check endpoint
   */
  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const watsonSTTHealthy = await watsonSTTService.healthCheck();
      const watsonxHealthy = await watsonxService.healthCheck();

      const isHealthy = watsonSTTHealthy && watsonxHealthy;

      return reply.code(isHealthy ? 200 : 503).send({
        success: isHealthy,
        services: {
          watsonSTT: watsonSTTHealthy ? 'healthy' : 'unhealthy',
          watsonx: watsonxHealthy ? 'healthy' : 'unhealthy',
        },
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Health check error:');
      
      return reply.code(503).send({
        success: false,
        error: 'Health check failed',
      });
    }
  });
}

// Made with Bob
