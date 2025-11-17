package com.example.capstone.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoClientConfig {

    @Value("${spring.data.mongodb.uri}")
    private String localUri;

    @Value("${spring.data.mongodb.database}")
    private String localDb;

    @Bean
    public MongoClient localMongoClient() {
        return MongoClients.create(localUri);
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoClient localMongoClient) {
        return new MongoTemplate(localMongoClient, localDb);
    }
}
