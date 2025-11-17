import api from "../lib/api";
import { Competition } from "../types/competition";

export const getAllCompetitions = async (): Promise<Competition[]> => {
    const res = await api.get("/api/competitions", {
    });
  
    const rawData = res.data as any[];
  
    return rawData.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      location: item.location,
      teamIds: item.teamIds,
      eventIds: item.eventIds,
      date: item.date,
      isFinal: item.isFinal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  };


export const getCompetitionById = async (id: string): Promise<Competition> => {
  const res = await api.get(`/api/competitions/${id}`);
  return res.data;
};


export const createCompetition = async (competition: Partial<Competition>): Promise<Competition> => {
  const res = await api.post("/api/competitions", competition);
  return res.data;
};


export const addTeamToCompetition = async (
  competitionId: string,
  teamId: string
): Promise<Competition> => {
  const res = await api.post(`/api/competitions/${competitionId}/registerTeam/${teamId}`);
  return res.data;
};
  