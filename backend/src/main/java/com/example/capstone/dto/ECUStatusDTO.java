package com.example.capstone.dto;

import com.example.capstone.model.ECU;
import com.example.capstone.model.ECUStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ECUStatusDTO {

	@NotNull
	private double t;
	@NotNull
	private double v;
	@NotNull
	private double c;

	public ECUStatus toEntity(ECU ecu) {
		ECUStatus ecuStatus = new ECUStatus();
		ecuStatus.setTimestamp(ecu.getStartedRecordingAt().plusMillis((long)(t*1000)));
		ecuStatus.setVoltage(v);
		ecuStatus.setCurrent(c);
		ecuStatus.setPower(v * c);
		return ecuStatus;
	}
}

