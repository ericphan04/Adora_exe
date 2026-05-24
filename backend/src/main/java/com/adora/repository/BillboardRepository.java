package com.adora.repository;

import com.adora.entity.Billboard;
import com.adora.entity.BillboardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BillboardRepository extends JpaRepository<Billboard, Long> {

    List<Billboard> findByOwnerId(Long ownerId);

    List<Billboard> findByStatus(BillboardStatus status);

    @Query("SELECT DISTINCT b FROM Billboard b " +
            "LEFT JOIN b.features f " +
            "WHERE (:status IS NULL OR b.status = :status) " +
            "AND (:categoryId IS NULL OR b.category.id = :categoryId) " +
            "AND (CAST(:city AS string) IS NULL OR LOWER(b.city) = CAST(:city AS string)) " +
            "AND (CAST(:district AS string) IS NULL OR LOWER(b.district) = CAST(:district AS string)) " +
            "AND (:minPrice IS NULL OR b.pricePerDay >= :minPrice) " +
            "AND (:maxPrice IS NULL OR b.pricePerDay <= :maxPrice) " +
            "AND (:featured IS NULL OR b.isFeatured = :featured) " +
            "AND (CAST(:keyword AS string) IS NULL OR LOWER(b.title) LIKE CAST(:keyword AS string) " +
            "  OR LOWER(b.description) LIKE CAST(:keyword AS string) " +
            "  OR LOWER(b.address) LIKE CAST(:keyword AS string) " +
            "  OR LOWER(b.city) LIKE CAST(:keyword AS string) " +
            "  OR LOWER(b.district) LIKE CAST(:keyword AS string)) " +
            "AND (CAST(:feature AS string) IS NULL OR LOWER(f.name) = CAST(:feature AS string))")
    List<Billboard> searchBillboards(
            @Param("status") BillboardStatus status,
            @Param("categoryId") Long categoryId,
            @Param("city") String city,
            @Param("district") String district,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("featured") Boolean featured,
            @Param("keyword") String keyword,
            @Param("feature") String feature
    );
}
