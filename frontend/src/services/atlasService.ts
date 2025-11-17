import api from "../lib/api";

export const uploadToAtlas = async () => {
  const res = await api.post<string>("/api/db/upload-to-atlas");
  return res.data;
};

export const pullFromAtlas = async () => {
  const res = await api.post<string>("/api/db/pull-from-atlas");
  return res.data; 
};

export const checkSyncStatus = async () => {
  const res = await api.get<string>("/api/db/sync-status");
  return res.data;
};
