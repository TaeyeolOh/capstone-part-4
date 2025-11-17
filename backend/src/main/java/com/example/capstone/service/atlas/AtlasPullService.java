package com.example.capstone.service.atlas;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AtlasPullService {

    private final SyncStatusService syncStatusService;

    @Value("${spring.data.mongodb.uri}")
    private String localUri;

    @Value("${spring.data.mongodb.database}")
    private String localDb;

    @Value("${atlas.mongodb.uri}")
    private String atlasUri;

    @Value("${atlas.mongodb.database}")
    private String atlasDb;

    // Main method to pull cloud data from Atlas and restore it locally
    public String pullFromAtlas() throws Exception {
         if (!verifySyncNeeded()) {
            return "Local and Atlas DB are already in sync. No pull necessary.";
        }

        try {
            dropLocalCollections();
            cleanOldDump();
            exportFromAtlas();
            importToLocal();
            System.out.println("[SUCCESS] Data pulled from Atlas and restored locally.");
            return "Pulled data from Atlas to local!";
        } catch (IOException e) {
            if (e.getMessage().contains("Name or service not known") ||
                    e.getMessage().contains("nodename nor servname")) {
                throw new IOException("Network unavailable. Please check your internet connection and try again.");
            }
            throw e;
        }
    }

    // Centralised sync check logic
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

    // Drop all local collections to prevent conflict during restore
    private void dropLocalCollections() {
        System.out.println("[INFO] Dropping all local collections...");
        try (MongoClient client = MongoClients.create(localUri)) {
            MongoDatabase db = client.getDatabase(localDb);
            for (String name : db.listCollectionNames()) {
                System.out.println("Dropping collection: " + name);
                db.getCollection(name).drop();
            }
        }
    }

    // Clean out old dump files (db snapshots) before pulling fresh data
    private void cleanOldDump() {
        File dumpDir = new File("/app/tmpdump");
        if (dumpDir.exists()) {
            System.out.println("[INFO] Removing old dump folder...");
            deleteRecursive(dumpDir);
        }
    }

    // Export the cloud (Atlas) database into BSON files
    private void exportFromAtlas() throws IOException, InterruptedException {
        System.out.println("[INFO] Running mongodump from Atlas...");
        Process dump = new ProcessBuilder("mongodump",
                "--uri", atlasUri + "/" + atlasDb,
                "--out", "/app/tmpdump/")
                .inheritIO().start();

        if (dump.waitFor() != 0) {
            throw new RuntimeException("mongodump from Atlas failed");
        }
    }

    // Restore BSON files from dump into the local MongoDB
    private void importToLocal() throws IOException, InterruptedException {
        System.out.println("[INFO] Restoring collections to local MongoDB...");
        File bsonDir = new File("/app/tmpdump/" + atlasDb);
        File[] bsonFiles = bsonDir.listFiles((dir, name) -> name.endsWith(".bson"));

        if (bsonFiles == null || bsonFiles.length == 0) {
            throw new RuntimeException("No BSON files found in: " + bsonDir.getAbsolutePath());
        }

        for (File bson : bsonFiles) {
            if (bson.length() == 0) {
                System.out.println("Skipping empty collection: " + bson.getName());
                continue;
            }

            String collection = bson.getName().replace(".bson", "");
            System.out.println("Restoring collection: " + collection);

            Process restore = new ProcessBuilder("mongorestore",
                    "--uri", localUri + "/" + localDb,
                    "--drop",
                    "--nsInclude=" + localDb + "." + collection,
                    bson.getAbsolutePath())
                    .inheritIO().start();

            if (restore.waitFor() != 0) {
                throw new RuntimeException("mongorestore failed for collection: " + collection);
            }
        }
    }

    // Deletes all contents of the dump directory recursively to ensure a clean sync
    private void deleteRecursive(File file) {
        if (file.isDirectory()) {
            for (File child : file.listFiles()) {
                deleteRecursive(child);
            }
        }
        if (!file.delete()) {
            System.err.println("Failed to delete: " + file.getAbsolutePath());
        }
    }
}