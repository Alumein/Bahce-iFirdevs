package com.bahceifirdevs.v01.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "districts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class District {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // İlçe adı (Örn: Kadıköy)

    @Column(nullable = false)
    private BigDecimal shippingPrice; // Kargo Ücreti (Örn: 250.00)

    @Column(nullable = false)
    private boolean active; // Aktif/Pasif durumu
}