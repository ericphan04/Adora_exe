package com.adora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AdoraBackendApplication {
    public static void main(String[] args) {
        // Load parent .env file if it exists (for local development outside docker)
        try {
            java.nio.file.Path envPath = java.nio.file.Paths.get("../.env");
            if (java.nio.file.Files.exists(envPath)) {
                java.nio.file.Files.lines(envPath)
                    .map(String::trim)
                    .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                    .forEach(line -> {
                        int delim = line.indexOf('=');
                        if (delim > 0) {
                            String key = line.substring(0, delim).trim();
                            String value = line.substring(delim + 1).trim();
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    });
            }
        } catch (Exception e) {
            // Ignore if unable to read
        }
        SpringApplication.run(AdoraBackendApplication.class, args);
    }
}
