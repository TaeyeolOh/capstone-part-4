import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, ChevronDown } from "lucide-react";
import {
  createVehicle,
  registerVehicleToTeam,
} from "../services/vehicleService";
import { getAllTeams } from "../services/teamService";
import { Team } from "../types/team";
import Spinner from "../components/Spinner";

const AddVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdowns state
  const [vehicleClassOpen, setVehicleClassOpen] = useState(false);
  const [vehicleTypeOpen, setVehicleTypeOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    vehicleType: "Bike",
    vehicleClass: "Standard",
    teamId: "",
    assignToTeam: false,
  });

  // Vehicle Class options
  const vehicleClassOptions = [
    { value: "Standard", label: "Standard" },
    { value: "Open", label: "Open" },
  ];

  // Vehicle Type options
  const vehicleTypeOptions = [
    { value: "Bike", label: "Bike" },
    { value: "Kart", label: "Kart" },
  ];

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const teamsData = await getAllTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setFormError(
        "Failed to load teams. You may not be able to assign this vehicle to a team."
      );
    } finally {
      setLoadingTeams(false);
    }
  };

  // Handle selection for dropdowns
  const handleSelect = (
    field: "vehicleClass" | "vehicleType",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "vehicleClass") {
      setVehicleClassOpen(false);
    } else if (field === "vehicleType") {
      setVehicleTypeOpen(false);
    }
  };

  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    setFormData((prev) => ({
      ...prev,
      teamId: team.id || "",
      assignToTeam: true,
    }));
    setTeamDropdownOpen(false);
  };

  // Handle toggle for assign to team
  const handleAssignToggle = () => {
    setFormData((prev) => ({
      ...prev,
      assignToTeam: !prev.assignToTeam,
      teamId: !prev.assignToTeam ? prev.teamId : "", // Clear team if toggling off
    }));
  };

  // Get selected team
  const getSelectedTeam = () => {
    return teams.find((team) => team.id === formData.teamId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setFormError("");

    try {
      console.log("Creating vehicle with data:", {
        vehicleType: formData.vehicleType,
        vehicleClass: formData.vehicleClass,
      });

      // First create the vehicle
      const newVehicle = await createVehicle({
        vehicleType: formData.vehicleType,
        vehicleClass: formData.vehicleClass,
      });

      console.log("Vehicle created successfully:", newVehicle);

      // Check if the vehicle has an ID
      if (!newVehicle.id) {
        throw new Error("Created vehicle has no ID");
      }

      // If user wants to assign it to a team
      if (formData.assignToTeam && formData.teamId) {
        console.log(
          `Registering vehicle ${newVehicle.id} to team ${formData.teamId}`
        );

        try {
          await registerVehicleToTeam(newVehicle.id, formData.teamId);
          console.log("Vehicle registered to team successfully");
        } catch (teamError: any) {
          console.error("Error registering vehicle to team:", teamError);

          // Display a more specific error message
          setFormError(
            `Vehicle created but could not be assigned to team: ${
              teamError.response?.data?.message || teamError.message
            }`
          );

          // We don't redirect here so the user can see the error
          setIsSubmitting(false);
          return;
        }
      }

      // Redirect to vehicles page
      navigate("/vehicles");
    } catch (error: any) {
      console.error("Error in form submission:", error);
      setFormError(
        `Failed to create vehicle: ${
          error.response?.data?.message || error.message
        }`
      );
      setIsSubmitting(false);
    }
  };

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
        <h2 className="text-3xl font-bold tracking-tight">Add New Vehicle</h2>
      </div>

      {/* Form */}
      <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form error message */}
          {formError && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-light-300">
                Vehicle Type
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 bg-dark-300 border border-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light"
                  onClick={() => setVehicleTypeOpen(!vehicleTypeOpen)}
                >
                  <span>{formData.vehicleType}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      vehicleTypeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {vehicleTypeOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-dark-200 border border-dark-100 rounded-md shadow-lg">
                    <ul className="py-1">
                      {vehicleTypeOptions.map((option) => (
                        <li key={option.value}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-dark-100 flex items-center justify-between"
                            onClick={() =>
                              handleSelect("vehicleType", option.value)
                            }
                          >
                            {option.label}
                            {formData.vehicleType === option.value && (
                              <Check size={16} />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <p className="text-xs text-light-500 mt-1">
                Choose between Bike or Kart vehicle types
              </p>
            </div>

            {/* Vehicle Class */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-light-300">
                Vehicle Class
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 bg-dark-300 border border-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light"
                  onClick={() => setVehicleClassOpen(!vehicleClassOpen)}
                >
                  <span>{formData.vehicleClass}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      vehicleClassOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {vehicleClassOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-dark-200 border border-dark-100 rounded-md shadow-lg">
                    <ul className="py-1">
                      {vehicleClassOptions.map((option) => (
                        <li key={option.value}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-dark-100 flex items-center justify-between"
                            onClick={() =>
                              handleSelect("vehicleClass", option.value)
                            }
                          >
                            {option.label}
                            {formData.vehicleClass === option.value && (
                              <Check size={16} />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <p className="text-xs text-light-500 mt-1">
                Standard (350W) or Open (2kW) class
              </p>
            </div>
          </div>

          {/* Assign to Team Section */}
          <div className="border-t border-dark-100 pt-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="assignToTeam"
                checked={formData.assignToTeam}
                onChange={handleAssignToggle}
                className="rounded border-dark-100 text-accent2-DEFAULT focus:ring-accent2-light mr-3"
              />
              <label htmlFor="assignToTeam" className="text-sm font-medium">
                Assign to a Team
              </label>
            </div>

            {formData.assignToTeam && (
              <div className="mt-4">
                {loadingTeams ? (
                  <div className="flex items-center space-x-2 text-light-500">
                    <Spinner size="sm" />
                    <span>Loading teams...</span>
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-light-500">
                    No teams available. Please create a team first.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-light-300">
                      Select Team
                    </label>
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
                                  onClick={() => handleTeamSelect(team)}
                                >
                                  <div>
                                    <div className="font-medium">
                                      {team.teamName}
                                    </div>
                                    <div className="text-xs text-light-500">
                                      {team.schoolName}
                                    </div>
                                  </div>
                                  {formData.teamId === team.id && (
                                    <Check size={16} />
                                  )}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {formData.assignToTeam && !formData.teamId && (
                      <p className="text-amber-500 text-xs mt-1">
                        Please select a team to continue
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-dark-100">
            <Link to="/vehicles">
              <button
                type="button"
                className="px-6 py-3 bg-dark-300 text-light-100 rounded-md hover:bg-dark-100 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={
                isSubmitting || (formData.assignToTeam && !formData.teamId)
              }
              className="px-6 py-3 bg-accent2-DEFAULT text-light-100 rounded-md hover:bg-accent2-light transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:hover:bg-accent2-DEFAULT"
            >
              {isSubmitting ? (
                <div className="animate-spin h-5 w-5 border-2 border-light-100 border-t-transparent rounded-full"></div>
              ) : (
                "Create Vehicle"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
