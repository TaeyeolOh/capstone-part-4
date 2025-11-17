import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, ChevronDown } from "lucide-react";
import {
  registerVehicleToTeam,
  getVehicleById,
} from "../services/vehicleService";
import { getAllTeams } from "../services/teamService";
import { Team } from "../types/team";
import { Vehicle } from "../types/vehicle";
import Spinner from "../components/Spinner";

interface LocationState {
  vehicleId?: string;
  vehicleType?: string;
  vehicleClass?: string;
}

const AssignVehicle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleId, vehicleType, vehicleClass } =
    (location.state as LocationState) || {};

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vehicle and teams data
  useEffect(() => {
    const fetchData = async () => {
      if (!vehicleId) {
        setFormError(
          "No vehicle selected. Please go back and select a vehicle."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch vehicle details
        const vehicleData = await getVehicleById(vehicleId);
        setVehicle(vehicleData);

        // Check if vehicle already has a team
        if (vehicleData.teamId) {
          setFormError("This vehicle is already assigned to a team.");
          setLoading(false);
          return;
        }

        // Fetch teams
        const teamsData = await getAllTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFormError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  // Handle team selection
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    setTeamDropdownOpen(false);
  };

  // Get selected team
  const getSelectedTeam = () => {
    return teams.find((team) => team.id === selectedTeamId);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleId || !selectedTeamId) {
      setFormError("Please select a team for this vehicle.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Register vehicle to team
      await registerVehicleToTeam(vehicleId, selectedTeamId);

      // Redirect to vehicles page
      navigate("/vehicles");
    } catch (error: any) {
      console.error("Error assigning vehicle to team:", error);

      // Extract specific error messages from response
      const errorResponse = error.response?.data;

      if (errorResponse?.error === "team_has_vehicle") {
        setFormError(
          "This team already has a vehicle assigned. Please select a different team."
        );
      } else if (errorResponse?.error === "vehicle_has_team") {
        setFormError("This vehicle is already assigned to a team.");
      } else if (
        errorResponse?.message &&
        errorResponse.message.includes("Team already has a vehicle registered")
      ) {
        setFormError(
          "This team already has a vehicle assigned. Please select a different team."
        );
      } else if (
        errorResponse?.message &&
        errorResponse.message.includes("Vehicle is already registered")
      ) {
        setFormError("This vehicle is already assigned to a team.");
      } else {
        // Fallback to a more detailed generic message
        setFormError(
          `Failed to assign vehicle to team: ${
            errorResponse?.message || error.message || "Unknown error"
          }`
        );
      }
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
        <p className="mb-4">Please go back and select a vehicle to assign.</p>
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
      {/* Header with back button */}
      <div className="flex items-center">
        <button
          onClick={() => navigate("/vehicles")}
          className="mr-4 p-2 bg-dark-200 rounded-full hover:bg-dark-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold tracking-tight">
          Assign Vehicle to Team
        </h2>
      </div>

      {/* Form error message */}
      {formError && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Vehicle Info Card */}
      <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
        <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-light-500 text-sm">Vehicle ID</p>
            <p className="font-mono">{vehicle?.id || vehicleId}</p>
          </div>
          <div>
            <p className="text-light-500 text-sm">Type</p>
            <p>{vehicle?.vehicleType || vehicleType || "Unknown"}</p>
          </div>
          <div>
            <p className="text-light-500 text-sm">Class</p>
            <p>{vehicle?.vehicleClass || vehicleClass || "Unknown"}</p>
          </div>
        </div>
      </div>

      {/* Team Selection */}
      <form
        onSubmit={handleSubmit}
        className="bg-dark-200 rounded-xl p-6 border border-dark-100"
      >
        <h3 className="text-lg font-medium mb-4">Select Team</h3>

        {teams.length === 0 ? (
          <div className="text-light-500 py-4">
            No teams available. Please create a team first.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-dark-300 border border-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light"
                onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
              >
                <span>
                  {getSelectedTeam()
                    ? `${getSelectedTeam()?.teamName} (${
                        getSelectedTeam()?.schoolName
                      })`
                    : "Select a team"}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    teamDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {teamDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-dark-200 border border-dark-100 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <ul className="py-1">
                    {teams.map((team) => (
                      <li key={team.id}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-dark-100 flex items-center justify-between"
                          onClick={() => handleTeamSelect(team.id || "")}
                        >
                          <div>
                            <div className="font-medium">{team.teamName}</div>
                            <div className="text-xs text-light-500">
                              {team.schoolName}
                            </div>
                          </div>
                          {selectedTeamId === team.id && <Check size={16} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {!selectedTeamId && (
              <p className="text-amber-500 text-xs">
                Please select a team to continue
              </p>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-dark-100 mt-6">
              <button
                type="button"
                onClick={() => navigate("/vehicles")}
                className="px-6 py-3 bg-dark-300 text-light-100 rounded-md hover:bg-dark-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedTeamId}
                className="px-6 py-3 bg-accent2-DEFAULT text-light-100 rounded-md hover:bg-accent2-light transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:hover:bg-accent2-DEFAULT"
              >
                {isSubmitting ? (
                  <div className="animate-spin h-5 w-5 border-2 border-light-100 border-t-transparent rounded-full"></div>
                ) : (
                  "Assign Vehicle"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AssignVehicle;
