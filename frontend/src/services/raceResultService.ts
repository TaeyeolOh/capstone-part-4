import api from "../lib/api";
import { RaceResult, CompetitionResult } from "../types/raceResult";

export const getAllRaceResults = async (): Promise<RaceResult[]> => {
  const res = await api.get("/api/race-results");
  return res.data;
};

export const getRaceResultById = async (id: string): Promise<RaceResult> => {
  const res = await api.get(`/api/race-results/${id}`);
  return res.data;
};

export const getRaceResultsByEvent = async (eventId: string): Promise<RaceResult[]> => {
  const res = await api.get(`/api/race-results/event/${eventId}`);
  return res.data;
};

export const getRaceResultsByCompetition = async (competitionId: string): Promise<CompetitionResult[]> => {
  const res = await api.get(`/api/race-results/competition/${competitionId}`);
  return res.data;
};

export const updateRaceTime = async (
  id: string, 
  raceTimeMillis: number, 
  raceTimeDisplay: string
): Promise<RaceResult> => {
  const res = await api.put(`/api/race-results/${id}`, {
    raceTimeMillis,
    raceTimeDisplay
  });
  return res.data;
};

export const updateEnergyForEvent = async (eventId: string): Promise<void> => {
  await api.post(`/api/race-results/update-energy/${eventId}`);
};