export type RiskLevel = 'low' | 'medium' | 'high';

export interface AffectedFile {
  path: string;
  changeType: 'create' | 'modify' | 'delete';
  description: string;
}

export interface AcceptanceCriteria {
  id: string;
  description: string;
  completed: boolean;
}

export interface GithubIssue {
  id: string;
  title: string;
  tags: string[];
  description: string;
  acceptanceCriteria: AcceptanceCriteria[];
  priority: 'low' | 'medium' | 'high';
}

export interface ImplementationStep {
  order: number;
  description: string;
  files: string[];
  completed: boolean;
}

export interface TechnicalTask {
  id: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  affectedFiles: AffectedFile[];
  implementationOrder: ImplementationStep[];
  estimatedEffort: string;
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
