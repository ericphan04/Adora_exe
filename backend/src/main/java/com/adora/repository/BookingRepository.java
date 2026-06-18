package com.adora.repository;

import com.adora.entity.Booking;
import com.adora.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRenterId(Long renterId);
    List<Booking> findByBillboardOwnerId(Long ownerId);

    // Renter Dashboard Optimizations
    long countByRenterIdAndStatusIn(Long renterId, List<BookingStatus> statuses);
    List<Booking> findByRenterIdAndStatusInAndStartDateAfter(Long renterId, List<BookingStatus> statuses, LocalDateTime date);
    List<Booking> findTop5ByRenterIdOrderByCreatedAtDesc(Long renterId);

    // Owner Dashboard Optimizations
    long countByBillboardOwnerIdAndStatus(Long ownerId, BookingStatus status);
    List<Booking> findTop5ByBillboardOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.billboard.id = :billboardId " +
           "AND b.status IN (com.adora.entity.BookingStatus.PENDING, com.adora.entity.BookingStatus.ACCEPTED, com.adora.entity.BookingStatus.PAID, com.adora.entity.BookingStatus.RUNNING) " +
           "AND b.startDate < :endDate AND b.endDate > :startDate")
    long countOverlappingBookings(@Param("billboardId") Long billboardId, 
                                 @Param("startDate") LocalDateTime startDate, 
                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT b FROM Booking b WHERE b.billboard.id = :billboardId " +
           "AND b.status IN (com.adora.entity.BookingStatus.PENDING, com.adora.entity.BookingStatus.ACCEPTED, com.adora.entity.BookingStatus.PAID, com.adora.entity.BookingStatus.RUNNING) " +
           "AND b.startDate < :endOfDay AND b.endDate > :startOfDay")
    List<Booking> findActiveBookingsForBillboardOnDate(@Param("billboardId") Long billboardId,
                                                       @Param("startOfDay") LocalDateTime startOfDay,
                                                       @Param("endOfDay") LocalDateTime endOfDay);
}
