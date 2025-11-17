import api from "../lib/api";
import { Vehicle } from "../types/vehicle";

export const getVehicleById = async (id: string): Promise<Vehicle> => {
  try {
    console.log(`Fetching vehicle with ID: ${id}`);
    const res = await api.get(`/api/vehicles/${id}`);
    
    const item = res.data;
    console.log(`Vehicle fetched successfully:`, item);
    
    return {
      id: item.id,
      vehicleType: item.vehicleType,
      vehicleClass: item.vehicleClass,
      teamId: item.teamId,
      ecuId: item.ecuId,
    };
  } catch (error) {
    console.error(`Error fetching vehicle with ID ${id}:`, error);
    throw error;
  }
};

export const getVehiclesByTeamId = async (teamId: string): Promise<Vehicle[]> => {
  try {
    console.log(`Fetching vehicles for team with ID: ${teamId}`);
    const res = await api.get(`/api/vehicles/getByTeamId/${teamId}`);
    
    const rawData = res.data as any[];
    console.log(`Fetched ${rawData.length} vehicles for team ${teamId}`);
    
    return rawData.map((item) => ({
      id: item.id,
      vehicleType: item.vehicleType,
      vehicleClass: item.vehicleClass,
      teamId: item.teamId,
      ecuId: item.ecuId,
    }));
  } catch (error) {
    console.error(`Error fetching vehicles for team ${teamId}:`, error);
    throw error;
  }
};

// New function to get only ECU-configured vehicles for a team
export const getECUConfiguredVehiclesByTeamId = async (teamId: string): Promise<Vehicle[]> => {
  try {
    console.log(`Fetching ECU-configured vehicles for team with ID: ${teamId}`);
    const res = await api.get(`/api/vehicles/getECUConfiguredByTeamId/${teamId}`);
    
    const rawData = res.data as any[];
    console.log(`Fetched ${rawData.length} ECU-configured vehicles for team ${teamId}`);
    
    return rawData.map((item) => ({
      id: item.id,
      vehicleType: item.vehicleType,
      vehicleClass: item.vehicleClass,
      teamId: item.teamId,
      ecuId: item.ecuId,
    }));
  } catch (error) {
    console.error(`Error fetching ECU-configured vehicles for team ${teamId}:`, error);
    throw error;
  }
};

export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    console.log("Fetching all vehicles");
    const res = await api.get("/api/vehicles");
    
    const rawData = res.data as any[];
    console.log(`Fetched ${rawData.length} vehicles`);
    
    return rawData.map((item) => ({
      id: item.id,
      vehicleType: item.vehicleType,
      vehicleClass: item.vehicleClass,
      teamId: item.teamId,
      ecuId: item.ecuId,
    }));
  } catch (error) {
    console.error("Error fetching all vehicles:", error);
    throw error;
  }
};

export const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'teamId' | 'ecuId'>): Promise<Vehicle> => {
  try {
    console.log("Creating vehicle with data:", vehicle);
    const res = await api.post("/api/vehicles", vehicle);
    
    const item = res.data;
    console.log("Vehicle created successfully:", item);
    
    return {
      id: item.id,
      vehicleType: item.vehicleType,
      vehicleClass: item.vehicleClass,
      teamId: item.teamId,
      ecuId: item.ecuId,
    };
  } catch (error) {
    console.error("Error creating vehicle:", error);
    throw error;
  }
};

export const registerVehicleToTeam = async (vehicleId: string, teamId: string): Promise<Vehicle> => {
  try {
    console.log(`Registering vehicle ${vehicleId} to team ${teamId}`);
    const res = await api.post(`/api/vehicles/${vehicleId}/registerToTeam/${teamId}`);
    
    const item = res.data;
    console.log("Vehicle registered to team successfully:", item);
    
    return {
      id: item.id,
      vehicleType: item.vehicleType,
      vehicleClass: item.vehicleClass,
      teamId: item.teamId,
      ecuId: item.ecuId,
    };
  } catch (error) {    console.error(`Error registering vehicle ${vehicleId} to team ${teamId}:`, error);
    throw error;
  }
};

export const setECUForVehicle = async (vehicleId: string, ecuSerialNumber: string): Promise<Vehicle> => {
  try {
    console.log(`Setting ECU ${ecuSerialNumber} for vehicle ${vehicleId}`);
    const res = await api.post(`/api/ecus/serial/${ecuSerialNumber}/registerToVehicle/${vehicleId}`);
    
    const item = res.data;
    console.log("ECU set for vehicle successfully:", item);
    
    return {
      id: item.id,
      vehicleType: item.vehicleType,
      vehicleClass: item.vehicleClass,
      teamId: item.teamId,
      ecuId: item.ecuId,
    };
  } catch (error) {
    console.error(`Error setting ECU ${ecuSerialNumber} for vehicle ${vehicleId}:`, error);
    throw error;
  }
};