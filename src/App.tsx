import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { HistoryItem, useHistory } from "@/hooks/useHistory";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex h-screen">
        <Sidebar 
          className="w-64 border-r border-border/50" 
          onHistoryLoad={handleHistoryLoad}
          onResetSession={handleResetSession}
          activeHistoryId={activeHistoryId}
          historyHook={historyHook}
        />
        <MainContent 
          ref={mainContentRef}
          className="flex-1" 
          onHistoryLoad={handleHistoryLoad}
          activeHistoryId={activeHistoryId}
          historyHook={historyHook}
        />
      </div>
    </div>
  );
}

export default App;
