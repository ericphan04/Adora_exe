package com.adora.repository;

import com.adora.entity.BillboardImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillboardImageRepository extends JpaRepository<BillboardImage, Long> {
    List<BillboardImage> findByBillboardId(Long billboardId);
}
