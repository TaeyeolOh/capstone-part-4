import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllCompetitions } from "../services/competitionService";
import { getRaceResultsByCompetition } from "../services/raceResultService";
import { Competition } from "../types/competition";
import { CompetitionResult } from "../types/raceResult";

const TeamPointsChart = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompetitions();
  }, []);

  useEffect(() => {
    if (selectedCompetition) {
      loadChartData(selectedCompetition);
    }
  }, [selectedCompetition]);

  const loadCompetitions = async () => {
    try {
      const data = await getAllCompetitions();
      setCompetitions(data);
      if (data.length > 0) {
        setSelectedCompetition(data[0].id);
      }
      setError(null);
    } catch (error) {
      console.error("Error loading competitions:", error);
      setError("Failed to load competition data");
    }
  };

  const loadChartData = async (competitionId: string) => {
    setLoading(true);
    try {
      const results = await getRaceResultsByCompetition(competitionId);

      // Group results by vehicle class
      const standardTeams = results.filter((r) =>
        r.results.some((res) => res.vehicleClass === "Standard")
      );
      const openTeams = results.filter((r) =>
        r.results.some((res) => res.vehicleClass === "Open")
      );

      // Get top 5 teams from each class
      const topStandard = standardTeams
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 5);
      const topOpen = openTeams
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 5);

      // Combine and format for chart
      const data: Array<{ name: string; Standard: number; Open: number }> = [];

      // Add standard class teams
      topStandard.forEach((team) => {
        data.push({
          name: team.teamName,
          Standard: team.totalPoints,
          Open: 0,
        });
      });

      // Add open class teams
      topOpen.forEach((team) => {
        const existing = data.find((d) => d.name === team.teamName);
        if (existing) {
          existing.Open = team.totalPoints;
        } else {
          data.push({
            name: team.teamName,
            Standard: 0,
            Open: team.totalPoints,
          });
        }
      });

      setChartData(data);
      setError(null);
    } catch (error) {
      console.error("Error loading chart data:", error);
      setChartData([]);
      setError("Failed to load race results data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <select
          className="bg-dark-100 border border-dark-100 text-light-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT"
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
        >
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name}
            </option>
          ))}
        </select>
      </div>

      <div className="h-80">
        {error ? (
          <div className="flex items-center justify-center h-full text-red-400">
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-light-400">Loading chart data...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-light-400">No race results available</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#222222"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#a3a3a3"
                axisLine={false}
                tickLine={false}
              />
              <YAxis stroke="#a3a3a3" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#121212",
                  border: "1px solid #333333",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
                labelStyle={{
                  color: "#ffffff",
                  fontWeight: "bold",
                  marginBottom: "5px",
                }}
                itemStyle={{ color: "#ffffff", padding: "2px 0" }}
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value, entry) => (
                  <span style={{ color: "#a3a3a3" }}>{value}</span>
                )}
              />
              <Bar
                dataKey="Standard"
                name="Standard Class"
                radius={[4, 4, 0, 0]}
                barSize={30}
                fill="#16A34A"
                fillOpacity={0.8}
                stroke="#16A34A"
                strokeWidth={1}
                strokeOpacity={0.8}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={true}
              />
              <Bar
                dataKey="Open"
                name="Open Class"
                radius={[4, 4, 0, 0]}
                barSize={30}
                fill="#00C2FF"
                fillOpacity={0.8}
                stroke="#00C2FF"
                strokeWidth={1}
                strokeOpacity={0.8}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TeamPointsChart;
