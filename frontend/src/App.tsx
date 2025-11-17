"use client";

import { useRef, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import EnergyMonitors from "./pages/EnergyMonitors";
import RaceResults from "./pages/RaceResults";
import EnergyData from "./pages/EnergyData";
import Header from "./components/Header";
import AddECUPage from "./pages/AddECU";
import AddTeamPage from "./pages/AddTeam";
import AddCompetitionPage from "./pages/CreateCompetition";
import Competitions from "./pages/Competitions";
import Events from "./pages/Events";
import CreateEventPage from "./pages/CreateEvent";
import AddTeamToEvent from "./pages/AddTeamToEvent";
import { useAtlasSync } from "./hooks/useAtlasSync";
import { useSyncOverlay } from "./contexts/SyncOverlayContext";
import BlockingOverlay from "./components/BlockingOverlay";
import { SyncFromAtlasDialog } from "./components/SyncFromAtlasDialog";
import Vehicles from "./pages/Vehicles";
import AddVehicle from "./pages/AddVehicle";
import AssignVehicle from "./pages/AssignVehicle";
import ConfigureECU from "./pages/ConfigureECU";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const { checkSyncStatus, pullFromAtlas } = useAtlasSync();
  const { isSyncing } = useSyncOverlay();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    const checkAndPromptSync = async () => {
      const status = await checkSyncStatus();
      if (status === "out-of-sync") {
        setShowSyncDialog(true);
      }
    };

    if (!hasSyncedRef.current) {
      checkAndPromptSync();
      hasSyncedRef.current = true;
    }
  }, [checkSyncStatus]);

  const handleConfirmSync = async () => {
    setShowSyncDialog(false);
    const success = await pullFromAtlas();
    if (success) {
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  };

  return (
    <Router>
      <div className="flex h-screen bg-black text-white font-sans relative">
        {isSyncing && <BlockingOverlay />}

        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-dark-500 to-dark-300">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/competitions" element={<Competitions />} />
              <Route path="/monitors" element={<EnergyMonitors />} />
              <Route path="/results" element={<RaceResults />} />
              <Route path="/energy-data" element={<EnergyData />} />
              <Route path="/events" element={<Events />} />
              <Route path="/add-ecu" element={<AddECUPage />} />
              <Route path="/add-team" element={<AddTeamPage />} />
              <Route path="/add-competition" element={<AddCompetitionPage />} />
              <Route path="/create-event" element={<CreateEventPage />} />
              <Route path="/add-team-to-event" element={<AddTeamToEvent />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/add-vehicle" element={<AddVehicle />} />
              <Route path="/assign-vehicle" element={<AssignVehicle />} />
              <Route path="/configure-ecu" element={<ConfigureECU />} />
            </Routes>
          </main>
        </div>
      </div>

      <SyncFromAtlasDialog
        open={showSyncDialog}
        onConfirm={handleConfirmSync}
        onCancel={() => setShowSyncDialog(false)}
      />
    </Router>
  );
}

export default App;
