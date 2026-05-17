import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, FileCode, Download, FileText, Clipboard, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { useToast } from './ui/Toast';
import { getRiskColor, copyToClipboard, technicalTaskToMarkdown, downloadMarkdown } from '../lib/utils';
import { Skeleton } from './ui/skeleton';

export const SystemBlueprint: React.FC = () => {
  const { technicalTask, toggleImplementationStep, isProcessing } = useProjectPlanner();
  const { showToast } = useToast();
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');

  // Skeleton loading state
  if (isProcessing) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="w-48 h-4 mb-2" />
            <Skeleton className="w-full h-3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-full h-16 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-full h-16 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-full h-16 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!technicalTask) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center px-6">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">No blueprint yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Paste a transcript and extract engineering intent to see the system breakdown here.
        </p>
      </div>
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

  const handleExportMarkdown = () => {
    try {
      const markdown = technicalTaskToMarkdown(technicalTask);
      downloadMarkdown(markdown, 'system-blueprint.md');
      showToast('System blueprint exported to Markdown', 'success');
    } catch (error) {
      showToast('Failed to export to Markdown', 'error');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const markdown = technicalTaskToMarkdown(technicalTask);
      await navigator.clipboard.writeText(markdown);
      setCopyState('success');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (error) {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="px-4 py-4 lg:px-6 lg:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle>{technicalTask.title}</CardTitle>
              <CardDescription>{technicalTask.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <Badge className={getRiskColor(technicalTask.riskLevel)}>
                {technicalTask.riskLevel.toUpperCase()} RISK
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExportMarkdown}
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Download as Markdown"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleCopyToClipboard}
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white transition-colors"
                  title={copyState === 'success' ? 'Copied!' : copyState === 'error' ? 'Failed' : 'Copy to Clipboard'}
                >
                  {copyState === 'success' ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
                {copyState === 'success' && (
                  <span className="text-xs text-green-400">Copied!</span>
                )}
                {copyState === 'error' && (
                  <span className="text-xs text-red-400">Failed</span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-4 py-4 lg:px-6 lg:py-6">
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
