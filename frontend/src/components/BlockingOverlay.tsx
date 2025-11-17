import { useSyncOverlay } from "../contexts/SyncOverlayContext";

export default function BlockingOverlay() {
  const { syncMessage } = useSyncOverlay();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="text-center animate-pulse p-6 rounded-xl bg-dark-300 shadow-xl">
        <p className="text-xl font-semibold mb-2">{syncMessage}</p>
        <div className="h-6 w-6 border-4 border-accent2-DEFAULT border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
