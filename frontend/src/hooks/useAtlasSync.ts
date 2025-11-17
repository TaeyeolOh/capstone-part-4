import { useNotification } from "./useNotification";
import { useSyncOverlay } from "../contexts/SyncOverlayContext";
import {
  uploadToAtlas as uploadAPI,
  pullFromAtlas as pullAPI,
  checkSyncStatus as checkAPI,
} from "../services/atlasService";

export function useAtlasSync() {
  const { showSuccess, showError, showInfo } = useNotification();
  const { setIsSyncing } = useSyncOverlay();

  const checkSyncStatus = async (): Promise<"in-sync" | "out-of-sync" | "sync-unknown"> => {
    if (!navigator.onLine) {
      showError("Cannot check sync status. Please connect to the internet.");
      return "sync-unknown";
    }
    
    try {
      const status = await checkAPI();
      if (status === "in-sync" || status === "out-of-sync" || status === "sync-unknown") {
        return status;
      }
      return "sync-unknown";
    } catch (err) {
      showError("Failed to check sync status. Please try again.");
      return "sync-unknown";
    }
  };

  const pullFromAtlas = async () => {
    if (!navigator.onLine) {
      showError("Cannot sync from Atlas. Please connect to the internet.");
      return false;
    }

    try {
      setIsSyncing(true, "Syncing with Atlas");
      await pullAPI();
      showSuccess("Pulled latest data from Atlas.");
      return true;
    } catch (err) {
      showError("Failed to pull from Atlas. Please try again later.");
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const uploadToAtlas = async () => {
    if (!navigator.onLine) {
      showError("Cannot Upload to Atlas. Connect to the internet and try again.");
      return false;
    }

    try {
      setIsSyncing(true, "Uploading to Atlas...");
      const message = await uploadAPI();

      if (message.includes("DB are already in sync")) {
        showInfo("Nothing to Upload. Local DB already Synced");
      } else if (message.includes("successful")) {
        showSuccess("Upload to Atlas completed successfully.");
      }

      return true;
    } catch (err) {
      showError("Upload to Atlas failed.");
      return false;
    } finally {
      setIsSyncing(false);
    }
  };


  return {
    checkSyncStatus,
    uploadToAtlas,
    pullFromAtlas,
  };
}
