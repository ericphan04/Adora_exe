package com.adora;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
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

    @Bean
    public CommandLineRunner dropNotificationCheckConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
                System.out.println("Successfully checked/dropped constraint notifications_type_check");
            } catch (Exception e) {
                System.err.println("Failed to drop constraint notifications_type_check: " + e.getMessage());
            }
        };
    }
}

