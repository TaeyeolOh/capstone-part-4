package com.example.capstone.model;

import com.example.capstone.dto.TeamDTO;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

import java.time.Instant;

@Data
@Document(collection = "teams")
public class Team {
    @Id
    private String id;

    @NotNull
    private Integer teamNumber;

    @NotBlank
    private String teamName;

    @NotBlank
    private String schoolName;

    @NotNull
    private List<String> vehicleIds;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Team modifyTeam(TeamDTO teamDTO) {
        if(teamDTO.getTeamNumber() != null) {
            this.teamNumber = teamDTO.getTeamNumber();
        }
        if(teamDTO.getTeamName() != null) {
            this.teamName = teamDTO.getTeamName();
        }
        if(teamDTO.getSchoolName() != null) {
            this.schoolName = teamDTO.getSchoolName();
        }
        return this;
    }
}
