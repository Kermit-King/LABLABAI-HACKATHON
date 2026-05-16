import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the environment schema with Zod
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // IBM Watson Speech-to-Text
  WATSON_STT_APIKEY: z.string().min(1, 'Watson STT API key is required'),
  WATSON_STT_URL: z.string().url('Watson STT URL must be a valid URL'),

  // IBM Watsonx.ai
  WATSONX_URL: z.string().url('Watsonx URL must be a valid URL'),
  WATSONX_PROJECT_ID: z.string().min(1, 'Watsonx project ID is required'),
  WATSONX_APIKEY: z.string().min(1, 'Watsonx API key is required'),

  // Model Configuration
  WATSONX_MODEL_ID: z.string().default('ibm/granite-3-8b-instruct'),
  WATSONX_MAX_TOKENS: z.string().default('4096').transform(Number),
  WATSONX_TEMPERATURE: z.string().default('0.1').transform(Number),
});

// Validate and parse environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Export validated environment configuration
export const env = validateEnv();

// Type-safe environment configuration
export type Env = z.infer<typeof envSchema>;

// Made with Bob
