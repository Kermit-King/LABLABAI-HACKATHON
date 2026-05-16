# BobScribe Architecture & Feature Planner

A sophisticated web application that transforms meeting transcripts and notes into highly structured, context-aware engineering instructions designed for IBM Bob autonomous codebase modification.

## 🚀 Features

- **Transcript Processing**: Paste raw meeting notes and extract engineering intent
- **System Blueprint**: Visual breakdown of technical tasks with risk assessment
- **GitHub Issues Generator**: Auto-generate structured issues with acceptance criteria
- **Bob Orchestrator Console**: Complete, ready-to-use prompts for IBM Bob
- **Interactive UI**: Check off tasks, copy file paths, and manage implementation order

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Dark mode first)
- **Icons**: Lucide React
- **State Management**: React Context API

## 📦 Installation

```bash
# Navigate to project directory
cd bobscribe-planner

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎨 Design Philosophy

- **Dark-mode first**: Sleek developer aesthetic with Slate/Zinc palette and Indigo accents
- **Density optimized**: No walls of text, prioritizes glanceability
- **Type-safe**: Full TypeScript coverage with explicit types
- **Modular**: Clean, reusable component architecture

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

## 🎯 Usage

1. **Input Transcript**: Paste meeting notes in the left panel
2. **Extract Intent**: Click "Extract Engineering Intent" button
3. **Review Blueprint**: Check system overview, affected files, and implementation order
4. **View Issues**: See generated GitHub issues with acceptance criteria
5. **Copy for Bob**: Get the complete prompt ready for IBM Bob

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ for the LabLabAI Hackathon