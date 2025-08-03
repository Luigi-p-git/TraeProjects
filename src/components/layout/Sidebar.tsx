import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn(
      "w-64 h-full bg-muted/30 border-r border-border flex flex-col",
      className
    )}>
      {/* Logo/Title Section */}
      <div className="p-6 border-b border-border/50">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          VoicePal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Speech-to-Text
        </p>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
            Navigation
          </div>
          <div className="space-y-1">
            <div className="px-3 py-2 text-sm text-foreground bg-accent/50 rounded-md border border-border/30">
              Transcription
            </div>
            <div className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 rounded-md transition-colors cursor-pointer">
              History
            </div>
            <div className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 rounded-md transition-colors cursor-pointer">
              Settings
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground">
          v1.0.0
        </div>
      </div>
    </div>
  );
}