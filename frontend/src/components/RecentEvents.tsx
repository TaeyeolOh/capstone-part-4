import { Calendar } from "lucide-react"
import { getAllEvents } from "../services/eventService"
import { useEffect, useState } from "react"
import { Event } from "../types/event"

const RecentEvents = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getAllEvents()
        setEvents(fetchedEvents)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching events:", error)
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

return (
  <div className="space-y-4">
    {events.map((event) => {
      const now = new Date();
      const eventEnd = new Date(event.endTime);
      const isCompleted = eventEnd < now;

      return (
        <div
          key={event.id}
          className="p-4 bg-dark-300 rounded-lg border border-dark-100 hover:scale-[1.02] transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-lg">{event.name}</h4>
              <p className="text-sm text-light-500 mt-1">
                {event.eventType.replace(/_/g, ' ')}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                isCompleted
                  ? "bg-green-900/30 text-green-400 border border-green-800"
                  : "bg-accent2-DEFAULT/20 text-accent2-light border border-accent2-DEFAULT/40"
              }`}
            >
              {isCompleted ? "Completed" : "Upcoming"}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-sm text-light-500">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5" />
              <span>
                {new Date(event.startTime).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="font-medium text-light-300">Start Time: </span>
              <span>
                {new Date(event.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'UTC'
                })}
              </span>
            </div>
            <div>
              <span className="font-medium text-light-300">End Time: </span>
              <span>
                {new Date(event.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'UTC'
                })}
              </span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);


}

export default RecentEvents

