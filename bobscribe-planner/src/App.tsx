import React from 'react';
import { Code2 } from 'lucide-react';
import { ProjectPlannerProvider } from './context/ProjectPlannerContext';
import { ToastProvider } from './components/ui/Toast';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';

function App() {
  return (
    <ToastProvider>
      <ProjectPlannerProvider>
        <div className="min-h-screen bg-background text-foreground">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">BobScribe Architecture & Feature Planner</h1>
                  <p className="text-sm text-muted-foreground">
                    Transform meeting notes into structured engineering instructions for IBM Bob
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
              {/* Left Panel */}
              <div className="h-full">
                <LeftPanel />
              </div>

              {/* Right Panel */}
              <div className="h-full">
                <RightPanel />
              </div>
            </div>
          </main>
        </div>
      </ProjectPlannerProvider>
    </ToastProvider>
  );
}

export default App;

// Made with Bob
