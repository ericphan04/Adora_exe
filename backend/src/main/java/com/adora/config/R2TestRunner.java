package com.adora.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.nio.charset.StandardCharsets;

@Component
public class R2TestRunner implements CommandLineRunner {

    @Autowired(required = false)
    private S3Client s3Client;

    @Autowired
    private R2Config r2Config;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("====== STARTING R2 CONNECTION TEST ======");
        if (s3Client == null || r2Config.isNotConfigured()) {
            System.out.println("R2 Client is not configured. Skipping connection test.");
            System.out.println("=========================================");
            return;
        }

        try {
            String testContent = "ADORA Cloudflare R2 Connection Test Successful! Timestamp: " + System.currentTimeMillis();
            byte[] bytes = testContent.getBytes(StandardCharsets.UTF_8);

            String key = "test-connection.txt";
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(r2Config.getBucketName())
                    .key(key)
                    .contentType("text/plain")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));
            
            String publicUrl = r2Config.getPublicUrl();
            if (publicUrl.endsWith("/")) {
                publicUrl = publicUrl.substring(0, publicUrl.length() - 1);
            }
            String testFileUrl = publicUrl + "/" + key;

            System.out.println("R2 CONNECTION TEST: SUCCESS!");
            System.out.println("Test file uploaded successfully.");
            System.out.println("Uploaded File URL: " + testFileUrl);
        } catch (Exception e) {
            System.err.println("R2 CONNECTION TEST: FAILED!");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("=========================================");
    }
}
