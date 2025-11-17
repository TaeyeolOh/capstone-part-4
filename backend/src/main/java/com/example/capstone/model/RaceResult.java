package com.example.capstone.model;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "race_results")
@CompoundIndexes({
    @CompoundIndex(name = "event_team_vehicle", def = "{'eventId': 1, 'teamId': 1, 'vehicleId': 1}", unique = true)
})
public class RaceResult {
    @Id
    private String id;

    @NotBlank
    @Indexed
    private String eventId;

    @NotBlank
    @Indexed
    private String teamId;

    @NotBlank
    @Indexed
    private String vehicleId;

    @NotBlank
    @Indexed
    private String competitionId;

    // Stored in milliseconds for easy calculation
    private Long raceTimeMillis;

    // Display format string (MM:SS.ms)
    private String raceTimeDisplay;

    @NotNull
    private Double points;

    @NotNull
    private Integer position;

    @NotBlank
    @Indexed
    private String vehicleClass;

    @NotBlank
    private String vehicleType;

    @NotBlank
    private String teamName;

    @NotBlank
    private String eventName;

    // Energy consumed in Wh
    private Double energyConsumed;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}