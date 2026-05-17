import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { fireworksSTTService } from '../services/fireworks.service.js';
import { watsonxService } from '../services/watsonx.service.js';
import { githubService } from '../services/github.service.js';
import type { AnalyzeRequest, AnalyzeResponse } from '../types/intent.js';
import type { RepositoryMap } from '../types/github.js';

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
      let repositoryData: { owner: string; name: string; branch: string; token: string } | undefined;

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
        const filename = data.filename;

        // Extract repository data from form fields if present
        const fields = data.fields as any;
        if (fields && fields['repository[owner]'] && fields['repository[name]'] &&
            fields['repository[branch]'] && fields['repository[token]']) {
          repositoryData = {
            owner: fields['repository[owner]'].value,
            name: fields['repository[name]'].value,
            branch: fields['repository[branch]'].value,
            token: fields['repository[token]'].value,
          };
        }

        // Transcribe audio using Fireworks AI STT
        fastify.log.info('🎤 Transcribing audio file with Fireworks AI...');
        transcript = await fireworksSTTService.transcribeAudio(audioBuffer, contentType, filename);
        fastify.log.info(`✅ Transcription complete: ${transcript.substring(0, 100)}...`);
        fastify.log.info('🔄 Automatically proceeding to extract engineering intent...');
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
        
        // Extract repository data from JSON body if present
        if (body.repository) {
          repositoryData = body.repository;
        }
      }

      // Validate transcript
      if (!transcript || transcript.trim().length < 10) {
        return reply.code(400).send({
          success: false,
          error: 'Transcript is too short or empty',
        });
      }

      // Fetch GitHub repository context if provided
      let repositoryMap: RepositoryMap | undefined;
      
      if (repositoryData) {
        try {
          fastify.log.info(`Fetching repository context: ${repositoryData.owner}/${repositoryData.name}@${repositoryData.branch}`);
          
          // Validate token first
          const isTokenValid = await githubService.validateToken(repositoryData.token);
          if (!isTokenValid) {
            throw new Error('GitHub token is invalid or expired');
          }
          
          // Fetch file tree
          const fileTree = await githubService.fetchFileTree(
            repositoryData.owner,
            repositoryData.name,
            repositoryData.branch,
            repositoryData.token
          );
          
          // Map repository structure
          repositoryMap = githubService.mapRepositoryStructure(fileTree);
          
          fastify.log.info(`Repository mapped: ${repositoryMap.relevantFiles.length} relevant files found`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          fastify.log.warn({ err: error }, `Failed to fetch repository context: ${errorMessage}`);
          
          // If it's a token error, throw it so the user knows
          if (errorMessage.includes('token') || errorMessage.includes('401') || errorMessage.includes('403')) {
            throw new Error(`GitHub authentication failed: ${errorMessage}. Please check your access token.`);
          }
          
          // For other errors, continue without repository context
          fastify.log.info('Continuing analysis without repository context');
        }
      }

      // Extract engineering intent using Watsonx.ai (with optional GitHub context)
      fastify.log.info('🧠 Extracting engineering intent...');
      const intentPayload = await watsonxService.extractIntent(transcript, repositoryMap);
      fastify.log.info('✅ Intent extraction complete');

      return reply.code(200).send({
        success: true,
        data: {
          ...intentPayload,
          transcript, // Include the transcribed text in the response
        },
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Error in /analyze endpoint:');
      
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      // Determine appropriate status code based on error type
      let statusCode = 500;
      if (errorMessage.includes('token') || errorMessage.includes('authentication') || errorMessage.includes('401')) {
        statusCode = 401;
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        statusCode = 404;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        statusCode = 429;
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        statusCode = 400;
      }
      
      return reply.code(statusCode).send({
        success: false,
        error: errorMessage,
        errorType: statusCode === 401 ? 'authentication' :
                   statusCode === 404 ? 'not_found' :
                   statusCode === 429 ? 'rate_limit' :
                   statusCode === 400 ? 'validation' : 'server_error'
      });
    }
  });

  /**
   * POST /api/v1/planner/transcribe
   * Transcribe audio file only (without extraction)
   */
  fastify.post('/transcribe', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check if request is multipart (audio file upload)
      if (!request.isMultipart()) {
        return reply.code(400).send({
          success: false,
          error: 'Audio file is required',
        });
      }

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
      const filename = data.filename;

      // Transcribe audio using Fireworks AI STT
      fastify.log.info('🎤 Transcribing audio file...');
      const transcript = await fireworksSTTService.transcribeAudio(audioBuffer, contentType, filename);
      fastify.log.info(`✅ Transcription complete: ${transcript.substring(0, 100)}...`);

      return reply.code(200).send({
        success: true,
        data: {
          transcript,
        },
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Error in /transcribe endpoint:');
      
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
      const fireworksSTTHealthy = await fireworksSTTService.healthCheck();
      const watsonxHealthy = await watsonxService.healthCheck();

      const isHealthy = fireworksSTTHealthy && watsonxHealthy;

      return reply.code(isHealthy ? 200 : 503).send({
        success: isHealthy,
        services: {
          fireworksSTT: fireworksSTTHealthy ? 'healthy' : 'unhealthy',
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
