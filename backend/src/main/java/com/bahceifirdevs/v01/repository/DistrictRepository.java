package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.District;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DistrictRepository extends JpaRepository<District, Long> {
    List<District> findAllByOrderByNameAsc();
    List<District> findByActiveTrueOrderByNameAsc();
    
    // İsme göre (büyük/küçük harf duyarsız) bulmak için
    Optional<District> findByNameIgnoreCase(String name);
}