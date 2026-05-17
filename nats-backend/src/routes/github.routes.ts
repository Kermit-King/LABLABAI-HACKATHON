import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { githubService } from '../services/github.service.js';

/**
 * GitHub Routes
 * Handles GitHub OAuth and repository operations
 */
export async function githubRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/github/oauth/initiate
   * Initiate GitHub OAuth flow
   */
  fastify.get('/oauth/initiate', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await githubService.initiateOAuth();
      return reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'OAuth initiation error');
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate OAuth',
      });
    }
  });

  /**
   * POST /api/v1/github/oauth/callback
   * Handle OAuth callback and exchange code for token
   */
  fastify.post<{
    Body: { code: string; state: string };
  }>('/oauth/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code } = request.body as { code: string; state: string };

      if (!code) {
        return reply.code(400).send({
          success: false,
          error: 'Authorization code is required',
        });
      }

      const result = await githubService.handleOAuthCallback(code);
      return reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'OAuth callback error');
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'OAuth callback failed',
      });
    }
  });

  /**
   * POST /api/v1/github/oauth/validate
   * Validate access token
   */
  fastify.post<{
    Body: { token: string };
  }>('/oauth/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token } = request.body as { token: string };

      if (!token) {
        return reply.code(400).send({
          success: false,
          error: 'Access token is required',
        });
      }

      const isValid = await githubService.validateToken(token);
      return reply.code(200).send({
        success: true,
        data: { valid: isValid },
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Token validation error');
      return reply.code(500).send({
        success: false,
        error: 'Token validation failed',
      });
    }
  });

  /**
   * GET /api/v1/github/repository/:owner/:repo
   * Fetch repository information
   */
  fastify.get<{
    Params: { owner: string; repo: string };
    Headers: { authorization: string };
  }>('/repository/:owner/:repo', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { owner, repo } = request.params as { owner: string; repo: string };
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: 'Authorization token is required',
        });
      }

      const token = authHeader.substring(7);
      const repository = await githubService.fetchRepository(owner, repo, token);

      return reply.code(200).send({
        success: true,
        data: repository,
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Fetch repository error');
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch repository',
      });
    }
  });

  /**
   * GET /api/v1/github/repository/:owner/:repo/branches
   * Fetch repository branches
   */
  fastify.get<{
    Params: { owner: string; repo: string };
    Headers: { authorization: string };
  }>('/repository/:owner/:repo/branches', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { owner, repo } = request.params as { owner: string; repo: string };
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: 'Authorization token is required',
        });
      }

      const token = authHeader.substring(7);
      const branches = await githubService.fetchBranches(owner, repo, token);

      return reply.code(200).send({
        success: true,
        data: branches,
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Fetch branches error');
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch branches',
      });
    }
  });

  /**
   * GET /api/v1/github/repository/:owner/:repo/tree/:branch
   * Fetch repository file tree and map structure
   */
  fastify.get<{
    Params: { owner: string; repo: string; branch: string };
    Headers: { authorization: string };
  }>('/repository/:owner/:repo/tree/:branch', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { owner, repo, branch } = request.params as { owner: string; repo: string; branch: string };
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: 'Authorization token is required',
        });
      }

      const token = authHeader.substring(7);
      
      // Fetch file tree
      fastify.log.info(`Fetching file tree for ${owner}/${repo}@${branch}`);
      const fileTree = await githubService.fetchFileTree(owner, repo, branch, token);
      
      // Map repository structure
      const repositoryMap = githubService.mapRepositoryStructure(fileTree);
      
      // Validate file sizes
      const validation = githubService.validateFileSizes(repositoryMap.relevantFiles);
      
      if (!validation.valid) {
        fastify.log.warn({ errors: validation.errors }, 'File size validation failed');
      }

      return reply.code(200).send({
        success: true,
        data: {
          tree: fileTree,
          map: repositoryMap,
          validation,
        },
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Fetch file tree error');
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch file tree',
      });
    }
  });

  /**
   * GET /api/v1/github/repository/:owner/:repo/file
   * Fetch file content
   */
  fastify.get<{
    Params: { owner: string; repo: string };
    Querystring: { path: string };
    Headers: { authorization: string };
  }>('/repository/:owner/:repo/file', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { owner, repo } = request.params as { owner: string; repo: string };
      const { path } = request.query as { path: string };
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: 'Authorization token is required',
        });
      }

      if (!path) {
        return reply.code(400).send({
          success: false,
          error: 'File path is required',
        });
      }

      const token = authHeader.substring(7);
      const fileContent = await githubService.fetchFileContent(owner, repo, path, token);

      return reply.code(200).send({
        success: true,
        data: fileContent,
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Fetch file content error');
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch file content',
      });
    }
  });

  /**
   * GET /api/v1/github/health
   * GitHub service health check
   */
  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const isHealthy = await githubService.healthCheck();
      return reply.code(isHealthy ? 200 : 503).send({
        success: isHealthy,
        service: 'github',
        status: isHealthy ? 'healthy' : 'unhealthy',
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'GitHub health check error');
      return reply.code(503).send({
        success: false,
        service: 'github',
        status: 'unhealthy',
      });
    }
  });
}

// Made with Bob