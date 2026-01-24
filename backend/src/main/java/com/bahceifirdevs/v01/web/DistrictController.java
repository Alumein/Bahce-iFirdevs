package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.District;
import com.bahceifirdevs.v01.repository.DistrictRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/districts")
@RequiredArgsConstructor
public class DistrictController {

    private final DistrictRepository districtRepository;

    @GetMapping
    public List<District> getAll() {
        return districtRepository.findAllByOrderByNameAsc();
    }

    @GetMapping("/active")
    public List<District> getActive() {
        return districtRepository.findByActiveTrueOrderByNameAsc();
    }

    @PostMapping
    public District create(@RequestBody District district) {
        // Varsayılan aktif gelsin ama request içinde false geldiyse ona uysun
        if (!district.isActive()) {
             district.setActive(true);
        }
        return districtRepository.save(district);
    }

    // --- YENİ EKLENEN METOT: DURUM DEĞİŞTİRME ---
    @PutMapping("/{id}/toggle-active")
    public void toggleActive(@PathVariable Long id) {
        District district = districtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("İlçe bulunamadı: " + id));
        
        // Mevcut durumu tersine çevir (True ise False, False ise True yap)
        district.setActive(!district.isActive());
        
        districtRepository.save(district);
    }
    // ---------------------------------------------

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        districtRepository.deleteById(id);
    }
}