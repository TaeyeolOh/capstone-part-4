package com.example.capstone.service.atlas;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AtlasUploadService {

    private final SyncStatusService syncStatusService;

    @Value("${spring.data.mongodb.uri}")
    private String localUri;

    @Value("${spring.data.mongodb.database}")
    private String localDb;

    @Value("${atlas.mongodb.uri}")
    private String atlasUri;

    @Value("${atlas.mongodb.database}")
    private String atlasDb;


    // Main method that handles the upload process from local to Atlas
    public String uploadToAtlas() throws Exception {
        if (!verifySyncNeeded()) {
            return "Local and Atlas DB are already in sync. No upload necessary.";
        }

        try {
            exportFromLocal();
            importToAtlas();
            return "Upload to MongoDB Atlas successful!";
        } catch (IOException e) {
            if (e.getMessage().contains("Name or service not known") ||
                    e.getMessage().contains("nodename nor servname")) {
                throw new IOException("Network unavailable. Please check your internet connection and try again.");
            }
            throw e;
        }
    }

    // Centralised sync check logic (same structure as pull service)
    private boolean verifySyncNeeded() throws IllegalStateException {
        Boolean isDifferent = syncStatusService.isDataDifferent();

        if (Boolean.FALSE.equals(isDifferent)) {
            return false;
        }
        if (isDifferent == null) {
            throw new IllegalStateException("Atlas is not reachable. Cannot verify sync status.");
        }
        return true;
    }

    // Dump local MongoDB database into BSON files under /app/tmpdump
    private void exportFromLocal() throws IOException, InterruptedException {
        System.out.println("[INFO] Dumping local MongoDB database...");
        Process dump = new ProcessBuilder("mongodump",
                "--uri", localUri + "/" + localDb,
                "--out", "/app/tmpdump/")
                .inheritIO().start();

        if (dump.waitFor() != 0) {
            throw new RuntimeException("mongodump failed");
        }
    }

    // Restore BSON dump into MongoDB Atlas
    private void importToAtlas() throws IOException, InterruptedException {
        File dumpDir = new File("/app/tmpdump/" + localDb);
        File[] bsonFiles = dumpDir.listFiles((dir, name) -> name.endsWith(".bson"));

        if (bsonFiles == null || bsonFiles.length == 0) {
            throw new RuntimeException("No BSON files found in dump directory: " + dumpDir.getAbsolutePath());
        }

        System.out.println("[INFO] Uploading BSON files to MongoDB Atlas...");
        for (File bson : bsonFiles) {
            System.out.println("→ Restoring: " + bson.getName());
            Process restore = new ProcessBuilder("mongorestore",
                    "--uri", atlasUri + "/" + atlasDb,
                    "--drop", // drops existing collections first in atlas before uploading
                    bson.getAbsolutePath())
                    .inheritIO().start();

            if (restore.waitFor() != 0) {
                throw new RuntimeException("mongorestore failed for file: " + bson.getName());
            }
        }
    }
}