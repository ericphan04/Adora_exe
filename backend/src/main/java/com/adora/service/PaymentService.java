package com.adora.service;

import com.adora.config.VnPayConfig;
import com.adora.dto.CreatePaymentRequest;
import com.adora.dto.PaymentDto;
import com.adora.entity.*;
import com.adora.exception.BadRequestException;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.BookingRepository;
import com.adora.repository.PaymentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final VnPayConfig vnPayConfig;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          VnPayConfig vnPayConfig,
                          @Lazy NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.vnPayConfig = vnPayConfig;
        this.notificationService = notificationService;
    }

    public String createPaymentUrl(CreatePaymentRequest request, Long renterId, HttpServletRequest httpServletRequest) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        if (!booking.getRenter().getId().equals(renterId)) {
            throw new BadRequestException("You can only pay for your own bookings");
        }

        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new BadRequestException("Payment can only be created for ACCEPTED bookings. Current status: " + booking.getStatus());
        }

        BigDecimal finalAmount = booking.getFinalAmount();
        BigDecimal platformCommission = finalAmount.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal ownerRevenue = finalAmount.subtract(platformCommission);

        // Generate unique txnRef (BookingId_Timestamp)
        String txnRef = booking.getId() + "_" + System.currentTimeMillis();

        // Create or update PENDING payment record
        Payment payment = paymentRepository.findByBookingRenterId(renterId).stream()
                .filter(p -> p.getBooking().getId().equals(booking.getId()) && p.getPaymentStatus() == PaymentStatus.PENDING)
                .findFirst()
                .orElse(null);

        if (payment == null) {
            payment = Payment.builder()
                    .booking(booking)
                    .amount(finalAmount)
                    .paymentMethod(request.getPaymentMethod())
                    .paymentStatus(PaymentStatus.PENDING)
                    .transactionCode(txnRef)
                    .platformCommission(platformCommission)
                    .ownerRevenue(ownerRevenue)
                    .build();
        } else {
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setTransactionCode(txnRef);
        }
        paymentRepository.save(payment);

        // Build VNPay Parameters Map
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());

        // VNPay requires amount * 100 (no decimal for VND)
        long amountInVnd = finalAmount.longValue() * 100;
        vnpParams.put("vnp_Amount", String.valueOf(amountInVnd));

        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don dat bang QC " + booking.getId());
        vnpParams.put("vnp_OrderType", "200000");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", VnPayConfig.getIpAddress(httpServletRequest));

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", now.format(formatter));

        // Expire time: +15 minutes
        LocalDateTime expireTime = now.plusMinutes(15);
        vnpParams.put("vnp_ExpireDate", expireTime.format(formatter));

        // Sort parameters alphabetically
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        // Build hashData (raw values, NO URL encoding) and query (URL encoded)
        // This is the correct VNPay 2.1.0 algorithm:
        // - hashData: fieldName=rawValue&fieldName=rawValue (for HMAC-SHA512)
        // - query: URLEncoded(fieldName)=URLEncoded(value)& (for HTTP query string)
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                // hashData uses raw (non-encoded) values
                hashData.append(fieldName).append("=").append(fieldValue);

                // query uses UTF-8 URL encoded values
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                if (itr.hasNext()) {
                    hashData.append("&");
                    query.append("&");
                }
            }
        }

        String secureHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        return vnPayConfig.getPayUrl() + "?" + query.toString();
    }

    public PaymentDto processCallback(Map<String, String> queryParams) {
        String vnpSecureHash = queryParams.get("vnp_SecureHash");

        if (vnpSecureHash == null || vnpSecureHash.isEmpty()) {
            throw new BadRequestException("Missing payment signature");
        }

        // Remove hash params before verifying signature
        Map<String, String> verifyParams = new HashMap<>(queryParams);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        // Sort alphabetically
        List<String> fieldNames = new ArrayList<>(verifyParams.keySet());
        Collections.sort(fieldNames);

        // Build hashData with RAW values (same method as createPaymentUrl)
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = verifyParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append("=").append(fieldValue);
                if (itr.hasNext()) {
                    hashData.append("&");
                }
            }
        }

        // Verify signature
        String calculatedHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        if (!calculatedHash.equalsIgnoreCase(vnpSecureHash)) {
            throw new BadRequestException("Invalid payment signature");
        }

        String txnRef = queryParams.get("vnp_TxnRef");
        String responseCode = queryParams.get("vnp_ResponseCode");

        // Parse Booking ID from transaction reference (format: BookingId_Timestamp)
        Long bookingId;
        try {
            bookingId = Long.parseLong(txnRef.split("_")[0]);
        } catch (Exception e) {
            throw new BadRequestException("Invalid transaction reference format");
        }

        Payment payment = paymentRepository.findByTransactionCode(txnRef)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found for txnRef: " + txnRef));

        Booking booking = payment.getBooking();

        if ("00".equals(responseCode)) {
            // Payment SUCCESS
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            booking.setStatus(BookingStatus.PAID);
            bookingRepository.save(booking);
            Payment saved = paymentRepository.save(payment);

            // Send notifications to renter and owner
            try {
                notificationService.sendPaymentSuccessNotifications(saved);
            } catch (Exception e) {
                // Don't fail the callback if notification fails
                System.err.println("Warning: Failed to send payment success notifications: " + e.getMessage());
            }
            return mapToDto(saved);
        } else {
            // Payment FAILED
            payment.setPaymentStatus(PaymentStatus.FAILED);
            Payment saved = paymentRepository.save(payment);

            // Send failure notification to renter
            try {
                notificationService.sendPaymentFailedNotification(saved);
            } catch (Exception e) {
                System.err.println("Warning: Failed to send payment failed notifications: " + e.getMessage());
            }
            return mapToDto(saved);
        }
    }

    public List<PaymentDto> getRenterPayments(Long renterId) {
        return paymentRepository.findByBookingRenterId(renterId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public PaymentDto getPaymentById(Long id, Long userId, Role role) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        if (role == Role.RENTER && !payment.getBooking().getRenter().getId().equals(userId)) {
            throw new BadRequestException("Access denied to payment transaction details");
        }

        return mapToDto(payment);
    }

    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    private PaymentDto mapToDto(Payment entity) {
        if (entity == null) return null;
        return PaymentDto.builder()
                .id(entity.getId())
                .bookingId(entity.getBooking().getId())
                .amount(entity.getAmount())
                .paymentMethod(entity.getPaymentMethod())
                .paymentStatus(entity.getPaymentStatus())
                .transactionCode(entity.getTransactionCode())
                .platformCommission(entity.getPlatformCommission())
                .ownerRevenue(entity.getOwnerRevenue())
                .paidAt(entity.getPaidAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
