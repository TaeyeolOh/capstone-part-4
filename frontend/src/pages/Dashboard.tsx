import { Battery, Users, Calendar, Award } from "lucide-react";
import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import TeamPointsChart from "../components/TeamPointsChart";
import RecentEvents from "../components/RecentEvents";
import { getAllTeams } from "../services/teamService";
import Spinner from "../components/Spinner";
import { getECUs } from "../services/ecuService";
import { getAllCompetitions } from "../services/competitionService";
import { getAllEvents } from "../services/eventService";

const Dashboard = () => {
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("All Events");
  const [monitorCount, setMonitorCount] = useState<number | null>(null);
  const [competitionCount, setCompetitionCount] = useState<number | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [activeMonitors, setActiveMonitors] = useState<number | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<number | null>(null);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<
    number | null
  >(null);

  // Fetch team count on component mount
  useEffect(() => {
    const fetchECUCount = async () => {
      try {
        const ecus = await getECUs();
        setMonitorCount(ecus.length);
        const activeMonitors = ecus.filter((ecu) => ecu.vehicleId).length;
        setActiveMonitors(activeMonitors);
      } catch (error) {
        setMonitorCount(0);
        console.error("Error fetching ECUs:", error);
      }
    };
    const fetchCompetitionCount = async () => {
      try {
        const competitions = await getAllCompetitions();
        setCompetitionCount(competitions.length);
        const now = new Date();
        const upcoming = competitions.filter(
          (competition) => new Date(competition.date) > now
        ).length;
        setUpcomingCompetitions(upcoming);
      } catch (error) {
        setCompetitionCount(0);
        console.error("Error fetching competitions:", error);
      }
    };
    const fetchEventCount = async () => {
      try {
        const events = await getAllEvents();
        setEventCount(events.length);
        const now = new Date();
        const upcoming = events.filter(
          (event) => new Date(event.startTime) > now
        ).length;
        setUpcomingEvents(upcoming);
      } catch (error) {
        setEventCount(0);
        console.error("Error fetching events:", error);
      }
    };
    const fetchTeamCount = async () => {
      try {
        const teams = await getAllTeams();
        setTeamCount(teams.length);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeamCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchECUCount();
    fetchCompetitionCount();
    fetchEventCount();
    fetchTeamCount();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard / Papatohu
        </h2>
        <div className="flex space-x-2">
          <select
            className="bg-dark-200 border border-dark-100 text-light-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option>All Events</option>
            <option>Auckland Regional</option>
            <option>Wellington Regional</option>
            <option>National Finals</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teams"
          value={loading ? "Loading..." : teamCount?.toString() || "0"}
          icon={<Users className="text-light-100" size={22} />}
          change={
            teamCount === null
              ? "Calculating..."
              : teamCount > 0
              ? `+${Math.min(teamCount, 5)} from last event`
              : "No teams yet"
          }
          changeType={
            teamCount === null
              ? "neutral"
              : teamCount > 0
              ? "increase"
              : "neutral"
          }
          accentColor="blue"
          isLoading={loading}
        />
        <StatCard
          title="Active Monitors"
          value={loading ? "Loading..." : monitorCount?.toString() || "0"}
          icon={<Battery className="text-light-100" size={22} />}
          changeType={
            activeMonitors === null
              ? "neutral"
              : activeMonitors > 0
              ? "increase"
              : "decrease"
          }
          change={
            activeMonitors === null
              ? "Calculating..."
              : activeMonitors > 0
              ? `${activeMonitors} Monitors Connected to Teams`
              : "No monitors connected to teams"
          }
          accentColor="green"
        />
        <StatCard
          title="Events"
          value={loading ? "Loading..." : eventCount?.toString() || "0"}
          icon={<Calendar className="text-light-100" size={22} />}
          change={
            loading
              ? "Loading..."
              : upcomingEvents !== null
              ? `${upcomingEvents} Upcoming Events`
              : "No events yet"
          }
          changeType={
            activeMonitors === null
              ? "neutral"
              : upcomingEvents !== null && upcomingEvents > 0
              ? "increase"
              : "decrease"
          }
          accentColor="purple"
        />
        <StatCard
          title="Competitions"
          value={loading ? "Loading..." : competitionCount?.toString() || "0"}
          icon={<Award className="text-light-100" size={22} />}
          change={
            loading
              ? "Loading..."
              : upcomingCompetitions !== null
              ? `${upcomingCompetitions} Upcoming Competition`
              : "No competitions yet"
          }
          changeType="increase"
          accentColor="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-200 rounded-xl p-6 border border-dark-100">
          <h3 className="text-xl font-semibold mb-6">
            Team Points by Competition
          </h3>
          {loading ? (
            <div className="flex justify-center items-center h-80">
              <Spinner size="lg" />
            </div>
          ) : (
            <TeamPointsChart />
          )}
        </div>
        <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
          <h3 className="text-xl font-semibold mb-6">Recent Events</h3>
          <RecentEvents />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
