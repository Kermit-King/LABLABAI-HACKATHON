import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectPlannerState } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const STORAGE_KEY = 'bobscribe-planner-state';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PersistedState {
  // Main state
  transcript: string;
  technicalTask: any;
  githubIssues: any[];
  bobPrompt: any;
  // GitHub connection
  githubRepoUrl: string;
  isGithubConnected: boolean;
  selectedBranch: string;
  availableBranches: string[];
  githubAccessToken: string;
  // Chat history
  chatMessages: ChatMessage[];
}

interface ProjectPlannerContextType extends ProjectPlannerState {
  setTranscript: (transcript: string) => void;
  extractEngineeringIntent: () => Promise<void>;
  transcribeAudio: () => Promise<void>;
  isTranscribing: boolean;
  toggleAcceptanceCriteria: (issueId: string, criteriaId: string) => void;
  toggleImplementationStep: (stepOrder: number) => void;
  resetState: () => void;
  clearAllData: () => void;
  disconnectGithub: () => void;
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
  githubAccessToken: string;
  setGithubAccessToken: (token: string) => void;
  error: string | null;
  // Chatbot
  chatMessages: ChatMessage[];
  sendChatMessage: (question: string) => Promise<void>;
  clearChatHistory: () => void;
  isChatLoading: boolean;
  // Chatbot UI state
  isChatPanelOpen: boolean;
  setIsChatPanelOpen: (open: boolean) => void;
  isChatPopout: boolean;
  setIsChatPopout: (popout: boolean) => void;
  // Shared input state
  chatInputMessage: string;
  setChatInputMessage: (message: string) => void;
}

const ProjectPlannerContext = createContext<ProjectPlannerContextType | undefined>(undefined);

