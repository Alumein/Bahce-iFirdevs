package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.District;
import com.bahceifirdevs.v01.repository.DistrictRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ShippingService {

    private final DistrictRepository districtRepository;

    @Transactional(readOnly = true)
    public BigDecimal calculateShippingCost(BigDecimal cartTotal, String districtName) {
        // 1. Kural: 2500 TL ve üzeri ÜCRETSİZ KARGO
        if (cartTotal.compareTo(new BigDecimal("5000")) >= 0) {
            return BigDecimal.ZERO;
        }

        // İlçe seçilmediyse varsayılan bir ücret dön (veya 0)
        if (districtName == null || districtName.trim().isEmpty()) {
             return new BigDecimal("250");
        }
        
        // 2. Kural: Veritabanından ilçeyi bul ve fiyatını al
        Optional<District> districtOpt = districtRepository.findByNameIgnoreCase(districtName.trim());
        
        if (districtOpt.isPresent()) {
            return districtOpt.get().getShippingPrice();
        }

        // Veritabanında yoksa varsayılan ücret (Güvenlik önlemi)
        return new BigDecimal("250");
    }
}