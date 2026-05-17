# GitHub Integration Troubleshooting Guide

## Common Issues When Fetching Repository Data

### Issue: "Failed to fetch repository" or 401/403 Errors

The GitHub service requires proper authentication. Here's how to diagnose and fix the issue:

## 1. GitHub Personal Access Token (PAT) Format

Your GitHub token should look like this:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:** You need to provide the FULL token value, not just "ghp"

### How to Create a GitHub Personal Access Token:

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "NATS Access")
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `public_repo` (Access public repositories)
5. Click "Generate token"
6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

## 2. How the Token is Used

When you submit a repository URL and token through the frontend, the backend expects:

```json
{
  "transcript": "your text or audio transcription",
  "repository": {
    "owner": "username",
    "name": "repo-name",
    "branch": "main",
    "token": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

## 3. Testing Your Token

You can test if your token works by running this curl command:

```bash
# Replace YOUR_TOKEN with your actual GitHub token
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user
```

If it works, you'll see your GitHub user information. If not, you'll get an error.

## 4. Common Errors and Solutions

### Error: "Authorization token is required"
**Cause:** Token not provided or in wrong format
**Solution:** Ensure you're passing the token in the repository object

### Error: "Repository not found" (404)
**Cause:** 
- Repository doesn't exist
- Token doesn't have access to the repository
- Owner/repo name is incorrect

**Solution:**
- Verify the repository URL is correct
- For private repos, ensure your token has `repo` scope
- Check the owner and repo name match exactly (case-sensitive)

### Error: "Failed to fetch branch reference"
**Cause:** Branch name doesn't exist
**Solution:** 
- Check the default branch name (might be `main` or `master`)
- Verify the branch exists in the repository

### Error: "Bad credentials" (401)
**Cause:** Invalid or expired token
**Solution:** Generate a new token

## 5. Repository URL Format

When providing a repository URL, it should be in one of these formats:
- `https://github.com/owner/repo`
- `owner/repo`

The system will parse:
- **owner**: The GitHub username or organization
- **repo**: The repository name
- **branch**: Default is usually `main` or `master`

## 6. Testing the Integration

### Step 1: Test Token Validation
```bash
curl -X POST http://localhost:3001/api/v1/github/oauth/validate \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_GITHUB_TOKEN"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

### Step 2: Test Repository Fetch
```bash
curl -X GET http://localhost:3001/api/v1/github/repository/OWNER/REPO \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "owner": "OWNER",
    "name": "REPO",
    "fullName": "OWNER/REPO",
    "description": "...",
    "defaultBranch": "main",
    "language": "TypeScript",
    ...
  }
}
```

### Step 3: Test with Audio/Text Analysis
```bash
curl -X POST http://localhost:3001/api/v1/planner/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Create a new feature for user authentication",
    "repository": {
      "owner": "YOUR_USERNAME",
      "name": "YOUR_REPO",
      "branch": "main",
      "token": "YOUR_GITHUB_TOKEN"
    }
  }'
```

## 7. Frontend Integration Check

If you're using the frontend, ensure the token is being passed correctly. Check the browser console for any errors.

The frontend should send the request like this:
```javascript
const response = await fetch('http://localhost:3001/api/v1/planner/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    transcript: transcriptText,
    repository: {
      owner: repoOwner,
      name: repoName,
      branch: repoBranch || 'main',
      token: githubToken, // This must be the full token!
    }
  })
});
```

## 8. Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

1. **Never commit tokens to Git**
   - Add `.env` to `.gitignore`
   - Never hardcode tokens in source code

2. **Token Permissions**
   - Only grant necessary scopes
   - For public repos: `public_repo` scope is sufficient
   - For private repos: `repo` scope is required

3. **Token Storage**
   - Store tokens securely (environment variables, secure storage)
   - Don't expose tokens in client-side code
   - Consider using OAuth flow for production

4. **Token Rotation**
   - Regularly rotate tokens
   - Revoke unused tokens
   - Set expiration dates when possible

## 9. Debug Mode

To see detailed error messages, check the backend logs:

```bash
cd nats-backend
npm run dev
```

The logs will show:
- API requests being made
- GitHub API responses
- Error details with stack traces

## 10. Rate Limiting

GitHub API has rate limits:
- **Authenticated requests:** 5,000 per hour
- **Unauthenticated requests:** 60 per hour

If you hit rate limits, you'll get a 403 error. Wait an hour or use a different token.

## Quick Checklist

- [ ] Generated a GitHub Personal Access Token
- [ ] Token has `repo` or `public_repo` scope
- [ ] Token is the full value (starts with `ghp_`)
- [ ] Repository owner and name are correct
- [ ] Branch name exists in the repository
- [ ] Token has access to the repository (for private repos)
- [ ] Backend server is running
- [ ] No CORS errors in browser console
- [ ] Checked backend logs for detailed errors

---

**Made with Bob** 🤖
