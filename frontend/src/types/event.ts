export interface Event {   
    id: string;
    competitionId: string;
    name: string;
    eventType: string;
    ecuIds: string[];
    teamIds?: string[];
    startTime: string;
    endTime: string;
    createdAt: string;
}

