# NATS Architecture & Feature Planner

Notes-to-Action Task Synthesizer - A sophisticated web application that transforms meeting transcripts and notes into highly structured, context-aware engineering instructions designed for IBM Bob autonomous codebase modification.

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
- **Build Tool**: Vite 6.4.2
- **Styling**: Tailwind CSS 3.3.6 (Dark mode first)
- **UI Components**: shadcn/ui (New York style)
- **Component Library**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context API
- **Syntax Highlighting**: React Syntax Highlighter
- **Utilities**: clsx, tailwind-merge, class-variance-authority

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- **Backend API running** on `http://localhost:3001` (see [nats-backend](../nats-backend/README.md))

## 🛠️ Installation & Setup

### Step 1: Install Dependencies
```bash
cd nats-planner
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
nats-planner/
├── src/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── badge.tsx            # Badge component
│   │   │   ├── button.tsx           # Button component
│   │   │   ├── card.tsx             # Card component
│   │   │   ├── dialog.tsx           # Dialog component
│   │   │   ├── scroll-area.tsx      # Scroll area component
│   │   │   ├── separator.tsx        # Separator component
│   │   │   ├── skeleton.tsx         # Skeleton loader
│   │   │   ├── tabs.tsx             # Tabs component
│   │   │   ├── textarea.tsx         # Textarea component
│   │   │   ├── tooltip.tsx          # Tooltip component
│   │   │   ├── ThemeToggle.tsx      # Theme toggle component
│   │   │   └── Toast.tsx            # Toast notification
│   │   ├── BobConsole.tsx           # Bob prompt generator
│   │   ├── ChatMessage.tsx          # Chat message component
│   │   ├── ChatTab.tsx              # Chat tab interface
│   │   ├── GithubIssuesView.tsx     # GitHub issues display
│   │   ├── LeftPanel.tsx            # Transcript input area
│   │   ├── RightPanel.tsx           # Tabbed workspace
│   │   └── SystemBlueprint.tsx      # Technical task breakdown
│   ├── context/
│   │   └── ProjectPlannerContext.tsx # Global state management
│   ├── data/
│   │   └── mockData.ts              # Sample data
│   ├── lib/
│   │   └── utils.ts                 # Utility functions (cn, colors, markdown)
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Application entry point
│   ├── index.css                    # Global styles + Tailwind
│   └── vite-env.d.ts                # Vite type definitions
├── .eslintrc.cjs                    # ESLint configuration
├── .gitignore                       # Git ignore rules
├── components.json                  # shadcn/ui configuration
├── HANDOFF.md                       # Project handoff documentation
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Locked dependency versions
├── postcss.config.js                # PostCSS configuration
├── README.md                        # This file
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.node.json               # TypeScript config for Node
└── vite.config.ts                   # Vite build configuration
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

### UI Components (shadcn/ui)
All UI components follow the shadcn/ui pattern with Radix UI primitives:
- **button.tsx** - Button with variants (default, destructive, outline, secondary, ghost, link)
- **card.tsx** - Card container with header, title, description, content, footer
- **badge.tsx** - Badge with variants (default, secondary, destructive, outline)
- **tabs.tsx** - Tabs with Radix UI (Tabs, TabsList, TabsTrigger, TabsContent)
- **dialog.tsx** - Modal dialog component
- **scroll-area.tsx** - Custom scrollable area
- **separator.tsx** - Visual separator
- **skeleton.tsx** - Loading skeleton
- **textarea.tsx** - Textarea input
- **tooltip.tsx** - Tooltip component
- **ThemeToggle.tsx** - Dark/light mode toggle
- **Toast.tsx** - Toast notification system

### Feature Components
- **LeftPanel.tsx** - Transcript input and GitHub integration
- **RightPanel.tsx** - Tabbed workspace (Blueprint, Issues, Bob Console, Chat)
- **SystemBlueprint.tsx** - Technical task breakdown with risk assessment
- **GithubIssuesView.tsx** - GitHub issues display and management
- **BobConsole.tsx** - IBM Bob prompt generator
- **ChatTab.tsx** - AI chatbot interface
- **ChatMessage.tsx** - Chat message with syntax highlighting

### State Management
- **ProjectPlannerContext.tsx** - Global state using React Context API

### Utilities
- **utils.ts** - Helper functions (cn, color utilities, markdown export)
- **types/index.ts** - TypeScript interfaces and types

## 🎨 Styling & Design System

### shadcn/ui Configuration
The project uses shadcn/ui components with the following configuration:
- **Style**: New York (modern, clean aesthetic)
- **Base Color**: Slate
- **CSS Variables**: Enabled for theme customization
- **Path Aliases**: `@/` prefix for clean imports

### Tailwind CSS
- **Version**: 3.3.6
- **Utility-first**: CSS framework
- **Dark Mode**: Default theme with toggle support
- **Color Palette**: Slate/Zinc base with Indigo accents
- **Responsive**: Mobile-first design approach

### Component Variants
Components use `class-variance-authority` for type-safe variant management:
- Buttons: default, destructive, outline, secondary, ghost, link
- Badges: default, secondary, destructive, outline
- Consistent sizing: sm, default, lg, icon

### Adding New Components
To add more shadcn/ui components:
```bash
npx shadcn-ui@latest add [component-name]
```
The CLI will use `components.json` to configure the component correctly.

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ for the LabLabAI Hackathon

## 🔗 Related Documentation

- [Main Project README](../README.md) - Complete setup guide
- [Backend API Documentation](../nats-backend/README.md) - API endpoints and configuration