package com.adora.repository;

import com.adora.entity.BillboardAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillboardAvailabilityRepository extends JpaRepository<BillboardAvailability, Long> {
    List<BillboardAvailability> findByBillboardId(Long billboardId);
    List<BillboardAvailability> findByBillboardIdAndAvailableDateBetween(Long billboardId, LocalDate startDate, LocalDate endDate);
}
