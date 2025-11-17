package com.example.capstone.service;

import com.example.capstone.model.*;
import com.example.capstone.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RaceResultService {
    private final RaceResultRepository raceResultRepository;
    private final EventRepository eventRepository;
    private final TeamRepository teamRepository;
    private final VehicleRepository vehicleRepository;
    private final CompetitionRepository competitionRepository;
    
    @Autowired
    @Lazy
    private ECUService ecuService;

    public RaceResultService(RaceResultRepository raceResultRepository, 
                           EventRepository eventRepository,
                           TeamRepository teamRepository, 
                           VehicleRepository vehicleRepository,
                           CompetitionRepository competitionRepository) {
        this.raceResultRepository = raceResultRepository;
        this.eventRepository = eventRepository;
        this.teamRepository = teamRepository;
        this.vehicleRepository = vehicleRepository;
        this.competitionRepository = competitionRepository;
    }

    // Create race result when team registers for event
    @Transactional
    public RaceResult createRaceResult(String eventId, String teamId, String vehicleId) {
        try {
            // Check if race result already exists
            Optional<RaceResult> existing = raceResultRepository.findByEventIdAndTeamIdAndVehicleId(eventId, teamId, vehicleId);
            if (existing.isPresent()) {
                return existing.get();
            }

            Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));

            RaceResult raceResult = new RaceResult();
            raceResult.setEventId(eventId);
            raceResult.setTeamId(teamId);
            raceResult.setVehicleId(vehicleId);
            raceResult.setCompetitionId(event.getCompetitionId());
            raceResult.setRaceTimeMillis(0L);
            raceResult.setRaceTimeDisplay("00:00.00");
            raceResult.setPoints(0.0);
            raceResult.setPosition(0);
            raceResult.setVehicleClass(vehicle.getVehicleClass());
            raceResult.setVehicleType(vehicle.getVehicleType());
            raceResult.setTeamName(team.getTeamName());
            raceResult.setEventName(event.getName());
            raceResult.setEnergyConsumed(0.0);

            return raceResultRepository.save(raceResult);
        } catch (Exception e) {
            System.err.println("Error creating race result: " + e.getMessage());
            throw e;
        }
    }

    // Update race time and recalculate points
    @Transactional
    public RaceResult updateRaceTime(String raceResultId, Long raceTimeMillis, String raceTimeDisplay) {
        RaceResult raceResult = raceResultRepository.findById(raceResultId)
            .orElseThrow(() -> new IllegalArgumentException("Race result not found"));
        
        raceResult.setRaceTimeMillis(raceTimeMillis);
        raceResult.setRaceTimeDisplay(raceTimeDisplay);
        
        // Save first to update the time
        raceResult = raceResultRepository.save(raceResult);
        
        // Recalculate points for all teams in this event and vehicle class
        recalculatePointsForEvent(raceResult.getEventId(), raceResult.getVehicleClass());
        
        // Return the updated result
        return raceResultRepository.findById(raceResultId).orElse(raceResult);
    }

    // Recalculate points for an event and vehicle class
    private void recalculatePointsForEvent(String eventId, String vehicleClass) {
        // Get all results for this event and vehicle class
        List<RaceResult> results = raceResultRepository.findByEventIdAndVehicleClass(eventId, vehicleClass);
        
        // Separate results with valid times and without
        List<RaceResult> withTime = results.stream()
            .filter(r -> r.getRaceTimeMillis() > 0)
            .sorted(Comparator.comparing(RaceResult::getRaceTimeMillis))
            .collect(Collectors.toList());
        
        List<RaceResult> withoutTime = results.stream()
            .filter(r -> r.getRaceTimeMillis() == 0)
            .collect(Collectors.toList());
        
        // Calculate points for teams with valid times
        int totalTeamsWithTime = withTime.size();
        for (int i = 0; i < withTime.size(); i++) {
            RaceResult result = withTime.get(i);
            int position = i + 1;
            double points = calculatePoints(position, totalTeamsWithTime);
            result.setPosition(position);
            result.setPoints(points);
        }
        
        // All teams without time get 0 points and last position
        int lastPosition = totalTeamsWithTime > 0 ? totalTeamsWithTime + 1 : 1;
        for (RaceResult result : withoutTime) {
            result.setPosition(lastPosition);
            result.setPoints(0.0);
        }
        
        // Save all updated results
        raceResultRepository.saveAll(results);
    }

    // Points calculation formula
    private double calculatePoints(int position, int totalTeams) {
        if (position == 1) return 100.0;
        if (totalTeams == 1) return 100.0; // Only one team
        if (position >= totalTeams) return 25.0; // Last place
        
        // Formula: (tmax - t)/(tmax - tmin) * 75 + 25
        double tmax = totalTeams;
        double tmin = 1;
        double t = position;
        
        return ((tmax - t) / (tmax - tmin)) * 75 + 25;
    }

    // Get results by event
    public List<RaceResult> getResultsByEvent(String eventId) {
        return raceResultRepository.findByEventId(eventId)
            .stream()
            .sorted(Comparator.comparing(RaceResult::getVehicleClass)
                .thenComparing(RaceResult::getPosition))
            .collect(Collectors.toList());
    }

    // Get results by competition (aggregate view)
    public List<Map<String, Object>> getResultsByCompetition(String competitionId) {
        List<RaceResult> allResults = raceResultRepository.findByCompetitionId(competitionId);
        
        // Group by team
        Map<String, List<RaceResult>> resultsByTeam = allResults.stream()
            .collect(Collectors.groupingBy(RaceResult::getTeamId));
        
        List<Map<String, Object>> aggregatedResults = new ArrayList<>();
        
        for (Map.Entry<String, List<RaceResult>> entry : resultsByTeam.entrySet()) {
            String teamId = entry.getKey();
            List<RaceResult> teamResults = entry.getValue();
            
            if (!teamResults.isEmpty()) {
                Map<String, Object> teamAggregate = new HashMap<>();
                RaceResult firstResult = teamResults.get(0);
                
                teamAggregate.put("teamId", teamId);
                teamAggregate.put("teamName", firstResult.getTeamName());
                teamAggregate.put("totalPoints", teamResults.stream()
                    .mapToDouble(RaceResult::getPoints)
                    .sum());
                teamAggregate.put("eventCount", teamResults.size());
                teamAggregate.put("results", teamResults);
                
                aggregatedResults.add(teamAggregate);
            }
        }
        
        // Sort by total points descending
        aggregatedResults.sort((a, b) -> 
            Double.compare((Double) b.get("totalPoints"), (Double) a.get("totalPoints")));
        
        return aggregatedResults;
    }

    // Get all race results
    public List<RaceResult> getAllResults() {
        return raceResultRepository.findAll();
    }

    // Get race result by ID
    public RaceResult getResultById(String id) {
        return raceResultRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Race result not found"));
    }

    // Calculate energy consumed during an event
    public Double calculateEnergyForEvent(String ecuId, String eventId) {
        try {
            List<ECUStatus> statusList = ecuService.getECUStatusByEvent(ecuId, eventId);
            if (statusList.isEmpty()) {
                return 0.0;
            }

            double cumulativeEnergy = 0.0;
            for (int i = 1; i < statusList.size(); i++) {
                ECUStatus prev = statusList.get(i - 1);
                ECUStatus curr = statusList.get(i);
                
                // Calculate time difference in hours
                long prevTime = prev.getTimestamp().toEpochMilli();
                long currTime = curr.getTimestamp().toEpochMilli();
                double deltaTimeHours = (currTime - prevTime) / 3600000.0;
                
                // Energy = Power * Time
                cumulativeEnergy += prev.getPower() * deltaTimeHours;
            }
            
            return cumulativeEnergy;
        } catch (Exception e) {
            System.err.println("Error calculating energy: " + e.getMessage());
            return 0.0;
        }
    }

    // Update energy for all results in an event
    @Transactional
    public void updateEnergyForEvent(String eventId) {
        try {
            List<RaceResult> results = raceResultRepository.findByEventId(eventId);
            
            for (RaceResult result : results) {
                // Get the vehicle to find its ECU
                Vehicle vehicle = vehicleRepository.findById(result.getVehicleId())
                    .orElse(null);
                
                if (vehicle != null && vehicle.getEcuId() != null) {
                    Double energy = calculateEnergyForEvent(vehicle.getEcuId(), eventId);
                    result.setEnergyConsumed(energy);
                }
            }
            
            raceResultRepository.saveAll(results);
        } catch (Exception e) {
            System.err.println("Error updating energy for event: " + e.getMessage());
        }
    }
}