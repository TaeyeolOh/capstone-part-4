export interface Team {
  id?: string;
  teamNumber: number;
  teamName: string;
  schoolName: string;
  vehicleIds: string[];
  createdAt?: string;
  updatedAt?: string;
}