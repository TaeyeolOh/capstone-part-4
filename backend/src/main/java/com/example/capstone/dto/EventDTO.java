package com.example.capstone.dto;

import com.example.capstone.model.Event;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.List;

@Data
public class EventDTO {
	private String name;
	private String eventType;
	private Instant startTime;
	private Instant endTime;
}
