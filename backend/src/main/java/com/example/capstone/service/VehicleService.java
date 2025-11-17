package com.example.capstone.service;

import com.example.capstone.model.Event;
import com.example.capstone.dto.VehicleDTO;
import com.example.capstone.model.Team;
import com.example.capstone.model.Vehicle;
import com.example.capstone.repository.EventRepository;
import com.example.capstone.repository.TeamRepository;
import com.example.capstone.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class VehicleService {
	VehicleRepository vehicleRepository;
	TeamRepository teamRepository;
	EventRepository eventRepository;

	public VehicleService(VehicleRepository vehicleRepository, TeamRepository teamRepository, EventRepository eventRepository) {
		this.vehicleRepository = vehicleRepository;
		this.teamRepository = teamRepository;
		this.eventRepository = eventRepository;
	}

	public List<Vehicle> getAllVehicles() {
		return vehicleRepository.findAll();
	}

	public Vehicle createVehicle(Vehicle vehicle) {
		// check that class is either Standard or Open
		if(!(vehicle.getVehicleClass().equals("Standard") || vehicle.getVehicleClass().equals("Open"))) {
			throw new IllegalArgumentException("Invalid vehicle class: " + vehicle.getVehicleClass());
		}
		// check that type is either Bike or Kart
		if(!(vehicle.getVehicleType().equals("Bike") || vehicle.getVehicleType().equals("Kart"))) {
			throw new IllegalArgumentException("Invalid vehicle type: " + vehicle.getVehicleType());
		}
		vehicle.setEcuId(null);
		vehicle.setTeamId(null);
		return vehicleRepository.save(vehicle);
	}

	public Vehicle registerVehicleToTeam(String vehicleId, String teamId) {
        System.out.println("Registering vehicle " + vehicleId + " to team " + teamId);
        
        try {
            Vehicle vehicle = getVehicleById(vehicleId);
            Team team = teamRepository.findById(teamId).orElse(null);
            
            if (vehicle == null) {
                System.err.println("Vehicle not found with ID: " + vehicleId);
                throw new IllegalArgumentException("Vehicle not found with ID: " + vehicleId);
            }
            
            if (team == null) {
                System.err.println("Team not found with ID: " + teamId);
                throw new IllegalArgumentException("Team not found with ID: " + teamId);
            }
            
            // Check if the vehicle is already registered to a team
            if (vehicle.getTeamId() != null) {
                System.err.println("Vehicle is already registered to team: " + vehicle.getTeamId());
                throw new IllegalArgumentException("Vehicle is already registered to a team");
            }
            
            // Initialize the vehicleIds list if it's null
            if (team.getVehicleIds() == null) {
                team.setVehicleIds(new ArrayList<>());
            }
            
            // make sure team only has one vehicle
            if (!team.getVehicleIds().isEmpty()) {
                System.err.println("Team already has vehicles registered: " + team.getVehicleIds());
                throw new IllegalArgumentException("Team already has a vehicle registered");
            }
            
            // Add vehicle to team and save
            team.getVehicleIds().add(vehicleId);
            teamRepository.save(team);
            System.out.println("Updated team with vehicle ID");
            
            // Update vehicle with team ID and save
            vehicle.setTeamId(teamId);
            vehicle = vehicleRepository.save(vehicle);
            System.out.println("Updated vehicle with team ID");
            
            return vehicle;
        } catch (Exception e) {
            System.err.println("Error registering vehicle to team: " + e.getMessage());
            throw e;
        }
    }

	public Vehicle getVehicleById(String vehicleId) {
		return vehicleRepository.findById(vehicleId).orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
	}

	public List<Vehicle> getVehiclesByEventId(String eventId) {
		Event event = eventRepository.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));
		List<String> vehicleIds = event.getEcuIds();
		return vehicleRepository.findByEcuIdIsIn(vehicleIds);
	}

	public Vehicle modifyVehicle(String vehicleId, VehicleDTO vehicleDTO) {
		return vehicleRepository.save(getVehicleById(vehicleId).modifyVehicle(vehicleDTO));
	}

	public void deleteVehicle(String vehicleId) {
		Vehicle vehicle = getVehicleById(vehicleId);
		// deregister the vehicle from the team if it is registered
		if (vehicle.getTeamId() != null) {
			Team team = teamRepository.findById(vehicle.getTeamId()).orElse(null);
			if (team != null) {
				team.getVehicleIds().remove(vehicleId);
				teamRepository.save(team);
			}
		}
		vehicleRepository.delete(vehicle);
	}

	public List<Vehicle> getVehiclesByTeamId(String teamId) {
        System.out.println("Getting vehicles for team ID: " + teamId);

        try {
            // First check if the team exists
            Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));

            // Method 1: Direct query for vehicles that have this teamId
            List<Vehicle> vehiclesWithTeamId = vehicleRepository.findByTeamId(teamId);
            System.out.println("Found " + vehiclesWithTeamId.size() + " vehicles with teamId reference");

            // Method 2: Get vehicles from the team's vehicleIds array
            List<Vehicle> vehiclesFromTeamList = new ArrayList<>();
            if (team.getVehicleIds() != null && !team.getVehicleIds().isEmpty()) {
                vehiclesFromTeamList = vehicleRepository.findAllById(team.getVehicleIds());
                System.out.println("Found " + vehiclesFromTeamList.size() + " vehicles from team's vehicleIds list");
            }

            // Combine both lists and remove duplicates
            Set<Vehicle> combinedVehicles = new HashSet<>(vehiclesWithTeamId);
            combinedVehicles.addAll(vehiclesFromTeamList);

            List<Vehicle> result = new ArrayList<>(combinedVehicles);
            System.out.println("Returning total of " + result.size() + " vehicles for team");
            return result;
        } catch (Exception e) {
            System.err.println("Error retrieving vehicles for team " + teamId + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Vehicle> getECUConfiguredVehiclesByTeamId(String teamId) {
    System.out.println("Getting ECU-configured vehicles for team ID: " + teamId);
    
    try {
        // Get all vehicles for the team first
        List<Vehicle> teamVehicles = getVehiclesByTeamId(teamId);
        
        // Filter only vehicles that have an ECU configured (ecuId is not null and not empty)
        List<Vehicle> ecuConfiguredVehicles = teamVehicles.stream()
            .filter(vehicle -> vehicle.getEcuId() != null && !vehicle.getEcuId().trim().isEmpty())
            .collect(Collectors.toList());
        
        System.out.println("Found " + ecuConfiguredVehicles.size() + " ECU-configured vehicles for team " + teamId);
        return ecuConfiguredVehicles;
    } catch (Exception e) {
        System.err.println("Error retrieving ECU-configured vehicles for team " + teamId + ": " + e.getMessage());
        return new ArrayList<>();
    }
}
}
