package com.adora.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
public class R2Config {

    @Value("${adora.r2.endpoint}")
    private String endpoint;

    @Value("${adora.r2.access-key}")
    private String accessKey;

    @Value("${adora.r2.secret-key}")
    private String secretKey;

    @Value("${adora.r2.bucket-name}")
    private String bucketName;

    @Value("${adora.r2.public-url}")
    private String publicUrl;

    @Bean
    public S3Client s3Client() {
        if (isNotConfigured()) {
            System.out.println("Cloudflare R2 is not fully configured (using default placeholders). Falling back to local storage.");
            return null;
        }
        try {
            return S3Client.builder()
                    .endpointOverride(URI.create(endpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)
                    ))
                    .region(Region.US_EAST_1)
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true)
                            .build())
                    .build();
        } catch (Exception e) {
            System.err.println("Failed to initialize R2 S3Client: " + e.getMessage());
            return null;
        }
    }

    public boolean isNotConfigured() {
        return endpoint == null || endpoint.isEmpty() || endpoint.contains("<account-id>")
                || accessKey == null || accessKey.isEmpty() || accessKey.contains("your-access-key")
                || secretKey == null || secretKey.isEmpty() || secretKey.contains("your-secret-key")
                || bucketName == null || bucketName.isEmpty() || bucketName.contains("adora-bucket");
    }

    public String getBucketName() {
        return bucketName;
    }

    public String getPublicUrl() {
        return publicUrl;
    }
}
