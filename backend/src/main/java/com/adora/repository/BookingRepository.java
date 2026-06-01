package com.adora.repository;

import com.adora.entity.Booking;
import com.adora.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRenterId(Long renterId);
    List<Booking> findByBillboardOwnerId(Long ownerId);

    // Renter Dashboard Optimizations
    long countByRenterIdAndStatusIn(Long renterId, List<BookingStatus> statuses);
    List<Booking> findByRenterIdAndStatusInAndStartDateAfter(Long renterId, List<BookingStatus> statuses, LocalDate date);
    List<Booking> findTop5ByRenterIdOrderByCreatedAtDesc(Long renterId);

    // Owner Dashboard Optimizations
    long countByBillboardOwnerIdAndStatus(Long ownerId, BookingStatus status);
    List<Booking> findTop5ByBillboardOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, BookingStatus status);
}
