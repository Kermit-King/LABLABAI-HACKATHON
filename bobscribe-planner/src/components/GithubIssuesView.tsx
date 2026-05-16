import React from 'react';
import { GitBranch, CheckSquare, Square } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { getPriorityColor } from '../lib/utils';

export const GithubIssuesView: React.FC = () => {
  const { githubIssues, toggleAcceptanceCriteria } = useProjectPlanner();

  if (githubIssues.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No GitHub issues generated yet. Process a transcript to see issues.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {githubIssues.map((issue) => (
        <Card key={issue.id} className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
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
              <Badge className={getPriorityColor(issue.priority)}>
                {issue.priority.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
