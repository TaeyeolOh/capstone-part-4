import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Cpu,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Vehicle } from "../types/vehicle";
import { Team } from "../types/team";
import { getAllVehicles } from "../services/vehicleService";
import { getTeamById } from "../services/teamService";
import Spinner from "../components/Spinner";
import useClickOutside from "../hooks/useClickOutside";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [teamsById, setTeamsById] = useState<Record<string, Team>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    vehicleClass: [] as string[],
    vehicleType: [] as string[],
    hasTeam: false,
    hasEcu: false,
  });

  const navigate = useNavigate();
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useClickOutside(filterRef, () => {
    if (filterOpen) setFilterOpen(false);
  });

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllVehicles();
      console.log("Vehicles data:", data);
      setVehicles(data);

      // Fetch teams for each vehicle that has a teamId
      const teamIds = [
        ...new Set(data.filter((v) => v.teamId).map((v) => v.teamId)),
      ];
      const teamsMap: Record<string, Team> = {};

      for (const teamId of teamIds) {
        if (teamId) {
          try {
            const team = await getTeamById(teamId);
            teamsMap[teamId] = team;
          } catch (teamErr) {
            console.error(`Error fetching team ${teamId}:`, teamErr);
          }
        }
      }

      setTeamsById(teamsMap);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  // Handle add vehicle button click
  const handleAddVehicle = () => {
    navigate("/add-vehicle");
  };

  // Handle filter toggle
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  // Handle filter change for checkboxes
  const handleFilterChange = (
    category: "vehicleClass" | "vehicleType",
    value: string
  ) => {
    setFilters((prev) => {
      const currentFilters = [...prev[category]];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [category]: currentFilters.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [category]: [...currentFilters, value],
        };
      }
    });
  };

  // Handle boolean filter change
  const handleBooleanFilterChange = (key: "hasTeam" | "hasEcu") => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle clear filters
  const clearFilters = () => {
    setFilters({
      vehicleClass: [],
      vehicleType: [],
      hasTeam: false,
      hasEcu: false,
    });
  };

  // Get team name for a vehicle
  const getTeamName = (vehicle: Vehicle) => {
    if (!vehicle.teamId) return "Not assigned";
    const team = teamsById[vehicle.teamId];
    return team ? team.teamName : "Unknown team";
  };

  // Filter vehicles based on search term and filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Search filter - search by ID, type, class, or team name
    const teamName = vehicle.teamId
      ? teamsById[vehicle.teamId]?.teamName || ""
      : "";
    const matchesSearch =
      (vehicle.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.vehicleType || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (vehicle.vehicleClass || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      teamName.toLowerCase().includes(searchTerm.toLowerCase());

    // Vehicle class filter
    const matchesClass =
      filters.vehicleClass.length === 0 ||
      (vehicle.vehicleClass &&
        filters.vehicleClass.includes(vehicle.vehicleClass));

    // Vehicle type filter
    const matchesType =
      filters.vehicleType.length === 0 ||
      (vehicle.vehicleType &&
        filters.vehicleType.includes(vehicle.vehicleType));

    // Team filter
    const matchesTeam = !filters.hasTeam || !!vehicle.teamId;

    // ECU filter
    const matchesEcu = !filters.hasEcu || !!vehicle.ecuId;

    return (
      matchesSearch && matchesClass && matchesType && matchesTeam && matchesEcu
    );
  });

  // Get class color for vehicle class
  const getClassColor = (className: string) => {
    if (className === "Standard") {
      return "bg-accent2-DEFAULT/20 text-accent2-light border border-accent2-DEFAULT/40";
    } else if (className === "Open") {
      return "bg-accent1-DEFAULT/20 text-accent1-light border border-accent1-DEFAULT/40";
    }
    // Default
    return "bg-gray-500/20 text-gray-300 border border-gray-500/40";
  };

  // Get type color for vehicle type
  const getTypeColor = (typeName: string) => {
    if (typeName === "Bike") {
      return "bg-accent3-DEFAULT/20 text-accent3-light border border-accent3-DEFAULT/40";
    } else if (typeName === "Kart") {
      return "bg-green-500/20 text-green-300 border border-green-500/40";
    }
    // Default
    return "bg-gray-500/20 text-gray-300 border border-gray-500/40";
  };

  // Render content based on loading state and vehicle data
  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      );
    }

    // Empty state
    if (filteredVehicles.length === 0) {
      return (
        <div className="bg-dark-200 rounded-lg border border-dark-100 p-10 text-center">
          <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
          <p className="text-light-500 mb-6">
            {searchTerm ||
              filters.vehicleClass.length > 0 ||
              filters.vehicleType.length > 0 ||
              filters.hasTeam ||
              filters.hasEcu
              ? "No vehicles match your search criteria."
              : "Get started by adding your first vehicle."}
          </p>
          <button
            onClick={handleAddVehicle}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">      
            <Plus size={18} className="mr-2" />
            Add Vehicle
          </button>
        </div>
      );
    }

    // Vehicles table
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-100 rounded-lg overflow-hidden">
          <thead className="bg-dark-300">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                Class
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                Team
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                ECU
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-dark-200 divide-y divide-dark-100">
            {filteredVehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="hover:bg-dark-100 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-mono text-sm">
                    {vehicle.id ? vehicle.id.substring(0, 8) + "..." : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 text-xs rounded-full ${getTypeColor(
                      vehicle.vehicleType || "Unknown"
                    )}`}
                  >
                    {vehicle.vehicleType || "Unknown"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 text-xs rounded-full ${getClassColor(
                      vehicle.vehicleClass || "Unknown"
                    )}`}
                  >
                    {vehicle.vehicleClass || "Unknown"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {vehicle.teamId && teamsById[vehicle.teamId] ? (
                      <>
                        <span className="font-medium">
                          {teamsById[vehicle.teamId].teamName}
                        </span>
                        <span className="text-xs text-light-500 block">
                          #{teamsById[vehicle.teamId].teamNumber}
                        </span>
                      </>
                    ) : (
                      <span className="text-light-500">Not assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {vehicle.ecuId ? (
                    <span className="font-mono text-xs">
                      {vehicle.ecuId.substring(0, 8)}...
                    </span>
                  ) : (
                    <span className="text-light-500">Not configured</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {!vehicle.teamId && (
                      <button
                        onClick={() =>
                          navigate("/assign-vehicle", {
                            state: {
                              vehicleId: vehicle.id,
                              vehicleType: vehicle.vehicleType,
                              vehicleClass: vehicle.vehicleClass,
                            },
                          })
                        }
                        className="p-2 bg-dark-300 rounded-md hover:bg-dark-100 transition-colors text-light-300"
                        title="Assign to Team"
                      >
                        <Users size={16} />
                      </button>
                    )}
                    {!vehicle.ecuId && (
                      <button
                        onClick={() =>
                          navigate("/configure-ecu", {
                            state: {
                              vehicleId: vehicle.id,
                            },
                          })
                        }
                        className="p-2 bg-dark-300 rounded-md hover:bg-dark-100 transition-colors text-light-300"
                        title="Configure ECU"
                      >
                        <Cpu size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Vehicles / Ngā Waka</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center px-3 py-2.5 bg-dark-200 text-white rounded-lg hover:bg-dark-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={`mr-1 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={handleAddVehicle}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} className="mr-2" />
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
          />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-200 border border-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT text-light-100"
          />
        </div>
        <div ref={filterRef} className="relative">
          <button
            onClick={toggleFilter}
            className="flex items-center justify-center px-4 py-3 bg-dark-200 border border-dark-100 rounded-lg hover:bg-dark-100 transition-colors"
          >
            <Filter size={18} className="mr-2 text-light-500" />
            <span>Filter</span>
            {(filters.vehicleClass.length > 0 ||
              filters.vehicleType.length > 0 ||
              filters.hasTeam ||
              filters.hasEcu) && (
                <span className="ml-2 bg-accent2-DEFAULT text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {filters.vehicleClass.length +
                    filters.vehicleType.length +
                    (filters.hasTeam ? 1 : 0) +
                    (filters.hasEcu ? 1 : 0)}
                </span>
              )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-dark-300 rounded-lg shadow-lg z-50 border border-dark-100 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-light-300 mb-2">
                    Vehicle Class
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.vehicleClass.includes("Standard")}
                        onChange={() =>
                          handleFilterChange("vehicleClass", "Standard")
                        }
                        className="rounded border-dark-100 text-accent2-DEFAULT focus:ring-accent2-light"
                      />
                      <span>Standard</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.vehicleClass.includes("Open")}
                        onChange={() =>
                          handleFilterChange("vehicleClass", "Open")
                        }
                        className="rounded border-dark-100 text-accent2-DEFAULT focus:ring-accent2-light"
                      />
                      <span>Open</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-light-300 mb-2">
                    Vehicle Type
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.vehicleType.includes("Bike")}
                        onChange={() =>
                          handleFilterChange("vehicleType", "Bike")
                        }
                        className="rounded border-dark-100 text-accent2-DEFAULT focus:ring-accent2-light"
                      />
                      <span>Bike</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.vehicleType.includes("Kart")}
                        onChange={() =>
                          handleFilterChange("vehicleType", "Kart")
                        }
                        className="rounded border-dark-100 text-accent2-DEFAULT focus:ring-accent2-light"
                      />
                      <span>Kart</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-light-300 mb-2">
                    Status
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.hasTeam}
                        onChange={() => handleBooleanFilterChange("hasTeam")}
                        className="rounded border-dark-100 text-accent2-DEFAULT focus:ring-accent2-light"
                      />
                      <span>Has Team</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.hasEcu}
                        onChange={() => handleBooleanFilterChange("hasEcu")}
                        className="rounded border-dark-100 text-accent2-DEFAULT focus:ring-accent2-light"
                      />
                      <span>Has ECU</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-light-500 hover:text-light-300"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {(filters.vehicleClass.length > 0 ||
        filters.vehicleType.length > 0 ||
        filters.hasTeam ||
        filters.hasEcu) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-light-500">Active filters:</span>
            {filters.vehicleClass.map((filter) => (
              <span
                key={`class-${filter}`}
                className="px-2 py-1 text-xs rounded-full bg-accent2-DEFAULT/10 text-accent2-light border border-accent2-DEFAULT/30"
              >
                Class: {filter}
              </span>
            ))}
            {filters.vehicleType.map((filter) => (
              <span
                key={`type-${filter}`}
                className="px-2 py-1 text-xs rounded-full bg-accent3-DEFAULT/10 text-accent3-light border border-accent3-DEFAULT/30"
              >
                Type: {filter}
              </span>
            ))}
            {filters.hasTeam && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                Has Team
              </span>
            )}
            {filters.hasEcu && (
              <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-300 border border-green-500/30">
                Has ECU
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-light-500 hover:text-light-300 underline"
            >
              Clear all
            </button>
          </div>
        )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content: Loading, Empty State, or Vehicles Table */}
      {renderContent()}
    </div>
  );
};

export default Vehicles;
