import { env } from '../config/env.js';
import type { IntentPayload } from '../types/intent.js';

/**
 * Watsonx.ai Service
 * Handles AI-powered intent extraction and structured output generation
 */
class WatsonxService {
  private apiKey: string;
  private projectId: string;
  private url: string;
  private modelId: string;

  constructor() {
    this.apiKey = env.WATSONX_APIKEY;
    this.projectId = env.WATSONX_PROJECT_ID;
    this.url = env.WATSONX_URL;
    this.modelId = env.WATSONX_MODEL_ID;
  }

  /**
   * Generate IAM token for Watsonx.ai authentication
   */
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

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Create a system prompt that forces structured JSON output
   */
  private createSystemPrompt(): string {
    return `You are an expert software engineering analyst. Your task is to analyze meeting transcripts and extract structured engineering requirements.

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no explanations) matching this exact schema:

{
  "riskLevel": "Low" | "Medium" | "High",
  "technicalTask": {
    "id": "task-001",
    "title": "string",
    "description": "string",
    "riskLevel": "Low" | "Medium" | "High",
    "affectedFiles": [
      {
        "path": "string",
        "changeType": "create" | "modify" | "delete",
        "description": "string"
      }
    ],
    "implementationOrder": [
      {
        "order": 1,
        "description": "string",
        "files": ["string"],
        "completed": false
      }
    ],
    "estimatedEffort": "string"
  },
  "affectedFiles": [...],
  "implementationOrder": [...],
  "githubIssues": [
    {
      "id": "issue-001",
      "title": "string",
      "tags": ["string"],
      "description": "string",
      "acceptanceCriteria": [
        {
          "id": "ac-001-1",
          "description": "string",
          "completed": false
        }
      ],
      "priority": "low" | "medium" | "high"
    }
  ],
  "bobPrompt": {
    "systemContext": "string",
    "taskBreakdown": "string",
    "fileInstructions": "string",
    "acceptanceCriteria": "string",
    "additionalNotes": "string"
  }
}

Rules:
1. Respond with ONLY the JSON object
2. No markdown code blocks (\`\`\`json)
3. No explanatory text before or after
4. Ensure all fields are present
5. Use realistic file paths and technical descriptions`;
  }

  /**
   * Extract engineering intent from transcript using Watsonx.ai
   */
  async extractIntent(transcript: string): Promise<IntentPayload> {
    try {
      const accessToken = await this.getAccessToken();

      const prompt = `${this.createSystemPrompt()}

TRANSCRIPT:
${transcript}

JSON OUTPUT:`;

      const requestBody = {
        model_id: this.modelId,
        input: prompt,
        parameters: {
          max_new_tokens: env.WATSONX_MAX_TOKENS,
          temperature: env.WATSONX_TEMPERATURE,
          top_p: 0.95,
          top_k: 50,
          repetition_penalty: 1.1,
          stop_sequences: ['\n\n\n'],
        },
        project_id: this.projectId,
      };

      const response = await fetch(`${this.url}/ml/v1/text/generation?version=2023-05-29`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Watsonx API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.results?.[0]?.generated_text?.trim();

      if (!generatedText) {
        throw new Error('No generated text from Watsonx');
      }

      // Clean up the response - remove any markdown code blocks
      let cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Parse the JSON response
      const intentPayload: IntentPayload = JSON.parse(cleanedText);

      // Validate the structure
      if (!intentPayload.technicalTask || !intentPayload.githubIssues || !intentPayload.bobPrompt) {
        throw new Error('Invalid intent payload structure');
      }

      return intentPayload;
    } catch (error) {
      console.error('Watsonx Intent Extraction Error:', error);
      
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse AI response as JSON. The model may need better prompting.');
      }
      
      throw new Error(
        `Failed to extract intent: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Health check for Watsonx.ai service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      console.error('Watsonx health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const watsonxService = new WatsonxService();

// Made with Bob
