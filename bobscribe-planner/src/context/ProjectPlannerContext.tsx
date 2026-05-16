import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProjectPlannerState, TechnicalTask, GithubIssue, BobPrompt } from '../types';
import { mockTechnicalTask, mockGithubIssues, mockBobPrompt } from '../data/mockData';

interface ProjectPlannerContextType extends ProjectPlannerState {
  setTranscript: (transcript: string) => void;
  extractEngineeringIntent: () => void;
  toggleAcceptanceCriteria: (issueId: string, criteriaId: string) => void;
  toggleImplementationStep: (stepOrder: number) => void;
  resetState: () => void;
  githubRepoUrl: string;
  setGithubRepoUrl: (url: string) => void;
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  isGithubConnected: boolean;
  setIsGithubConnected: (connected: boolean) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  availableBranches: string[];
  connectToGithub: () => Promise<void>;
  isConnecting: boolean;
}

const ProjectPlannerContext = createContext<ProjectPlannerContextType | undefined>(undefined);

export const ProjectPlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProjectPlannerState>({
    transcript: '',
    technicalTask: mockTechnicalTask,
    githubIssues: mockGithubIssues,
    bobPrompt: mockBobPrompt,
    isProcessing: false,
  });

  const [githubRepoUrl, setGithubRepoUrl] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isGithubConnected, setIsGithubConnected] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const setTranscript = (transcript: string) => {
    setState(prev => ({ ...prev, transcript }));
  };

  const connectToGithub = async () => {
    if (!githubRepoUrl.trim()) return;
    
    setIsConnecting(true);
    
    // Simulate API call to GitHub
    setTimeout(() => {
      // Mock branches - in real implementation, fetch from GitHub API
      const mockBranches = ['main', 'dev', 'staging', 'feature/new-feature'];
      setAvailableBranches(mockBranches);
      setSelectedBranch(mockBranches[0]); // Default to first branch
      setIsGithubConnected(true);
      setIsConnecting(false);
    }, 1000);
  };

  const extractEngineeringIntent = () => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    // Simulate processing delay
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        technicalTask: mockTechnicalTask,
        githubIssues: mockGithubIssues,
        bobPrompt: mockBobPrompt,
        isProcessing: false,
      }));
    }, 1500);
  };

  const toggleAcceptanceCriteria = (issueId: string, criteriaId: string) => {
    setState(prev => ({
      ...prev,
      githubIssues: prev.githubIssues.map(issue =>
        issue.id === issueId
          ? {
              ...issue,
              acceptanceCriteria: issue.acceptanceCriteria.map(ac =>
                ac.id === criteriaId ? { ...ac, completed: !ac.completed } : ac
              ),
            }
          : issue
      ),
    }));
  };

  const toggleImplementationStep = (stepOrder: number) => {
    setState(prev => ({
      ...prev,
      technicalTask: prev.technicalTask
        ? {
            ...prev.technicalTask,
            implementationOrder: prev.technicalTask.implementationOrder.map(step =>
              step.order === stepOrder ? { ...step, completed: !step.completed } : step
            ),
          }
        : null,
    }));
  };

  const resetState = () => {
    setState({
      transcript: '',
      technicalTask: null,
      githubIssues: [],
      bobPrompt: null,
      isProcessing: false,
    });
  };

  return (
    <ProjectPlannerContext.Provider
      value={{
        ...state,
        setTranscript,
        extractEngineeringIntent,
        toggleAcceptanceCriteria,
        toggleImplementationStep,
        resetState,
        githubRepoUrl,
        setGithubRepoUrl,
        audioFile,
        setAudioFile,
        isGithubConnected,
        setIsGithubConnected,
        selectedBranch,
        setSelectedBranch,
        availableBranches,
        connectToGithub,
        isConnecting,
      }}
    >
      {children}
    </ProjectPlannerContext.Provider>
  );
};

export const useProjectPlanner = () => {
  const context = useContext(ProjectPlannerContext);
  if (context === undefined) {
    throw new Error('useProjectPlanner must be used within a ProjectPlannerProvider');
  }
  return context;
};

// Made with Bob
