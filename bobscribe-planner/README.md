# BobScribe Architecture & Feature Planner

A sophisticated web application that transforms meeting transcripts and notes into highly structured, context-aware engineering instructions designed for IBM Bob autonomous codebase modification.

## 🚀 Features

- **Transcript Processing**: Paste raw meeting notes and extract engineering intent
- **System Blueprint**: Visual breakdown of technical tasks with risk assessment
- **GitHub Issues Generator**: Auto-generate structured issues with acceptance criteria
- **Bob Orchestrator Console**: Complete, ready-to-use prompts for IBM Bob
- **Interactive Chatbot**: AI assistant for project planning and architecture discussions
- **GitHub Integration**: OAuth authentication and direct issue creation
- **Interactive UI**: Check off tasks, copy file paths, and manage implementation order
- **Dark Mode**: Sleek developer aesthetic with theme toggle

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Dark mode first)
- **Icons**: Lucide React
- **State Management**: React Context API
- **Syntax Highlighting**: React Syntax Highlighter

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- **Backend API running** on `http://localhost:3001` (see [bobscribe-backend](../bobscribe-backend/README.md))

## 🛠️ Installation & Setup

### Step 1: Install Dependencies
```bash
cd bobscribe-planner
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```
✅ Frontend runs on `http://localhost:5173` (default Vite port)

### Step 3: Verify Backend Connection
Ensure the backend API is running on `http://localhost:3001` before using the application. The frontend makes API calls to:
- `POST /api/v1/planner/analyze` - Extract engineering intent
- `POST /api/v1/chatbot/message` - Chatbot interactions
- `GET /api/v1/github/oauth/authorize` - GitHub OAuth

## 🏃 Running the Application

### Development Mode (Recommended)
```bash
npm run dev
```
- Hot-reload enabled
- Opens at `http://localhost:5173`
- Connects to backend at `http://localhost:3001`

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Lint Code
```bash
npm run lint
```

## 🎨 Design Philosophy

- **Dark-mode first**: Sleek developer aesthetic with Slate/Zinc palette and Indigo accents
- **Density optimized**: No walls of text, prioritizes glanceability
- **Type-safe**: Full TypeScript coverage with explicit types
- **Modular**: Clean, reusable component architecture
- **Responsive**: Works on desktop and tablet devices

## 📁 Project Structure

```
bobscribe-planner/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── LeftPanel.tsx    # Transcript input
│   │   ├── RightPanel.tsx   # Tabbed workspace
│   │   ├── SystemBlueprint.tsx
│   │   ├── GithubIssuesView.tsx
│   │   └── BobConsole.tsx
│   ├── context/
│   │   └── ProjectPlannerContext.tsx
│   ├── data/
│   │   └── mockData.ts      # Sample data
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🎯 Usage Flow

### 1. Start the Application
Ensure both backend and frontend are running:
- **Backend**: `http://localhost:3001` ✅
- **Frontend**: `http://localhost:5173` ✅

### 2. Input Transcript
- Paste meeting notes or project requirements in the left panel
- Or use the chatbot for interactive planning discussions

### 3. Extract Engineering Intent
- Click **"Extract Engineering Intent"** button
- The AI will analyze and structure your requirements

### 4. Review System Blueprint
Navigate through the tabs:
- **📋 System Blueprint**: Overview, risk assessment, affected files
- **🐙 GitHub Issues**: Auto-generated issues with acceptance criteria
- **🤖 Bob Console**: Complete prompts ready for IBM Bob
- **💬 Chatbot**: Interactive AI assistant for clarifications

### 5. Take Action
- ✅ Check off completed tasks
- 📋 Copy file paths and code snippets
- 🐙 Create GitHub issues directly (with OAuth)
- 🤖 Copy Bob prompts for autonomous code modification

## 🔧 Development Commands

```bash
# Run development server with hot-reload
npm run dev

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Lint TypeScript and React code
npm run lint
```

## 🌐 Environment Configuration

The frontend is configured to connect to the backend at `http://localhost:3001`. If you need to change this:

1. Update API calls in service files (if any)
2. Ensure CORS is configured correctly in the backend

## 🐛 Troubleshooting

### Backend Connection Issues
**Problem**: "Failed to fetch" or network errors

**Solution**:
1. Verify backend is running: `curl http://localhost:3001/api/v1/planner/health`
2. Check backend logs for errors
3. Ensure CORS is configured for `http://localhost:5173`

### Port Already in Use
**Problem**: Port 5173 is already in use

**Solution**: Vite will automatically suggest an alternative port (e.g., 5174). Accept the suggestion or manually specify a port:
```bash
npm run dev -- --port 5174
```

### Build Errors
**Problem**: TypeScript or build errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 📦 Component Architecture

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Tabs.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Toast.tsx
│   ├── LeftPanel.tsx          # Transcript input area
│   ├── RightPanel.tsx         # Tabbed workspace
│   ├── SystemBlueprint.tsx    # Technical task breakdown
│   ├── GithubIssuesView.tsx   # GitHub issues display
│   ├── BobConsole.tsx         # Bob prompt generator
│   ├── Chatbot.tsx            # AI chatbot interface
│   └── ChatMessage.tsx        # Chat message component
├── context/
│   └── ProjectPlannerContext.tsx  # Global state management
├── types/
│   └── index.ts               # TypeScript interfaces
├── lib/
│   └── utils.ts               # Utility functions
└── App.tsx                    # Main application component
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: Default theme with toggle support
- **Color Palette**: Slate/Zinc base with Indigo accents
- **Responsive**: Mobile-first design approach

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ for the LabLabAI Hackathon

## 🔗 Related Documentation

- [Main Project README](../README.md) - Complete setup guide
- [Backend API Documentation](../bobscribe-backend/README.md) - API endpoints and configuration