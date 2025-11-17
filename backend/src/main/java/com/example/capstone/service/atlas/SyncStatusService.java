package com.example.capstone.service.atlas;

import com.example.capstone.util.DocumentHashUtil;
import com.mongodb.client.*;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class SyncStatusService {

    private final MongoClient localMongoClient;

    @Value("${spring.data.mongodb.database}")
    private String localDb;

    @Value("${atlas.mongodb.uri}")
    private String atlasUri;

    @Value("${atlas.mongodb.database}")
    private String atlasDb;

    public SyncStatusService(MongoClient localMongoClient) {
        this.localMongoClient = localMongoClient;
    }

     
     // Compares the contents of the local and Atlas databases to check for differences.
     // Returns:
     //   - true: if any collection or document differs
     //   - false: if all collections and documents are identical
     //   - null: if Atlas is unreachable
    public Boolean isDataDifferent() {
        try (MongoClient atlasClient = createAtlasClient()) {
            if (atlasClient == null)
                return null;

            MongoDatabase localDbRef = localMongoClient.getDatabase(localDb);
            MongoDatabase atlasDbRef = atlasClient.getDatabase(atlasDb);
        
            // Create union of collection names in both databases
            Set<String> allCollections = unionCollections(localDbRef, atlasDbRef);

             // Compare each collection by count and document hash
            for (String collection : allCollections) {
                if (isCollectionDifferent(localDbRef, atlasDbRef, collection))
                    return true;
            }

            return false;
        } catch (Exception e) {
            System.err.println("Sync check failed: " + e.getMessage());
            return false;
        }
    }

    // Creates a client connection to MongoDB Atlas and tests the connection with a
    // ping. Returns null if the connection fails.
    private MongoClient createAtlasClient() {
        try {
            MongoClient client = MongoClients.create(atlasUri);
            client.getDatabase("admin").runCommand(new Document("ping", 1));
            return client;
        } catch (Exception e) {
            System.err.println("Could not connect to Atlas: " + e.getMessage());
            return null;
        }
    }

    
     // Merges and returns the union of collection names across local and Atlas databases.
     // This ensures we don't miss any collections unique to either side.
    private Set<String> unionCollections(MongoDatabase localDb, MongoDatabase atlasDb) {
        Set<String> local = new HashSet<>();
        Set<String> atlas = new HashSet<>();
        localDb.listCollectionNames().into(local);
        atlasDb.listCollectionNames().into(atlas);
        Set<String> all = new HashSet<>(local);
        all.addAll(atlas);
        System.out.println("Comparing collections: " + all);
        return all;
    }


     // Compares two collections (by name) between local and Atlas:
     // - If the document count differs → triggers sync
     // - If any document hash differs → triggers sync
    private boolean isCollectionDifferent(MongoDatabase localDb, MongoDatabase atlasDb, String collection) {
        MongoCollection<Document> local = localDb.getCollection(collection);
        MongoCollection<Document> atlas = atlasDb.getCollection(collection);

        long localCount = local.countDocuments();
        long atlasCount = atlas.countDocuments();

        System.out.printf("Collection %s → local count: %d, atlas count: %d%n", collection, localCount, atlasCount);

        // if doucment count differs
        if (localCount != atlasCount) {
            System.out.println("Collection count mismatch for: " + collection);
            return true;
        }

        // Compare each document by _id and hash of contents
        for (Document localDoc : local.find()) {
            Document atlasDoc = atlas.find(new Document("_id", localDoc.get("_id"))).first();
            if (atlasDoc == null) {
                System.out.println("Missing document in Atlas: " + localDoc.get("_id"));
                return true;
            }

            String localHash = DocumentHashUtil.generateDocumentHash(localDoc);
            String atlasHash = DocumentHashUtil.generateDocumentHash(atlasDoc);
            if (!localHash.equals(atlasHash)) {
                System.out.println("Hash mismatch for _id: " + localDoc.get("_id"));
                return true;
            }
        }

        return false;
    }
}