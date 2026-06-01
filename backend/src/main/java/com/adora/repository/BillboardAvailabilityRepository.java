package com.adora.repository;

import com.adora.entity.BillboardAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillboardAvailabilityRepository extends JpaRepository<BillboardAvailability, Long> {
    List<BillboardAvailability> findByBillboardId(Long billboardId);
    List<BillboardAvailability> findByBillboardIdAndAvailableDateBetween(Long billboardId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(a) FROM BillboardAvailability a WHERE a.billboard.owner.id = :ownerId")
    long countTotalSlotsByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(a) FROM BillboardAvailability a WHERE a.billboard.owner.id = :ownerId AND a.status = com.adora.entity.AvailabilityStatus.BOOKED")
    long countBookedSlotsByOwnerId(@Param("ownerId") Long ownerId);
}
