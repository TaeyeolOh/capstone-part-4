 package com.example.capstone.config;

 import com.example.capstone.model.*;
 import com.fasterxml.jackson.core.type.TypeReference;
 import com.fasterxml.jackson.databind.JsonNode;
 import com.fasterxml.jackson.databind.ObjectMapper;
 import jakarta.annotation.PreDestroy;
 import lombok.RequiredArgsConstructor;
 import org.springframework.boot.CommandLineRunner;
 import org.springframework.context.annotation.Profile;
 import org.springframework.core.io.ClassPathResource;
 import org.springframework.data.mongodb.core.MongoTemplate;
 import org.springframework.stereotype.Component;

 import java.io.InputStream;
 import java.util.List;

 @Component
 @Profile("dev") // only run with: spring.profiles.active=dev in the application.propties file
 @RequiredArgsConstructor
 public class DbSeeder implements CommandLineRunner {

     private final MongoTemplate mongoTemplate;
     private final ObjectMapper objectMapper;

     @Override
     public void run(String... args) throws Exception {
         System.out.println("Seeding MongoDB from json file");

         InputStream is = new ClassPathResource("db.json").getInputStream();
         JsonNode root = objectMapper.readTree(is);

         mongoTemplate.insert(objectMapper.convertValue(root.get("vehicles"), new TypeReference<List<Vehicle>>() {}), Vehicle.class);
         mongoTemplate.insert(objectMapper.convertValue(root.get("teams"), new TypeReference<List<Team>>() {}), Team.class);
         mongoTemplate.insert(objectMapper.convertValue(root.get("ecus"), new TypeReference<List<ECU>>() {}), ECU.class);
         mongoTemplate.insert(objectMapper.convertValue(root.get("competitions"), new TypeReference<List<Competition>>() {}), Competition.class);
         mongoTemplate.insert(objectMapper.convertValue(root.get("events"), new TypeReference<List<Event>>() {}), Event.class);

         System.out.println("Done seeding MongoDB, populated database");
     }

     @PreDestroy
     public void cleanUp() {
         System.out.println("Cleaning up MongoDB");
         mongoTemplate.dropCollection(Event.class);
         mongoTemplate.dropCollection(Competition.class);
         mongoTemplate.dropCollection(ECU.class);
         mongoTemplate.dropCollection(Team.class);
         mongoTemplate.dropCollection(Vehicle.class);
         System.out.println("All seeded collections removed.");
     }
 }
