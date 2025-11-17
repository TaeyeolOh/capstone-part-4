import api from "../lib/api";
import { Team } from "../types/team";

export const getAllTeams = async (): Promise<Team[]> => {
  const res = await api.get("/api/teams", {});
  
  const rawData = res.data as any[];
  
  return rawData.map((item) => ({
    id: item.id,
    teamNumber: item.teamNumber,
    teamName: item.teamName,
    schoolName: item.schoolName,
    vehicleIds: item.vehicleIds || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};

export const getTeamById = async (id: string): Promise<Team> => {
  const res = await api.get(`/api/teams/${id}`, {});
  
  const item = res.data;
  
  return {
    id: item.id,
    teamNumber: item.teamNumber,
    teamName: item.teamName,
    schoolName: item.schoolName,
    vehicleIds: item.vehicleIds || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const createTeam = async (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> => {
  const res = await api.post("/api/teams", team);
  
  const item = res.data;
  
  return {
    id: item.id,
    teamNumber: item.teamNumber,
    teamName: item.teamName,
    schoolName: item.schoolName,
    vehicleIds: item.vehicleIds || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const getTeamsByCompetitionId = async (competitionId: string): Promise<Team[]> => {
  const res = await api.get(`/api/teams/getByCompId/${competitionId}`, {});
  
  const rawData = res.data as any[];
  
  return rawData.map((item) => ({
    id: item.id,
    teamNumber: item.teamNumber,
    teamName: item.teamName,
    schoolName: item.schoolName,
    vehicleIds: item.vehicleIds || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};