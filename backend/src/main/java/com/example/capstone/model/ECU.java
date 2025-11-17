package com.example.capstone.model;

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
@Document(collection = "ecus")
public class ECU {
    @Id
    private String id;

    @NotBlank
    @Indexed
    private String serialNumber;

    private String vehicleId;

    @NotNull
    private List<ECUStatus> ecuStatusList;

    @NotNull
    private Instant startedRecordingAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
