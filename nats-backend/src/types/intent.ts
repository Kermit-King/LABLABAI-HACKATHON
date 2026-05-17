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
  existsInRepo?: boolean;
  currentContent?: string;
}

/**
 * Represents a single acceptance criterion for validation
 */
export interface AcceptanceCriteria {
  id: string;
  description: string;
  completed: boolean;
  affectedFiles?: string[];
  testStrategy?: string;
}

/**
 * Code reference within a GitHub issue
 */
export interface CodeReference {
  file: string;
  lineRange?: string;
  snippet?: string;
  reason: string;
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
  codeReferences?: CodeReference[];
  estimatedEffort?: string;
  dependencies?: string[];
  labels?: string[];
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
 * Repository information for GitHub-aware tasks
 */
export interface RepositoryInfo {
  owner: string;
  name: string;
  branch: string;
  url: string;
}

/**
 * Codebase context metadata
 */
export interface CodebaseContext {
  primaryLanguage: string;
  framework?: string;
  architecture?: string;
  dependencies?: string[];
}

/**
 * Related file with relevance scoring
 */
export interface RelatedFile {
  path: string;
  relevance: 'high' | 'medium' | 'low';
  reason: string;
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
  repository?: RepositoryInfo;
  codebaseContext?: CodebaseContext;
  relatedFiles?: RelatedFile[];
}

/**
 * Represents the structured prompt for NATS
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
  repository?: {
    owner: string;
    name: string;
    branch: string;
    token: string;
  };
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
