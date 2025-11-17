import { useCallback, useEffect, useRef, useState } from "react";
import { useNotification } from "./useNotification";

// Define possible upload states
type UploadStatus = "pending" | "success" | "failed" | null;
// LocalStorage key used to persist upload state across refreshes or offline periods
const STORAGE_KEY = "atlasUploadStatus";

/**
 * This custom React hook manages offline-safe upload functionality.
 * When the user tries to upload while offline, it queues the upload
 * and automatically retries once the internet connection is restored.
 *
 * @param uploadFn - The actual function that performs the upload (e.g., to Atlas)
 */
export function useUploadQueue(uploadFn: () => Promise<boolean>) {
  const [status, setStatus] = useState<UploadStatus>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const hasRetried = useRef(false);
  const { showInfo } = useNotification();

  // On initial load, restore upload status and timestamp from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { status, timestamp } = JSON.parse(stored);
      setStatus(status);
      setTimestamp(timestamp);
    }
  }, []);

  // Handle reconnection logic — retry upload automatically when device comes back online
  useEffect(() => {
    const handleOnline = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && !hasRetried.current) {
        const { status } = JSON.parse(stored);
        // If an upload was pending, retry it
        if (status === "pending") {
          hasRetried.current = true;
          // Attempt the upload
          const result = await uploadFn();
          const newStatus = result ? "success" : "failed";
          const time = Date.now();
          // Save new status and timestamp
          setStatus(newStatus);
          setTimestamp(time);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: newStatus, timestamp: time }));
        }
      }
    };

    // Register listener to detect when the browser regains connectivity
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [uploadFn]);

    /**
   * Function to trigger an upload manually.
   * If offline, queue the upload and notify the user.
   * If online, run the upload immediately.
   */
  const triggerUpload = useCallback(async () => {
    const time = Date.now();

    // If offline, queue upload for retry and show user feedback
    if (!navigator.onLine) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "pending", timestamp: time }));
      setStatus("pending");
      setTimestamp(time);
      hasRetried.current = false;
      showInfo("You're offline. Upload has been queued and will be retried automatically.");
      return false;
    }

    // Otherwise, attempt upload immediately
    const result = await uploadFn();
    const newStatus = result ? "success" : "failed";
    // Save result and timestamp
    setStatus(newStatus);
    setTimestamp(time);
    hasRetried.current = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: newStatus, timestamp: time }));
    return result;
  }, [uploadFn]);

  // Return current upload state and method to trigger an upload
  return {
    status,
    timestamp,
    triggerUpload,
  };
}