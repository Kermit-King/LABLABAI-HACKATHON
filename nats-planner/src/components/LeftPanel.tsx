import React, { useRef, useEffect } from 'react';
import { Sparkles, Github, Upload, Check, GitBranch, ExternalLink, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useProjectPlanner } from '../context/ProjectPlannerContext';

export const LeftPanel: React.FC = () => {
  const {
    transcript,
    setTranscript,
    extractEngineeringIntent,
    transcribeAudio,
    isTranscribing,
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
    isConnecting,
    githubAccessToken,
    setGithubAccessToken,
    error,
    disconnectGithub,
    clearAllData,
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
          <div className="space-y-2">
            <label htmlFor="github-repo" className="text-xs font-medium text-muted-foreground">
              Repository URL
            </label>
            <input
              id="github-repo"
              type="text"
              value={githubRepoUrl}
              onChange={(e) => setGithubRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              disabled={isGithubConnected}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="github-token" className="text-xs font-medium text-muted-foreground">
                Personal Access Token
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get token
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <input
              id="github-token"
              type="password"
              value={githubAccessToken}
              onChange={(e) => setGithubAccessToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              disabled={isGithubConnected}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              💡 Create a token with <code className="px-1 py-0.5 rounded bg-muted">repo</code> scope at GitHub Settings → Developer settings → Personal access tokens
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={connectToGithub}
              disabled={!githubRepoUrl?.trim() || !githubAccessToken?.trim() || isGithubConnected || isConnecting}
              className={isGithubConnected ? 'bg-green-600 hover:bg-green-700 flex-1' : 'flex-1'}
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
                'Connect to Repository'
              )}
            </Button>
            {isGithubConnected && (
              <Button
                onClick={disconnectGithub}
                variant="outline"
                size="sm"
                className="px-3"
                title="Disconnect and use a different repository"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded px-2 py-1">
              {error}
            </div>
          )}

          {/* Branch Selector - Only shown when connected */}
          {isGithubConnected && (
            <div className="space-y-2 pt-3 border-t border-border">
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <GitBranch className="h-3.5 w-3.5 text-primary" />
                Target Branch
              </label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {availableBranches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                        {branch}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              aria-label="Upload audio file"
              id="audio-upload"
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
              <>
                <Button
                  onClick={transcribeAudio}
                  disabled={isTranscribing}
                  variant="secondary"
                  className="w-full justify-center"
                >
                  {isTranscribing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Transcribing with Fireworks AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Transcribe Audio
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Click "Transcribe Audio" to convert speech to text, or "Extract" to transcribe and analyze in one step
                </p>
              </>
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

          <Textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here...

Example:
'We need to implement a secure logout feature that properly clears cookies and revokes JWT tokens. The current implementation doesn't handle token revocation, which is a security risk. Users should be able to logout from all devices, and we need to ensure that revoked tokens can't be reused.'"
            className="w-full min-h-40 resize-none"
            style={{ overflowY: 'hidden' }}
          />
          
          <Button
            onClick={extractEngineeringIntent}
            disabled={(!transcript.trim() && !audioFile) || isProcessing || isTranscribing}
            className="w-full text-sm font-medium"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {audioFile && !transcript.trim() ? 'Transcribing & Analyzing...' : 'Processing...'}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {audioFile && !transcript.trim() ? 'Transcribe & Extract' : 'Extract Engineering Intent'}
              </>
            )}
          </Button>

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

      {/* Clear All Data Button */}
      <Button
        onClick={clearAllData}
        variant="outline"
        size="sm"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clear All Data
      </Button>
    </div>
  );
};

// Made with Bob
