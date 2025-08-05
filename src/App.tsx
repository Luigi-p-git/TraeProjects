import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { HistoryItem, useHistory } from "@/hooks/useHistory";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

function App() {
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const mainContentRef = useRef<any>(null);
  
  // Lift history state up to App level
  const historyHook = useHistory();

  const handleHistoryLoad = (item: HistoryItem | null) => {
    if (item) {
      setActiveHistoryId(item.id);
      // Aquí podrías emitir un evento personalizado o usar una ref para comunicarte con MainContent
      // Por ahora, MainContent manejará la carga a través de props
      if (mainContentRef.current) {
        mainContentRef.current.loadHistoryItem(item);
      }
    } else {
      setActiveHistoryId(null);
    }
  };

  const handleResetSession = () => {
    setActiveHistoryId(null);
    if (mainContentRef.current) {
      mainContentRef.current.resetSession();
    }
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <div className="min-h-screen relative overflow-hidden">
          {/* Aurora Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 aurora-1" />
            <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/8 via-indigo-500/8 to-violet-500/8 aurora-2" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/6 via-teal-500/6 to-sky-500/6 aurora-3" />
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/4 via-orange-500/4 to-yellow-500/4 aurora-1" style={{ animationDelay: '10s' }} />
          </div>
          
          {/* Header with Theme Toggle */}
          <header className="relative z-10 flex justify-end p-4">
            <ThemeToggle />
          </header>
          
          {/* Main Content */}
          <div className="relative z-10 flex h-[calc(100vh-80px)]">
            <Sidebar 
              className="w-64 border-r border-border/50 bg-background/80 backdrop-blur-sm" 
              onHistoryLoad={handleHistoryLoad}
              onResetSession={handleResetSession}
              activeHistoryId={activeHistoryId}
              historyHook={historyHook}
            />
            <MainContent 
              ref={mainContentRef}
              className="flex-1 bg-background/80 backdrop-blur-sm" 
              onHistoryLoad={handleHistoryLoad}
              activeHistoryId={activeHistoryId}
              historyHook={historyHook}
            />
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
