package com.example.capstone.repository;

import com.example.capstone.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
	List<Event> findByCompetitionId(String competitionId);
}
