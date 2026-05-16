import React from 'react';
import { Bot, Copy, FileText, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { useToast } from './ui/Toast';
import { copyToClipboard } from '../lib/utils';
import { SkeletonBlock } from './ui/SkeletonBlock';

export const BobConsole: React.FC = () => {
  const { bobPrompt, isProcessing } = useProjectPlanner();
  const { showToast } = useToast();

  // Skeleton loading state
  if (isProcessing) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <SkeletonBlock width="w-32" height="h-3" className="mb-2" />
            <SkeletonBlock width="w-full" height="h-3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <SkeletonBlock width="w-32" height="h-3" />
              <SkeletonBlock width="w-full" height="h-48" rounded="rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!bobPrompt) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
        <Terminal className="h-10 w-10 text-slate-500" />
        <h3 className="text-sm font-medium text-slate-300">Nothing to send yet</h3>
        <p className="text-xs text-slate-500 text-center max-w-sm">
          Once extraction runs, the full Bob-ready prompt will appear here.
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
      showToast('Prompt copied to clipboard! Ready for IBM Bob.', 'success');
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
                IBM Bob Orchestrator Prompt
              </CardTitle>
              <CardDescription>
                Complete, structured instructions ready to be passed to IBM Bob for autonomous execution
              </CardDescription>
            </div>
            <Button onClick={handleCopyPrompt} className="shrink-0 w-full sm:w-auto">
              <Copy className="mr-2 h-4 w-4" />
              Copy for Bob
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

// Made with Bob
