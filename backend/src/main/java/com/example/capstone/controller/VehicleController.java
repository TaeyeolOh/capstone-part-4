package com.example.capstone.controller;

import com.example.capstone.model.Vehicle;
import com.example.capstone.dto.VehicleDTO;
import com.example.capstone.service.VehicleService;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
	private final VehicleService vehicleService;

	public VehicleController(VehicleService vehicleService) {
		this.vehicleService = vehicleService;
	}

	@GetMapping
    public List<Vehicle> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

	@PostMapping
	public Vehicle createVehicle(@Valid  @RequestBody Vehicle vehicle) {
		return vehicleService.createVehicle(vehicle);
	}

	@PostMapping("/{vehicleId}/registerToTeam/{teamId}")
    public ResponseEntity<?> registerVehicleToTeam(
            @PathVariable String vehicleId, 
            @PathVariable String teamId) {
        try {
            Vehicle vehicle = vehicleService.registerVehicleToTeam(vehicleId, teamId);
            return ResponseEntity.ok(vehicle);
        } catch (IllegalArgumentException e) {
            // Specific error handling for known error cases
            String errorMessage = e.getMessage();
            
            if (errorMessage.contains("Team already has a vehicle registered")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "error", "team_has_vehicle",
                        "message", "This team already has a vehicle assigned. Please select a different team.",
                        "vehicleId", vehicleId,
                        "teamId", teamId
                    ));
            } else if (errorMessage.contains("Vehicle is already registered to a team")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "error", "vehicle_has_team",
                        "message", "This vehicle is already assigned to a team.",
                        "vehicleId", vehicleId
                    ));
            } else if (errorMessage.contains("Vehicle not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "error", "vehicle_not_found",
                        "message", "The selected vehicle could not be found.",
                        "vehicleId", vehicleId
                    ));
            } else if (errorMessage.contains("Team not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "error", "team_not_found",
                        "message", "The selected team could not be found.",
                        "teamId", teamId
                    ));
            } else {
                // Generic error case
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "error", "assignment_failed",
                        "message", errorMessage
                    ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "server_error",
                    "message", "Error registering vehicle to team: " + e.getMessage()
                ));
        }
    }

	@GetMapping("/{vehicleId}")
	public Vehicle getVehicleById(@PathVariable String vehicleId) {
		return vehicleService.getVehicleById(vehicleId);
	}

	@GetMapping("/getByTeamId/{teamId}")
    public ResponseEntity<?> getVehiclesByTeamId(@PathVariable String teamId) {
        try {
            System.out.println("Controller: Getting vehicles for team ID: " + teamId);
            List<Vehicle> vehicles = vehicleService.getVehiclesByTeamId(teamId);
            System.out.println("Controller: Returning " + vehicles.size() + " vehicles");
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            System.err.println("Controller error retrieving vehicles for team " + teamId + ": " + e.getMessage());
            // Return empty list instead of error
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // New endpoint for ECU-configured vehicles
    // Add this endpoint to your existing VehicleController.java

@GetMapping("/getECUConfiguredByTeamId/{teamId}")
public ResponseEntity<?> getECUConfiguredVehiclesByTeamId(@PathVariable String teamId) {
    try {
        System.out.println("Controller: Getting ECU-configured vehicles for team ID: " + teamId);
        List<Vehicle> vehicles = vehicleService.getECUConfiguredVehiclesByTeamId(teamId);
        System.out.println("Controller: Returning " + vehicles.size() + " ECU-configured vehicles");
        return ResponseEntity.ok(vehicles);
    } catch (Exception e) {
        System.err.println("Controller error retrieving ECU-configured vehicles for team " + teamId + ": " + e.getMessage());
        // Return empty list instead of error
        return ResponseEntity.ok(new ArrayList<>());
    }
}

    @GetMapping("/getByEventId/{eventId}")
    public List<Vehicle> getVehiclesByEventId(@PathVariable String eventId) {
        return vehicleService.getVehiclesByEventId(eventId);
    }
}