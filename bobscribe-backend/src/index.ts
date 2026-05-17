import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { env } from './config/env.js';
import { plannerRoutes } from './routes/planner.routes.js';
import { githubRoutes } from './routes/github.routes.js';
import { chatbotRoutes } from './routes/chatbot.routes.js';

/**
 * Bootstrap the Fastify server
 */
async function bootstrap() {
  // Create Fastify instance with logging
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
    },
  });

  // Register CORS plugin
  await fastify.register(cors, {
    origin: [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Alternative frontend port
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Register multipart plugin for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 1, // Max 1 file per request
    },
  });

  // Global error handler
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);

    const err = error as Error & { statusCode?: number };
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    reply.code(statusCode).send({
      success: false,
      error: message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  // Register routes
  await fastify.register(plannerRoutes, { prefix: '/api/v1/planner' });
  await fastify.register(githubRoutes, { prefix: '/api/v1/github' });
  await fastify.register(chatbotRoutes, { prefix: '/api/v1/chatbot' });

  // Root health check
  fastify.get('/', async () => {
    return {
      service: 'BobScribe Backend API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  });

  // Start server
  try {
    await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    fastify.log.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 BobScribe Backend API Server                        ║
║                                                           ║
║   Environment: ${env.NODE_ENV.padEnd(43)}║
║   Port:        ${env.PORT.toString().padEnd(43)}║
║   URL:         http://localhost:${env.PORT.toString().padEnd(31)}║
║                                                           ║
║   Endpoints:                                              ║
║   - POST /api/v1/planner/analyze                         ║
║   - GET  /api/v1/planner/health                          ║
║   - GET  /api/v1/github/oauth/initiate                   ║
║   - POST /api/v1/github/oauth/callback                   ║
║   - GET  /api/v1/github/repository/:owner/:repo          ║
║   - POST /api/v1/chatbot/ask                             ║
║   - GET  /api/v1/chatbot/health                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Made with Bob
