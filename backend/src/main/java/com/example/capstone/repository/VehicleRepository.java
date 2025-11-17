package com.example.capstone.repository;

import com.example.capstone.model.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends MongoRepository<Vehicle, String> {
	List<Vehicle> findByTeamId(String teamId);
	List<Vehicle> findByEcuIdIsIn(List<String> ecuIds);
}
