import React, { useState } from 'react';
import { GitBranch, CheckSquare, Square, Download, GitPullRequest, Clipboard, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { useToast } from './ui/Toast';
import { getPriorityColor, githubIssueToMarkdown, downloadMarkdown } from '../lib/utils';
import { SkeletonBlock } from './ui/SkeletonBlock';

export const GithubIssuesView: React.FC = () => {
  const { githubIssues, toggleAcceptanceCriteria, isProcessing } = useProjectPlanner();
  const { showToast } = useToast();
  const [copyStates, setCopyStates] = useState<Record<string, 'idle' | 'success' | 'error'>>({});

  // Skeleton loading state
  if (isProcessing) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonBlock key={i} width="w-full" height="h-28" rounded="rounded-lg" />
        ))}
      </div>
    );
  }

  // Empty state
  if (githubIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
        <GitPullRequest className="h-10 w-10 text-slate-500" />
        <h3 className="text-sm font-medium text-slate-300">No issues generated</h3>
        <p className="text-xs text-slate-500 text-center max-w-sm">
          Run extraction to auto-generate structured GitHub issues from your transcript.
        </p>
      </div>
    );
  }

  const handleExportIssue = (issue: typeof githubIssues[0]) => {
    try {
      const markdown = githubIssueToMarkdown(issue);
      const slug = issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      downloadMarkdown(markdown, `issue-${slug}.md`);
      showToast(`Issue "${issue.title}" exported to Markdown`, 'success');
    } catch (error) {
      showToast('Failed to export issue', 'error');
    }
  };

  const handleCopyIssue = async (issue: typeof githubIssues[0]) => {
    try {
      const markdown = githubIssueToMarkdown(issue);
      await navigator.clipboard.writeText(markdown);
      setCopyStates(prev => ({ ...prev, [issue.id]: 'success' }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [issue.id]: 'idle' }));
      }, 2000);
    } catch (error) {
      setCopyStates(prev => ({ ...prev, [issue.id]: 'error' }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [issue.id]: 'idle' }));
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">
      {githubIssues.map((issue) => (
        <Card key={issue.id} className="hover:border-primary/50 transition-colors">
          <CardHeader className="px-4 py-4 lg:px-6 lg:py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-2 min-w-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  {issue.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {issue.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                <Badge className={getPriorityColor(issue.priority)}>
                  {issue.priority.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleExportIssue(issue)}
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Download as Markdown"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleCopyIssue(issue)}
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white transition-colors"
                    title={copyStates[issue.id] === 'success' ? 'Copied!' : copyStates[issue.id] === 'error' ? 'Failed' : 'Copy to Clipboard'}
                  >
                    {copyStates[issue.id] === 'success' ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                  </Button>
                  {copyStates[issue.id] === 'success' && (
                    <span className="text-xs text-green-400">Copied!</span>
                  )}
                  {copyStates[issue.id] === 'error' && (
                    <span className="text-xs text-red-400">Failed</span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-4 py-4 lg:px-6 lg:py-6">
            {/* Description */}
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {issue.description}
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-400" />
                Acceptance Criteria ({issue.acceptanceCriteria.filter(ac => ac.completed).length}/
                {issue.acceptanceCriteria.length})
              </h4>
              <div className="space-y-2">
                {issue.acceptanceCriteria.map((criteria) => (
                  <button
                    key={criteria.id}
                    onClick={() => toggleAcceptanceCriteria(issue.id, criteria.id)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className="shrink-0 mt-0.5">
                      {criteria.completed ? (
                        <CheckSquare className="h-5 w-5 text-green-400" />
                      ) : (
                        <Square className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={`text-sm flex-1 ${
                        criteria.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {criteria.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Made with Bob
