import React from 'react';
import { AlertTriangle, CheckCircle2, Copy, FileCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { useToast } from './ui/Toast';
import { getRiskColor, copyToClipboard } from '../lib/utils';

export const SystemBlueprint: React.FC = () => {
  const { technicalTask, toggleImplementationStep } = useProjectPlanner();
  const { showToast } = useToast();

  if (!technicalTask) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No technical task extracted yet. Process a transcript to see the system blueprint.
        </CardContent>
      </Card>
    );
  }

  const handleCopyFile = async (filePath: string) => {
    try {
      await copyToClipboard(filePath);
      showToast(`Copied: ${filePath}`, 'success');
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>{technicalTask.title}</CardTitle>
              <CardDescription>{technicalTask.description}</CardDescription>
            </div>
            <Badge className={getRiskColor(technicalTask.riskLevel)}>
              {technicalTask.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estimated Effort */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Estimated Effort
            </h4>
            <p className="text-sm text-muted-foreground">{technicalTask.estimatedEffort}</p>
          </div>

          {/* Affected Files */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileCode className="h-4 w-4 text-primary" />
              Affected Files ({technicalTask.affectedFiles.length})
            </h4>
            <div className="space-y-2">
              {technicalTask.affectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono text-primary truncate">
                        {file.path}
                      </code>
                      <Badge
                        variant="outline"
                        className={
                          file.changeType === 'create'
                            ? 'text-green-400 border-green-500/30'
                            : file.changeType === 'modify'
                            ? 'text-blue-400 border-blue-500/30'
                            : 'text-red-400 border-red-500/30'
                        }
                      >
                        {file.changeType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{file.description}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopyFile(file.path)}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Implementation Order */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              Implementation Order
            </h4>
            <div className="space-y-2">
              {technicalTask.implementationOrder.map((step) => (
                <div
                  key={step.order}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/20"
                >
                  <button
                    onClick={() => toggleImplementationStep(step.order)}
                    className="shrink-0 mt-0.5"
                  >
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                        step.completed
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/50 hover:border-primary'
                      }`}
                    >
                      {step.completed && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        Step {step.order}
                      </span>
                    </div>
                    <p className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {step.files.map((file, idx) => (
                        <code
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground"
                        >
                          {file}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Made with Bob
