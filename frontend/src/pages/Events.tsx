import { Flag, Plus, Truck } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { getEventsByCompetitionId } from "../services/eventService"
import { Event } from "../types/event"
import { useEffect, useState } from "react"

const Events = () => {

  const location = useLocation()
  const navigate = useNavigate()

  const competitionName = location.state?.competitionName || "Competition Name"
  const competitionID = location.state?.competitionID || "Competition ID"


  const [eventDetails, setEventDetails] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!competitionID) return;

    const fetchEvents = async () => {
      try {
        const data = await getEventsByCompetitionId(competitionID);
        setEventDetails(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [competitionID]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Events for {competitionName}</h2>

      <button
        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => navigate("/create-event", { state: { competitionID, competitionName } })}
      >
        Create Event
        <Plus size={18} className="mr-2" />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventDetails.map((event) => (
          <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-bold">{event.name}</h3>
              <div className="mt-4 flex items-center text-sm text-gray-400">
                <Flag size={16} className="mr-2" />
                <span>{event.eventType}</span>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-400">
                <Truck size={16} className="mr-2" />
                <span>{event.ecuIds.length} Vehicles</span>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-400">
                <span className="text-sm font-semibold">Start Time:</span>
                <span className="ml-2">{new Date(event.startTime).toLocaleString()}</span>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-400">
                <span className="text-sm font-semibold">End Time:</span>
                <span className="ml-2">{new Date(event.endTime).toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-gray-700 px-6 py-3 flex justify-end">
            </div>
          </div>
        ))}
      </div>
      <button
        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => navigate("/competitions", { state: { competitionID, competitionName } })}
      >
        Back
      </button>
    </div>
  );
};

export default Events;
