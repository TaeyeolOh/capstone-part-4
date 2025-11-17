import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Team } from "../types/team";
import { Vehicle } from "../types/vehicle";
import { getAllTeams } from "../services/teamService";
import { getVehiclesByTeamId } from "../services/vehicleService";
import Spinner from "../components/Spinner";
import useClickOutside from "../hooks/useClickOutside";

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [vehiclesByTeam, setVehiclesByTeam] = useState<
    Record<string, Vehicle[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    vehicleClass: [] as string[],
    vehicleType: [] as string[],
  });

  const navigate = useNavigate();
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useClickOutside(filterRef, () => {
    if (filterOpen) setFilterOpen(false);
  });

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch teams from API
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTeams();
      console.log("Teams data:", data);
      setTeams(data);

      // Fetch vehicles for each team
      const vehiclesMap: Record<string, Vehicle[]> = {};
      for (const team of data) {
        if (team.id) {
          try {
            console.log(`Fetching vehicles for team with ID: ${team.id}`);
            console.log(`Team vehicle IDs array:`, team.vehicleIds);

            const vehicles = await getVehiclesByTeamId(team.id);

            console.log(
              `Successfully fetched ${vehicles.length} vehicles for team ${team.id}:`,
              vehicles
            );
            vehiclesMap[team.id] = vehicles;
          } catch (vehicleErr) {
            console.error(
              `Error fetching vehicles for team ${team.id}:`,
              vehicleErr
            );
            vehiclesMap[team.id] = [];
          }
        } else {
          console.warn("Team found without ID, skipping vehicle fetch");
        }
      }
      setVehiclesByTeam(vehiclesMap);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeams();
  };

  // Handle add team button click
  const handleAddTeam = () => {
    navigate("/add-team");
  };

  // Handle filter toggle
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  // Handle filter change
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

  // Handle clear filters
  const clearFilters = () => {
    setFilters({
      vehicleClass: [],
      vehicleType: [],
    });
  };

  // Get vehicle info for a team
  const getVehicleInfo = (team: Team) => {
    const vehicles = vehiclesByTeam[team.id || ""] || [];
    if (vehicles.length === 0) {
      return { type: "No vehicle", class: "" };
    }
    return {
      type: vehicles[0].vehicleType || "Unknown",
      class: vehicles[0].vehicleClass || "Unknown",
    };
  };

  // Filter teams based on search term and filters
  const filteredTeams = teams.filter((team) => {
    // Search filter
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.schoolName.toLowerCase().includes(searchTerm.toLowerCase());

    // Vehicle filters
    const teamVehicles = vehiclesByTeam[team.id || ""] || [];
    const hasMatchingVehicleClass =
      filters.vehicleClass.length === 0 ||
      teamVehicles.some((v) => filters.vehicleClass.includes(v.vehicleClass));

    const hasMatchingVehicleType =
      filters.vehicleType.length === 0 ||
      teamVehicles.some((v) => filters.vehicleType.includes(v.vehicleType));

    return matchesSearch && hasMatchingVehicleClass && hasMatchingVehicleType;
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

  // Render content based on loading state and team data
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
    if (filteredTeams.length === 0) {
      return (
        <div className="bg-dark-200 rounded-lg border border-dark-100 p-10 text-center">
          <h3 className="text-xl font-semibold mb-2">No teams found</h3>
          <p className="text-light-500 mb-6">
            {searchTerm ||
            filters.vehicleClass.length > 0 ||
            filters.vehicleType.length > 0
              ? "No teams match your search criteria."
              : "Get started by adding your first team."}
          </p>
          <button
            onClick={handleAddTeam}
            className="inline-flex items-center px-4 py-2 bg-accent2-DEFAULT text-white rounded-md hover:bg-accent2-light transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Team
          </button>
        </div>
      );
    }

    // Teams table
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-100 rounded-lg overflow-hidden">
          <thead className="bg-dark-300">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                Team Name
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                School
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                Vehicle Type
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider"
              >
                Vehicle Class
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
            {filteredTeams.map((team) => {
              const vehicleInfo = getVehicleInfo(team);
              return (
                <tr
                  key={team.id}
                  className="hover:bg-dark-100 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{team.teamName}</div>
                    <div className="text-xs text-light-500">
                      #{team.teamNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-light-400">
                      {team.schoolName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vehicleInfo.type !== "No vehicle" ? (
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full ${getTypeColor(
                          vehicleInfo.type
                        )}`}
                      >
                        {vehicleInfo.type}
                      </span>
                    ) : (
                      <span className="text-light-500 text-sm">No vehicle</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vehicleInfo.class ? (
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full ${getClassColor(
                          vehicleInfo.class
                        )}`}
                      >
                        {vehicleInfo.class}
                      </span>
                    ) : (
                      <span className="text-light-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        navigate("/add-team-to-event", {
                          state: {
                            teamId: team.id,
                            teamName: team.teamName,
                          },
                        })
                      }
                      className="p-2 bg-dark-300 rounded-md hover:bg-dark-100 transition-colors text-light-300"
                      title="Register to Event"
                    >
                      <BookOpen size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Teams / Ngā tīma</h2>
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
            onClick={handleAddTeam}
            className="flex items-center justify-center px-5 py-2.5 bg-accent2-DEFAULT text-white rounded-lg hover:bg-accent2-light transition-colors shadow-neon"
          >
            <Plus size={18} className="mr-2" />
            Add Team
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
            placeholder="Search teams..."
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
              filters.vehicleType.length > 0) && (
              <span className="ml-2 bg-accent2-DEFAULT text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filters.vehicleClass.length + filters.vehicleType.length}
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
      {(filters.vehicleClass.length > 0 || filters.vehicleType.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-light-500">Active filters:</span>
          {filters.vehicleClass.map((filter) => (
            <span
              key={`class-${filter}`}
              className="px-2 py-1 text-xs rounded-full bg-accent2-DEFAULT/10 text-accent2-light border border-accent2-DEFAULT/30"
            >
              {filter}
            </span>
          ))}
          {filters.vehicleType.map((filter) => (
            <span
              key={`type-${filter}`}
              className="px-2 py-1 text-xs rounded-full bg-accent3-DEFAULT/10 text-accent3-light border border-accent3-DEFAULT/30"
            >
              {filter}
            </span>
          ))}
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

      {/* Content: Loading, Empty State, or Teams Table */}
      {renderContent()}
    </div>
  );
};

export default Teams;
