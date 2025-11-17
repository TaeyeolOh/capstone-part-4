export interface Competition  {
    id: string;
    name: string;
    description: string;
    location: string;
    teamIds: string[];
    eventIds: string[];
    date: string;
    isFinal: boolean;
    createdAt: string;
    updatedAt: string;
};
