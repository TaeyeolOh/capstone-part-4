import { ECUStatus } from "./ecustatus";

    export interface ECU {  
        id: string;
        serialNumber: string;
        vehicleId: string;
        ecuStatusList: ECUStatus[];
        createdAt: Date;
        updatedAt: Date;
    }

