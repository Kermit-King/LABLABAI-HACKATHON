/**
 * GitHub Integration Types
 * Type definitions for GitHub API integration
 */

export interface Repository {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  language: string;
  size: number;
  url: string;
  private: boolean;
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface FileNode {
  path: string;
  type: 'file' | 'dir' | 'tree' | 'blob';
  size: number;
  sha: string;
  url: string;
}

export interface FileContent {
  path: string;
  content: string;
  encoding: string;
  size: number;
  sha: string;
}

export interface RepositoryMap {
  structure: {
    directories: string[];
    files: FileNode[];
  };
  statistics: {
    totalFiles: number;
    totalSize: number;
    filesByExtension: Record<string, number>;
    primaryLanguage: string;
  };
  relevantFiles: FileNode[];
}

export interface GitHubUser {
  login: string;
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface OAuthInitResponse {
  authUrl: string;
  state: string;
}

export interface OAuthCallbackResponse {
  accessToken: string;
  user: GitHubUser;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  totalSize: number;
  fileCount: number;
  oversizedFiles: string[];
}

// Made with Bob