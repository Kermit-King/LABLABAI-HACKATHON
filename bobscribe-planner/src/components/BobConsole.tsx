import React from 'react';
import { Bot, Copy, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { useToast } from './ui/Toast';
import { copyToClipboard } from '../lib/utils';

export const BobConsole: React.FC = () => {
  const { bobPrompt } = useProjectPlanner();
  const { showToast } = useToast();

  if (!bobPrompt) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No Bob prompt generated yet. Process a transcript to see the orchestrator console.
        </CardContent>
      </Card>
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
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                IBM Bob Orchestrator Prompt
              </CardTitle>
              <CardDescription>
                Complete, structured instructions ready to be passed to IBM Bob for autonomous execution
              </CardDescription>
            </div>
            <Button onClick={handleCopyPrompt} className="shrink-0">
              <Copy className="mr-2 h-4 w-4" />
              Copy for Bob
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <section.icon className="h-4 w-4" />
                {section.title}
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono overflow-x-auto scrollbar-thin">
                  {section.content}
                </pre>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prompt Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
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
