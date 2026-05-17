import React, { useState } from 'react';
import { GitBranch, CheckSquare, Square, Download, GitPullRequest, Clipboard, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { useToast } from './ui/Toast';
import { getPriorityColor, githubIssueToMarkdown, downloadMarkdown } from '../lib/utils';
import { Skeleton } from './ui/skeleton';

export const GithubIssuesView: React.FC = () => {
  const { githubIssues, toggleAcceptanceCriteria, isProcessing } = useProjectPlanner();
  const { showToast } = useToast();
  const [copyStates, setCopyStates] = useState<Record<string, 'idle' | 'success' | 'error'>>({});
  const [renderError, setRenderError] = useState<string | null>(null);

  // Error boundary for rendering issues
  React.useEffect(() => {
    // Reset error when githubIssues changes
    setRenderError(null);
  }, [githubIssues]);

  // Validate githubIssues data structure
  const safeGithubIssues = React.useMemo(() => {
    try {
      if (!githubIssues) {
        console.warn('githubIssues is null or undefined');
        return [];
      }
      
      if (!Array.isArray(githubIssues)) {
        console.error('githubIssues is not an array:', typeof githubIssues);
        setRenderError('Invalid data structure: githubIssues must be an array');
        return [];
      }

      // Filter and validate each issue
      return githubIssues.filter((issue, index) => {
        if (!issue) {
          console.warn(`Issue at index ${index} is null/undefined`);
          return false;
        }
        if (!issue.id) {
          console.warn(`Issue at index ${index} missing id:`, issue);
          return false;
        }
        if (!issue.title) {
          console.warn(`Issue ${issue.id} missing title`);
          return false;
        }
        if (!issue.description) {
          console.warn(`Issue ${issue.id} missing description`);
          return false;
        }
        if (!issue.priority) {
          console.warn(`Issue ${issue.id} missing priority, defaulting to 'medium'`);
          issue.priority = 'medium';
        }
        if (!issue.acceptanceCriteria || !Array.isArray(issue.acceptanceCriteria)) {
          console.warn(`Issue ${issue.id} missing or invalid acceptanceCriteria, setting to empty array`);
          issue.acceptanceCriteria = [];
        }
        if (!issue.tags || !Array.isArray(issue.tags)) {
          console.warn(`Issue ${issue.id} missing or invalid tags, setting to empty array`);
          issue.tags = [];
        }
        return true;
      });
    } catch (error) {
      console.error('Error processing githubIssues:', error);
      setRenderError(`Error processing issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }, [githubIssues]);

  // Show error state if there was a rendering error
  if (renderError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center px-6">
        <GitPullRequest className="h-10 w-10 text-red-400" />
        <h3 className="text-sm font-medium text-foreground">Error Loading Issues</h3>
        <p className="text-xs text-red-400 max-w-sm">
          {renderError}
        </p>
        <p className="text-xs text-muted-foreground max-w-sm">
          Please try running the extraction again or check the console for details.
        </p>
      </div>
    );
  }

  // Skeleton loading state
  if (isProcessing) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  // Empty state
  if (safeGithubIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center px-6">
        <GitPullRequest className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">No issues generated</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Run extraction to auto-generate structured GitHub issues from your transcript.
        </p>
      </div>
    );
  }

  const handleExportIssue = (issue: typeof safeGithubIssues[0]) => {
    try {
      // Validate issue data before processing
      if (!issue || !issue.title || !issue.description) {
        throw new Error('Invalid issue data - missing required fields');
      }
      
      const markdown = githubIssueToMarkdown(issue);
      const slug = issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      downloadMarkdown(markdown, `issue-${slug}.md`);
      showToast(`Issue "${issue.title}" exported to Markdown`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Failed to export issue: ${errorMsg}`, 'error');
    }
  };

  const handleCopyIssue = async (issue: typeof safeGithubIssues[0]) => {
    try {
      // Validate issue data before processing
      if (!issue || !issue.title || !issue.description) {
        throw new Error('Invalid issue data - missing required fields');
      }
      
      const markdown = githubIssueToMarkdown(issue);
      await navigator.clipboard.writeText(markdown);
      setCopyStates(prev => ({ ...prev, [issue.id]: 'success' }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [issue.id]: 'idle' }));
      }, 2000);
    } catch (error) {
      console.error('Copy error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Failed to copy: ${errorMsg}`, 'error');
      setCopyStates(prev => ({ ...prev, [issue.id]: 'error' }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [issue.id]: 'idle' }));
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">
      {safeGithubIssues.map((issue) => {
        // Additional runtime safety check
        try {
          return (
        <Card key={issue.id} className="hover:border-primary/50 transition-colors">
          <CardHeader className="px-4 py-4 lg:px-6 lg:py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-2 min-w-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  {issue.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {issue.tags && Array.isArray(issue.tags) && issue.tags.map((tag, idx) => (
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
                Acceptance Criteria ({issue.acceptanceCriteria && Array.isArray(issue.acceptanceCriteria) ? issue.acceptanceCriteria.filter(ac => ac.completed).length : 0}/
                {issue.acceptanceCriteria && Array.isArray(issue.acceptanceCriteria) ? issue.acceptanceCriteria.length : 0})
              </h4>
              <div className="space-y-2">
                {issue.acceptanceCriteria && Array.isArray(issue.acceptanceCriteria) && issue.acceptanceCriteria.map((criteria) => {
                  // Safety check for criteria
                  if (!criteria || !criteria.id) {
                    return null;
                  }
                  
                  return (
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
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        );
        } catch (error) {
          console.error('Error rendering issue:', issue?.id, error);
          return (
            <Card key={issue?.id || `error-${Math.random()}`} className="border-red-500">
              <CardContent className="p-4">
                <p className="text-sm text-red-400">
                  Error rendering issue: {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </CardContent>
            </Card>
          );
        }
      })}
    </div>
  );
};

// Made with Bob
