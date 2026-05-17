import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TechnicalTask, GithubIssue, AffectedFile, ImplementationStep, AcceptanceCriteria } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'high':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'low':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'medium':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'high':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  }
}

// Markdown export utilities
export function technicalTaskToMarkdown(task: TechnicalTask): string {
  let markdown = `# System Blueprint\n\n`;
  markdown += `## ${task.title}\n\n`;
  markdown += `${task.description}\n\n`;
  markdown += `**Risk Level:** ${task.riskLevel.toUpperCase()}\n\n`;
  markdown += `**Estimated Effort:** ${task.estimatedEffort}\n\n`;
  
  markdown += `## Affected Files\n\n`;
  task.affectedFiles.forEach((file: AffectedFile) => {
    markdown += `- **${file.path}** (${file.changeType})\n`;
    markdown += `  ${file.description}\n`;
  });
  
  markdown += `\n## Risk Assessment\n\n`;
  markdown += `This task has been assessed as **${task.riskLevel.toUpperCase()} RISK**.\n\n`;
  
  markdown += `## Implementation Order\n\n`;
  task.implementationOrder.forEach((step: ImplementationStep) => {
    markdown += `${step.order}. ${step.description}\n`;
    markdown += `   Files: ${step.files.join(', ')}\n`;
  });
  
  return markdown;
}

export function githubIssueToMarkdown(issue: GithubIssue): string {
  let markdown = `# ${issue.title}\n\n`;
  
  markdown += `## Description\n\n`;
  markdown += `${issue.description}\n\n`;
  
  markdown += `## Acceptance Criteria\n\n`;
  issue.acceptanceCriteria.forEach((criteria: AcceptanceCriteria) => {
    markdown += `- [ ] ${criteria.description}\n`;
  });
  
  markdown += `\n## Labels\n\n`;
  markdown += issue.tags.join(', ') + '\n\n';
  
  markdown += `## Priority\n\n`;
  markdown += `${issue.priority.toUpperCase()}\n`;
  
  return markdown;
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Made with Bob
