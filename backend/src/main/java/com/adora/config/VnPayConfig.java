package com.adora.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * VNPay Configuration
 *
 * To switch from Sandbox to Production, update the following in application.properties
 * (or set environment variables):
 *   VNP_PAY_URL=https://pay.vnpay.vn/vpcpay.html
 *   VNP_TMN_CODE=your_production_tmn_code
 *   VNP_HASH_SECRET=your_production_hash_secret
 *   VNP_RETURN_URL=https://yourdomain.com/api/payments/callback
 *   VNP_FRONTEND_BASE_URL=https://yourdomain.com
 */
@Configuration
public class VnPayConfig {

    @Value("${vnp.pay-url}")
    private String payUrl;

    @Value("${vnp.tmn-code}")
    private String tmnCode;

    @Value("${vnp.hash-secret}")
    private String hashSecret;

    @Value("${vnp.return-url}")
    private String returnUrl;

    @Value("${vnp.frontend-base-url}")
    private String frontendBaseUrl;

    public String getPayUrl() {
        return payUrl;
    }

    public String getTmnCode() {
        return tmnCode;
    }

    public String getHashSecret() {
        return hashSecret;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public String getFrontendBaseUrl() {
        return frontendBaseUrl;
    }

    /**
     * Computes HMAC-SHA512 signature.
     * Uses UTF-8 encoding for both key and data as per VNPay 2.1.0 spec.
     */
    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                return "";
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    /**
     * Gets the real client IP address, handling proxies and load balancers.
     */
    public static String getIpAddress(HttpServletRequest request) {
        String ipAddress;
        try {
            ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getRemoteAddr();
            }
            // Handle multiple IPs in X-Forwarded-For (take the first)
            if (ipAddress != null && ipAddress.contains(",")) {
                ipAddress = ipAddress.split(",")[0].trim();
            }
        } catch (Exception e) {
            ipAddress = "127.0.0.1";
        }
        return ipAddress;
    }
}
