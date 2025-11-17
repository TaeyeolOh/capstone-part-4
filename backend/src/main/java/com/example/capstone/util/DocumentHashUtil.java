package com.example.capstone.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.Document;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.TreeMap;

public class DocumentHashUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String generateDocumentHash(Document doc) {
        try {
            // Use TreeMap to sort the document fields alphabetically by key to ensure hash is consistent even if the field order changes
            Map<String, Object> documentMap = new TreeMap<>(doc);
             // Remove the mongo-specific _id field to focus only on the actual data
            documentMap.remove("_id");

            String jsonString = objectMapper.writeValueAsString(documentMap);
            // Compute the hash of the JSON string
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(jsonString.getBytes(StandardCharsets.UTF_8));

            // Convert the binary hash into a readable hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        } catch (Exception e) {
            throw new RuntimeException("Error generating document hash", e);
        }
    }
}