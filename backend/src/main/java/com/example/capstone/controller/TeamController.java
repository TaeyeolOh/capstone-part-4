package com.example.capstone.controller;

import com.example.capstone.model.Team;
import com.example.capstone.service.CompetitionService;
import com.example.capstone.service.TeamService;
import com.example.capstone.dto.TeamDTO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {
    private final TeamService teamService;

    public TeamController(TeamService teamService, CompetitionService competitionService) {
        this.teamService = teamService;
    }

    @GetMapping
    public List<Team> getAllTeams() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public Team getTeamById(@PathVariable String id) {
        return teamService.getTeamById(id);
    }

    @PostMapping
    public Team createTeam(@Valid @RequestBody Team team) {
        return teamService.createTeam(team);
    }

    @GetMapping("/getByCompId/{competitionId}")
    public List<Team> getTeamsByCompetitionId(@PathVariable String competitionId) {
        return teamService.getTeamsByCompetitionId(competitionId);
    }

    @PostMapping("/{teamId}/modify")
    public Team modifyTeam(@PathVariable String teamId, @Valid @RequestBody TeamDTO teamDTO) {
        return teamService.modifyTeam(teamId, teamDTO);
    }

    @DeleteMapping("/{teamId}")
    public void deleteTeam(@PathVariable String teamId) {
        teamService.deleteTeam(teamId);
    }
}
