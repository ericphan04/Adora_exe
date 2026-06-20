package com.adora.repository;

import com.adora.entity.Payment;
import com.adora.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingRenterId(Long renterId);
    Optional<Payment> findByTransactionCode(String transactionCode);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.platformCommission), 0) FROM Payment p WHERE p.paymentStatus = :status")
    BigDecimal sumCommissionByStatus(@Param("status") PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.booking.renter.id = :renterId AND p.paymentStatus = 'SUCCESS'")
    BigDecimal sumSpendingByRenterId(@Param("renterId") Long renterId);

    @Query("SELECT COALESCE(SUM(p.ownerRevenue), 0) FROM Payment p WHERE p.booking.billboard.owner.id = :ownerId AND p.paymentStatus = 'SUCCESS'")
    BigDecimal sumRevenueByOwnerId(@Param("ownerId") Long ownerId);
    List<Payment> findByBookingIdIn(List<Long> bookingIds);
}
