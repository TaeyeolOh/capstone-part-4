package com.example.capstone.repository;

import com.example.capstone.model.RaceResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RaceResultRepository extends MongoRepository<RaceResult, String> {
    
    List<RaceResult> findByEventId(String eventId);
    
    List<RaceResult> findByCompetitionId(String competitionId);
    
    List<RaceResult> findByEventIdAndVehicleClass(String eventId, String vehicleClass);
    
    Optional<RaceResult> findByEventIdAndTeamIdAndVehicleId(String eventId, String teamId, String vehicleId);
    
    @Query("{ 'eventId': ?0, 'raceTimeMillis': { $gt: 0 } }")
    List<RaceResult> findByEventIdWithValidTime(String eventId);
    
    @Query("{ 'eventId': ?0, 'vehicleClass': ?1, 'raceTimeMillis': { $gt: 0 } }")
    List<RaceResult> findByEventIdAndVehicleClassWithValidTime(String eventId, String vehicleClass);
    
    List<RaceResult> findByTeamId(String teamId);
    
    @Query("{ 'competitionId': ?0, 'teamId': ?1 }")
    List<RaceResult> findByCompetitionIdAndTeamId(String competitionId, String teamId);
}