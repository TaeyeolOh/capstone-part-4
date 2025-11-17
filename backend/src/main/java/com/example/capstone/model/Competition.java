package com.example.capstone.model;

import com.example.capstone.dto.CompetitionDTO;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "competitions")
public class Competition {
    @Id
    private String id;

    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @NotBlank
    private String location;

    @NotNull
    @Indexed 
    private List<String> teamIds;

    @NotNull
    @Indexed
    private List<String> eventIds;

    @NotNull
    private Instant date;

    @NotNull
    private Boolean isFinal;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Competition modifyCompetition(CompetitionDTO competitionDTO) {
        if(competitionDTO.getName() != null) {
            this.name = competitionDTO.getName();
        }
        if(competitionDTO.getDescription() != null) {
            this.description = competitionDTO.getDescription();
        }
        if(competitionDTO.getLocation() != null) {
            this.location = competitionDTO.getLocation();
        }
        if(competitionDTO.getDate() != null) {
            this.date = competitionDTO.getDate();
        }
        if(competitionDTO.getIsFinal() != null) {
            this.isFinal = competitionDTO.getIsFinal();
        }
        return this;
    }
}
