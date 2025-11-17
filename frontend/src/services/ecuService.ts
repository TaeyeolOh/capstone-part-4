import api from "../lib/api";
import { ECU } from "../types/ecu";


export const getECUById = async (ecuId: string): Promise<ECU> => {
  const response = await api.get(`/api/ecus/${ecuId}`);
  return response.data;
};

export const getECUs = async (): Promise<ECU[]> => {
  const response = await api.get("/api/ecus");
  return response.data;
};
