package com.example.capstone.controller;

import com.example.capstone.dto.ECUStatusDTO;
import com.example.capstone.model.ECU;
import com.example.capstone.model.ECUStatus;
import com.example.capstone.service.ECUService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ecus")
public class ECUController {
    private final ECUService ecuService;

    public ECUController(ECUService ecuService) {
        this.ecuService = ecuService;
    }

    @GetMapping
    public List<ECU> getAllECUs() {
        return ecuService.getAllECUs();
    }

    @GetMapping("/{id}")
    public ECU getECUById(@PathVariable String id) {
        return ecuService.getECUById(id);
    }

    @GetMapping("/getUnregisteredECUs")
    public List<ECU> getUnregisteredECUs() {
        return ecuService.getUnregisteredECUs();
    }

    // DO NOT USE UNLESS FOR TESTING, CREATE ECU WITH register ONLY
    @PostMapping
    public ECU createECU(@Valid @RequestBody ECU ecu) {
        return ecuService.createECU(ecu);
    }

    @PostMapping("/register/{serialNumber}/{currentTicks}")
    public ECU registerECU(@PathVariable String serialNumber,
                           @PathVariable Long currentTicks) {
        return ecuService.registerECU(serialNumber, currentTicks);
    }


    @PostMapping("/serial/{serial}/registerToVehicle/{vehicleId}")
    public ECU assignTeamToECU(@PathVariable("serial") String serial, @PathVariable String vehicleId) {
        return ecuService.assignECUToVehicleBySerial(serial, vehicleId);
    }

    @PostMapping("/bulk/{serialNumber}")
    public List<ECUStatus> createBulkECUStatus(@Valid @RequestBody List<ECUStatusDTO> ecuStatuses,
                                               @PathVariable String serialNumber) {
        return ecuService.createBulkECUStatus(ecuStatuses, serialNumber);
    }

    @GetMapping("/{ecuId}/getStatusByEvent/{eventId}")
    public List<ECUStatus> getECUStatusByEvent(@PathVariable String ecuId, @PathVariable String eventId) {
        return ecuService.getECUStatusByEvent(ecuId, eventId);
    }

    @PostMapping("/{ecuId}/deregisterFromVehicle")
    public ECU deregisterECUFromVehicle(@PathVariable String ecuId) {
        return ecuService.unassignECUFromVehicle(ecuId);
    }
}
