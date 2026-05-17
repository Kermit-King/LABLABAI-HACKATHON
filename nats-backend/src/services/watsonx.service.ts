import { env } from '../config/env.js';
import type { IntentPayload } from '../types/intent.js';
import type { RepositoryMap } from '../types/github.js';

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

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Determine schema complexity level based on available token budget
   */
  private determineSchemaComplexity(transcript: string, repositoryMap?: RepositoryMap): 'full' | 'standard' | 'minimal' {
    const maxTokens = env.WATSONX_MAX_TOKENS;
    
    // Estimate tokens used by input
    const transcriptTokens = this.estimateTokens(transcript);
    const repoContextTokens = repositoryMap ? this.estimateTokens(this.createGitHubContextSection(repositoryMap)) : 0;
    const systemPromptBaseTokens = 800; // Approximate base system prompt size
    
    const inputTokens = transcriptTokens + repoContextTokens + systemPromptBaseTokens;
    const availableOutputTokens = maxTokens - inputTokens;
    
    console.log('Token Budget Analysis:', {
      maxTokens,
      transcriptTokens,
      repoContextTokens,
      systemPromptBaseTokens,
      totalInputTokens: inputTokens,
      availableOutputTokens,
      transcriptLength: transcript.length
    });
    
    // Determine complexity based on available output tokens
    if (availableOutputTokens < 1500) {
      console.warn('⚠️ Low token budget - using MINIMAL schema');
      return 'minimal';
    } else if (availableOutputTokens < 3000) {
      console.log('📊 Medium token budget - using STANDARD schema');
      return 'standard';
    } else {
      console.log('✨ High token budget - using FULL schema');
      return 'full';
    }
  }

  /**
   * Generate schema based on complexity level
   */
  private getSchemaForComplexity(complexity: 'full' | 'standard' | 'minimal', repositoryMap?: RepositoryMap): string {
    const minimalSchema = `{
  "riskLevel": "Low" | "Medium" | "High",
  "technicalTask": {
    "id": "task-001",
    "title": "string",
    "description": "string (concise)",
    "riskLevel": "Low" | "Medium" | "High",
    "affectedFiles": [{"path": "string", "changeType": "create|modify|delete", "description": "string"}],
    "implementationOrder": [{"order": 1, "description": "string", "files": ["string"], "completed": false}],
    "estimatedEffort": "string"
  },
  "githubIssues": [
    {
      "id": "issue-001",
      "title": "string",
      "tags": ["string"],
      "description": "string (brief)",
      "priority": "low" | "medium" | "high"
    }
  ],
  "bobPrompt": {
    "systemContext": "string (brief)",
    "taskBreakdown": "string (concise)",
    "fileInstructions": "string (key changes only)"
  }
}`;

    const standardSchema = `{
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
        "description": "string",
        "existsInRepo": boolean
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
    "estimatedEffort": "string"${repositoryMap ? `,
    "repository": {
      "owner": "string",
      "name": "string",
      "branch": "string",
      "url": "string"
    }` : ''}
  },
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
    "acceptanceCriteria": "string"
  }
}`;

    const fullSchema = `{
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
        "description": "string",
        "existsInRepo": boolean,
        "currentContent": "string (if exists)"
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
    "estimatedEffort": "string",
    ${repositoryMap ? `"repository": {
      "owner": "string",
      "name": "string",
      "branch": "string",
      "url": "string"
    },
    "codebaseContext": {
      "primaryLanguage": "${repositoryMap.statistics.primaryLanguage}",
      "framework": "string (detected from files)",
      "architecture": "string (detected from structure)",
      "dependencies": ["string"]
    },
    "relatedFiles": [
      {
        "path": "string",
        "relevance": "high" | "medium" | "low",
        "reason": "string"
      }
    ],` : ''}
  },
  "affectedFiles": [...],
  "implementationOrder": [...],
  "githubIssues": [
    {
      "id": "issue-001",
      "title": "string",
      "tags": ["string"],
      "description": "string (reference actual code locations)",
      "acceptanceCriteria": [
        {
          "id": "ac-001-1",
          "description": "string",
          "completed": false,
          "affectedFiles": ["string"],
          "testStrategy": "string"
        }
      ],
      "priority": "low" | "medium" | "high",
      ${repositoryMap ? `"codeReferences": [
        {
          "file": "string (actual file path)",
          "lineRange": "string (optional)",
          "snippet": "string (optional)",
          "reason": "string"
        }
      ],
      "estimatedEffort": "string",
      "dependencies": ["string"],
      "labels": ["string"]` : ''}
    }
  ],
  "bobPrompt": {
    "systemContext": "string (include repository and architecture info)",
    "taskBreakdown": "string (reference actual files and structure)",
    "fileInstructions": "string (specific file paths and changes)",
    "acceptanceCriteria": "string (testable with file references)",
    "additionalNotes": "string (dependencies, constraints, risks)"
  }
}`;

    if (complexity === 'minimal') return minimalSchema;
    if (complexity === 'standard') return standardSchema;
    return fullSchema;
  }

  /**
   * Create a system prompt that forces structured JSON output
   * Adapts schema complexity based on available token budget
   */
  private createSystemPrompt(repositoryMap?: RepositoryMap, complexity: 'full' | 'standard' | 'minimal' = 'full'): string {
    const complexityNote = complexity === 'minimal'
      ? '⚠️ USING MINIMAL SCHEMA - Keep responses concise and focused on essentials only.'
      : complexity === 'standard'
      ? '📊 USING STANDARD SCHEMA - Balance detail with brevity.'
      : '✨ USING FULL SCHEMA - Provide comprehensive details.';

    const basePrompt = `You are an expert software engineering analyst. Your task is to analyze meeting transcripts and extract structured engineering requirements.

${complexityNote}

${repositoryMap ? this.createGitHubContextSection(repositoryMap) : ''}

CRITICAL OUTPUT REQUIREMENTS:
1. You MUST respond with ONLY a valid, COMPLETE JSON object
2. The JSON MUST start with { and end with }
3. Do NOT include markdown code blocks (no \`\`\`json or \`\`\`)
4. Do NOT include any explanatory text before or after the JSON
5. Do NOT include any comments inside the JSON
6. ENSURE the JSON is COMPLETE - all arrays must be closed with ], all objects with }
7. If you run out of space, prioritize completing the JSON structure over adding more details
8. Every opened bracket/brace MUST have a matching closing bracket/brace
9. ${complexity === 'minimal' ? 'Keep all text fields BRIEF and CONCISE' : complexity === 'standard' ? 'Balance detail with conciseness' : 'Provide comprehensive details'}

Required JSON schema:

${this.getSchemaForComplexity(complexity, repositoryMap)}

STRICT OUTPUT RULES:
1. Your response MUST START with { and END with }
2. NO markdown code blocks (no \`\`\`json or \`\`\`)
3. NO explanatory text before or after the JSON
4. NO comments inside the JSON
5. Ensure ALL required fields are present
6. ${repositoryMap ? 'Use ACTUAL file paths from the repository structure provided' : 'Use realistic file paths and technical descriptions'}
7. ${repositoryMap ? 'Map transcript requirements to existing files where possible' : ''}
8. ${repositoryMap ? 'Mark existsInRepo as true for files that exist, false for new files' : ''}
9. ${repositoryMap ? 'Include codeReferences in GitHub issues pointing to actual code locations' : ''}
10. The JSON MUST be valid and parseable
11. COMPLETE the JSON structure - do not truncate arrays or objects
12. If approaching token limit, reduce detail but ALWAYS close all brackets/braces

VALIDATION CHECKLIST before responding:
✓ Starts with {
✓ Ends with }
✓ All [ have matching ]
✓ All { have matching }
✓ All strings are properly quoted
✓ No trailing commas
✓ Valid JSON syntax

Example of CORRECT output format:
{"riskLevel":"Medium","technicalTask":{...},"affectedFiles":[...],"implementationOrder":[...],"githubIssues":[...],"bobPrompt":{...}}

Example of INCORRECT output (DO NOT DO THIS):
\`\`\`json
{"riskLevel":"Medium",...}
\`\`\`

IMPORTANT: Start your response with { immediately and ensure it ends with }`;

    return basePrompt;
  }

  /**
   * Create GitHub context section for the prompt
   */
  private createGitHubContextSection(repositoryMap: RepositoryMap): string {
    const relevantFilesList = repositoryMap.relevantFiles
      .slice(0, 50) // Limit to first 50 files to avoid token limits
      .map(f => `  - ${f.path} (${f.size} bytes)`)
      .join('\n');

    const directoriesList = repositoryMap.structure.directories
      .slice(0, 30) // Limit to first 30 directories
      .join('\n  - ');

    return `
CODEBASE CONTEXT:
You have access to the actual repository structure. Use this information to map the transcript requirements to real files.

Repository Statistics:
- Total Files: ${repositoryMap.statistics.totalFiles}
- Total Size: ${repositoryMap.statistics.totalSize} bytes
- Primary Language: ${repositoryMap.statistics.primaryLanguage}
- Files by Extension: ${JSON.stringify(repositoryMap.statistics.filesByExtension)}

Directory Structure (sample):
  - ${directoriesList}

Relevant Code Files (${repositoryMap.relevantFiles.length} total, showing first 50):
${relevantFilesList}

IMPORTANT INSTRUCTIONS:
1. Map the meeting transcript requirements to ACTUAL files from the list above
2. Use REAL file paths - do not invent file names
3. For existing files, set "existsInRepo": true and "changeType": "modify"
4. For new files, set "existsInRepo": false and "changeType": "create"
5. Follow the project's existing structure patterns when suggesting new files
6. In GitHub issues, reference actual file paths in codeReferences
7. Consider the project's architecture when planning implementation order
8. Identify related files that might be affected by the changes
`;
  }

  /**
   * Extract engineering intent from transcript using Watsonx.ai
   * Automatically adapts schema complexity based on transcript length
   */
  async extractIntent(transcript: string, repositoryMap?: RepositoryMap): Promise<IntentPayload> {
    try {
      const accessToken = await this.getAccessToken();

      // Determine optimal schema complexity based on token budget
      const complexity = this.determineSchemaComplexity(transcript, repositoryMap);
      console.log(`🎯 Using ${complexity.toUpperCase()} schema complexity for this request`);

      const systemPrompt = this.createSystemPrompt(repositoryMap, complexity);
      const userPrompt = `TRANSCRIPT:
${transcript}

JSON OUTPUT:`;

      const requestBody = {
        model_id: this.modelId,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        parameters: {
          max_tokens: env.WATSONX_MAX_TOKENS,
          temperature: env.WATSONX_TEMPERATURE,
          top_p: 0.95,
          top_k: 50,
          repetition_penalty: 1.1,
          // Remove stop_sequences to prevent premature truncation
          // stop_sequences: ['\n\n\n'],
        },
        project_id: this.projectId,
      };

      const response = await fetch(this.url, {
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

      const data = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
        results?: Array<{ generated_text?: string }>;
      };
      
      // Handle chat API response format
      const generatedText = data.choices?.[0]?.message?.content?.trim() ||
                           data.results?.[0]?.generated_text?.trim();

      if (!generatedText) {
        console.error('Watsonx response structure:', JSON.stringify(data, null, 2));
        throw new Error('No generated text from Watsonx');
      }

      // Check if response seems truncated
      if (generatedText.length < 500) {
        console.warn('Warning: AI response seems unusually short:', generatedText.length, 'characters');
      }

      console.log('Raw AI Response Length:', generatedText.length);
      console.log('Raw AI Response (first 500 chars):', generatedText.substring(0, 500));
      console.log('Raw AI Response (last 500 chars):', generatedText.substring(Math.max(0, generatedText.length - 500)));

      // Clean up the response - remove any markdown code blocks and extra text
      let cleanedText = generatedText
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      // Extract JSON by finding the outermost braces
      // IMPORTANT: Always use first { and last } to get the COMPLETE JSON
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
        console.log('Extracted JSON from position', firstBrace, 'to', lastBrace);
      } else {
        console.warn('Could not find valid JSON braces in response');
      }

      console.log('Cleaned JSON Length:', cleanedText.length);
      console.log('Cleaned JSON (first 500 chars):', cleanedText.substring(0, 500));
      console.log('Cleaned JSON (last 500 chars):', cleanedText.substring(Math.max(0, cleanedText.length - 500)));

      // Validate that we have a complete JSON object
      const openBraces = (cleanedText.match(/\{/g) || []).length;
      const closeBraces = (cleanedText.match(/\}/g) || []).length;
      const openBrackets = (cleanedText.match(/\[/g) || []).length;
      const closeBrackets = (cleanedText.match(/\]/g) || []).length;

      console.log('JSON Structure Check:', {
        openBraces,
        closeBraces,
        openBrackets,
        closeBrackets,
        balanced: openBraces === closeBraces && openBrackets === closeBrackets
      });

      if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
        console.warn('Unbalanced JSON structure detected - attempting to fix');
        console.warn(`Braces: ${openBraces}/${closeBraces}, Brackets: ${openBrackets}/${closeBrackets}`);
        
        // Attempt to fix incomplete JSON by closing missing brackets/braces
        let fixedText = cleanedText;
        
        // Close missing brackets
        const missingBrackets = openBrackets - closeBrackets;
        if (missingBrackets > 0) {
          console.log(`Adding ${missingBrackets} missing closing bracket(s)`);
          fixedText += ']'.repeat(missingBrackets);
        }
        
        // Close missing braces
        const missingBraces = openBraces - closeBraces;
        if (missingBraces > 0) {
          console.log(`Adding ${missingBraces} missing closing brace(s)`);
          fixedText += '}'.repeat(missingBraces);
        }
        
        // Update cleanedText with fixed version
        cleanedText = fixedText;
        console.log('Fixed JSON (last 500 chars):', cleanedText.substring(Math.max(0, cleanedText.length - 500)));
        
        // Verify the fix
        const newOpenBraces = (cleanedText.match(/\{/g) || []).length;
        const newCloseBraces = (cleanedText.match(/\}/g) || []).length;
        const newOpenBrackets = (cleanedText.match(/\[/g) || []).length;
        const newCloseBrackets = (cleanedText.match(/\]/g) || []).length;
        
        if (newOpenBraces !== newCloseBraces || newOpenBrackets !== newCloseBrackets) {
          console.error('Failed to fix JSON structure');
          console.error('Full cleaned text:', cleanedText);
          throw new Error(`Unable to fix incomplete JSON. Braces: ${newOpenBraces}/${newCloseBraces}, Brackets: ${newOpenBrackets}/${newCloseBrackets}`);
        }
        
        console.log('Successfully fixed JSON structure');
      }

      // Parse the JSON response
      let intentPayload: IntentPayload;
      try {
        intentPayload = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Parse error details:', {
          message: parseError instanceof Error ? parseError.message : 'Unknown error',
          position: parseError instanceof SyntaxError ? (parseError as any).position : 'N/A'
        });
        
        // Extract error position if available
        let errorPosition = -1;
        if (parseError instanceof Error) {
          const posMatch = parseError.message.match(/position (\d+)/);
          if (posMatch) {
            errorPosition = parseInt(posMatch[1]);
            const contextStart = Math.max(0, errorPosition - 150);
            const contextEnd = Math.min(cleanedText.length, errorPosition + 150);
            console.error('Error context (300 chars around position):', cleanedText.substring(contextStart, contextEnd));
            console.error('Error at character:', cleanedText.charAt(errorPosition));
          }
        }
        
        // Try to fix common JSON issues
        console.log('Attempting to fix common JSON issues...');
        let fixedText = cleanedText;
        
        // 1. Remove trailing commas before closing brackets/braces
        fixedText = fixedText.replace(/,(\s*[\]}])/g, '$1');
        
        // 2. Fix missing quotes around property names
        fixedText = fixedText.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        
        // 3. Fix missing commas between array elements (common issue)
        // Look for patterns like: "value" "value" or } { or ] [
        fixedText = fixedText.replace(/"(\s+)"/g, '","');  // "value" "value" -> "value","value"
        fixedText = fixedText.replace(/\}(\s*)\{/g, '},{'); // }{ -> },{
        fixedText = fixedText.replace(/\](\s*)\[/g, '],['); // ][ -> ],[
        
        // 4. Fix missing commas after closing braces/brackets before next property
        fixedText = fixedText.replace(/\}(\s*)"/g, '},"');  // }"key" -> },"key"
        fixedText = fixedText.replace(/\](\s*)"/g, '],"');  // ]"key" -> ],"key"
        
        // 5. If we have a specific error position, try to fix around that area
        if (errorPosition > 0 && errorPosition < fixedText.length) {
          const before = fixedText.substring(Math.max(0, errorPosition - 50), errorPosition);
          const after = fixedText.substring(errorPosition, Math.min(fixedText.length, errorPosition + 50));
          
          // Check if we're missing a comma in an array
          if (before.includes('[') && !before.trim().endsWith(',') && !before.trim().endsWith('[')) {
            const lastQuote = before.lastIndexOf('"');
            const lastBrace = before.lastIndexOf('}');
            const lastBracket = before.lastIndexOf(']');
            const insertPos = Math.max(lastQuote, lastBrace, lastBracket);
            
            if (insertPos > 0 && after.trim().startsWith('{') || after.trim().startsWith('"')) {
              console.log('Inserting missing comma at position', errorPosition);
              fixedText = fixedText.substring(0, errorPosition) + ',' + fixedText.substring(errorPosition);
            }
          }
        }
        
        // Try parsing the fixed version
        try {
          console.log('Attempting to parse fixed JSON...');
          intentPayload = JSON.parse(fixedText);
          console.log('✓ Successfully parsed fixed JSON!');
        } catch (secondError) {
          console.error('Second parse attempt failed:', secondError);
          
          // Try one more aggressive fix: truncate at the error position and close structures
          if (errorPosition > 0) {
            console.log('Attempting aggressive fix: truncate and close structures...');
            let truncatedText = fixedText.substring(0, errorPosition);
            
            // Count unclosed structures
            const openBraces = (truncatedText.match(/\{/g) || []).length;
            const closeBraces = (truncatedText.match(/\}/g) || []).length;
            const openBrackets = (truncatedText.match(/\[/g) || []).length;
            const closeBrackets = (truncatedText.match(/\]/g) || []).length;
            
            // Remove trailing incomplete element (might be cut off mid-string)
            truncatedText = truncatedText.replace(/,\s*$/, ''); // Remove trailing comma
            truncatedText = truncatedText.replace(/:\s*$/, ':""'); // Complete incomplete property
            truncatedText = truncatedText.replace(/"\s*$/, '"'); // Close incomplete string
            
            // Close all open structures
            truncatedText += ']'.repeat(openBrackets - closeBrackets);
            truncatedText += '}'.repeat(openBraces - closeBraces);
            
            try {
              console.log('Attempting to parse truncated JSON...');
              intentPayload = JSON.parse(truncatedText);
              console.log('✓ Successfully parsed truncated JSON!');
              console.warn('Warning: Response was truncated due to parse error. Some data may be incomplete.');
            } catch (thirdError) {
              // All attempts failed
              console.error('All fix attempts failed');
              console.error('Original text length:', cleanedText.length);
              console.error('Fixed text length:', fixedText.length);
              console.error('Truncated text length:', truncatedText.length);
              console.error('Full original text:', cleanedText);
              
              throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Response length: ${cleanedText.length} chars. All auto-fix attempts failed.`);
            }
          } else {
            // No error position, can't do aggressive fix
            console.error('Full text that failed to parse:', cleanedText);
            throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Response length: ${cleanedText.length} chars`);
          }
        }
      }

      // Log the full parsed payload for debugging
      console.log('=== PARSED PAYLOAD DEBUG ===');
      console.log('Payload keys:', Object.keys(intentPayload));
      console.log('Payload type:', typeof intentPayload);
      console.log('Is array?:', Array.isArray(intentPayload));
      console.log('Full payload (first 2000 chars):', JSON.stringify(intentPayload, null, 2).substring(0, 2000));
      console.log('Full payload (last 1000 chars):', JSON.stringify(intentPayload, null, 2).slice(-1000));
      console.log('=== END DEBUG ===');
      
      // Normalize the payload structure - extract fields from technicalTask if needed
      console.log('🔧 Normalizing payload structure...');
      
      // If affectedFiles is missing at root but exists in technicalTask, copy it
      if (!intentPayload.affectedFiles && intentPayload.technicalTask?.affectedFiles) {
        console.log('📋 Copying affectedFiles from technicalTask to root level');
        intentPayload.affectedFiles = intentPayload.technicalTask.affectedFiles;
      }
      
      // If implementationOrder is missing at root but exists in technicalTask, copy it
      if (!intentPayload.implementationOrder && intentPayload.technicalTask?.implementationOrder) {
        console.log('📋 Copying implementationOrder from technicalTask to root level');
        intentPayload.implementationOrder = intentPayload.technicalTask.implementationOrder;
      }
      
      // Generate githubIssues if missing
      if (!intentPayload.githubIssues && intentPayload.technicalTask) {
        console.log('🔨 Generating githubIssues from technicalTask');
        intentPayload.githubIssues = [{
          id: 'issue-001',
          title: intentPayload.technicalTask.title,
          tags: ['feature', 'auto-generated'],
          description: intentPayload.technicalTask.description,
          acceptanceCriteria: intentPayload.technicalTask.implementationOrder?.map((step, idx) => ({
            id: `ac-001-${idx + 1}`,
            description: step.description,
            completed: step.completed,
            affectedFiles: step.files,
            testStrategy: 'Manual testing and code review'
          })) || [],
          priority: intentPayload.riskLevel === 'High' ? 'high' : intentPayload.riskLevel === 'Low' ? 'low' : 'medium',
          estimatedEffort: intentPayload.technicalTask.estimatedEffort,
          dependencies: intentPayload.technicalTask.codebaseContext?.dependencies || [],
          labels: ['auto-generated']
        }];
      }
      
      // Generate bobPrompt if missing
      if (!intentPayload.bobPrompt && intentPayload.technicalTask) {
        console.log('🔨 Generating bobPrompt from technicalTask');
        const repoInfo = intentPayload.technicalTask.repository
          ? `Repository: ${intentPayload.technicalTask.repository.owner}/${intentPayload.technicalTask.repository.name} (${intentPayload.technicalTask.repository.branch})`
          : 'No repository information available';
        
        const contextInfo = intentPayload.technicalTask.codebaseContext
          ? `Language: ${intentPayload.technicalTask.codebaseContext.primaryLanguage}, Framework: ${intentPayload.technicalTask.codebaseContext.framework || 'N/A'}, Architecture: ${intentPayload.technicalTask.codebaseContext.architecture || 'N/A'}`
          : 'No codebase context available';
        
        intentPayload.bobPrompt = {
          systemContext: `${repoInfo}\n${contextInfo}\n\nRisk Level: ${intentPayload.riskLevel}`,
          taskBreakdown: intentPayload.technicalTask.description,
          fileInstructions: intentPayload.technicalTask.affectedFiles
            ?.map(f => `${f.changeType.toUpperCase()} ${f.path}: ${f.description}`)
            .join('\n') || 'No file instructions available',
          acceptanceCriteria: intentPayload.technicalTask.implementationOrder
            ?.map((step, idx) => `${idx + 1}. ${step.description}`)
            .join('\n') || 'No acceptance criteria available',
          additionalNotes: `Estimated Effort: ${intentPayload.technicalTask.estimatedEffort}\n\nRelated Files:\n${intentPayload.technicalTask.relatedFiles?.map(f => `- ${f.path} (${f.relevance}): ${f.reason}`).join('\n') || 'None'}`
        };
      }
      
      // Validate the structure with detailed error reporting
      const missingFields: string[] = [];
      
      if (!intentPayload.technicalTask) {
        missingFields.push('technicalTask');
      }
      if (!intentPayload.githubIssues) {
        missingFields.push('githubIssues');
      }
      if (!intentPayload.bobPrompt) {
        missingFields.push('bobPrompt');
      }
      if (!intentPayload.riskLevel) {
        missingFields.push('riskLevel');
      }
      if (!intentPayload.affectedFiles) {
        missingFields.push('affectedFiles');
      }
      if (!intentPayload.implementationOrder) {
        missingFields.push('implementationOrder');
      }
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields after normalization:', missingFields);
        console.error('Available keys:', Object.keys(intentPayload));
        
        // Try to provide helpful context
        if (intentPayload.technicalTask) {
          console.log('✓ technicalTask exists with keys:', Object.keys(intentPayload.technicalTask));
        }
        if (intentPayload.githubIssues) {
          console.log('✓ githubIssues exists with', Array.isArray(intentPayload.githubIssues) ? intentPayload.githubIssues.length : 0, 'items');
        }
        if (intentPayload.bobPrompt) {
          console.log('✓ bobPrompt exists with keys:', Object.keys(intentPayload.bobPrompt));
        }
        
        // Save the problematic payload to a file for analysis
        console.error('💾 Saving problematic payload to debug file...');
        console.error('PROBLEMATIC_PAYLOAD_START');
        console.error(JSON.stringify(intentPayload, null, 2));
        console.error('PROBLEMATIC_PAYLOAD_END');
        
        throw new Error(`Invalid intent payload structure - missing required fields: ${missingFields.join(', ')}. Check server logs for full payload details.`);
      }
      
      // Additional validation for nested structures
      if (intentPayload.technicalTask) {
        const taskMissing: string[] = [];
        if (!intentPayload.technicalTask.id) taskMissing.push('technicalTask.id');
        if (!intentPayload.technicalTask.title) taskMissing.push('technicalTask.title');
        if (!intentPayload.technicalTask.description) taskMissing.push('technicalTask.description');
        if (!intentPayload.technicalTask.affectedFiles) taskMissing.push('technicalTask.affectedFiles');
        if (!intentPayload.technicalTask.implementationOrder) taskMissing.push('technicalTask.implementationOrder');
        
        if (taskMissing.length > 0) {
          console.warn('Warning: technicalTask is missing nested fields:', taskMissing);
        }
      }
      
      console.log('✓ Intent payload validation passed');
      console.log('Payload summary:', {
        riskLevel: intentPayload.riskLevel,
        taskTitle: intentPayload.technicalTask?.title,
        affectedFilesCount: intentPayload.affectedFiles?.length || 0,
        implementationSteps: intentPayload.implementationOrder?.length || 0,
        githubIssuesCount: intentPayload.githubIssues?.length || 0,
        hasBobPrompt: !!intentPayload.bobPrompt
      });

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
