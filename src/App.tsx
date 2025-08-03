import { Sidebar } from "./components/layout/Sidebar";
import { MainContent } from "./components/layout/MainContent";

// This tells TypeScript that the `window` object might have a `__TAURI__` property.
declare global {
  interface Window {
    __TAURI__?: object;
  }
}

function App() {
  // This line checks if the app is running in the Tauri desktop environment.
  const isTauri = window.__TAURI__ !== undefined;

  return (
    <div className="h-screen bg-background flex">
      {/* Main app layout */}
      <Sidebar />
      <MainContent />

      {/* Debug Label */}
      <div className="fixed bottom-2 left-2 z-50 rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
        Environment: {isTauri ? 'Desktop (Tauri)' : 'Web Browser'}
      </div>
    </div>
  );
}

export default App;
