package com.example.capstone.controller;

import com.example.capstone.model.Event;
import com.example.capstone.service.EventService;
import com.example.capstone.service.TeamService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;
    private final TeamService teamService;

    public EventController(EventService eventService, TeamService teamService) {
        this.eventService = eventService;
        this.teamService = teamService;
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @PostMapping
    public Event createEvent(@Valid @RequestBody Event event) {
        return eventService.createEvent(event);
    }

    @GetMapping("/competition/{competitionId}")
    public List<Event> getEventsByCompetitionId(@PathVariable String competitionId) {
        return eventService.getEventsByCompetitionId(competitionId);
    }

    @GetMapping("/{eventId}")
    public Event getEventById(@PathVariable String eventId) {
        return eventService.getEventById(eventId);
    }

    @PostMapping("/{eventId}/registerEcu/{ecuId}")
    public Event registerECUToEvent(@PathVariable String eventId, @PathVariable String ecuId) {
        return eventService.registerECUToEvent(eventId, ecuId);
    }

    // Enhanced endpoint to register team with vehicle to event
    @PostMapping("/{eventId}/registerTeam/{teamId}/withVehicle/{vehicleId}")
    public ResponseEntity<Event> registerTeamToEventWithVehicle(
            @PathVariable String eventId, 
            @PathVariable String teamId,
            @PathVariable String vehicleId) {
        try {
            System.out.println("Controller: Registering team " + teamId + " with vehicle " + vehicleId + " to event " + eventId);
            Event updatedEvent = eventService.registerTeamToEvent(eventId, teamId, vehicleId);
            return ResponseEntity.ok(updatedEvent);
        } catch (Exception e) {
            System.err.println("Error registering team with vehicle to event: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Keep the old endpoint for backward compatibility
    @PostMapping("/{eventId}/registerTeam/{teamId}")
    public ResponseEntity<Event> registerTeamToEvent(
            @PathVariable String eventId, 
            @PathVariable String teamId) {
        try {
            System.out.println("Controller: Registering team " + teamId + " to event " + eventId);
            Event updatedEvent = eventService.registerTeamToEvent(eventId, teamId);
            return ResponseEntity.ok(updatedEvent);
        } catch (Exception e) {
            System.err.println("Error registering team to event: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // FOR TESTING, CREATING EVENT REQUIRES VALID COMPETITION ID
    @PostMapping("/{eventId}/setCompetition/{competitionId}")
    public Event setCompetitionForEvent(@PathVariable String eventId, @PathVariable String competitionId) {
        return eventService.setEventCompetitionId(eventId, competitionId);
    }
}
