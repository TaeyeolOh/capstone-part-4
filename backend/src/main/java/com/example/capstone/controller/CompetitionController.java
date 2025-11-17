package com.example.capstone.controller;

import com.example.capstone.dto.CompetitionDTO;
import com.example.capstone.model.Competition;
import com.example.capstone.service.CompetitionService;
import com.example.capstone.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/competitions")
public class CompetitionController {
    private final CompetitionService competitionService;

    public CompetitionController(CompetitionService competitionService, TeamService teamService) {
        this.competitionService = competitionService;
    }

    @GetMapping
    public List<Competition> getAllCompetitions() {
        return competitionService.getAllCompetitions();
    }

    @GetMapping("/{id}")
    public Competition getCompetitionById(@PathVariable String id) {
        return competitionService.getCompetitionById(id);
    }

    @PostMapping
    public Competition createCompetition(@Valid @RequestBody Competition competition) {
        return competitionService.createCompetition(competition);
    }

    @PostMapping("/{competitionId}/registerTeam/{teamId}")
    public Competition addTeamToCompetition(@PathVariable String competitionId, @PathVariable String teamId) {
        return competitionService.addTeamToCompetition(competitionId, teamId);
    }

    @PostMapping("/{competitionId}/modify")
    public Competition modifyCompetition(@PathVariable String competitionId, @Valid @RequestBody CompetitionDTO competitionDTO) {
        return competitionService.modifyCompetition(competitionId, competitionDTO);
    }

    @PostMapping("/{competitionId}/deregisterTeam/{teamId}")
    public Competition removeTeamFromCompetition(@PathVariable String competitionId, @PathVariable String teamId) {
        return competitionService.removeTeamFromCompetition(competitionId, teamId);
    }

    @DeleteMapping("/{competitionId}")
    public void deleteCompetition(@PathVariable String competitionId) {
        competitionService.deleteCompetition(competitionId);
    }
}
