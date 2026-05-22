package com.adora.repository;

import com.adora.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBillboardId(Long billboardId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.billboard.id = :billboardId")
    Double getAverageRatingByBillboardId(@Param("billboardId") Long billboardId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.billboard.id = :billboardId")
    Long countByBillboardId(@Param("billboardId") Long billboardId);
}
