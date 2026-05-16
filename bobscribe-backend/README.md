# BobScribe Backend API

Engineering intent orchestration pipeline powered by IBM Watson and Watsonx.ai.

## 🚀 Features

- **Speech-to-Text**: Transcribe audio files using IBM Watson Speech-to-Text
- **AI Intent Extraction**: Extract structured engineering requirements using Watsonx.ai
- **Type-Safe**: Full TypeScript implementation with strict typing
- **Environment Validation**: Zod-based configuration validation
- **RESTful API**: Clean Fastify-based REST API with CORS support
- **File Upload**: Support for audio file uploads via multipart/form-data

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- IBM Cloud account with:
  - Watson Speech-to-Text service
  - Watsonx.ai access

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your IBM credentials
```

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
# Server
PORT=3001
NODE_ENV=development

# IBM Watson Speech-to-Text
WATSON_STT_APIKEY=your_api_key
WATSON_STT_URL=https://api.us-south.speech-to-text.watson.cloud.ibm.com

# IBM Watsonx.ai
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=your_project_id
WATSONX_APIKEY=your_api_key

# Model Configuration
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
WATSONX_MAX_TOKENS=4096
WATSONX_TEMPERATURE=0.1
```

## 🏃 Running the Server

```bash
# Development mode with hot-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📡 API Endpoints

### POST /api/v1/planner/analyze

Analyze a transcript or audio file to extract engineering intent.

**Request (Text):**
```json
{
  "transcript": "We need to implement a logout feature..."
}
```

**Request (Audio):**
```bash
curl -X POST http://localhost:3001/api/v1/planner/analyze \
  -F "audio=@meeting.wav"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "riskLevel": "Medium",
    "technicalTask": { ... },
    "githubIssues": [ ... ],
    "bobPrompt": { ... }
  }
}
```

### GET /api/v1/planner/health

Check service health status.

**Response:**
```json
{
  "success": true,
  "services": {
    "watsonSTT": "healthy",
    "watsonx": "healthy"
  }
}
```

### GET /

Root endpoint with service information.

## 🏗️ Project Structure

```
bobscribe-backend/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment validation
│   ├── services/
│   │   ├── watson.service.ts   # Watson STT integration
│   │   └── watsonx.service.ts  # Watsonx.ai integration
│   ├── routes/
│   │   └── planner.routes.ts   # API routes
│   ├── types/
│   │   └── intent.ts           # TypeScript interfaces
│   └── index.ts                # Server bootstrap
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security

- All credentials stored in environment variables
- CORS configured for specific origins
- File upload size limits enforced
- Input validation on all endpoints

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3001/api/v1/planner/health

# Test analyze endpoint
curl -X POST http://localhost:3001/api/v1/planner/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Implement user authentication"}'
```

## 📝 License

MIT