package com.example.capstone.service;

import com.example.capstone.dto.CompetitionDTO;
import com.example.capstone.model.Competition;
import com.example.capstone.repository.CompetitionRepository;
import com.example.capstone.repository.EventRepository;
import com.example.capstone.repository.TeamRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class CompetitionService {
    private final CompetitionRepository competitionRepository;
    private final TeamRepository teamRepository;
    private final EventRepository eventRepository;

    public CompetitionService(CompetitionRepository competitionRepository, TeamRepository teamRepository, EventRepository eventRepository) {
        this.competitionRepository = competitionRepository;
        this.teamRepository = teamRepository;
        this.eventRepository = eventRepository;
    }

    public List<Competition> getAllCompetitions() {
        return competitionRepository.findAll();
    }

    public Competition getCompetitionById(String id) {
        return competitionRepository.findById(id).orElseThrow(() -> new RuntimeException("Competition not found"));
    }

    public Competition createCompetition(Competition competition) {
        competition.setEventIds(new ArrayList<>());
        competition.setTeamIds(new ArrayList<>());
        return competitionRepository.save(competition);
    }

    public Competition addTeamToCompetition(String competitionId, String teamId) {
        Competition competition = getCompetitionById(competitionId);
        teamRepository.findById(teamId).orElseThrow(() -> new IllegalArgumentException("Team not found"));
        List<String> teamIds = competition.getTeamIds();
        if (!teamIds.contains(teamId)) {
            teamIds.add(teamId);
            return competitionRepository.save(competition);
        } else {
            throw new IllegalArgumentException("Team already exists in the competition");
        }
    }

    public Competition removeTeamFromCompetition(String competitionId, String teamId) {
        Competition competition = getCompetitionById(competitionId);
        List<String> teamIds = competition.getTeamIds();
        if (teamIds.contains(teamId)) {
            teamIds.remove(teamId);
            return competitionRepository.save(competition);
        } else {
            throw new IllegalArgumentException("Team not found in the competition");
        }
    }

    public Competition modifyCompetition(String competitionId, CompetitionDTO competitionDTO) {
        return competitionRepository.save(getCompetitionById(competitionId).modifyCompetition(competitionDTO));
    }

    public void deleteCompetition(String competitionId) {
        Competition competition = getCompetitionById(competitionId);
        // delete all events associated with the competition
        List<String> eventIds = competition.getEventIds();
        for (String eventId : eventIds) {
            eventRepository.deleteById(eventId);
        }
        competitionRepository.delete(competition);
    }
}
