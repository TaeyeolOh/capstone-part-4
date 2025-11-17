package com.example.capstone.service;

import com.example.capstone.dto.EventDTO;
import com.example.capstone.model.Competition;
import com.example.capstone.model.ECU;
import com.example.capstone.model.Event;
import com.example.capstone.model.Vehicle;
import com.example.capstone.model.Team;
import com.example.capstone.repository.CompetitionRepository;
import com.example.capstone.repository.ECURepository;
import com.example.capstone.repository.EventRepository;
import com.example.capstone.repository.VehicleRepository;
import com.example.capstone.repository.TeamRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.ArrayList;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final CompetitionRepository competitionRepository;
    private final ECURepository ecuRepository;
    private final VehicleRepository vehicleRepository;
    private final TeamRepository teamRepository;
    private final RaceResultService raceResultService; // Add this

    public EventService(EventRepository eventRepository, CompetitionRepository competitionRepository, 
                       ECURepository ecuRepository, VehicleRepository vehicleRepository,
                       TeamRepository teamRepository, RaceResultService raceResultService) { // Add to constructor
        this.eventRepository = eventRepository;
        this.competitionRepository = competitionRepository;
        this.ecuRepository = ecuRepository;
        this.vehicleRepository = vehicleRepository;
        this.teamRepository = teamRepository;
        this.raceResultService = raceResultService; // Initialize
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(Event event) {
        Competition competition = competitionRepository.findById(event.getCompetitionId()).orElse(null);
        if (competition == null) {
            throw new IllegalArgumentException("Competition not found");
        }
        
        // Initialize teamIds as an empty ArrayList if it's null
        if (event.getTeamIds() == null) {
            event.setTeamIds(new ArrayList<>());
        }
        
        Event newEvent = eventRepository.save(event);
        List<String> eventIds = competition.getEventIds();
        eventIds.add(newEvent.getId());
        competitionRepository.save(competition);
        return newEvent;
    }

    public List<Event> getEventsByCompetitionId(String competitionId) {
        return eventRepository.findByCompetitionId(competitionId);
    }

    public Event getEventById(String eventId) {
        return eventRepository.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    public Event registerECUToEvent(String eventId, String ecuId) {
        ECU ecu = ecuRepository.findById(ecuId).orElseThrow(() -> new IllegalArgumentException("ECU not found"));
        String vehicleId = ecu.getVehicleId();
        if (vehicleId == null) {
            throw new IllegalArgumentException("ECU is not assigned to a vehicle");
        }
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow(() -> new RuntimeException("Vehicle not found"));
        String teamId = vehicle.getTeamId();
        if (teamId == null) {
            throw new IllegalArgumentException("Vehicle is not assigned to a team");
        }
        Event event = getEventById(eventId);
        Competition competition = competitionRepository.findById(event.getCompetitionId()).orElseThrow(() -> new RuntimeException("Competition not found"));
        List<String> teamIds = competition.getTeamIds();
        if (!teamIds.contains(teamId)) {
            throw new IllegalArgumentException("Team is not registered to the event's competition");
        }
        List<String> eventEcuIds = event.getEcuIds();
        if (eventEcuIds.contains(ecuId)) {
            throw new IllegalArgumentException("ECU is already registered to the event");
        }
        eventEcuIds.add(ecuId);
        return eventRepository.save(event);
    }

    // Enhanced method to register team with vehicle to event
    public Event registerTeamToEvent(String eventId, String teamId, String vehicleId) {
        try {
            System.out.println("Registering team " + teamId + " with vehicle " + vehicleId + " to event " + eventId);
            
            // Verify that the team exists
            Team team = teamRepository.findById(teamId).orElseThrow(() -> 
                new IllegalArgumentException("Team not found with ID: " + teamId));
            
            // Verify that the vehicle exists and belongs to the team
            Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow(() ->
                new IllegalArgumentException("Vehicle not found with ID: " + vehicleId));
            
            if (!teamId.equals(vehicle.getTeamId())) {
                throw new IllegalArgumentException("Vehicle does not belong to the specified team");
            }
            
            // Verify that the vehicle has an ECU configured
            if (vehicle.getEcuId() == null || vehicle.getEcuId().trim().isEmpty()) {
                throw new IllegalArgumentException("Vehicle must have an ECU configured to register for events");
            }
            
            // Get the event
            Event event = getEventById(eventId);
            System.out.println("Found event: " + event.getName() + " (ID: " + event.getId() + ")");
            
            // Get the competition associated with this event
            Competition competition = competitionRepository.findById(event.getCompetitionId())
                .orElseThrow(() -> new RuntimeException("Competition not found with ID: " + event.getCompetitionId()));
            System.out.println("Found competition: " + competition.getName() + " (ID: " + competition.getId() + ")");
            
            // Make sure the team is part of the competition
            List<String> competitionTeamIds = competition.getTeamIds();
            if (!competitionTeamIds.contains(teamId)) {
                // If team is not already in the competition, add it
                System.out.println("Adding team to competition: " + teamId);
                competitionTeamIds.add(teamId);
                competition = competitionRepository.save(competition);
            }
            
            // Initialize the teamIds list if it doesn't exist
            if (event.getTeamIds() == null) {
                System.out.println("Initializing teamIds list");
                event.setTeamIds(new ArrayList<>());
            }
            
            // Initialize the ecuIds list if it doesn't exist
            if (event.getEcuIds() == null) {
                System.out.println("Initializing ecuIds list");
                event.setEcuIds(new ArrayList<>());
            }
            
            // Check if team is already registered to this event
            List<String> eventTeamIds = event.getTeamIds();
            if (eventTeamIds.contains(teamId)) {
                throw new IllegalArgumentException("Team is already registered to this event");
            }
            
            // Check if the vehicle's ECU is already registered to this event
            List<String> eventEcuIds = event.getEcuIds();
            if (eventEcuIds.contains(vehicle.getEcuId())) {
                throw new IllegalArgumentException("This vehicle's ECU is already registered to this event");
            }
            
            // Add team to event
            System.out.println("Adding team to event: " + teamId);
            eventTeamIds.add(teamId);
            
            // Add the vehicle's ECU to the event
            System.out.println("Adding ECU to event: " + vehicle.getEcuId());
            eventEcuIds.add(vehicle.getEcuId());
            
            Event savedEvent = eventRepository.save(event);
            
            // Create race result entry for this team/vehicle/event
            try {
                raceResultService.createRaceResult(eventId, teamId, vehicleId);
                System.out.println("Created race result entry for team " + teamId);
            } catch (Exception e) {
                System.err.println("Error creating race result: " + e.getMessage());
                // Don't fail the registration if race result creation fails
            }
            
            return savedEvent;
        } catch (Exception e) {
            System.err.println("Error in registerTeamToEvent method: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Keep the old method for backward compatibility (without vehicle selection)
    public Event registerTeamToEvent(String eventId, String teamId) {
        try {
            // Verify that the team exists
            Team team = teamRepository.findById(teamId).orElseThrow(() -> 
                new IllegalArgumentException("Team not found"));
            
            // Get the event
            Event event = getEventById(eventId);
            
            // Get the competition associated with this event
            Competition competition = competitionRepository.findById(event.getCompetitionId())
                .orElseThrow(() -> new RuntimeException("Competition not found"));
            
            // Make sure the team is part of the competition
            List<String> competitionTeamIds = competition.getTeamIds();
            if (!competitionTeamIds.contains(teamId)) {
                // If team is not already in the competition, add it
                competitionTeamIds.add(teamId);
                competition = competitionRepository.save(competition);
            }
            
            // Initialize the teamIds list if it doesn't exist
            if (event.getTeamIds() == null) {
                event.setTeamIds(new ArrayList<>());
            }
            
            // Check if team is already registered to this event
            List<String> eventTeamIds = event.getTeamIds();
            if (eventTeamIds.contains(teamId)) {
                throw new IllegalArgumentException("Team is already registered to this event");
            }
            
            // Add team to event
            eventTeamIds.add(teamId);
            return eventRepository.save(event);
        } catch (Exception e) {
            System.err.println("Error in registerTeamToEvent method: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // for testing purposes
    public Event setEventCompetitionId(String eventId, String competitionId) {
        Event event = getEventById(eventId);
        Competition competition = competitionRepository.findById(competitionId).orElse(null);
        if (competition == null) {
            throw new IllegalArgumentException("Competition not found");
        }
        event.setCompetitionId(competitionId);
        competition.getEventIds().add(eventId);
        competitionRepository.save(competition);
        return eventRepository.save(event);
    }
}