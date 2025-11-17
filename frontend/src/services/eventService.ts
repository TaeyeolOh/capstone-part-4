import api from "../lib/api";
import { Event } from "../types/event";

export const getAllEvents = async (): Promise<Event[]> => {
  const res = await api.get("/api/events");
  return res.data;
};

export const getEventsByCompetitionId = async (competitionId: string): Promise<Event[]> => {
  const res = await api.get(`/api/events/competition/${competitionId}`);
  return res.data;
};

export const getEventById = async (eventId: string): Promise<Event> => {
  const res = await api.get(`/api/events/${eventId}`);
  return res.data;
};

export const createEvent = async (event: Partial<Event>): Promise<Event> => {
  const res = await api.post("/api/events", event);
  return res.data;
};

export const registerECUToEvent = async (eventId: string, ecuId: string): Promise<Event> => {
  const res = await api.post(`/api/events/${eventId}/registerEcu/${ecuId}`);
  return res.data;
};

export const setCompetitionForEvent = async (eventId: string, competitionId: string): Promise<Event> => {
  const res = await api.post(`/api/events/${eventId}/setCompetition/${competitionId}`);
  return res.data;
};

// Updated to support vehicle registration
export const registerTeamToEvent = async (eventId: string, teamId: string, vehicleId?: string): Promise<Event> => {
  if (vehicleId) {
    // Use the new endpoint with vehicle selection
    const res = await api.post(`/api/events/${eventId}/registerTeam/${teamId}/withVehicle/${vehicleId}`);
    return res.data;
  } else {
    // Use the old endpoint for backward compatibility
    const res = await api.post(`/api/events/${eventId}/registerTeam/${teamId}`);
    return res.data;
  }
};