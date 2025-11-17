package com.example.capstone.dto;

import com.example.capstone.model.Competition;
import lombok.Data;

import java.time.Instant;

@Data
public class CompetitionDTO {
	private String name;
	private String description;
	private String location;
	private Instant date;
	private Boolean isFinal;
}
