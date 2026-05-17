import React from 'react';
import { Bot, Copy, FileText, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { useToast } from './ui/Toast';
import { copyToClipboard } from '../lib/utils';
import { Skeleton } from './ui/skeleton';

export const NatsConsole: React.FC = () => {
  const { bobPrompt, isProcessing } = useProjectPlanner();
  const { showToast } = useToast();

  // Skeleton loading state
  if (isProcessing) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="w-32 h-3 mb-2" />
            <Skeleton className="w-full h-3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="w-32 h-3" />
              <Skeleton className="w-full h-48 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!bobPrompt) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center px-6">
        <Terminal className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Nothing to send yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Once extraction runs, the full NATS-ready prompt will appear here.
        </p>
      </div>
    );
  }

  const fullPrompt = `${bobPrompt.systemContext}

${bobPrompt.taskBreakdown}

${bobPrompt.fileInstructions}

${bobPrompt.acceptanceCriteria}

${bobPrompt.additionalNotes}`;

  const handleCopyPrompt = async () => {
    try {
      await copyToClipboard(fullPrompt);
      showToast('Prompt copied to clipboard! Ready for NATS.', 'success');
    } catch (error) {
      showToast('Failed to copy prompt', 'error');
    }
  };

  const sections = [
    { title: 'System Context', content: bobPrompt.systemContext, icon: FileText },
    { title: 'Task Breakdown', content: bobPrompt.taskBreakdown, icon: FileText },
    { title: 'File Instructions', content: bobPrompt.fileInstructions, icon: FileText },
    { title: 'Acceptance Criteria', content: bobPrompt.acceptanceCriteria, icon: FileText },
    { title: 'Additional Notes', content: bobPrompt.additionalNotes, icon: FileText },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="px-4 py-4 lg:px-6 lg:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                NATS Orchestrator Prompt
              </CardTitle>
              <CardDescription>
                Complete, structured instructions ready to be passed to NATS for autonomous execution
              </CardDescription>
            </div>
            <Button onClick={handleCopyPrompt} className="shrink-0 w-full sm:w-auto">
              <Copy className="mr-2 h-4 w-4" />
              Copy for NATS
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4 lg:px-6 lg:py-6">
          {sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <section.icon className="h-4 w-4" />
                {section.title}
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <pre className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-x-auto scrollbar-thin">
                  {section.content}
                </pre>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="px-4 py-4 lg:px-6 lg:py-6">
          <CardTitle className="text-base">Prompt Statistics</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 lg:px-6 lg:py-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{fullPrompt.length}</div>
              <div className="text-xs text-muted-foreground">Characters</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">
                {fullPrompt.split('\n').length}
              </div>
              <div className="text-xs text-muted-foreground">Lines</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">
                {Math.ceil(fullPrompt.split(' ').length / 750)}
              </div>
              <div className="text-xs text-muted-foreground">Est. Tokens (k)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Made with NATS
