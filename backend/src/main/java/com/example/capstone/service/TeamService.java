package com.example.capstone.service;

import com.example.capstone.dto.TeamDTO;
import com.example.capstone.model.Competition;
import com.example.capstone.model.Team;
import com.example.capstone.model.Vehicle;
import com.example.capstone.repository.CompetitionRepository;
import com.example.capstone.repository.TeamRepository;
import com.example.capstone.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class TeamService {
    private final TeamRepository teamRepository;
    private final CompetitionRepository competitionRepository;
    private final VehicleRepository vehicleRepository;

    public TeamService(TeamRepository teamRepository, CompetitionRepository competitionRepository, VehicleRepository vehicleRepository) {
        this.teamRepository = teamRepository;
        this.competitionRepository = competitionRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team getTeamById(String id) {
        return teamRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Team not found"));
    }

    public Team createTeam(Team team) {
        team.setVehicleIds(new ArrayList<>());
        return teamRepository.save(team);
    }

    public List<Team> getTeamsByCompetitionId(String competitionId) {
        return teamRepository.findAllById(competitionRepository.findById(competitionId)
          .orElseThrow(() -> new IllegalArgumentException("Competition not found"))
          .getTeamIds());
    }

    public Team modifyTeam(String teamId, TeamDTO teamDTO) {
        return teamRepository.save(getTeamById(teamId).modifyTeam(teamDTO));
    }

    public void deleteTeam(String teamId) {
        Team team = getTeamById(teamId);
        // deregister the team from all competitions
        List<Competition> competitions = competitionRepository.findAll();
        for (Competition competition : competitions) {
            List<String> teamIds = competition.getTeamIds();
            if (teamIds.contains(teamId)) {
                teamIds.remove(teamId);
                competitionRepository.save(competition);
            }
        }
        // deregister vehicles from the team
        List<String> vehicleIds = team.getVehicleIds();
        for (String vehicleId : vehicleIds) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
            if (vehicle != null) {
                vehicle.setTeamId(null);
                vehicleRepository.save(vehicle);
            }
        }
        teamRepository.delete(team);
    }
}
