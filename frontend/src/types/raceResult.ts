export interface RaceResult {
  id: string;
  eventId: string;
  teamId: string;
  vehicleId: string;
  competitionId: string;
  raceTimeMillis: number;
  raceTimeDisplay: string;
  points: number;
  position: number;
  vehicleClass: string;
  vehicleType: string;
  teamName: string;
  eventName: string;
  energyConsumed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionResult {
  teamId: string;
  teamName: string;
  totalPoints: number;
  eventCount: number;
  results: RaceResult[];
}