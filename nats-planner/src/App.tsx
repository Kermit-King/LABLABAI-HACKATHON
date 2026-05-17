import { Code2 } from 'lucide-react';
import { ProjectPlannerProvider } from './context/ProjectPlannerContext';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider, ThemeToggle } from './components/ui/ThemeToggle';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';

const AppContent = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur h-14 lg:h-16">
        <div className="flex items-center justify-between px-4 lg:px-8 h-full">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <Code2 className="h-4 w-4 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-semibold">N.A.T.S.</h1>
              <p className="hidden lg:block text-sm text-muted-foreground">
                Notes-to-Action Task Synthesizer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[380px_1fr]">
          {/* Left Panel */}
          <div className="w-full lg:sticky lg:top-24 lg:self-start">
            <LeftPanel />
          </div>

          {/* Right Panel */}
          <div className="w-full lg:sticky lg:top-24 lg:self-start">
            <RightPanel />
          </div>
        </div>
      </main>
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
