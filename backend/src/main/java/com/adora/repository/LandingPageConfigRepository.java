package com.adora.repository;

import com.adora.entity.LandingPageConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LandingPageConfigRepository extends JpaRepository<LandingPageConfig, Long> {
}
