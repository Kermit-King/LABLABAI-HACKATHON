# Audio Extraction Feature

## Overview
The NATS (Notes-to-Action Task Synthesizer) backend now supports **automatic extraction** of engineering intent from audio files. Once an audio file is uploaded, it is automatically:
1. **Transcribed** using Fireworks AI Speech-to-Text (STT)
2. **Analyzed** using Watsonx.ai to extract engineering intent
3. **Returned** with the complete analysis including the transcript

## How It Works

### Workflow
```
Audio File Upload → Fireworks AI Transcription → Watsonx.ai Analysis → Complete Response
```

### Step-by-Step Process
1. **Upload Audio**: Client uploads an audio file via multipart/form-data
2. **Transcription**: Fireworks AI Whisper-v3-turbo transcribes the audio to text
3. **Automatic Extraction**: The transcript is immediately passed to Watsonx.ai for intent extraction
4. **Response**: Returns the complete analysis including:
   - Transcript text
   - System blueprint (technical tasks)
   - GitHub issues
   - NATS prompt

## API Endpoint

### POST `/api/v1/planner/analyze`

**Accepts**: 
- Multipart form-data with audio file
- JSON with transcript text

**Supported Audio Formats**:
- WAV (`.wav`)
- MP3 (`.mp3`)
- OGG (`.ogg`)
- WebM (`.webm`)
- M4A (`.m4a`)

**Maximum File Size**: 10MB

### Example Request (Audio File)

```bash
curl -X POST http://localhost:3001/api/v1/planner/analyze \
  -F "file=@recording.wav" \
  -F "repository[owner]=username" \
  -F "repository[name]=repo-name" \
  -F "repository[branch]=main" \
  -F "repository[token]=ghp_xxxxx"
```

### Example Request (Text Transcript)

```bash
curl -X POST http://localhost:3001/api/v1/planner/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Create a new API endpoint for user authentication",
    "repository": {
      "owner": "username",
      "name": "repo-name",
      "branch": "main",
      "token": "ghp_xxxxx"
    }
  }'
```

### Response Format

```json
{
  "success": true,
  "data": {
    "transcript": "Create a new API endpoint for user authentication...",
    "systemBlueprint": {
      "tasks": [
        {
          "id": "task-1",
          "title": "Create authentication endpoint",
          "description": "Implement POST /api/auth/login endpoint",
          "priority": "high",
          "estimatedHours": 4,
          "dependencies": [],
          "technicalDetails": {
            "files": ["src/routes/auth.routes.ts"],
            "technologies": ["Fastify", "JWT"],
            "considerations": ["Security", "Rate limiting"]
          }
        }
      ]
    },
    "githubIssues": [
      {
        "title": "Implement user authentication endpoint",
        "body": "Create POST /api/auth/login endpoint...",
        "labels": ["enhancement", "backend"]
      }
    ],
    "bobPrompt": {
      "prompt": "You are implementing a user authentication system...",
      "context": "The project uses Fastify and TypeScript..."
    }
  }
}
```

## Features

### ✅ Automatic Processing
- No separate transcription step needed
- Audio files are automatically transcribed and analyzed in one request
- Seamless workflow from audio to actionable engineering tasks

### ✅ Transcript Included
- The transcribed text is included in the response
- Useful for verification and debugging
- Can be saved for future reference

### ✅ GitHub Context Integration
- Optional repository context can be provided
- Enhances analysis with project-specific information
- Automatically fetches file structure and relevant files

### ✅ Comprehensive Logging
- Clear log messages for each step:
  - 🎤 Transcribing audio file
  - ✅ Transcription complete
  - 🔄 Proceeding to extraction
  - 🧠 Extracting engineering intent
  - ✅ Intent extraction complete

## Configuration

### Environment Variables

```env
# Fireworks AI API Key (required for audio transcription)
FIREWORKS_API_KEY=your_fireworks_api_key

# Watsonx.ai credentials (required for intent extraction)
WATSONX_API_KEY=your_watsonx_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### File Upload Limits

Configured in `src/index.ts`:
```typescript
await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1, // Max 1 file per request
  },
});
```

## Error Handling

### Common Errors

1. **No audio file provided**
   - Status: 400
   - Error: "No audio file provided"

2. **Transcript too short**
   - Status: 400
   - Error: "Transcript is too short or empty"

3. **Transcription failed**
   - Status: 500
   - Error: "Failed to transcribe audio: [error details]"

4. **Intent extraction failed**
   - Status: 500
   - Error: "Failed to extract intent: [error details]"

## Testing

### Health Check

```bash
curl http://localhost:3001/api/v1/planner/health
```

Expected response:
```json
{
  "success": true,
  "services": {
    "fireworksSTT": "healthy",
    "watsonx": "healthy"
  }
}
```

### Test Audio Upload

1. Record a short audio message describing a feature
2. Upload using the API endpoint
3. Verify the response includes:
   - Accurate transcript
   - Relevant technical tasks
   - GitHub issues
   - NATS prompt

## Performance

- **Transcription**: ~2-5 seconds for 1-minute audio
- **Intent Extraction**: ~3-8 seconds depending on complexity
- **Total Processing**: ~5-15 seconds for typical requests

## Best Practices

1. **Audio Quality**: Use clear audio with minimal background noise
2. **File Size**: Keep audio files under 5MB for faster processing
3. **Format**: WAV or MP3 recommended for best compatibility
4. **Context**: Provide GitHub repository context when available for better analysis
5. **Verification**: Always check the transcript in the response for accuracy

## Future Enhancements

- [ ] Support for longer audio files (chunking)
- [ ] Real-time streaming transcription
- [ ] Multiple language support
- [ ] Speaker diarization
- [ ] Audio quality analysis
- [ ] Batch processing

## Troubleshooting

### Transcription Issues

If transcription fails:
1. Check Fireworks AI API key is valid
2. Verify audio file format is supported
3. Ensure audio file is not corrupted
4. Check file size is within limits

### Extraction Issues

If intent extraction fails:
1. Verify Watsonx.ai credentials
2. Check transcript is meaningful
3. Ensure transcript is at least 10 characters
4. Review logs for detailed error messages

## Support

For issues or questions:
- Check logs: `npm run dev` shows detailed logging
- Review health endpoint: `/api/v1/planner/health`
- Consult Fireworks AI documentation: https://docs.fireworks.ai
- Consult Watsonx.ai documentation: https://www.ibm.com/docs/en/watsonx

---

**Made with Bob** 🤖