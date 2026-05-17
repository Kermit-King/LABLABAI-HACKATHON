# 🎯 BobScribe - AI-Powered Engineering Intent Orchestration

Transform meeting transcripts and notes into highly structured, context-aware engineering instructions designed for IBM Bob autonomous codebase modification.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **IBM Cloud account** with:
  - Watson Speech-to-Text service
  - Watsonx.ai access
- **GitHub OAuth App** (optional, for GitHub integration)

### Running the Full Stack

**Option 1: Two Terminal Windows (Recommended for Development)**

**Terminal 1 - Backend:**
```bash
cd bobscribe-backend
npm install
cp .env.example .env
# Edit .env with your IBM credentials (see Backend Setup below)
npm run dev
```
✅ Backend runs on: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd bobscribe-planner
npm install
npm run dev
```
✅ Frontend runs on: `http://localhost:5173`

**Option 2: Run Both Simultaneously**
```bash
# Install concurrently globally (one-time setup)
npm install -g concurrently

# From project root directory
concurrently "cd bobscribe-backend && npm run dev" "cd bobscribe-planner && npm run dev"
```

---

## 📦 Project Structure

```
LABLABAI-HACKATHON/
├── bobscribe-backend/          # Fastify API Server (Port 3001)
│   ├── src/
│   │   ├── config/            # Environment validation
│   │   ├── services/          # Watson STT & Watsonx.ai integration
│   │   ├── routes/            # API endpoints
│   │   └── types/             # TypeScript interfaces
│   ├── .env.example           # Environment template
│   └── package.json
│
└── bobscribe-planner/         # React Frontend (Port 5173)
    ├── src/
    │   ├── components/        # UI components
    │   ├── context/           # State management
    │   ├── types/             # TypeScript interfaces
    │   └── App.tsx
    └── package.json
```

---

## 🔧 Backend Setup (bobscribe-backend)

### 1. Install Dependencies
```bash
cd bobscribe-backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
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

# Model Configuration
WATSONX_MODEL_ID=ibm/granite-4-h-small
WATSONX_MAX_TOKENS=8192
WATSONX_TEMPERATURE=0.2

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=your_github_oauth_client_id_here
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3001/api/v1/github/oauth/callback
```

### 3. Run Backend
```bash
# Development mode (hot-reload)
npm run dev

# Production build
npm run build
npm start
```

### 4. Verify Backend
```bash
# Health check
curl http://localhost:3001/api/v1/planner/health

# Expected response:
# {"success":true,"services":{"watsonSTT":"healthy","watsonx":"healthy"}}
```

**📚 Full Backend Documentation:** See [bobscribe-backend/README.md](bobscribe-backend/README.md)

---

## 🎨 Frontend Setup (bobscribe-planner)

### 1. Install Dependencies
```bash
cd bobscribe-planner
npm install
```

### 2. Run Frontend
```bash
# Development mode (hot-reload)
npm run dev

# Production build
npm run build
npm run preview
```

### 3. Access Application
Open your browser to: `http://localhost:5173`

**📚 Full Frontend Documentation:** See [bobscribe-planner/README.md](bobscribe-planner/README.md)

---

## 🌟 Features

### Backend API
- **Speech-to-Text**: Transcribe audio files using IBM Watson
- **AI Intent Extraction**: Extract structured engineering requirements using Watsonx.ai
- **GitHub Integration**: OAuth authentication and issue creation
- **Type-Safe**: Full TypeScript implementation
- **RESTful API**: Clean Fastify-based REST API with CORS support

### Frontend Application
- **Transcript Processing**: Paste raw meeting notes and extract engineering intent
- **System Blueprint**: Visual breakdown of technical tasks with risk assessment
- **GitHub Issues Generator**: Auto-generate structured issues with acceptance criteria
- **Bob Orchestrator Console**: Complete, ready-to-use prompts for IBM Bob
- **Interactive UI**: Check off tasks, copy file paths, and manage implementation order
- **Dark Mode First**: Sleek developer aesthetic

---

## 📡 API Endpoints

### POST `/api/v1/planner/analyze`
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

### GET `/api/v1/planner/health`
Check service health status.

### POST `/api/v1/chatbot/message`
Send a message to the AI chatbot.

### GitHub OAuth Endpoints
- `GET /api/v1/github/oauth/authorize` - Initiate OAuth flow
- `GET /api/v1/github/oauth/callback` - OAuth callback
- `POST /api/v1/github/issues` - Create GitHub issues

---

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:3001/api/v1/planner/health
```

### Test Analyze Endpoint
```bash
curl -X POST http://localhost:3001/api/v1/planner/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Implement user authentication with JWT tokens"}'
```

### Test Frontend
1. Open `http://localhost:5173` in your browser
2. Paste a transcript in the left panel
3. Click "Extract Engineering Intent"
4. Review the generated blueprint, issues, and Bob prompts

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Language**: TypeScript
- **AI Services**: IBM Watson STT, IBM Watsonx.ai
- **Validation**: Zod

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Context API

---

## 🔒 Security

- All credentials stored in environment variables
- CORS configured for specific origins
- File upload size limits enforced
- Input validation on all endpoints
- OAuth 2.0 for GitHub integration

---

## 🐛 Troubleshooting

### Port Already in Use
- **Backend**: Change `PORT` in `.env` file
- **Frontend**: Vite will automatically suggest an alternative port

### Missing Environment Variables
The backend will fail to start if required IBM credentials are missing. Check console for specific errors.

### CORS Issues
Backend is configured for `http://localhost:5173`. If you change the frontend port, update CORS settings in `bobscribe-backend/src/index.ts`.

### Connection Refused
Ensure the backend is running before starting the frontend. The frontend makes API calls to `http://localhost:3001`.

---

## 📝 Development Commands

### Backend
```bash
npm run dev      # Start development server with hot-reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Lint TypeScript code
```

### Frontend
```bash
npm run dev      # Start development server with hot-reload
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint TypeScript/React code
```

---

## 🎯 Usage Flow

1. **Start Backend**: Run the backend server with IBM credentials configured
2. **Start Frontend**: Launch the React application
3. **Input Transcript**: Paste meeting notes or upload audio in the left panel
4. **Extract Intent**: Click "Extract Engineering Intent" button
5. **Review Blueprint**: Check system overview, affected files, and implementation order
6. **View Issues**: See generated GitHub issues with acceptance criteria
7. **Copy for Bob**: Get the complete prompt ready for IBM Bob
8. **Execute**: Use the generated instructions with IBM Bob for autonomous code modification

---

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ for the LabLabAI Hackathon

---

## 🔗 Additional Resources

- [Backend API Documentation](bobscribe-backend/README.md)
- [Frontend Application Guide](bobscribe-planner/README.md)
- [IBM Watson Documentation](https://cloud.ibm.com/docs/watson)
- [IBM Watsonx.ai Documentation](https://www.ibm.com/products/watsonx-ai)