export const ProjectPlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from localStorage
  const loadPersistedState = (): PersistedState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects for chat messages
        if (parsed.chatMessages) {
          parsed.chatMessages = parsed.chatMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
    return {
      transcript: '',
      technicalTask: null,
      githubIssues: [],
      bobPrompt: null,
      githubRepoUrl: '',
      isGithubConnected: false,
      selectedBranch: '',
      availableBranches: [],
      githubAccessToken: '',
      chatMessages: [],
    };
  };

  const persistedState = loadPersistedState();

  const [state, setState] = useState<ProjectPlannerState>({
    transcript: persistedState.transcript,
    technicalTask: persistedState.technicalTask,
    githubIssues: persistedState.githubIssues,
    bobPrompt: persistedState.bobPrompt,
    isProcessing: false,
  });

  const [githubRepoUrl, setGithubRepoUrl] = useState<string>(persistedState.githubRepoUrl);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isGithubConnected, setIsGithubConnected] = useState<boolean>(persistedState.isGithubConnected);
  const [selectedBranch, setSelectedBranch] = useState<string>(persistedState.selectedBranch);
  const [availableBranches, setAvailableBranches] = useState<string[]>(persistedState.availableBranches);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [githubAccessToken, setGithubAccessToken] = useState<string>(persistedState.githubAccessToken);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(persistedState.chatMessages);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState<boolean>(true); // Default to panel mode
  const [isChatPopout, setIsChatPopout] = useState<boolean>(false); // Default to panel, not popout
  const [chatInputMessage, setChatInputMessage] = useState<string>(''); // Shared input state

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      const dataToStore: PersistedState = {
        transcript: state.transcript,
        technicalTask: state.technicalTask,
        githubIssues: state.githubIssues,
        bobPrompt: state.bobPrompt,
        githubRepoUrl,
        isGithubConnected,
        selectedBranch,
        availableBranches,
        githubAccessToken,
        chatMessages,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error persisting state:', error);
    }
  }, [state, githubRepoUrl, isGithubConnected, selectedBranch, availableBranches, githubAccessToken, chatMessages]);

  const setTranscript = (transcript: string) => {
    setState(prev => ({ ...prev, transcript }));
  };

  /**
   * Parse GitHub repository URL to extract owner and repo name
   */
  const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
    try {
      // Handle various GitHub URL formats
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)/,  // https://github.com/owner/repo
        /^([^\/]+)\/([^\/]+)$/,              // owner/repo
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, ''), // Remove .git suffix if present
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing GitHub URL:', error);
      return null;
    }
  };

  /**
   * Connect to GitHub repository and fetch branches
   */
  const connectToGithub = async () => {
    if (!githubRepoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!githubAccessToken.trim()) {
      setError('Please provide a GitHub access token');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const parsed = parseGithubUrl(githubRepoUrl);
      if (!parsed) {
        throw new Error('Invalid GitHub repository URL');
      }

      const { owner, repo } = parsed;

      // Fetch repository information
      const repoResponse = await fetch(
        `${API_BASE_URL}/api/v1/github/repository/${owner}/${repo}`,
        {
          headers: {
            'Authorization': `Bearer ${githubAccessToken}`,
          },
        }
      );

      if (!repoResponse.ok) {
        const errorData = await repoResponse.json();
        throw new Error(errorData.error || 'Failed to fetch repository');
      }

      // Fetch branches
      const branchesResponse = await fetch(
        `${API_BASE_URL}/api/v1/github/repository/${owner}/${repo}/branches`,
        {
          headers: {
            'Authorization': `Bearer ${githubAccessToken}`,
          },
        }
      );

      if (!branchesResponse.ok) {
        const errorData = await branchesResponse.json();
        throw new Error(errorData.error || 'Failed to fetch branches');
      }

      const branchesData = await branchesResponse.json();
      const branches = branchesData.data.map((b: any) => b.name);

      setAvailableBranches(branches);
      setSelectedBranch(branches[0] || 'main');
      setIsGithubConnected(true);
    } catch (error) {
      console.error('GitHub connection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to GitHub');
      setIsGithubConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Transcribe audio file only (without extraction)
   */
  const transcribeAudio = async () => {
    if (!audioFile) {
      setError('Please upload an audio file first');
      return;
    }

    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch(`${API_BASE_URL}/api/v1/planner/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      
      // Set the transcript in the textarea
      setState(prev => ({ ...prev, transcript: data.data.transcript }));
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error instanceof Error ? error.message : 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  /**
   * Extract engineering intent with optional GitHub context
   */
  const extractEngineeringIntent = async () => {
    // Allow extraction if either transcript or audio file is present
    if (!state.transcript.trim() && !audioFile) {
      setError('Please enter a transcript or upload an audio file');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));
    setError(null);

    try {
      const parsed = isGithubConnected ? parseGithubUrl(githubRepoUrl) : null;

      let response;

      // If audio file is present, use multipart form data
      if (audioFile) {
        const formData = new FormData();
        formData.append('file', audioFile);

        // Add GitHub context if connected
        if (parsed && isGithubConnected && githubAccessToken) {
          formData.append('repository[owner]', parsed.owner);
          formData.append('repository[name]', parsed.repo);
          formData.append('repository[branch]', selectedBranch);
          formData.append('repository[token]', githubAccessToken);
        }

        response = await fetch(`${API_BASE_URL}/api/v1/planner/analyze`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Use JSON for text transcript
        const requestBody: any = {
          transcript: state.transcript,
        };

        // Add GitHub context if connected
        if (parsed && isGithubConnected && githubAccessToken) {
          requestBody.repository = {
            owner: parsed.owner,
            name: parsed.repo,
            branch: selectedBranch,
            token: githubAccessToken,
          };
        }

        response = await fetch(`${API_BASE_URL}/api/v1/planner/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze transcript');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        transcript: data.data.transcript || prev.transcript, // Update transcript if returned
        technicalTask: data.data.technicalTask,
        githubIssues: data.data.githubIssues,
        bobPrompt: data.data.bobPrompt,
        isProcessing: false,
      }));
    } catch (error) {
      console.error('Intent extraction error:', error);
      setError(error instanceof Error ? error.message : 'Failed to extract engineering intent');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
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
    setError(null);
    setChatMessages([]);
  };

  /**
   * Disconnect from GitHub repository
   */
  const disconnectGithub = () => {
    setIsGithubConnected(false);
    setGithubRepoUrl('');
    setGithubAccessToken('');
    setSelectedBranch('');
    setAvailableBranches([]);
    setError(null);
  };

  /**
   * Clear all data including persisted state
   */
  const clearAllData = () => {
    // Reset all state
    setState({
      transcript: '',
      technicalTask: null,
      githubIssues: [],
      bobPrompt: null,
      isProcessing: false,
    });
    
    // Reset GitHub connection
    setIsGithubConnected(false);
    setGithubRepoUrl('');
    setGithubAccessToken('');
    setSelectedBranch('');
    setAvailableBranches([]);
    
    // Reset other state
    setAudioFile(null);
    setError(null);
    setChatMessages([]);
    setChatInputMessage('');
    
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  /**
   * Send a chat message to the chatbot
   */
  const sendChatMessage = async (question: string) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatbot/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          context: {
            transcript: state.transcript,
            systemBlueprint: state.technicalTask,
            githubIssues: state.githubIssues,
            bobPrompt: state.bobPrompt,
          },
          chatHistory: chatMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.data.answer,
        timestamp: new Date(data.data.timestamp),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  /**
   * Clear chat history
   */
  const clearChatHistory = () => {
    setChatMessages([]);
  };

  return (
    <ProjectPlannerContext.Provider
      value={{
        ...state,
        setTranscript,
        extractEngineeringIntent,
        transcribeAudio,
        isTranscribing,
        toggleAcceptanceCriteria,
        toggleImplementationStep,
        resetState,
        clearAllData,
        disconnectGithub,
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
        githubAccessToken,
        setGithubAccessToken,
        error,
        chatMessages,
        sendChatMessage,
        clearChatHistory,
        isChatLoading,
        chatInputMessage,
        setChatInputMessage,
        isChatPanelOpen,
        setIsChatPanelOpen,
        isChatPopout,
        setIsChatPopout,
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
