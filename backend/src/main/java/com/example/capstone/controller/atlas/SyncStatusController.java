package com.example.capstone.controller.atlas;

import com.example.capstone.service.atlas.SyncStatusService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/db")
@RequiredArgsConstructor
public class SyncStatusController {

    private final SyncStatusService service;

    @GetMapping("/sync-status")
    public ResponseEntity<String> checkSync() {
        Boolean result = service.isDataDifferent();

        if (result == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("sync-unknown");
        }

        return ResponseEntity.ok(result ? "out-of-sync" : "in-sync");
    }

}
