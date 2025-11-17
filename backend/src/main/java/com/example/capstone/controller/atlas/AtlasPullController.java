package com.example.capstone.controller.atlas;

import com.example.capstone.service.atlas.AtlasPullService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/db")
@RequiredArgsConstructor
public class AtlasPullController {

    private final AtlasPullService service;

    @PostMapping("/pull-from-atlas")
    public ResponseEntity<String> pull() {
        try {
            return ResponseEntity.ok(service.pullFromAtlas());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Pull failed: " + e.getMessage());
        }
    }
}
