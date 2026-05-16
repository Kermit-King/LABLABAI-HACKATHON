export type RiskLevel = 'low' | 'medium' | 'high';

export interface AffectedFile {
  path: string;
  changeType: 'create' | 'modify' | 'delete';
  description: string;
  existsInRepo?: boolean;
  currentContent?: string;
}

export interface AcceptanceCriteria {
  id: string;
  description: string;
  completed: boolean;
  affectedFiles?: string[];
  testStrategy?: string;
}

export interface CodeReference {
  file: string;
  lineRange?: string;
  snippet?: string;
  reason: string;
}

export interface GithubIssue {
  id: string;
  title: string;
  tags: string[];
  description: string;
  acceptanceCriteria: AcceptanceCriteria[];
  priority: 'low' | 'medium' | 'high';
  codeReferences?: CodeReference[];
  estimatedEffort?: string;
  dependencies?: string[];
  labels?: string[];
}

export interface ImplementationStep {
  order: number;
  description: string;
  files: string[];
  completed: boolean;
}

export interface RepositoryInfo {
  owner: string;
  name: string;
  branch: string;
  url: string;
}

export interface CodebaseContext {
  primaryLanguage: string;
  framework?: string;
  architecture?: string;
  dependencies?: string[];
}

export interface RelatedFile {
  path: string;
  relevance: 'high' | 'medium' | 'low';
  reason: string;
}

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

export interface BobPrompt {
  systemContext: string;
  taskBreakdown: string;
  fileInstructions: string;
  acceptanceCriteria: string;
  additionalNotes: string;
}

export interface ProjectPlannerState {
  transcript: string;
  technicalTask: TechnicalTask | null;
  githubIssues: GithubIssue[];
  bobPrompt: BobPrompt | null;
  isProcessing: boolean;
}

// Made with Bob
