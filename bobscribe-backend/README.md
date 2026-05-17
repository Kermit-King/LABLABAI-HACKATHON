# BobScribe Backend API

Engineering intent orchestration pipeline powered by IBM Watson and Watsonx.ai.

## 🚀 Features

- **Speech-to-Text**: Transcribe audio files using IBM Watson Speech-to-Text
- **AI Intent Extraction**: Extract structured engineering requirements using Watsonx.ai
- **GitHub Integration**: OAuth authentication and issue creation
- **Chatbot Service**: Interactive AI assistant for project planning
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
- GitHub OAuth App (optional, for GitHub integration features)

## 🛠️ Installation & Setup

### Step 1: Install Dependencies
```bash
cd bobscribe-backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env
```

### Step 3: Edit Environment Variables

Open `.env` and configure with your credentials:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# IBM Watson Speech-to-Text
WATSON_STT_APIKEY=your_watson_stt_api_key_here
WATSON_STT_URL=https://api.us-south.speech-to-text.watson.cloud.ibm.com

# IBM Watsonx.ai
WATSONX_URL=https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_APIKEY=your_watsonx_api_key_here

# Model Configuration (Optimized for Transcripts)
WATSONX_MODEL_ID=ibm/granite-4-h-small
WATSONX_MAX_TOKENS=8192
WATSONX_TEMPERATURE=0.2
WATSONX_TOP_P=1
WATSONX_PRESENCE_PENALTY=0.1

# GitHub OAuth Configuration (Optional)
GITHUB_CLIENT_ID=your_github_oauth_client_id_here
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3001/api/v1/github/oauth/callback
```

**Required Credentials:**
- Get Watson STT credentials from [IBM Cloud Console](https://cloud.ibm.com/catalog/services/speech-to-text)
- Get Watsonx.ai credentials from [IBM Watsonx](https://www.ibm.com/products/watsonx-ai)
- Create GitHub OAuth App at [GitHub Developer Settings](https://github.com/settings/developers) (optional)

## 🏃 Running the Server

### Development Mode (Recommended)
```bash
npm run dev
```
✅ Server runs on `http://localhost:3001` with hot-reload enabled

### Production Mode
```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Verify Server is Running
```bash
# Health check
curl http://localhost:3001/api/v1/planner/health

# Expected response:
# {"success":true,"services":{"watsonSTT":"healthy","watsonx":"healthy"}}
```

## 📡 API Endpoints

### Planner Endpoints

#### POST `/api/v1/planner/analyze`
Analyze a transcript or audio file to extract engineering intent.

**Request (Text):**
```json
{
  "transcript": "We need to implement a logout feature with JWT token invalidation..."
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
    "technicalTask": {
      "title": "Implement Logout Feature",
      "description": "...",
      "affectedFiles": ["src/auth/logout.ts", "src/routes/auth.routes.ts"]
    },
    "githubIssues": [
      {
        "title": "Implement logout endpoint",
        "body": "...",
        "labels": ["enhancement", "backend"]
      }
    ],
    "bobPrompt": {
      "systemContext": "...",
      "userInstructions": "..."
    }
  }
}
```

#### GET `/api/v1/planner/health`
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

### Chatbot Endpoints

#### POST `/api/v1/chatbot/message`
Send a message to the AI chatbot for interactive project planning.

**Request:**
```json
{
  "message": "How should I structure the authentication module?",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "For authentication, I recommend...",
    "conversationId": "uuid"
  }
}
```

### GitHub Integration Endpoints

#### GET `/api/v1/github/oauth/authorize`
Initiate GitHub OAuth flow.

#### GET `/api/v1/github/oauth/callback`
OAuth callback endpoint (redirects after GitHub authorization).

#### POST `/api/v1/github/issues`
Create GitHub issues from extracted engineering intent.

**Request:**
```json
{
  "owner": "username",
  "repo": "repository",
  "issues": [
    {
      "title": "Implement logout endpoint",
      "body": "Description...",
      "labels": ["enhancement"]
    }
  ],
  "accessToken": "github_oauth_token"
}
```

### Root Endpoint

#### GET `/`
Service information and available endpoints.

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