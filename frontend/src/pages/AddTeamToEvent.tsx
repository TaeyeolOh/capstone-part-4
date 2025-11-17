import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Team } from "../types/team";
import { Competition } from "../types/competition";
import { Event } from "../types/event";
import { Vehicle } from "../types/vehicle";
import { getAllTeams } from "../services/teamService";
import { getAllCompetitions } from "../services/competitionService";
import {
  getEventsByCompetitionId,
  registerTeamToEvent,
} from "../services/eventService";
import { getECUConfiguredVehiclesByTeamId } from "../services/vehicleService";
import { Check, ArrowLeft, AlertCircle, Car, Zap } from "lucide-react";
import Spinner from "../components/Spinner";

interface LocationState {
  teamId?: string;
  teamName?: string;
  competitionId?: string;
  competitionName?: string;
}

const AddTeamToEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    state?.teamId || null
  );
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<
    string | null
  >(state?.competitionId || null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );

  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCompetitionId) {
      fetchEventsByCompetition(selectedCompetitionId);
    } else {
      setEvents([]);
      setSelectedEventId(null);
    }
  }, [selectedCompetitionId]);

  useEffect(() => {
    const teamId = selectedTeamId || state?.teamId;
    if (teamId) {
      fetchAvailableVehicles(teamId);
    } else {
      setAvailableVehicles([]);
      setSelectedVehicleId(null);
    }
  }, [selectedTeamId, state?.teamId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamsData, competitionsData] = await Promise.all([
        getAllTeams(),
        getAllCompetitions(),
      ]);

      setTeams(teamsData);
      setCompetitions(competitionsData);

      if (state?.competitionId) {
        await fetchEventsByCompetition(state.competitionId);
      }

      // If team is preselected, fetch its ECU-configured vehicles
      if (state?.teamId) {
        await fetchAvailableVehicles(state.teamId);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByCompetition = async (competitionId: string) => {
    try {
      const eventsData = await getEventsByCompetitionId(competitionId);
      setEvents(eventsData);
      setSelectedEventId(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events for the selected competition.");
    }
  };

  const fetchAvailableVehicles = async (teamId: string) => {
    try {
      setLoadingVehicles(true);
      console.log("Fetching ECU-configured vehicles for team:", teamId);
      const vehicles = await getECUConfiguredVehiclesByTeamId(teamId);
      console.log("Available vehicles:", vehicles);
      setAvailableVehicles(vehicles);
      setSelectedVehicleId(null); // Reset vehicle selection
    } catch (err) {
      console.error("Error fetching available vehicles:", err);
      setAvailableVehicles([]);
      setSelectedVehicleId(null);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleAddTeamToEvent = async () => {
    const teamId = selectedTeamId || state?.teamId;

    if (!teamId || !selectedEventId) {
      setError("Please select a team and an event");
      return;
    }

    // Check if we have ECU-configured vehicles available
    if (availableVehicles.length === 0) {
      setError(
        "This team has no ECU-configured vehicles. Please configure an ECU for a vehicle first."
      );
      return;
    }

    if (!selectedVehicleId) {
      setError("Please select a vehicle to register with");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      console.log("Registering team to event:", {
        teamId,
        eventId: selectedEventId,
        vehicleId: selectedVehicleId,
      });

      // Use the updated registerTeamToEvent function with vehicleId
      await registerTeamToEvent(selectedEventId, teamId, selectedVehicleId);

      setSuccess(
        "Team successfully registered to event with selected vehicle!"
      );

      setTimeout(() => {
        navigate("/teams");
      }, 2000);
    } catch (err: any) {
      console.error("Error adding team to event:", err);
      setError(
        `Failed to register team to event: ${err.message || "Unknown error"}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedTeam = () => {
    const id = selectedTeamId || state?.teamId || null;
    return id ? teams.find((team) => team.id === id) : undefined;
  };

  const getSelectedCompetition = () => {
    const id = selectedCompetitionId || state?.competitionId || null;
    return id
      ? competitions.find((competition) => competition.id === id)
      : undefined;
  };

  const getSelectedEvent = () => {
    return selectedEventId
      ? events.find((event) => event.id === selectedEventId)
      : undefined;
  };

  const getSelectedVehicle = () => {
    return selectedVehicleId
      ? availableVehicles.find((vehicle) => vehicle.id === selectedVehicleId)
      : undefined;
  };

  const renderTeamsSection = () => {
    if (teams.length === 0) {
      return (
        <p className="text-light-500 py-4">
          No teams available. Please create a team first.
        </p>
      );
    }

    if (state?.teamId) {
      return (
        <div className="p-4 rounded-lg bg-accent2-DEFAULT/20 border border-accent2-DEFAULT">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{state.teamName}</h4>
              <p className="text-sm text-light-500">
                {teams.find((t) => t.id === state.teamId)?.schoolName ||
                  "Unknown school"}
              </p>
            </div>
            <Check size={18} className="text-accent2-DEFAULT" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => setSelectedTeamId(team.id || null)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedTeamId === team.id
                ? "bg-accent2-DEFAULT/20 border border-accent2-DEFAULT"
                : "bg-dark-300 border border-dark-100 hover:bg-dark-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{team.teamName}</h4>
                <p className="text-sm text-light-500">{team.schoolName}</p>
              </div>
              {selectedTeamId === team.id && (
                <Check size={18} className="text-accent2-DEFAULT" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCompetitionsSection = () => {
    if (competitions.length === 0) {
      return (
        <p className="text-light-500 py-4">
          No competitions available. Please create a competition first.
        </p>
      );
    }

    if (state?.competitionId) {
      return (
        <div className="p-4 rounded-lg bg-accent2-DEFAULT/20 border border-accent2-DEFAULT">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{state.competitionName}</h4>
              <p className="text-sm text-light-500">
                {competitions.find((c) => c.id === state.competitionId)
                  ?.location || "Unknown location"}
              </p>
            </div>
            <Check size={18} className="text-accent2-DEFAULT" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {competitions.map((competition) => (
          <div
            key={competition.id}
            onClick={() => setSelectedCompetitionId(competition.id || null)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedCompetitionId === competition.id
                ? "bg-accent2-DEFAULT/20 border border-accent2-DEFAULT"
                : "bg-dark-300 border border-dark-100 hover:bg-dark-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{competition.name}</h4>
                <p className="text-sm text-light-500">{competition.location}</p>
              </div>
              {selectedCompetitionId === competition.id && (
                <Check size={18} className="text-accent2-DEFAULT" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEventsSection = () => {
    if (!selectedCompetitionId && !state?.competitionId) {
      return (
        <p className="text-light-500 py-4">
          Please select a competition first to view its events.
        </p>
      );
    }

    if (events.length === 0) {
      return (
        <p className="text-light-500 py-4">
          No events available for this competition. Please create an event
          first.
        </p>
      );
    }

    return (
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => setSelectedEventId(event.id || null)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedEventId === event.id
                ? "bg-accent2-DEFAULT/20 border border-accent2-DEFAULT"
                : "bg-dark-300 border border-dark-100 hover:bg-dark-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{event.name}</h4>
                <p className="text-sm text-light-500">{event.eventType}</p>
              </div>
              {selectedEventId === event.id && (
                <Check size={18} className="text-accent2-DEFAULT" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVehiclesSection = () => {
    const teamId = selectedTeamId || state?.teamId;

    if (!teamId) {
      return (
        <p className="text-light-500 py-4">
          Please select a team first to view available vehicles.
        </p>
      );
    }

    if (loadingVehicles) {
      return (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      );
    }

    if (availableVehicles.length === 0) {
      return (
        <div className="text-center py-6">
          <Car size={48} className="mx-auto text-light-500 mb-3" />
          <p className="text-light-500 mb-2">
            No ECU-configured vehicles available
          </p>
          <p className="text-sm text-light-600">
            This team needs at least one vehicle with an ECU configured to
            register for events.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {availableVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => setSelectedVehicleId(vehicle.id || null)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedVehicleId === vehicle.id
                ? "bg-accent2-DEFAULT/20 border border-accent2-DEFAULT"
                : "bg-dark-300 border border-dark-100 hover:bg-dark-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Car size={16} className="text-light-400" />
                  <Zap size={14} className="text-accent1-DEFAULT" />
                </div>
                <div>
                  <h4 className="font-medium">
                    {vehicle.vehicleType} - {vehicle.vehicleClass}
                  </h4>
                  <p className="text-sm text-light-500">
                    ECU ID: {vehicle.ecuId}
                  </p>
                </div>
              </div>
              {selectedVehicleId === vehicle.id && (
                <Check size={18} className="text-accent2-DEFAULT" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const isFormDisabled = () => {
    const hasTeam = !!selectedTeamId || !!state?.teamId;
    const hasEvent = !!selectedEventId;
    const hasVehicle = !!selectedVehicleId;
    const hasECUConfiguredVehicles = availableVehicles.length > 0;

    return (
      !hasTeam ||
      !hasEvent ||
      !hasVehicle ||
      !hasECUConfiguredVehicles ||
      submitting
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <button
          onClick={() => navigate("/teams")}
          className="mr-4 p-2 bg-dark-200 rounded-full hover:bg-dark-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold tracking-tight">
          Register Team to Event
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-800 text-green-400 px-4 py-3 rounded-md flex items-start">
              <Check size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
              <h3 className="text-xl font-semibold mb-4">
                {state?.teamId ? "Selected Team" : "Select Team"}
              </h3>
              {renderTeamsSection()}
            </div>

            <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
              <h3 className="text-xl font-semibold mb-4">
                {state?.competitionId
                  ? "Selected Competition"
                  : "Select Competition"}
              </h3>
              {renderCompetitionsSection()}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
              <h3 className="text-xl font-semibold mb-4">Select Event</h3>
              {renderEventsSection()}
            </div>

            <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Zap size={20} className="mr-2" />
                Select Vehicle (ECU Required)
              </h3>
              {renderVehiclesSection()}
            </div>
          </div>

          <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
            <h3 className="text-xl font-semibold mb-4">Registration Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-light-500 text-sm">Team</p>
                <p className="font-medium">
                  {state?.teamName ||
                    getSelectedTeam()?.teamName ||
                    "No team selected"}
                </p>
              </div>
              <div>
                <p className="text-light-500 text-sm">Competition</p>
                <p className="font-medium">
                  {state?.competitionName ||
                    getSelectedCompetition()?.name ||
                    "No competition selected"}
                </p>
              </div>
              <div>
                <p className="text-light-500 text-sm">Event</p>
                <p className="font-medium">
                  {getSelectedEvent()?.name || "No event selected"}
                </p>
              </div>
              <div>
                <p className="text-light-500 text-sm">Vehicle</p>
                <p className="font-medium">
                  {getSelectedVehicle()
                    ? `${getSelectedVehicle()?.vehicleType} (${
                        getSelectedVehicle()?.ecuId
                      })`
                    : "No vehicle selected"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate("/teams")}
              className="px-6 py-3 bg-dark-200 text-light-100 rounded-md hover:bg-dark-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTeamToEvent}
              disabled={isFormDisabled()}
              className="px-6 py-3 bg-accent2-DEFAULT text-light-100 rounded-md hover:bg-accent2-light transition-colors disabled:bg-accent2-DEFAULT/50 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]"
            >
              {submitting ? (
                <div className="animate-spin h-5 w-5 border-2 border-light-100 border-t-transparent rounded-full"></div>
              ) : (
                "Register to Event"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTeamToEvent;
