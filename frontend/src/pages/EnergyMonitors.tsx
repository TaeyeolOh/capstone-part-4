import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getECUs, getECUById } from "../services/ecuService"
import { getVehicleById } from "../services/vehicleService"
import { getTeamById } from "../services/teamService"
import { ECU } from "../types/ecu"
import { Zap, Battery } from "lucide-react"

const EnergyMonitors = () => {
  const [ecus, setECUs] = useState<ECU[]>([])
  const [ecuDetails, setEcuDetails] = useState<{ [ecuId: string]: { vehicle: any; team: any } | null }>({})

  useEffect(() => {
    const fetchECUs = async () => {
      try {
        const ecus = await getECUs()
        setECUs(ecus)
      } catch (error) {
        console.error("Error fetching ECUs:", error)
      }
    }
    fetchECUs()
  }, [])

  const fetchVehicleAndTeam = async (ecuId: string) => {
    try {
      const ecuObj = await getECUById(ecuId)
      let vehicle = null
      let team = null

      if (ecuObj?.vehicleId) {
        vehicle = await getVehicleById(ecuObj.vehicleId)
        if (vehicle?.teamId) {
          team = await getTeamById(vehicle.teamId)
        }
      }

      return { vehicle, team }
    } catch (error) {
      console.error("Error fetching vehicle and team:", error)
      return { vehicle: null, team: null }
    }
  }

  useEffect(() => {
    if (ecus.length === 0) return;
    const fetchAllDetails = async () => {
      const details: { [ecuId: string]: { vehicle: any; team: any } | null } = {};
      await Promise.all(
        ecus.map(async (ecu) => {
          const data = await fetchVehicleAndTeam(ecu.id);
          details[ecu.id] = data;
        })
      );
      setEcuDetails(details);
    };
    fetchAllDetails();
  }, [ecus]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <h1 className="text-2xl font-bold">Energy Monitors / Aroturuki Pungao</h1>
      </div>
      {ecus.map((ecu) => {
        const latestStatus = ecu.ecuStatusList?.[ecu.ecuStatusList.length - 1];
        const details = ecuDetails[ecu.id];
        return (
          <div key={ecu.id} className="bg-dark-200 rounded-xl overflow-hidden border border-dark-100">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-dark-100 text-light-500 border border-dark-100">
                    <Zap size={16} />
                  </div>
                  <h3 className="text-lg font-bold">{ecu.serialNumber}</h3>
                </div>
              </div>
              {/* Vehicle and Team Info */}
              <div className="mt-4 space-y-1">
                <div className="text-xs text-light-400">
                  <span className="font-semibold">Vehicle:</span>{" "}
                  {details?.vehicle
                    ? details.vehicle.vehicleType
                    : <span className="italic text-light-600">No vehicle assigned</span>}
                </div>
                <div className="text-xs text-light-400">
                  <span className="font-semibold">Team:</span>{" "}
                  {details?.team
                    ? details.team.teamName
                    : <span className="italic text-light-600">No team assigned</span>}
                </div>
              </div>
              {/* Battery Bar */}
              <div className="mt-5 flex items-center">
                <Battery size={20} className="text-light-500 mr-2" />
                <div className="w-full bg-dark-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${details?.vehicle ? "bg-green-500" : "bg-red-500"}`}
                    style={{ width: `100%` }}
                  ></div>
                </div>
              </div>
              {/* Status Info */}
              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-light-500">Voltage:</span>
                  <span className="font-medium">{latestStatus ? `${latestStatus.voltage}V` : "--"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-light-500">Current:</span>
                  <span className="font-medium">{latestStatus ? `${latestStatus.current}A` : "--"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-light-500">Power:</span>
                  <span className="font-medium">{latestStatus ? `${latestStatus.power}W` : "--"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-light-500">Last Sync:</span>
                  <span className="font-medium">{latestStatus ? new Date(latestStatus.timestamp).toLocaleString() : "--"}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnergyMonitors;
