package com.adora.service;

import com.adora.config.VnPayConfig;
import com.adora.dto.CreatePaymentRequest;
import com.adora.dto.PaymentDto;
import com.adora.entity.*;
import com.adora.exception.BadRequestException;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.BookingRepository;
import com.adora.repository.PaymentRepository;
import com.adora.service.NotificationService;
import com.adora.entity.NotificationType;
import jakarta.servlet.http.HttpServletRequest;
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
                          NotificationService notificationService) {
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

        // Generate txnRef code
        String txnRef = booking.getId() + "_" + System.currentTimeMillis();

        // Create or update pending payment record
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

        // VNPay Parameters
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        
        // Amount needs to be multiplied by 100 for VND
        BigDecimal amountInCents = finalAmount.multiply(BigDecimal.valueOf(100));
        vnpParams.put("vnp_Amount", String.valueOf(amountInCents.longValue()));
        
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Pay for booking " + booking.getId());
        vnpParams.put("vnp_OrderType", "200000"); // billpayment
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        
        vnpParams.put("vnp_IpAddr", VnPayConfig.getIpAddress(httpServletRequest));

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", now.format(formatter));

        // Build query string
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnpParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    // Hash data (without url encoding raw values, or with encoding depending on VNPay requirements)
                    // VNPay 2.1.0 requires fields in hashData to be URL encoded using StandardCharsets.US_ASCII or StandardCharsets.UTF_8
                    hashData.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                            .append("=")
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    throw new BadRequestException("Encoding error: " + e.getMessage());
                }
                
                if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                    query.append("&");
                    hashData.append("&");
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }

    public PaymentDto processCallback(Map<String, String> queryParams) {
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        
        // Remove hash params to verify signature
        Map<String, String> verifyParams = new HashMap<>(queryParams);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(verifyParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = verifyParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    hashData.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    throw new BadRequestException("Signature verification encoding error");
                }
                if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                    hashData.append("&");
                }
            }
        }

        String calculatedHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        if (!calculatedHash.equalsIgnoreCase(vnp_SecureHash)) {
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
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found for booking: " + bookingId));

        Booking booking = payment.getBooking();

        if ("00".equals(responseCode)) {
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            
            booking.setStatus(BookingStatus.PAID);
            bookingRepository.save(booking);

            // 1. Send PAYMENT_SUCCESS to renter
            notificationService.createNotification(
                    booking.getRenter(),
                    "Thanh toán thành công",
                    "Giao dịch thanh toán thành công cho đơn đặt màn hình LED #" + booking.getId() + " (" + booking.getBillboard().getTitle() + ")",
                    NotificationType.PAYMENT_SUCCESS,
                    booking,
                    payment
            );

            // 2. Send BOOKING_PAID to billboard owner
            notificationService.createNotification(
                    booking.getBillboard().getOwner(),
                    "Đơn đặt bảng đã thanh toán",
                    "Đơn thuê màn hình LED #" + booking.getId() + " (" + booking.getBillboard().getTitle() + ") của bạn đã được thanh toán thành công bởi " + booking.getRenter().getFullName(),
                    NotificationType.BOOKING_PAID,
                    booking,
                    payment
            );
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            
            // Send PAYMENT_FAILED to renter
            notificationService.createNotification(
                    booking.getRenter(),
                    "Thanh toán thất bại",
                    "Thanh toán cho đơn đặt màn hình LED #" + booking.getId() + " (" + booking.getBillboard().getTitle() + ") đã thất bại hoặc bị hủy bỏ.",
                    NotificationType.PAYMENT_FAILED,
                    booking,
                    payment
            );
        }

        Payment saved = paymentRepository.save(payment);
        return mapToDto(saved);
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
