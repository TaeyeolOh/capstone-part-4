package com.example.capstone.controller.atlas;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.capstone.service.atlas.AtlasUploadService;

@RestController
@RequestMapping("/api/db")
@RequiredArgsConstructor
public class AtlasUploadController {

    private final AtlasUploadService service;

    @PostMapping("/upload-to-atlas")
    public ResponseEntity<String> upload() {
        try {
            return ResponseEntity.ok(service.uploadToAtlas());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
