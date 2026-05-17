# Smart JSON Repair Implementation

## Problem Summary

The application was experiencing JSON parsing errors when processing AI responses from Watsonx. The error occurred because:

1. **AI responses were being truncated** mid-JSON due to token limits
2. **The old fix logic was naive** - it blindly counted opening/closing brackets and braces, then added the difference
3. **This created invalid JSON** like `}]]}}` instead of proper structure

### Example Error
```
Error: Expected ',' or '}' after property value in JSON at position 4175
```

The AI response would end like:
```json
"acceptanceCriteria": [
  {
    "id": "ac-001-1",
    "description": "...",
    "completed": false
  }
```

And the old fix would add `]]}}`, creating invalid JSON: `}]]}}` instead of the correct `}]}`

## Root Cause

The truncation happened in nested arrays within the `githubIssues[].acceptanceCriteria[]` structure. The old repair logic:
- Counted ALL opening brackets/braces in the entire JSON
- Counted ALL closing brackets/braces
- Added the difference at the end
- **Did not understand JSON structure or context**

## Solution: Smart JSON Repair

Implemented a **context-aware JSON repair function** that:

### 1. **Parses Character-by-Character**
- Tracks whether we're inside a string, object, or array
- Maintains a stack of open structures (LIFO - Last In First Out)
- Records the last valid position

### 2. **Detects Truncation Points**
- Identifies incomplete strings
- Finds unexpected closing brackets/braces
- Detects trailing incomplete content

### 3. **Intelligent Truncation**
- Removes incomplete trailing elements
- Backtracks to last valid position if needed
- Handles incomplete strings by truncating before them

### 4. **Structure-Aware Closing**
- Closes structures in **reverse order** (arrays before objects)
- Only closes **actually unclosed** structures
- Validates the repair before returning

## Implementation Details

### New Method: `smartRepairJSON(jsonText: string): string`

**Location:** `nats-backend/src/services/watsonx.service.ts` (line 375)

**Key Features:**
```typescript
interface StackItem {
  type: 'object' | 'array';
  position: number;
}
```

**Algorithm:**
1. Parse JSON character by character
2. Track open structures in a stack
3. Detect where truncation occurred
4. Remove incomplete trailing content
5. Close unclosed structures in LIFO order
6. Validate the result

**Example Repair:**
```
Input:  {"items":[{"id":1,"name":"test"
Stack:  [object@0, array@8, object@9]
Output: {"items":[{"id":1,"name":"test"}]}
Added:  }]}
```

## Changes Made

### File: `nats-backend/src/services/watsonx.service.ts`

1. **Added `smartRepairJSON` method** (lines 375-530)
   - Context-aware JSON structure parser
   - Intelligent truncation and repair logic
   - Comprehensive logging for debugging

2. **Updated repair logic** (line 652)
   - Replaced blind bracket/brace addition
   - Now calls `this.smartRepairJSON(cleanedText)`

## Benefits

✅ **Accurate Repairs** - Understands JSON structure, not just character counts
✅ **Better Error Handling** - Detects and handles various truncation scenarios
✅ **Detailed Logging** - Provides insights into what was repaired and how
✅ **Validation** - Ensures repaired JSON is actually valid before returning
✅ **Graceful Degradation** - Falls back to truncation if repair fails

## Testing Recommendations

To test the fix:

1. **Start the backend server:**
   ```bash
   cd nats-backend
   npm run dev
   ```

2. **Send a test request** that previously failed:
   - Use the same transcript that caused the error
   - Monitor the console logs for repair messages

3. **Look for these log messages:**
   - `🔧 Starting smart JSON repair...`
   - `📊 Parse analysis:` - Shows structure analysis
   - `✂️ Truncating...` or `🔧 Closing...` - Shows repair actions
   - `✅ Smart repair complete` - Indicates success
   - `🔍 Final structure validation:` - Shows balanced structures

4. **Verify the response** is now valid JSON and parses correctly

## Expected Log Output

```
Unbalanced JSON structure detected - attempting smart repair
Braces: 18/16, Brackets: 17/15
🔧 Starting smart JSON repair...
📊 Parse analysis: {
  totalLength: 4137,
  lastValidPosition: 4100,
  unclosedStructures: 2,
  inString: false,
  stackDepth: 'object > array'
}
🔧 Closing 2 unclosed structures: array@3850, object@0
   Adding: "]}"
✅ Smart repair complete
🔍 Final structure validation: {
  braces: '18/18',
  brackets: '17/17',
  balanced: true
}
```

## Future Improvements

Consider these enhancements:

1. **Schema Simplification** - Reduce nested complexity in `acceptanceCriteria`
2. **Token Budget Monitoring** - Add warnings when approaching limits
3. **Streaming Validation** - Parse JSON as it's generated
4. **Graceful Degradation** - Request AI to prioritize completing structures

## Rollback Plan

If issues occur, revert by:

1. Remove the `smartRepairJSON` method
2. Restore the old repair logic at line 647-654
3. Restart the server

The old logic was:
```typescript
let fixedText = cleanedText;
fixedText += ']'.repeat(openBrackets - closeBrackets);
fixedText += '}'.repeat(openBraces - closeBraces);
cleanedText = fixedText;
```

## Conclusion

This implementation provides a **robust, intelligent solution** to the JSON truncation problem. Instead of blindly adding brackets, it understands the JSON structure and repairs it contextually, resulting in valid, parseable JSON responses.