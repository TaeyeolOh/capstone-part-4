import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, ArrowLeft, Info } from "lucide-react";
import { getVehicleById } from "../services/vehicleService";
import { Vehicle } from "../types/vehicle";
import Spinner from "../components/Spinner";
import { setECUForVehicle } from "../services/vehicleService";
import { getECUs } from "../services/ecuService";
import { ECU } from "../types/ecu";

interface LocationState {
  vehicleId?: string;
}

const ConfigureECU = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleId } = (location.state as LocationState) || {};

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [ecuSerialNumber, setEcuSerialNumber] = useState("");
  const [connectionType, setConnectionType] = useState("Bluetooth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const [ecus, setECUs] = useState<ECU[]>([]);


  const fetchECUs = async () => {
    try {
      const ecuList = await getECUs();
      const filteredECUs = ecuList.filter(ecu => !ecu.vehicleId);
      console.log("Fetched ECUs:", filteredECUs);
      setECUs(filteredECUs);
    } catch (err) {
      console.error("Error fetching ECUs:", err);
      setError("Failed to load ECUs. Please try again.");
    }
  };

  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setError("No vehicle selected. Please go back and select a vehicle.");
        setLoading(false);
        return;
      }

      try {
        const vehicleData = await getVehicleById(vehicleId);
        setVehicle(vehicleData);

        // Check if vehicle already has an ECU
        if (vehicleData.ecuId) {
          setError("This vehicle already has an ECU configured.");
        }
        // Fetch available ECUs
        await fetchECUs();
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        setError("Failed to load vehicle data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  const handleConfigureECU = async () => {
    setIsSubmitting(true);
    try {
      if (!vehicleId) {
        setError("No vehicle selected. Please go back and select a vehicle.");
        return;
      }
      setECUForVehicle(vehicleId, ecuSerialNumber);
      console.log("ECU configured successfully");
      setIsConfigured(true);
      alert(`ECU ${ecuSerialNumber} configured via ${connectionType}`);
      navigate("/vehicles");
    } catch (err) {
      setError("Failed to configure ECU. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!vehicleId) {
    return (
      <div className="bg-red-900/30 border border-red-800 text-red-400 px-6 py-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">No Vehicle Selected</h3>
        <p className="mb-4">
          Please go back and select a vehicle to configure an ECU.
        </p>
        <button
          onClick={() => navigate("/vehicles")}
          className="px-4 py-2 bg-dark-300 rounded-md hover:bg-dark-100 transition-colors"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate("/vehicles")}
          className="mr-4 p-2 bg-dark-200 rounded-full hover:bg-dark-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold tracking-tight">Configure ECU</h2>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Vehicle Info */}
      {vehicle && (
        <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
          <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-light-500 text-sm">Vehicle ID</p>
              <p className="font-mono">{vehicle.id}</p>
            </div>
            <div>
              <p className="text-light-500 text-sm">Type</p>
              <p>{vehicle.vehicleType}</p>
            </div>
            <div>
              <p className="text-light-500 text-sm">Class</p>
              <p>{vehicle.vehicleClass}</p>
            </div>
          </div>
        </div>
      )}

      {/* ECU Configuration */}
      <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
        <div className="flex items-start space-x-4 bg-blue-900/20 border border-blue-800 text-blue-300 p-4 rounded-md mb-6">
          <Info className="flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium mb-1">ECU Configuration</p>
            <p>
              Configure an Energy Control Unit (ECU) to monitor this vehicle’s energy usage during races.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-light-300 mb-1">
            Select ECU
          </label>
          <select
            value={ecuSerialNumber}
            onChange={(e) => setEcuSerialNumber(e.target.value)}
            className="w-full px-4 py-3 bg-dark-300 border border-dark-100 rounded-md"
          >
            <option value=""> Select an ECU </option>
            {ecus.map(ecu => (
              <option key={ecu.id} value={ecu.serialNumber}>
                {ecu.serialNumber}
              </option>
            ))}
          </select>
          {ecus.length === 0 && (
            <p className="text-red-400 mt-2">No available ECUs to assign.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-light-300 mb-1">
            Connection Type
          </label>
          <select
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value)}
            className="w-full px-4 py-3 bg-dark-300 border border-dark-100 rounded-md"
          >
            <option>Wi-Fi</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-dark-100 mt-6">
          <button
            type="button"
            onClick={() => navigate("/vehicles")}
            className="px-6 py-3 bg-dark-300 text-light-100 rounded-md hover:bg-dark-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ecuSerialNumber || isSubmitting}
            onClick={handleConfigureECU}
            className={`px-6 py-3 rounded-md text-light-100 transition-colors ${!ecuSerialNumber || isSubmitting
                ? "bg-accent2-DEFAULT/50 cursor-not-allowed"
                : "bg-accent2-DEFAULT hover:bg-accent2-hover"
              }`}
          >
            {isSubmitting ? "Configuring..." : "Configure ECU"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigureECU;
