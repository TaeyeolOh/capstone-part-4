package com.example.capstone.model;

import com.example.capstone.dto.EventDTO;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;

@Data
@Document(collection = "events")
public class Event {
    @Id
    private String id;

    @NotBlank
    @Indexed 
    private String competitionId;

    @NotBlank
    private String name;

    @NotBlank
    private String eventType;

    @NotNull
    @Indexed 
    private List<String> ecuIds;
    
    private List<String> teamIds = new ArrayList<>();

    @NotNull
    private Instant startTime;

    @NotNull
    private Instant endTime;

    @CreatedDate
    private Instant createdAt;

}
