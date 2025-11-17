import type React from "react";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createEvent } from "../services/eventService";

type FormData = {
  competitionId: string;
  name: string;
  eventType: string;
  vehicleCount: string;
  startTime: string;
  endTime: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

export default function CreateEventPage() {
  const navigate = useNavigate();
  const location = useLocation();


  const passedCompetitionId = location.state?.competitionID || "";
  const passedCompetitionName = location.state?.competitionName || "";
  console.log("Passed Competition ID:", passedCompetitionId);


  const [formData, setFormData] = useState<FormData>({
    competitionId: passedCompetitionId,
    name: "",
    eventType: "",
    vehicleCount: "",
    startTime: "",
    endTime: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");


  useEffect(() => {
    setFormData((prev) => ({ ...prev, competitionId: passedCompetitionId }));
  }, [passedCompetitionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    let valid = true;

    if (!formData.competitionId.trim()) {
      newErrors.competitionId = "Competition ID is required";
      valid = false;
    }

    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
      valid = false;
    }

    if (!formData.eventType.trim()) {
      newErrors.eventType = "Event type is required";
      valid = false;
    }

    const vehicleCountNum = Number(formData.vehicleCount);
    if (!formData.vehicleCount.trim() || isNaN(vehicleCountNum) || vehicleCountNum < 0) {
      newErrors.vehicleCount = "Valid number of vehicles is required";
      valid = false;
    }

    if (!formData.startTime.trim() || isNaN(Date.parse(formData.startTime))) {
      newErrors.startTime = "Valid start time is required";
      valid = false;
    }

    if (!formData.endTime.trim() || isNaN(Date.parse(formData.endTime))) {
      newErrors.endTime = "Valid end time is required";
      valid = false;
    } else if (Date.parse(formData.endTime) <= Date.parse(formData.startTime)) {
      newErrors.endTime = "End time must be after start time";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError("");

    try {
      const eventPayload = {
        competitionId: formData.competitionId.trim(),
        name: formData.name.trim(),
        eventType: formData.eventType.trim(),
        ecuIds: Array.from({ length: Number(formData.vehicleCount) }, (_, i) => `ecu-${i + 1}`),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      await createEvent(eventPayload);
      console.log("Passing Competition ID:", formData.competitionId);
      navigate("/events", { state: { competitionID: passedCompetitionId, competitionName: passedCompetitionName } });
    } catch (error) {
      console.error("Error creating event:", error);
      setFormError("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-400 text-light-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">Create New Event</span>
          </h1>
          <p className="text-light-500 mt-2">Create a new event and assign vehicle slots</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {formError && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Display Competition ID instead of editable input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-light-300">
              Competition ID
            </label>
            <div className="px-4 py-3 bg-dark-300 border border-dark-100 rounded-md text-light-200 select-text">
              {formData.competitionId || <span className="italic text-light-500">No competition ID provided</span>}
            </div>
            {errors.competitionId && <p className="text-red-500 text-sm">{errors.competitionId}</p>}
          </div>

          {/* Event Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-light-300">
              Event Name <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter event name"
              className={`w-full px-4 py-3 bg-dark-300 border ${errors.name ? "border-red-500" : "border-dark-100"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <label htmlFor="eventType" className="block text-sm font-medium text-light-300">
              Event Type <span className="text-accent1-DEFAULT">*</span>
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-dark-300 border ${errors.eventType ? "border-red-500" : "border-dark-100"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            >
              <option value="">Select event type</option>
              <option value="Performance">Performance</option>
              <option value="Qualification">Qualification</option>
              <option value="Practice">Practice</option>
            </select>
            {errors.eventType && <p className="text-red-500 text-sm">{errors.eventType}</p>}
          </div>

          {/* Number of Vehicles */}
          <div className="space-y-2">
            <label htmlFor="vehicleCount" className="block text-sm font-medium text-light-300">
              Number of Vehicles <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="number"
              id="vehicleCount"
              name="vehicleCount"
              value={formData.vehicleCount}
              onChange={handleChange}
              placeholder="Enter number of vehicles"
              className={`w-full px-4 py-3 bg-dark-300 border ${errors.vehicleCount ? "border-red-500" : "border-dark-100"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
              min={0}
            />
            {errors.vehicleCount && <p className="text-red-500 text-sm">{errors.vehicleCount}</p>}
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <label htmlFor="startTime" className="block text-sm font-medium text-light-300">
              Start Time <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-dark-300 border ${errors.startTime ? "border-red-500" : "border-dark-100"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <label htmlFor="endTime" className="block text-sm font-medium text-light-300">
              End Time <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="datetime-local"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-dark-300 border ${errors.endTime ? "border-red-500" : "border-dark-100"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={() => navigate("/events", { state: { competitionID: passedCompetitionId, competitionName: passedCompetitionName } })}
              className="px-6 py-3 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-3 rounded-md text-sm font-semibold bg-blue-800 hover:bg-blue-900 text-white transition-colors
    ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}
  `}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
