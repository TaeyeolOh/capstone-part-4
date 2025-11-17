package com.example.capstone.service;

import com.example.capstone.dto.ECUStatusDTO;
import com.example.capstone.model.*;
import com.example.capstone.repository.ECURepository;
import com.example.capstone.repository.EventRepository;
import com.example.capstone.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ECUService {
    private final ECURepository ecuRepository;
    private final VehicleRepository vehicleRepository;
    private final EventRepository eventRepository;

    public ECUService(ECURepository ecuRepository, VehicleRepository vehicleRepository, EventRepository eventRepository) {
        this.ecuRepository = ecuRepository;
		this.vehicleRepository = vehicleRepository;
		this.eventRepository = eventRepository;
	}

    public List<ECU> getAllECUs() {
        return ecuRepository.findAll();
    }

    public ECU getECUById(String id) {
        return ecuRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("ECU not found"));
    }

    public ECU createECU(ECU ecu) {
        return ecuRepository.save(ecu);
    }

    public ECU registerECU(String serialNumber, Long currentTicks) {
		ECU ecu;
		try {
			ecu = getECUBySerialNumber(serialNumber);
        } catch(Exception e){
            ecu = new ECU();
            ecu.setSerialNumber(serialNumber);
            ecu.setEcuStatusList(new ArrayList<>());
        }
        ecu.setStartedRecordingAt(Instant.now().minusMillis(currentTicks));
        return ecuRepository.save(ecu);
    }

    public ECU getECUBySerialNumber(String serialNumber) {
		return ecuRepository.findBySerialNumber(serialNumber).orElseThrow(() -> new IllegalArgumentException("ECU not found"));
    }

    public ECU assignECUToVehicleBySerial(String serialNumber, String vehicleId) {
    ECU ecu = ecuRepository.findBySerialNumber(serialNumber)
        .orElseThrow(() -> new IllegalArgumentException("ECU not found"));

    Vehicle vehicle = vehicleRepository.findById(vehicleId)
        .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));

    if (vehicle.getEcuId() != null) {
        throw new IllegalArgumentException("Vehicle already has an ECU assigned");
    }
    vehicle.setEcuId(ecu.getId());
    vehicleRepository.save(vehicle);

    ecu.setVehicleId(vehicleId);
    return ecuRepository.save(ecu);
    }

    public ECU unassignECUFromVehicle(String ecuId) {
        ECU ecu = getECUById(ecuId);
        if (ecu.getVehicleId() == null) {
            throw new IllegalArgumentException("ECU is not assigned to any vehicle");
        }
        Vehicle vehicle = vehicleRepository.findById(ecu.getVehicleId())
          .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
        if (!vehicle.getEcuId().equals(ecuId)) {
            throw new IllegalArgumentException("ECU is not assigned to this vehicle");
        }
        ecu.setVehicleId(null);
        vehicle.setEcuId(null);
        vehicleRepository.save(vehicle);
        ecuRepository.save(ecu);
        return ecu;
    }

    public List<ECUStatus> createBulkECUStatus(List<ECUStatusDTO> ecuStatuses, String serialNumber) {
        ECU ecu = getECUBySerialNumber(serialNumber);
        List<ECUStatus> savedECUStatuses = new ArrayList<>();
        for (ECUStatusDTO ecuStatusDTO : ecuStatuses) {
            ECUStatus ecuStatus = ecuStatusDTO.toEntity(ecu);
            savedECUStatuses.add(ecuStatus);
        }
        ecu.getEcuStatusList().addAll(savedECUStatuses);
        ecuRepository.save(ecu);
        return savedECUStatuses;
    }

    public List<ECUStatus> getECUStatusByEvent(String ecuId, String eventId) {
        ECU ecu = getECUById(ecuId);
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (!event.getEcuIds().contains(ecuId)) {
            throw new IllegalArgumentException("ECU not registered for this event");
        }
        List<ECUStatus> filteredStatuses = new ArrayList<>();
        for (ECUStatus status : ecu.getEcuStatusList()) {
            if(status.getTimestamp().isAfter(event.getStartTime()) && status.getTimestamp().isBefore(event.getEndTime())) {
                filteredStatuses.add(status);
            }
        }
        return filteredStatuses;
    }

    public List<ECU> getUnregisteredECUs() {
        List<ECU> allECUs = getAllECUs();
        List<ECU> unregisteredECUs = new ArrayList<>();
        for (ECU ecu : allECUs) {
            if (ecu.getVehicleId() == null) {
                unregisteredECUs.add(ecu);
            }
        }
        return unregisteredECUs;
    }
}
