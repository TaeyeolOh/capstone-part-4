"use client"

import { useState, useRef, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts"
import { Search, Download, ZoomIn, ZoomOut } from "lucide-react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { getTeamById } from "../services/teamService"
import { getVehicleById } from "../services/vehicleService"
import { Vehicle } from "../types/vehicle"
import { ECU } from "../types/ecu"
import { getECUById } from "../services/ecuService"
import { getECUs } from "../services/ecuService"
import { Team } from "../types/team"

const EnergyData = () => {
  const [ecu, setECU] = useState<ECU[]>([])
  const [selectedECU, setSelectedECU] = useState<string>("")
  const [selectedMetric, setSelectedMetric] = useState("power")
  const [ecuData, setEcuData] = useState<
    { time: string; voltage: number; current: number; power: number; energy: number; }[]
  >([])
  const [team, setTeam] = useState<Team | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [powerLimit, setPowerLimit] = useState<number | null>(null)

  const overTimeChartRef = useRef<HTMLDivElement | null>(null)
  const energyAccumulationChartRef = useRef<HTMLDivElement | null>(null)
  const [search, setSearch] = useState("")

  const [xWindow, setXWindow] = useState({start: 0, end: 0})

  useEffect(() => {
    if(ecuData.length > 0) {
      setXWindow({start: 0, end: ecuData.length - 1})
    }
  }, [ecuData])

  const ZOOM_STEP = 0.2;

  const handleZoomIn = () => {
  const len = ecuData.length;
  if (len < 2) return;
  const { start, end } = xWindow;
  const range = end - start;
  if (range <= 2) return; // Prevent over-zoom
  const step = Math.max(1, Math.floor(range * ZOOM_STEP / 2));
  setXWindow({
    start: Math.min(start + step, end - 2),
    end: Math.max(end - step, start + 2),
  });
};

const handleZoomOut = () => {
  const len = ecuData.length;
  if (len < 2) return;
  const { start, end } = xWindow;
  const range = end - start;
  if (range >= len - 1) return;
  const step = Math.max(1, Math.floor(range * ZOOM_STEP / 2));
  setXWindow({
    start: Math.max(start - step, 0),
    end: Math.min(end + step, len - 1),
  });
};

  const filteredECUs = ecu.filter((e) =>
    e.serialNumber.toLowerCase().includes(search.toLowerCase())
  )
  // Fetch all ECUs on mount
  useEffect(() => {
    const fetchECUs = async () => {
      try {
        const data = await getECUs()
        console.log("Fetched ECUs:", data)
        setECU(data)
        if (data.length > 0) {
          const firstEcuId = data[0].id
          if (!firstEcuId) return
          setSelectedECU(firstEcuId)
          await loadECUData(firstEcuId)
          await fetchVehicleAndTeamAndLimit(firstEcuId)
        }
      } catch (error) {
        console.error("Failed to load ECUs:", error)
      }
    }
    fetchECUs()
  }, [])

  useEffect(() => {
    if (
      filteredECUs.length > 0 &&
      filteredECUs[0].id !== selectedECU
    ) {
      setSelectedECU(filteredECUs[0].id)
      loadECUData(filteredECUs[0].id)
    }
    if (filteredECUs.length === 0 && selectedECU !== "") {
      setSelectedECU("")
      setEcuData([])
    }
  }, [search])

  const loadECUData = async (ecuId: string) => {
    try {
      const ecu: ECU = await getECUById(ecuId)
      const rawStatusList = ecu.ecuStatusList || []
      let cumulativeEnergy = 0
      const formattedData = rawStatusList.map((status, idx, arr) => {
        const dateObj = new Date(status.timestamp)
        const time = dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        const voltage = status.voltage
        const current = status.current
        const power = status.power

        if (idx === 0) {
          cumulativeEnergy = 0
        } else {
          const prevTimestamp = new Date(arr[idx - 1].timestamp).getTime()
          const currTimestamp = new Date(status.timestamp).getTime()
          const dt = (currTimestamp - prevTimestamp) / 3600000
          cumulativeEnergy += arr[idx - 1].power * dt
        }

        return { time, voltage, current, power, energy: cumulativeEnergy }
      })
      console.log("Formatted ECU data:", formattedData)
      setEcuData(formattedData)
    } catch (error) {
      console.error("Error fetching ECU data:", error)
      setEcuData([])
    }
  }

  const fetchVehicleAndTeamAndLimit = async (ecuID: string) => {
    const ecuObj = await getECUById(ecuID)
    console.log("Selected ECU object:", ecuObj)
    if (ecuObj && ecuObj.vehicleId) {
      const vehicleObj = await getVehicleById(ecuObj.vehicleId)
      console.log("Fetched vehicle:", vehicleObj)
      setVehicle(vehicleObj)
      if (vehicleObj.teamId) {
        const teamObj = await getTeamById(vehicleObj.teamId)
        console.log("Fetched team:", teamObj)
        setTeam(teamObj)
      } else {
        setTeam(null)
      }
      let limit = null
      console.log("Vehicle class:", vehicleObj.vehicleClass)
      if (vehicleObj.vehicleClass === "Standard") limit = 350
      else if (vehicleObj.vehicleClass === "Open") limit = 2000
      console.log("Power limit based on vehicle class:", limit)
      setPowerLimit(limit)
    } else {
      setVehicle(null)
      setTeam(null)
      setPowerLimit(null)
    }
  }

  const handleECUChange = async (ecuID: string) => {
    setSelectedECU(ecuID)
    await loadECUData(ecuID)
    await fetchVehicleAndTeamAndLimit(ecuID)
  }

  const isPowerLimitExceeded = () => {
    if (!powerLimit || selectedMetric !== "power") return false
    return ecuData.some(d => d.power > powerLimit)
  }

  // Get color for selected metric
  const getMetricColor = () => {
    switch (selectedMetric) {
      case "voltage":
        return "#00c2ff"
      case "current":
        return "#16a34a"
      case "power":
        return "#ff7b5c"
      case "energy":
        return "#8e24aa"
      default:
        return "#00c2ff"
    }
  }

  // Export charts as PDF
  const handleExport = () => {
    Promise.all([
      overTimeChartRef.current
        ? html2canvas(overTimeChartRef.current)
        : Promise.reject("Over Time Chart is not available"),
      energyAccumulationChartRef.current
        ? html2canvas(energyAccumulationChartRef.current)
        : Promise.reject("Energy Accumulation Chart is not available"),
    ])
      .then(([overTimeCanvas, energyAccumulationCanvas]) => {
        const doc = new jsPDF()
        doc.addImage(overTimeCanvas.toDataURL(), "PNG", 10, 10, 180, 90)
        doc.addPage()
        doc.addImage(energyAccumulationCanvas.toDataURL(), "PNG", 10, 10, 180, 90)
        doc.save("energy_data.pdf")
      })
      .catch((err) => {
        console.error("Error capturing charts:", err)
      })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Energy Data / Ngā Raraunga Pūngao</h2>
        <div className="flex space-x-3">
          <button
            className="flex items-center justify-center px-4 py-2.5 bg-dark-200 text-white rounded-lg hover:bg-dark-100 transition-colors border border-dark-100"
            onClick={handleExport}
          >
            <Download size={18} className="mr-2" />
            Export Data
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
          />
          <input
            type="text"
            placeholder="Search ECUs by serial number"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-200 border border-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT text-light-100"
          />
        </div>
        <div className="flex space-x-3">
          <select
            className="bg-dark-200 border border-dark-100 text-light-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT"
            value={selectedECU}
            onChange={(e) => handleECUChange(e.target.value)}
          >
            <option value="" disabled>
              Select an ECU
            </option>
            {filteredECUs.map((ecu) => (
              <option key={ecu.id} value={ecu.id}>
                {ecu.serialNumber}
              </option>
            ))}
          </select>
          <select
            className="bg-dark-200 border border-dark-100 text-light-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent2-DEFAULT"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="voltage">Voltage</option>
            <option value="current">Current</option>
            <option value="power">Power</option>
            <option value="energy">Energy</option>
          </select>
        </div>
      </div>

      <div className="bg-dark-200 rounded-xl p-6 border border-dark-100 hover-scale transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {ecu.find(e => e.id === selectedECU)?.serialNumber ?? "No ECU Selected"} -{" "}
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Over Time
          </h3>
          <div className="flex space-x-2">
            <button className="p-2 bg-dark-100 rounded-lg hover:bg-dark-300 transition-colors" onClick = {handleZoomIn}>
              <ZoomIn size={18} className="text-light-400" />
            </button>
            <button className="p-2 bg-dark-100 rounded-lg hover:bg-dark-300 transition-colors" onClick = {handleZoomOut}>
              <ZoomOut size={18} className="text-light-400" />
            </button>
          </div>
        </div>
        {selectedMetric === "power" && isPowerLimitExceeded() && (
            <div className="mb-4 p-3 bg-red-600 text-white rounded-lg font-semibold text-center">
              WARNING: Power limit exceeded for {team?.teamName} 
              <p>Vehicle Class: {vehicle?.vehicleClass}</p>
            </div>
          )}
        <div className="h-80" ref={overTimeChartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ecuData.slice(xWindow.start, xWindow.end + 1)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {selectedMetric === "power" && powerLimit && (
                <ReferenceLine
                  y={powerLimit}
                  stroke="red"
                  strokeDasharray="4 2"
                  label={{
                    value: `Power Limit: ${powerLimit}W`,
                    fill: 'red',
                    fontWeight: 'bold',
                    position: 'top'
                  }}
                />
              )}
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
              <XAxis dataKey="time" stroke="#a3a3a3" axisLine={false} tickLine={false} />
              <YAxis stroke="#a3a3a3" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#121212",
                  border: "1px solid #333333",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
                labelStyle={{ color: "#ffffff", fontWeight: "bold", marginBottom: "5px" }}
                itemStyle={{ color: "#ffffff", padding: "2px 0" }}
                cursor={{ stroke: "rgba(255, 255, 255, 0.2)" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => <span style={{ color: "#a3a3a3" }}>{value}</span>}
              />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
                stroke={getMetricColor()}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy accumulation chart */}
      <div className="bg-dark-200 rounded-xl p-6 border border-dark-100 hover-scale transition-all duration-300">
        <h3 className="text-xl font-semibold mb-6">Energy Accumulation</h3>
        <div className="h-80" ref={energyAccumulationChartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={ecuData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="energyColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8e24aa" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8e24aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
              <XAxis dataKey="time" stroke="#a3a3a3" axisLine={false} tickLine={false} />
              <YAxis stroke="#a3a3a3" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#121212",
                  border: "1px solid #333333",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
                labelStyle={{ color: "#ffffff", fontWeight: "bold", marginBottom: "5px" }}
                itemStyle={{ color: "#ffffff", padding: "2px 0" }}
                cursor={{ stroke: "rgba(255, 255, 255, 0.2)" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => <span style={{ color: "#a3a3a3" }}>{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="energy"
                name="Energy Accumulated"
                stroke="#8e24aa"
                fillOpacity={1}
                fill="url(#energyColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default EnergyData
