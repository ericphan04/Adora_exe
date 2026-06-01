package com.adora.service;

import com.adora.config.R2Config;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class UploadService {

    private final S3Client s3Client;
    private final R2Config r2Config;
    private final Path localUploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    @Autowired
    public UploadService(@Autowired(required = false) S3Client s3Client, R2Config r2Config) {
        this.s3Client = s3Client;
        this.r2Config = r2Config;
        
        // Ensure local uploads directory exists
        try {
            Files.createDirectories(localUploadDir);
            System.out.println("Local upload directory initialized at: " + localUploadDir);
        } catch (IOException e) {
            System.err.println("Could not create local uploads directory: " + e.getMessage());
        }
    }

    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        // Try to upload to Cloudflare R2 if configured
        if (s3Client != null && !r2Config.isNotConfigured()) {
            try {
                String contentType = file.getContentType();
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(r2Config.getBucketName())
                        .key(fileName)
                        .contentType(contentType)
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                System.out.println("File uploaded successfully to Cloudflare R2: " + fileName);

                // Construct public URL
                String publicUrl = r2Config.getPublicUrl();
                if (publicUrl.endsWith("/")) {
                    publicUrl = publicUrl.substring(0, publicUrl.length() - 1);
                }
                return publicUrl + "/" + fileName;
            } catch (Exception e) {
                System.err.println("Failed to upload to Cloudflare R2: " + e.getMessage() + ". Falling back to local storage.");
            }
        }

        // Fallback to local storage
        try {
            Path targetLocation = this.localUploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File saved locally (fallback): " + targetLocation);
            
            // Return local public URL
            return "http://localhost:8085/uploads/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file locally. Error: " + e.getMessage(), e);
        }
    }
}
