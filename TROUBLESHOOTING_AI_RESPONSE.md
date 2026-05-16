# Troubleshooting AI Response Issues

## Issue: Missing Required Fields (technicalTask, githubIssues, bobPrompt)

If you're seeing this error:
```
Failed to extract intent: Invalid intent payload structure - missing required fields: technicalTask, githubIssues, bobPrompt
```

This means the AI model is not generating the expected JSON structure.

## Diagnostic Steps

### 1. Check Server Logs

Look for these debug sections in your server console:

```
=== PARSED PAYLOAD DEBUG ===
Payload keys: [...]
Payload type: object
Is array?: false
Full payload (first 2000 chars): {...}
=== END DEBUG ===
```

And:

```
PROBLEMATIC_PAYLOAD_START
{...full JSON here...}
PROBLEMATIC_PAYLOAD_END
```

### 2. Analyze What the AI Generated

Copy the JSON between `PROBLEMATIC_PAYLOAD_START` and `PROBLEMATIC_PAYLOAD_END` and check:

- **Is it an empty object `{}`?** → The AI generated nothing useful
- **Does it have different field names?** → The AI didn't follow the schema
- **Is it truncated?** → Token limit or parsing issue
- **Is it wrapped in another structure?** → The AI added extra nesting

### 3. Common Causes & Solutions

#### Cause 1: Model Not Following Instructions
**Symptoms:** AI generates valid JSON but with wrong field names

**Solution:** The model might not be capable of following complex instructions. Try:
1. Use a more capable model (e.g., `meta-llama/llama-3-1-70b-instruct` instead of `ibm/granite-4-h-small`)
2. Simplify the prompt
3. Add more examples in the system prompt

#### Cause 2: Token Limit Too High
**Symptoms:** Response is truncated or malformed

**Solution:** 
```env
# Try reducing from 131072 to a more reasonable value
WATSONX_MAX_TOKENS=16384
```

Very high token limits can cause issues with some models.

#### Cause 3: Response Wrapped in Extra Structure
**Symptoms:** Payload keys show something like `["response", "data"]` instead of expected fields

**Solution:** The AI might be wrapping the response. Check if `intentPayload.response` or `intentPayload.data` contains the actual data.

#### Cause 4: Model Generating Explanation Text
**Symptoms:** Payload is a string or has unexpected structure

**Solution:** The model is ignoring the "JSON only" instruction. Try:
1. Use a different model
2. Add more explicit stop sequences
3. Increase temperature slightly (paradoxically, very low temperature can make models too literal)

### 4. Quick Fixes to Try

#### Fix 1: Update Model Configuration

Edit `.env`:
```env
# Try a more capable model
WATSONX_MODEL_ID=meta-llama/llama-3-1-70b-instruct

# Or try IBM's larger Granite model
WATSONX_MODEL_ID=ibm/granite-13b-instruct-v2

# Adjust token limit
WATSONX_MAX_TOKENS=16384

# Slightly increase temperature
WATSONX_TEMPERATURE=0.3
```

#### Fix 2: Simplify the Transcript

If using a very long or complex transcript:
1. Break it into smaller chunks
2. Summarize the key points first
3. Remove unnecessary details

#### Fix 3: Test with Simple Input

Try this minimal transcript:
```
"We need to add a login button to the homepage. It should be blue and redirect to /login when clicked."
```

If this works, the issue is with complex transcripts. If it doesn't, the issue is with the model/configuration.

### 5. Model Recommendations

Based on complexity:

**Simple Tasks (< 1000 tokens):**
- `ibm/granite-4-h-small` ✓
- `WATSONX_MAX_TOKENS=4096`

**Medium Tasks (1000-5000 tokens):**
- `ibm/granite-13b-instruct-v2` ✓
- `meta-llama/llama-3-1-8b-instruct` ✓
- `WATSONX_MAX_TOKENS=8192`

**Complex Tasks (5000+ tokens, large codebases):**
- `meta-llama/llama-3-1-70b-instruct` ✓✓✓
- `ibm/granite-34b-code-instruct` ✓✓
- `WATSONX_MAX_TOKENS=16384`

### 6. Debugging Workflow

1. **Run the request** and capture the error
2. **Check server logs** for `PROBLEMATIC_PAYLOAD_START/END`
3. **Copy the JSON** and validate it at jsonlint.com
4. **Analyze the structure** - what fields are present?
5. **Compare with expected schema** in `src/types/intent.ts`
6. **Try a different model** if structure is completely wrong
7. **Adjust token limits** if response is truncated
8. **Simplify the prompt** if model is confused

### 7. Emergency Fallback

If nothing works, you can temporarily modify the validation to accept partial responses:

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

In `watsonx.service.ts`, comment out the validation:
```typescript
// if (missingFields.length > 0) {
//   throw new Error(...);
// }
```

This will let you see what the AI is actually generating, but the app may crash later when trying to use the incomplete data.

### 8. Getting Help

When asking for help, provide:
1. The full JSON from `PROBLEMATIC_PAYLOAD_START/END`
2. Your `.env` configuration (without API keys)
3. The transcript you're trying to analyze
4. The model you're using

## Prevention

To avoid these issues:
1. Start with recommended models and token limits
2. Test with simple transcripts first
3. Gradually increase complexity
4. Monitor server logs for warnings
5. Keep transcripts focused and concise