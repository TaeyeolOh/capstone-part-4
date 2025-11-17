# Stage 1: Build phase
# multi-stage build to compile springboot app and keep the final image small and clean.

# Use a lightweight Java 17 base image for the build stage
FROM openjdk:17-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper and configuration files needed for building the app
COPY mvnw mvnw
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies ahead of time to improve build performance
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# Copy source code and compile the application   
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime 
# This final stage creates a minimal image that only contains what is needed to run the app.

# Use a lightweight Java 17 image for the final container that will actually run the app
FROM openjdk:17-jdk-slim

# Set working directory for runtime
WORKDIR /app

# Reinstall MongoDB tools (needed again at runtime for syncing)
# This is necessary because the tools don’t carry over between build stages.
RUN apt-get update && \
    apt-get install -y wget curl unzip ca-certificates && \
    wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian11-x86_64-100.9.4.tgz && \
    tar -zxvf mongodb-database-tools-*-100.9.4.tgz && \
    cp -R mongodb-database-tools-*/bin/* /usr/local/bin/ && \
    rm -rf mongodb-database-tools-*

# Copy only the compiled JAR file from the build stage into the runtime container
COPY --from=build /app/target/capstone-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Run the Spring Boot app when the container starts
CMD ["java", "-jar", "app.jar"]