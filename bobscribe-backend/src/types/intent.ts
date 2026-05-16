/**
 * Risk level assessment for technical tasks
 */
export type RiskLevel = 'Low' | 'Medium' | 'High';

/**
 * Type of code mutation required for a file
 */
export type ChangeType = 'create' | 'modify' | 'delete';

/**
 * Priority level for GitHub issues
 */
export type Priority = 'low' | 'medium' | 'high';

/**
 * Represents a file affected by the technical task
 */
export interface AffectedFile {
  path: string;
  changeType: ChangeType;
  description: string;
}

/**
 * Represents a single acceptance criterion for validation
 */
export interface AcceptanceCriteria {
  id: string;
  description: string;
  completed: boolean;
}

/**
 * Represents a GitHub issue generated from the transcript
 */
export interface GithubIssue {
  id: string;
  title: string;
  tags: string[];
  description: string;
  acceptanceCriteria: AcceptanceCriteria[];
  priority: Priority;
}

/**
 * Represents an implementation step in the execution order
 */
export interface ImplementationStep {
  order: number;
  description: string;
  files: string[];
  completed: boolean;
}

/**
 * Represents the complete technical task breakdown
 */
export interface TechnicalTask {
  id: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  affectedFiles: AffectedFile[];
  implementationOrder: ImplementationStep[];
  estimatedEffort: string;
}

/**
 * Represents the structured prompt for IBM Bob
 */
export interface BobPrompt {
  systemContext: string;
  taskBreakdown: string;
  fileInstructions: string;
  acceptanceCriteria: string;
  additionalNotes: string;
}

/**
 * The complete payload returned by the intent extraction pipeline
 */
export interface IntentPayload {
  riskLevel: RiskLevel;
  technicalTask: TechnicalTask;
  affectedFiles: AffectedFile[];
  implementationOrder: ImplementationStep[];
  githubIssues: GithubIssue[];
  bobPrompt: BobPrompt;
}

/**
 * Request body for the analyze endpoint
 */
export interface AnalyzeRequest {
  transcript?: string;
  audioFile?: Buffer;
}

/**
 * Response from the analyze endpoint
 */
export interface AnalyzeResponse {
  success: boolean;
  data?: IntentPayload;
  error?: string;
}

// Made with Bob
