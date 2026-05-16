import { env } from '../config/env.js';
import type {
  Repository,
  Branch,
  FileNode,
  FileContent,
  RepositoryMap,
  GitHubUser,
  OAuthInitResponse,
  OAuthCallbackResponse,
  ValidationResult,
} from '../types/github.js';

/**
 * GitHub Service
 * Handles GitHub API integration, OAuth, and repository operations
 */
class GitHubService {
  private readonly apiUrl = 'https://api.github.com';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  
  // File size limits
  private readonly maxFileSize = 512000; // 500KB
  private readonly maxTotalSize = 20971520; // 20MB
  
  // Relevant file extensions for code analysis
  private readonly relevantExtensions = [
    '.ts', '.tsx', '.js', '.jsx',
    '.py', '.java', '.go', '.rs',
    '.cpp', '.c', '.h', '.cs',
    '.rb', '.php', '.swift', '.kt',
    '.vue', '.svelte', '.astro',
    '.json', '.yaml', '.yml', '.toml',
    '.md', '.mdx',
  ];
  
  // Patterns to ignore
  private readonly ignorePatterns = [
    'node_modules/',
    'dist/',
    'build/',
    '.git/',
    '.next/',
    '.cache/',
    'coverage/',
    '__pycache__/',
    '.min.js',
    '.bundle.js',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
  ];

  constructor() {
    this.clientId = env.GITHUB_CLIENT_ID || '';
    this.clientSecret = env.GITHUB_CLIENT_SECRET || '';
    this.redirectUri = env.GITHUB_REDIRECT_URI || '';
  }

