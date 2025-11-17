package com.example.capstone.controller;

import com.example.capstone.model.RaceResult;
import com.example.capstone.service.RaceResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/race-results")
public class RaceResultController {
    private final RaceResultService raceResultService;

    public RaceResultController(RaceResultService raceResultService) {
        this.raceResultService = raceResultService;
    }

    @GetMapping
    public List<RaceResult> getAllResults() {
        return raceResultService.getAllResults();
    }

    @GetMapping("/{id}")
    public RaceResult getResultById(@PathVariable String id) {
        return raceResultService.getResultById(id);
    }

    @GetMapping("/event/{eventId}")
    public List<RaceResult> getResultsByEvent(@PathVariable String eventId) {
        return raceResultService.getResultsByEvent(eventId);
    }

    @GetMapping("/competition/{competitionId}")
    public List<Map<String, Object>> getResultsByCompetition(@PathVariable String competitionId) {
        return raceResultService.getResultsByCompetition(competitionId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RaceResult> updateRaceTime(
            @PathVariable String id,
            @RequestBody Map<String, Object> updateData) {
        try {
            Long raceTimeMillis = ((Number) updateData.get("raceTimeMillis")).longValue();
            String raceTimeDisplay = (String) updateData.get("raceTimeDisplay");
            
            RaceResult updated = raceResultService.updateRaceTime(id, raceTimeMillis, raceTimeDisplay);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Manual endpoint to create race result for testing
    @PostMapping("/create")
    public ResponseEntity<RaceResult> createRaceResult(@RequestBody Map<String, String> data) {
        try {
            String eventId = data.get("eventId");
            String teamId = data.get("teamId");
            String vehicleId = data.get("vehicleId");
            
            RaceResult result = raceResultService.createRaceResult(eventId, teamId, vehicleId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint to update energy for an event
    @PostMapping("/update-energy/{eventId}")
    public ResponseEntity<String> updateEnergyForEvent(@PathVariable String eventId) {
        try {
            raceResultService.updateEnergyForEvent(eventId);
            return ResponseEntity.ok("Energy updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating energy: " + e.getMessage());
        }
    }
}