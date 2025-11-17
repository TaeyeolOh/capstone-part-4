import { createContext, useContext, useState, ReactNode } from "react";

interface SyncOverlayContextProps {
    isSyncing: boolean;
    syncMessage: string;
    setIsSyncing: (value: boolean, message?: string) => void;
  }
  
  const SyncOverlayContext = createContext<SyncOverlayContextProps | undefined>(undefined);
  
  export const SyncOverlayProvider = ({ children }: { children: ReactNode }) => {
    const [isSyncing, _setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState("Syncing...");
  
    const setIsSyncing = (value: boolean, message = "Syncing...") => {
      _setIsSyncing(value);
      setSyncMessage(message);
    };
  
    return (
      <SyncOverlayContext.Provider value={{ isSyncing, syncMessage, setIsSyncing }}>
        {children}
      </SyncOverlayContext.Provider>
    );
  };
  

export const useSyncOverlay = () => {
  const context = useContext(SyncOverlayContext);
  if (!context) throw new Error("useSyncOverlay must be used within SyncOverlayProvider");
  return context;
};
