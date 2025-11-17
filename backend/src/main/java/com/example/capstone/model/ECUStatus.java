package com.example.capstone.model;

import lombok.Data;
import jakarta.validation.constraints.NotNull;


import java.time.Instant;

@Data
public class ECUStatus {

    @NotNull
    private Instant timestamp;

    @NotNull
    private Double voltage;

    @NotNull
    private Double current;

    @NotNull
    private Double power;
}
