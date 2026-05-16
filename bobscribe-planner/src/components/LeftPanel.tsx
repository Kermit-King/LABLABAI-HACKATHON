import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';

export const LeftPanel: React.FC = () => {
  const { transcript, setTranscript, extractEngineeringIntent, isProcessing } = useProjectPlanner();

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Meeting Transcript Input
          </CardTitle>
          <CardDescription>
            Paste your meeting notes or transcribed audio to extract engineering requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here...

Example:
'We need to implement a secure logout feature that properly clears cookies and revokes JWT tokens. The current implementation doesn't handle token revocation, which is a security risk. Users should be able to logout from all devices, and we need to ensure that revoked tokens can't be reused.'"
            className="flex-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none scrollbar-thin"
          />
          
          <div className="flex items-center gap-3">
            <Button
              onClick={extractEngineeringIntent}
              disabled={!transcript.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Extract Engineering Intent
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">💡 Tips for better results:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Include technical requirements and constraints</li>
              <li>Mention affected files or systems</li>
              <li>Specify security or performance concerns</li>
              <li>Note any dependencies or order of operations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Made with Bob