  /**
   * Initiate GitHub OAuth flow
   */
  async initiateOAuth(): Promise<OAuthInitResponse> {
    const state = this.generateRandomState();
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=public_repo&state=${state}`;
    
    return {
      authUrl,
      state,
    };
  }

  /**
   * Handle OAuth callback and exchange code for access token
   */
  async handleOAuthCallback(code: string): Promise<OAuthCallbackResponse> {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to exchange code for token: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(`OAuth error: ${tokenData.error_description || tokenData.error}`);
      }

      const accessToken = tokenData.access_token;

      // Fetch user information
      const user = await this.fetchUser(accessToken);

      return {
        accessToken,
        user,
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new Error(`OAuth callback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate access token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Fetch GitHub user information
   */
  async fetchUser(token: string): Promise<GitHubUser> {
    try {
      const response = await fetch(`${this.apiUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        login: data.login,
        id: data.id,
        name: data.name || data.login,
        email: data.email || '',
        avatarUrl: data.avatar_url,
      };
    } catch (error) {
      console.error('Fetch user error:', error);
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch repository information
   */
  async fetchRepository(owner: string, repo: string, token: string): Promise<Repository> {
    try {
      const response = await fetch(`${this.apiUrl}/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found');
        }
        throw new Error(`Failed to fetch repository: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        owner: data.owner.login,
        name: data.name,
        fullName: data.full_name,
        description: data.description || '',
        defaultBranch: data.default_branch,
        language: data.language || 'Unknown',
        size: data.size,
        url: data.html_url,
        private: data.private,
      };
    } catch (error) {
      console.error('Fetch repository error:', error);
      throw new Error(`Failed to fetch repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch repository branches
   */
  async fetchBranches(owner: string, repo: string, token: string): Promise<Branch[]> {
    try {
      const response = await fetch(`${this.apiUrl}/repos/${owner}/${repo}/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.statusText}`);
      }

      const data = await response.json();

      return data.map((branch: any) => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          url: branch.commit.url,
        },
        protected: branch.protected,
      }));
    } catch (error) {
      console.error('Fetch branches error:', error);
      throw new Error(`Failed to fetch branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch repository file tree
   */
  async fetchFileTree(owner: string, repo: string, branch: string, token: string): Promise<FileNode[]> {
    try {
      // First, get the tree SHA for the branch
      const branchResponse = await fetch(`${this.apiUrl}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!branchResponse.ok) {
        throw new Error(`Failed to fetch branch reference: ${branchResponse.statusText}`);
      }

      const branchData = await branchResponse.json();
      const commitSha = branchData.object.sha;

      // Get the commit to find the tree SHA
      const commitResponse = await fetch(`${this.apiUrl}/repos/${owner}/${repo}/git/commits/${commitSha}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!commitResponse.ok) {
        throw new Error(`Failed to fetch commit: ${commitResponse.statusText}`);
      }

      const commitData = await commitResponse.json();
      const treeSha = commitData.tree.sha;

      // Fetch the tree recursively
      const treeResponse = await fetch(`${this.apiUrl}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!treeResponse.ok) {
        throw new Error(`Failed to fetch tree: ${treeResponse.statusText}`);
      }

      const treeData = await treeResponse.json();

      return treeData.tree.map((item: any) => ({
        path: item.path,
        type: item.type,
        size: item.size || 0,
        sha: item.sha,
        url: item.url,
      }));
    } catch (error) {
      console.error('Fetch file tree error:', error);
      throw new Error(`Failed to fetch file tree: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch file content
   */
  async fetchFileContent(owner: string, repo: string, path: string, token: string): Promise<FileContent> {
    try {
      const response = await fetch(`${this.apiUrl}/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.statusText}`);
      }

      const data = await response.json();

      // Decode base64 content
      const content = data.encoding === 'base64' 
        ? Buffer.from(data.content, 'base64').toString('utf-8')
        : data.content;

      return {
        path: data.path,
        content,
        encoding: data.encoding,
        size: data.size,
        sha: data.sha,
      };
    } catch (error) {
      console.error('Fetch file content error:', error);
      throw new Error(`Failed to fetch file content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Filter relevant files for analysis
   */
  filterRelevantFiles(files: FileNode[]): FileNode[] {
    return files.filter(file => {
      // Only include files (not directories)
      if (file.type !== 'blob') return false;

      // Check if file should be ignored
      const shouldIgnore = this.ignorePatterns.some(pattern => 
        file.path.includes(pattern)
      );
      if (shouldIgnore) return false;

      // Check if file has relevant extension
      const hasRelevantExtension = this.relevantExtensions.some(ext => 
        file.path.endsWith(ext)
      );

      return hasRelevantExtension;
    });
  }

  /**
   * Validate file sizes
   */
  validateFileSizes(files: FileNode[]): ValidationResult {
    const errors: string[] = [];
    const oversizedFiles: string[] = [];
    let totalSize = 0;

    for (const file of files) {
      totalSize += file.size;

      if (file.size > this.maxFileSize) {
        oversizedFiles.push(file.path);
        errors.push(`File ${file.path} exceeds maximum size (${file.size} bytes > ${this.maxFileSize} bytes)`);
      }
    }

    if (totalSize > this.maxTotalSize) {
      errors.push(`Total size exceeds maximum (${totalSize} bytes > ${this.maxTotalSize} bytes)`);
    }

    return {
      valid: errors.length === 0,
      errors,
      totalSize,
      fileCount: files.length,
      oversizedFiles,
    };
  }

  /**
   * Map repository structure
   */
  mapRepositoryStructure(fileTree: FileNode[]): RepositoryMap {
    const directories = new Set<string>();
    const files: FileNode[] = [];
    const filesByExtension: Record<string, number> = {};
    let totalSize = 0;

    for (const node of fileTree) {
      if (node.type === 'tree') {
        directories.add(node.path);
      } else if (node.type === 'blob') {
        files.push(node);
        totalSize += node.size;

        // Count files by extension
        const ext = this.getFileExtension(node.path);
        if (ext) {
          filesByExtension[ext] = (filesByExtension[ext] || 0) + 1;
        }
      }
    }

    // Determine primary language based on file count
    const primaryLanguage = this.determinePrimaryLanguage(filesByExtension);

    // Filter relevant files
    const relevantFiles = this.filterRelevantFiles(files);

    return {
      structure: {
        directories: Array.from(directories),
        files,
      },
      statistics: {
        totalFiles: files.length,
        totalSize,
        filesByExtension,
        primaryLanguage,
      },
      relevantFiles,
    };
  }

  /**
   * Get file extension
   */
  private getFileExtension(path: string): string | null {
    const match = path.match(/\.([^.]+)$/);
    return match ? `.${match[1]}` : null;
  }

  /**
   * Determine primary language based on file extensions
   */
  private determinePrimaryLanguage(filesByExtension: Record<string, number>): string {
    const languageMap: Record<string, string> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
    };

    let maxCount = 0;
    let primaryLang = 'Unknown';

    for (const [ext, count] of Object.entries(filesByExtension)) {
      if (count > maxCount && languageMap[ext]) {
        maxCount = count;
        primaryLang = languageMap[ext];
      }
    }

    return primaryLang;
  }

  /**
   * Generate random state for OAuth
   */
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/zen`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('GitHub health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService();

// Made with Bob