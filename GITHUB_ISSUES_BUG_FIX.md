# GitHub Issues Intermittent Bug - Fix Implementation

## Date: 2026-05-17

## Problem Summary
The GitHub issues functionality was working intermittently due to several issues:
1. JSON responses from AI being truncated or incomplete
2. Inconsistent schema complexity causing missing required fields
3. No validation of GitHub tokens before use
4. Race conditions from concurrent extraction requests
5. Poor error messages making debugging difficult
6. Missing acceptance criteria and estimated effort in some responses
7. **Frontend crashes causing blank pages when rendering invalid issue data**

## Changes Implemented

### 1. Backend: watsonx.service.ts

#### Added JSON Validation Method (Lines 531-580)
```typescript
private validateCompleteJSON(parsed: any): { valid: boolean; missing: string[] }
```
- Validates all required fields are present in parsed JSON
- Checks nested structures (technicalTask, githubIssues, bobPrompt)
- Returns detailed list of missing fields for debugging

#### Updated Minimal Schema (Lines 94-127)
- Added `acceptanceCriteria` array to githubIssues (previously missing)
- Added `estimatedEffort` to githubIssues (previously missing)
- Added `acceptanceCriteria` to bobPrompt (previously missing)
- Ensures consistency across all schema complexity levels

#### Enhanced JSON Parsing (Lines 706-715)
- Added validation check after successful JSON parse
- Warns about missing fields before normalization
- Provides better debugging information

#### Improved Fallback Generation (Lines 843-881)
- Ensures githubIssues array is never empty
- Adds default acceptanceCriteria if missing
- Adds default estimatedEffort if missing
- Validates and fixes existing issues that lack required fields
- Guarantees at least one complete GitHub issue is always returned

### 2. Frontend: ProjectPlannerContext.tsx

#### Added Request Deduplication (Line 122)
```typescript
const [isExtracting, setIsExtracting] = useState<boolean>(false);
```
- Prevents concurrent extraction requests
- Avoids race conditions and state conflicts

#### Added Token Validation Function (Lines 292-310)
```typescript
const validateGithubToken = async (token: string): Promise<boolean>
```
- Validates GitHub token before using it for extraction
- Prevents wasted API calls with invalid tokens
- Provides early error detection

#### Enhanced extractEngineeringIntent (Lines 317-327)
- Checks if extraction is already in progress
- Validates GitHub token before proceeding (if connected)
- Sets isExtracting flag to prevent duplicates
- Properly cleans up in finally block

#### Improved Error Handling (Lines 405-411)
- Better error messages
- Proper cleanup of isExtracting flag
- Maintains state consistency on errors

### 3. Backend: planner.routes.ts

#### Added Token Validation in Repository Fetch (Lines 91-95)
```typescript
const isTokenValid = await githubService.validateToken(repositoryData.token);
if (!isTokenValid) {
  throw new Error('GitHub token is invalid or expired');
}
```
- Validates token before fetching repository data
- Prevents unnecessary API calls with bad tokens

#### Enhanced Error Handling (Lines 103-113)
- Distinguishes between token errors and other errors
- Throws authentication errors to user
- Continues without repo context for non-critical errors
- Better logging for debugging

#### Improved Error Response (Lines 121-145)
- Returns appropriate HTTP status codes (401, 404, 429, 400, 500)
- Includes errorType field for frontend handling
- Provides specific error messages based on error type
- Better debugging information

## Testing Recommendations

### 1. Test Token Validation
```bash
# Test with invalid token
curl -X POST http://localhost:3001/api/v1/planner/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Add user authentication",
    "repository": {
      "owner": "test",
      "name": "repo",
      "branch": "main",
      "token": "invalid_token"
    }
  }'
```
Expected: 401 error with clear message about invalid token

### 2. Test Request Deduplication
- Click "Extract" button multiple times rapidly
- Expected: Only one extraction runs, others are ignored with console warning

### 3. Test Schema Consistency
- Test with short transcript (< 100 words)
- Test with medium transcript (100-500 words)
- Test with long transcript (> 500 words)
- Expected: All responses have acceptanceCriteria and estimatedEffort

### 4. Test Fallback Generation
- Use transcript that produces minimal AI response
- Expected: At least one complete GitHub issue with all required fields

### 5. Test Error Messages
- Test with expired token
- Test with non-existent repository
- Test with rate-limited API
- Expected: Specific, actionable error messages

### 4. Frontend: GithubIssuesView.tsx

#### Added Data Validation with useMemo (Lines 24-72)
```typescript
const safeGithubIssues = React.useMemo(() => { ... })
```
- Validates githubIssues is an array before rendering
- Filters out invalid issues (missing id, title, description)
- Provides default values for missing fields (priority, tags, acceptanceCriteria)
- Logs warnings for debugging
- Sets renderError state if data structure is invalid

#### Added Error State Display (Lines 74-88)
- Shows user-friendly error message if data validation fails
- Prevents blank page crashes
- Provides actionable guidance to user

#### Added Try-Catch in Map Function (Lines 153-277)
- Wraps each issue rendering in try-catch
- Catches and displays individual rendering errors
- Prevents one bad issue from crashing entire view
- Shows error card for problematic issues

#### Enhanced Handler Functions (Lines 110-148)
- Updated to use `safeGithubIssues` type
- Better error messages in toast notifications
- More detailed error logging

## Benefits

1. **Reliability**: Request deduplication prevents race conditions
2. **Early Detection**: Token validation catches issues before extraction
3. **Consistency**: All schema levels include required fields
4. **Robustness**: Fallback generation ensures complete responses
5. **Debuggability**: Better error messages and validation logging
6. **User Experience**: Clear error messages guide users to solutions
7. **No More Blank Pages**: Frontend validation prevents crashes from invalid data
8. **Graceful Degradation**: Individual issue errors don't crash entire view

## Monitoring

Watch for these log messages:
- `⚠️ Parsed JSON is missing required fields:` - Indicates AI response needs normalization
- `🔨 Generating githubIssues from technicalTask` - Fallback generation triggered
- `✓ GitHub token validated successfully` - Token validation passed
- `Extraction already in progress` - Request deduplication working

## Rollback Plan

If issues occur, revert these files:
1. `nats-backend/src/services/watsonx.service.ts`
2. `nats-planner/src/context/ProjectPlannerContext.tsx`
3. `nats-backend/src/routes/planner.routes.ts`

All changes are backward compatible and don't require database migrations.

## Success Metrics

- Reduction in "Failed to parse AI response" errors
- Reduction in "Missing required fields" errors
- Reduction in GitHub authentication errors during extraction
- Consistent presence of acceptanceCriteria in all GitHub issues
- No race condition errors from concurrent extractions

---

**Made with Bob** 🤖