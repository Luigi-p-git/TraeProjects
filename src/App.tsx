import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { HistoryItem, useHistory } from "@/hooks/useHistory";
import { ThemeProvider } from "@/components/theme-provider";
import { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const mainContentRef = useRef<any>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Lift history state up to App level
  const historyHook = useHistory();

  // Auto-hide logic
  useEffect(() => {
    if (isHovering) {
      // Clear any existing timeout when hovering
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setSidebarVisible(true);
    } else {
      // Start 3-second countdown when not hovering
      if (sidebarVisible) {
        hideTimeoutRef.current = setTimeout(() => {
          setSidebarVisible(false);
        }, 3000);
      }
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isHovering, sidebarVisible]);

  const handleSidebarMouseEnter = () => {
    setIsHovering(true);
  };

  const handleSidebarMouseLeave = () => {
    setIsHovering(false);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    if (!sidebarVisible) {
      setIsHovering(true);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex h-screen relative">
          {/* Hamburger Menu Button */}
          <motion.button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-muted/50 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              left: sidebarVisible ? "272px" : "16px"
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </motion.button>

          {/* Animated Sidebar */}
          <AnimatePresence>
            {sidebarVisible && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed left-0 top-0 h-full z-40"
                onMouseEnter={handleSidebarMouseEnter}
                onMouseLeave={handleSidebarMouseLeave}
              >
                <Sidebar 
                  className="w-64 h-full border-r border-border/50 shadow-xl" 
                  onHistoryLoad={handleHistoryLoad}
                  onResetSession={handleResetSession}
                  activeHistoryId={activeHistoryId}
                  historyHook={historyHook}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <MainContent 
            ref={mainContentRef}
            className="flex-1 transition-all duration-300" 
            onHistoryLoad={handleHistoryLoad}
            activeHistoryId={activeHistoryId}
            historyHook={historyHook}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
