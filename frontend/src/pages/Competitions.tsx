import { Plus, Calendar, MapPin, Flag } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Competition } from "../types/competition"
import { getAllCompetitions } from "../services/competitionService"
import { useEffect, useState } from "react"

const Competitions = () => {
  const navigate = useNavigate()

  const handleCreateCompetitions = () => {
    navigate("/add-competition")
  }

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllCompetitions()
        console.log("Competitions data:", data)
        setCompetitions(data)
      } catch (err) {
        console.error("Failed to load competitions:", err)
        setError("Failed to load competitions.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading competitions...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Competitions / Ngā Whakataetae</h2>
        <button
          onClick={handleCreateCompetitions}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={18} className="mr-2" />
          Create A Competition
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitions.map((comp) => {
          const eventDate = new Date(comp.date)
          const today = new Date()
          const isCompleted = eventDate < today
          return (
            <div key={comp.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold">{comp.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${isCompleted ? "bg-green-900 text-green-300" : "bg-blue-900 text-blue-300"
                      }`}
                  >
                    {isCompleted ? "Completed" : "Upcoming"}
                  </span>
                </div>
                <p className="mt-2 text-gray-400">{comp.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <span>{new Date(comp.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    <span>{comp.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Flag size={16} className="mr-2 text-gray-400" />
                    <span>{comp.eventIds.length} Events</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 px-6 py-3 flex justify-between">
                <button className="text-sm text-blue-400 hover:text-blue-300" onClick={() => {
                  console.log("Navigating to events with state:", { competitionID: comp.id, competitionName: comp.name });
                  navigate("/events", {
                    state: { competitionID: comp.id, competitionName: comp.name }
                  });
                }}>
                  Manage Events
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div >
  )
}

export default Competitions
