package com.example.capstone.repository;

import com.example.capstone.model.ECU;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ECURepository extends MongoRepository<ECU, String> {
	Optional<ECU> findBySerialNumber(String serialNumber);
}
