import { cn } from "@/lib/utils";
import { useHistory, HistoryItem } from "@/hooks/useHistory";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Clock, Languages, Archive, Sparkles } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
  onHistoryLoad?: (item: HistoryItem | null) => void;
  onResetSession?: () => void;
  activeHistoryId?: string | null;
  historyHook?: ReturnType<typeof useHistory>;
}

export function Sidebar({ className, onHistoryLoad, onResetSession, activeHistoryId, historyHook }: SidebarProps) {
  // Use shared history hook or fallback to local one
  const localHistoryHook = useHistory();
  const { history, deleteHistoryItem, loadHistoryItem } = historyHook || localHistoryHook;
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  
  // Debug: Log when Sidebar re-renders with history changes
  console.log('Sidebar is re-rendering with history:', history);

  const handleItemClick = (id: string) => {
    const item = loadHistoryItem(id);
    if (item && onHistoryLoad) {
      onHistoryLoad(item);
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteHistoryItem(id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'A few minutes ago';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getLanguageDisplayName = (code: string) => {
    const languageMap: Record<string, string> = {
      'en-US': 'EN',
      'es-ES': 'ES', 
      'fr-FR': 'FR',
      'EN': 'EN',
      'ES': 'ES',
      'FR': 'FR'
    };
    return languageMap[code] || code;
  };

  console.log('DEBUG: Sidebar is rendering with history:', history);
  
  return (
    <div className={cn("bg-card/50 backdrop-blur-sm flex flex-col h-full", className)}>
      <div className="p-6 border-b border-border/50">
        {/* Logo/Brand - Clickeable para resetear */}
        <motion.button
          onClick={onResetSession}
          className="w-full text-left space-y-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h2 className="text-lg font-semibold text-foreground">VoicePal</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered speech processing
          </p>
        </motion.button>
        
        {/* Features */}
        <div className="mt-6 space-y-4">
          <div className="text-sm text-muted-foreground">
            Features:
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Speech to Text</li>
            <li>• Text to Speech</li>
            <li>• Real-time Translation</li>
            <li>• Multiple Languages</li>
          </ul>
        </div>
      </div>
      
      {/* History Section */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="space-y-4 h-full">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="w-4 h-4" />
            History ({history.length})
          </div>
          
          {/* History List */}
          <div className="space-y-2 overflow-y-auto flex-1">
            <AnimatePresence>
              {history.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-center py-12 px-4"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                    className="relative mb-6"
                  >
                    <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Archive className="w-8 h-8 text-primary/60" />
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-primary/10"
                      />
                    </div>
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="w-4 h-4 text-primary/40" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="space-y-3"
                  >
                    <h3 className="text-foreground font-medium">Your saved sessions will appear here</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Start by recording your voice or entering text,<br />
                      then use the <span className="font-medium text-primary">Save</span> button to preserve your sessions.
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    data-testid="history-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative p-3 rounded-lg border cursor-pointer transition-all group",
                      activeHistoryId === item.id
                        ? "bg-primary/10 border-primary/30 shadow-sm"
                        : "bg-card/80 border-border/50 hover:bg-muted/50 hover:border-border"
                    )}
                    onClick={() => handleItemClick(item.id)}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Delete Button */}
                    <AnimatePresence>
                      {hoveredItemId === item.id && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={(e) => handleDeleteItem(e, item.id)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors z-10"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                    
                    {/* Content */}
                    <div className="space-y-2 pr-8">
                      {/* Text Preview */}
                      <div className="text-sm text-foreground font-medium line-clamp-2">
                        {item.transcribedText.length > 50 
                          ? `${item.transcribedText.substring(0, 50)}...` 
                          : item.transcribedText
                        }
                      </div>
                      
                      {/* Translation Preview */}
                      {item.translatedText && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          <Languages className="w-3 h-3 inline mr-1" />
                          {item.translatedText.length > 40 
                            ? `${item.translatedText.substring(0, 40)}...` 
                            : item.translatedText
                          }
                        </div>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(item.createdAt)}</span>
                        <div className="flex items-center gap-1">
                          <span>{getLanguageDisplayName(item.sourceLang)}</span>
                          {item.translatedText && (
                            <>
                              <span>→</span>
                              <span>{getLanguageDisplayName(item.targetLang)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Active Indicator */}
                    {activeHistoryId === item.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}