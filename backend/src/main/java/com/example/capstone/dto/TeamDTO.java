package com.example.capstone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TeamDTO {
	private Integer teamNumber;
	private String teamName;
	private String schoolName;
}
