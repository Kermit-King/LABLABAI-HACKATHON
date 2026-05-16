import React, { useRef, useEffect } from 'react';
import { Sparkles, Github, Upload, Check, GitBranch } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';

export const LeftPanel: React.FC = () => {
  const {
    transcript,
    setTranscript,
    extractEngineeringIntent,
    isProcessing,
    githubRepoUrl,
    setGithubRepoUrl,
    audioFile,
    setAudioFile,
    isGithubConnected,
    selectedBranch,
    setSelectedBranch,
    availableBranches,
    connectToGithub,
    isConnecting
  } = useProjectPlanner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [transcript]);

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* GitHub Repository Link */}
      <Card>
        <CardHeader className="pb-3 px-4 lg:px-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <Github className="h-4 w-4 text-primary" />
            GitHub Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 lg:px-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={githubRepoUrl}
              onChange={(e) => setGithubRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              disabled={isGithubConnected}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              onClick={connectToGithub}
              disabled={!githubRepoUrl.trim() || isGithubConnected || isConnecting}
              className={isGithubConnected ? 'bg-green-600 hover:bg-green-700' : ''}
              size="sm"
            >
              {isConnecting ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connecting...
                </>
              ) : isGithubConnected ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Connected
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </div>

          {/* Branch Selector - Only shown when connected */}
          {isGithubConnected && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <GitBranch className="h-3.5 w-3.5 text-primary" />
                Select Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {availableBranches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Input Card */}
      <Card className="flex flex-col">
        <CardHeader className="px-4 lg:px-6">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Meeting Transcript Input
          </CardTitle>
          <CardDescription>
            Upload audio or paste your meeting notes to extract engineering requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-4 lg:px-6">
          {/* Audio Upload Button */}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
            />
            <Button
              onClick={handleUploadClick}
              variant="outline"
              className="w-full justify-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              {audioFile ? `Uploaded: ${audioFile.name}` : 'Upload Audio File'}
            </Button>
            {audioFile && (
              <p className="text-xs text-muted-foreground text-center">
                Audio file ready for transcription
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or paste transcript</span>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here...

Example:
'We need to implement a secure logout feature that properly clears cookies and revokes JWT tokens. The current implementation doesn't handle token revocation, which is a security risk. Users should be able to logout from all devices, and we need to ensure that revoked tokens can't be reused.'"
            className="w-full min-h-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            style={{ overflowY: 'hidden' }}
          />
          
          <div className="flex items-center gap-3">
            <Button
              onClick={extractEngineeringIntent}
              disabled={!transcript.trim() || isProcessing}
              className="w-full sm:w-auto"
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
