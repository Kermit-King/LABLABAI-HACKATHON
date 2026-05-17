import { Code2, MessageCircle } from 'lucide-react';
import { ProjectPlannerProvider, useProjectPlanner } from './context/ProjectPlannerContext';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider, ThemeToggle } from './components/ui/ThemeToggle';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { Chatbot, ChatPanel } from './components/Chatbot';
import { Button } from './components/ui/Button';

const AppContent = () => {
  const { isChatPanelOpen, setIsChatPanelOpen } = useProjectPlanner();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-3">
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
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isChatPanelOpen ? 'Hide Chat' : 'Show Chat'}
                </span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 lg:px-8">
        <div className={`flex flex-col gap-6 ${
          isChatPanelOpen
            ? 'lg:grid lg:grid-cols-[380px_1fr_360px]'
            : 'lg:grid lg:grid-cols-[380px_1fr]'
        }`}>
          {/* Left Panel */}
          <div className="w-full lg:sticky lg:top-24 lg:self-start">
            <LeftPanel />
          </div>

          {/* Right Panel */}
          <div className="w-full lg:sticky lg:top-24 lg:self-start">
            <RightPanel />
          </div>

          {/* Chat Panel (conditionally rendered) */}
          {isChatPanelOpen && (
            <div className="w-full lg:sticky lg:top-24 lg:self-start max-h-[calc(100vh-8rem)]">
              <ChatPanel />
            </div>
          )}
        </div>
      </main>

      {/* Floating Chatbot (for popout mode and floating button) */}
      <Chatbot />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ProjectPlannerProvider>
          <AppContent />
        </ProjectPlannerProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
