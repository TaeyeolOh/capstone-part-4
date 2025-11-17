package com.example.capstone.model;

import com.example.capstone.dto.VehicleDTO;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "vehicles")
public class Vehicle {

    @Id
    private String id;

    @NotBlank
    private String vehicleType;

    @NotBlank
    private String vehicleClass;

    private String teamId;

    private String ecuId;

    public Vehicle modifyVehicle(VehicleDTO vehicleDTO) {
        if (vehicleDTO.getVehicleType() != null) {
            this.vehicleType = vehicleDTO.getVehicleType();
        }
        if (vehicleDTO.getVehicleClass() != null) {
            this.vehicleClass = vehicleDTO.getVehicleClass();
        }
        return this;
    }
}
