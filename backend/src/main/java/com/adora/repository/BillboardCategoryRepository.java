package com.adora.repository;

import com.adora.entity.BillboardCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillboardCategoryRepository extends JpaRepository<BillboardCategory, Long> {
    Optional<BillboardCategory> findByName(String name);
}
