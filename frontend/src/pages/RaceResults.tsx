"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  RefreshCw,
  Battery,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Competition } from "../types/competition";
import { Event } from "../types/event";
import { RaceResult, CompetitionResult } from "../types/raceResult";
import { getAllCompetitions } from "../services/competitionService";
import { getEventsByCompetitionId } from "../services/eventService";
import {
  getRaceResultsByEvent,
  getRaceResultsByCompetition,
  updateRaceTime,
  updateEnergyForEvent,
} from "../services/raceResultService";

const RaceResults = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [eventResults, setEventResults] = useState<RaceResult[]>([]);
  const [competitionResults, setCompetitionResults] = useState<
    CompetitionResult[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<string>("");
  const [sortColumn, setSortColumn] = useState("points");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [vehicleClassFilter, setVehicleClassFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load competitions on mount
  useEffect(() => {
    loadCompetitions();
  }, []);

  // Load events when competition changes
  useEffect(() => {
    if (selectedCompetition) {
      setSelectedEvent("all"); // Reset to "all" when competition changes
      loadEvents(selectedCompetition);
    }
  }, [selectedCompetition]);

  // Load results when event selection changes or competition changes
  useEffect(() => {
    if (selectedCompetition) {
      loadResults();
    }
  }, [selectedEvent, selectedCompetition]);

  const loadCompetitions = async () => {
    try {
      const data = await getAllCompetitions();
      setCompetitions(data);
      if (data.length > 0 && !selectedCompetition) {
        setSelectedCompetition(data[0].id);
      }
    } catch (error) {
      console.error("Error loading competitions:", error);
    }
  };

  const loadEvents = async (competitionId: string) => {
    try {
      const data = await getEventsByCompetitionId(competitionId);
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadResults = async () => {
    setLoading(true);
    try {
      if (selectedEvent === "all") {
        // Load competition aggregate results
        const data = await getRaceResultsByCompetition(selectedCompetition);
        setCompetitionResults(data);
        setEventResults([]);
      } else {
        // Load specific event results
        const data = await getRaceResultsByEvent(selectedEvent);
        setEventResults(data);
        setCompetitionResults([]);
      }
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadResults();
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder(column === "position" ? "asc" : "desc");
    }
  };

  const formatTimeDisplay = (millis: number): string => {
    if (millis === 0) return "00:00.00";
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes.toString().padStart(2, "0")}:${seconds.padStart(5, "0")}`;
  };

  const parseTimeToMillis = (timeStr: string): number => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\.(\d{2})$/);
    if (!match) return 0;
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const milliseconds = parseInt(match[3]) * 10;
    return (minutes * 60 + seconds) * 1000 + milliseconds;
  };

  const handleTimeEdit = (resultId: string, currentTime: string) => {
    setEditingTime(resultId);
    setTempTime(currentTime);
  };

  const handleTimeSave = async (resultId: string) => {
    const millis = parseTimeToMillis(tempTime);
    if (millis > 0) {
      try {
        await updateRaceTime(resultId, millis, tempTime);
        await loadResults(); // Reload to get updated points
      } catch (error) {
        console.error("Error updating time:", error);
      }
    }
    setEditingTime(null);
    setTempTime("");
  };

  const handleTimeCancel = () => {
    setEditingTime(null);
    setTempTime("");
  };

  const getClassColor = (vehicleClass: string) => {
    if (vehicleClass.toLowerCase().includes("standard"))
      return "bg-accent2-DEFAULT/20 text-accent2-light border border-accent2-DEFAULT/40";
    if (vehicleClass.toLowerCase().includes("open"))
      return "bg-accent1-DEFAULT/20 text-accent1-light border border-accent1-DEFAULT/40";
    return "bg-accent3-DEFAULT/20 text-accent3-light border border-accent3-DEFAULT/40";
  };

  // Filter and sort event results
  const filteredEventResults = eventResults
    .filter((result) => {
      const matchesClass =
        vehicleClassFilter === "all" ||
        result.vehicleClass === vehicleClassFilter;
      const matchesSearch =
        searchQuery === "" ||
        result.teamName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesSearch;
    })
    .sort((a, b) => {
      let aVal: any = a[sortColumn as keyof RaceResult];
      let bVal: any = b[sortColumn as keyof RaceResult];

      if (sortColumn === "raceTimeMillis") {
        aVal = a.raceTimeMillis;
        bVal = b.raceTimeMillis;
        // Put 0 times at the end when sorting by time
        if (aVal === 0) return 1;
        if (bVal === 0) return -1;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Filter and sort competition results
  const filteredCompetitionResults = competitionResults
    .filter((result) => {
      const matchesSearch =
        searchQuery === "" ||
        result.teamName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortColumn === "totalPoints") {
        return sortOrder === "asc"
          ? a.totalPoints - b.totalPoints
          : b.totalPoints - a.totalPoints;
      }
      return 0;
    });

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Race Results", 14, 22);

    doc.setFontSize(12);
    const headers =
      selectedEvent === "all"
        ? ["Team", "Total Points", "Events Participated"]
        : ["Position", "Team", "Vehicle", "Class", "Time", "Points"];

    const startY = 30;
    let yOffset = startY;

    // Headers
    doc.setFillColor(0, 0, 0);
    doc.rect(14, yOffset - 5, 180, 10, "F");
    doc.setTextColor(255, 255, 255);

    if (selectedEvent === "all") {
      doc.text(headers[0], 14, yOffset);
      doc.text(headers[1], 80, yOffset);
      doc.text(headers[2], 140, yOffset);
    } else {
      doc.text(headers[0], 14, yOffset);
      doc.text(headers[1], 30, yOffset);
      doc.text(headers[2], 80, yOffset);
      doc.text(headers[3], 120, yOffset);
      doc.text(headers[4], 150, yOffset);
      doc.text(headers[5], 170, yOffset);
    }

    yOffset += 10;
    doc.setTextColor(0, 0, 0);

    // Data
    if (selectedEvent === "all") {
      filteredCompetitionResults.forEach((result, index) => {
        doc.text(result.teamName, 14, yOffset);
        doc.text(result.totalPoints.toFixed(2), 80, yOffset);
        doc.text(result.eventCount.toString(), 140, yOffset);
        yOffset += 10;
      });
    } else {
      filteredEventResults.forEach((result) => {
        doc.text(result.position.toString(), 14, yOffset);
        doc.text(result.teamName, 30, yOffset);
        doc.text(result.vehicleType, 80, yOffset);
        doc.text(result.vehicleClass, 120, yOffset);
        doc.text(result.raceTimeDisplay, 150, yOffset);
        doc.text(result.points.toFixed(2), 170, yOffset);
        yOffset += 10;
      });
    }

    doc.save("race-results.pdf");
  };

  const handleUpdateEnergy = async () => {
    if (selectedEvent !== "all") {
      try {
        setLoading(true);
        await updateEnergyForEvent(selectedEvent);
        await loadResults();
      } catch (error) {
        console.error("Error updating energy:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Race Results / Ngā Hua o te Rēhi
        </h2>
        <div className="flex gap-2">
          <button
            className="flex items-center justify-center px-4 py-2.5 bg-dark-200 text-white rounded-lg hover:bg-dark-100 transition-colors border border-dark-100"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          {selectedEvent !== "all" && (
            <button
              className="flex items-center justify-center px-4 py-2.5 bg-accent3-DEFAULT text-white rounded-lg hover:bg-accent3-light transition-colors"
              onClick={handleUpdateEnergy}
            >
              <Battery size={18} className="mr-2" />
              Update Energy
            </button>
          )}
          <button
            className="flex items-center justify-center px-4 py-2.5 bg-dark-200 text-white rounded-lg hover:bg-dark-100 transition-colors border border-dark-100"
            onClick={exportToPDF}
          >
            <Download size={18} className="mr-2" />
            Export Results
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
          />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-200 border border-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT text-light-100"
          />
        </div>
        <div className="flex space-x-3">
          <select
            className="bg-dark-200 border border-dark-100 text-light-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT"
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
          >
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
          <select
            className="bg-dark-200 border border-dark-100 text-light-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="all">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
          {selectedEvent !== "all" && (
            <select
              className="bg-dark-200 border border-dark-100 text-light-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT"
              value={vehicleClassFilter}
              onChange={(e) => setVehicleClassFilter(e.target.value)}
            >
              <option value="all">All Classes</option>
              <option value="Standard">Standard</option>
              <option value="Open">Open</option>
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-light-400">Loading results...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {selectedEvent === "all" ? (
            // Competition View
            competitionResults.length === 0 ? (
              <div className="text-center py-8 text-light-400">
                No results found for this competition. Make sure teams have
                participated in events.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-dark-100 rounded-lg overflow-hidden">
                <thead className="bg-dark-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                      <button
                        className="flex items-center text-light-500 hover:text-light-100"
                        onClick={() => handleSort("totalPoints")}
                      >
                        Total Points
                        {sortColumn === "totalPoints" &&
                          (sortOrder === "asc" ? (
                            <ArrowUp size={14} className="ml-1" />
                          ) : (
                            <ArrowDown size={14} className="ml-1" />
                          ))}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                      Events
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                      Total Energy (Wh)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-dark-200 divide-y divide-dark-100">
                  {filteredCompetitionResults.map((result, index) => (
                    <tr
                      key={result.teamId}
                      className="hover:bg-dark-100 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{index + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{result.teamName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {result.totalPoints.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-light-400">
                          {result.eventCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-light-400">
                          {result.results
                            .reduce(
                              (sum, r) => sum + (r.energyConsumed || 0),
                              0
                            )
                            .toFixed(3)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : // Event View
          eventResults.length === 0 ? (
            <div className="text-center py-8 text-light-400">
              No results found for this event. Make sure teams are registered
              with vehicles.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-dark-100 rounded-lg overflow-hidden">
              <thead className="bg-dark-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                    <button
                      className="flex items-center text-light-500 hover:text-light-100"
                      onClick={() => handleSort("position")}
                    >
                      Position
                      {sortColumn === "position" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp size={14} className="ml-1" />
                        ) : (
                          <ArrowDown size={14} className="ml-1" />
                        ))}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                    <button
                      className="flex items-center text-light-500 hover:text-light-100"
                      onClick={() => handleSort("raceTimeMillis")}
                    >
                      Time
                      {sortColumn === "raceTimeMillis" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp size={14} className="ml-1" />
                        ) : (
                          <ArrowDown size={14} className="ml-1" />
                        ))}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                    Energy (Wh)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-light-500 uppercase tracking-wider">
                    <button
                      className="flex items-center text-light-500 hover:text-light-100"
                      onClick={() => handleSort("points")}
                    >
                      Points
                      {sortColumn === "points" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp size={14} className="ml-1" />
                        ) : (
                          <ArrowDown size={14} className="ml-1" />
                        ))}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-dark-200 divide-y divide-dark-100">
                {filteredEventResults.map((result) => (
                  <tr
                    key={result.id}
                    className="hover:bg-dark-100 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {result.position === 0 ? "--" : result.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{result.teamName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-light-400">
                        {result.vehicleType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full ${getClassColor(
                          result.vehicleClass
                        )}`}
                      >
                        {result.vehicleClass}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTime === result.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tempTime}
                            onChange={(e) => setTempTime(e.target.value)}
                            placeholder="MM:SS.ms"
                            className="w-24 px-2 py-1 text-sm bg-dark-300 border border-dark-100 rounded"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") handleTimeSave(result.id);
                              if (e.key === "Escape") handleTimeCancel();
                            }}
                          />
                          <button
                            onClick={() => handleTimeSave(result.id)}
                            className="text-green-500 hover:text-green-400"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleTimeCancel}
                            className="text-red-500 hover:text-red-400"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <div
                          className="text-sm font-medium cursor-pointer hover:text-accent2-DEFAULT"
                          onClick={() =>
                            handleTimeEdit(result.id, result.raceTimeDisplay)
                          }
                        >
                          {result.raceTimeDisplay}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-light-400">
                        {result.energyConsumed
                          ? result.energyConsumed.toFixed(3)
                          : "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {result.points.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default RaceResults;
