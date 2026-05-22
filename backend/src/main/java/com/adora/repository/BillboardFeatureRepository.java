package com.adora.repository;

import com.adora.entity.BillboardFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillboardFeatureRepository extends JpaRepository<BillboardFeature, Long> {
    List<BillboardFeature> findByBillboardId(Long billboardId);
}
