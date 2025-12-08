package com.bahceifirdevs.v01.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon extends BaseEntity {

  @Column(nullable = false, unique = true, length = 50)
  private String code; // Örn: "BAHAR20"

  @Column(nullable = false)
  private Integer discountPercentage; // Örn: 20

  @Column(nullable = false)
  private LocalDate expirationDate;

  @Column(nullable = false)
  private BigDecimal minCartAmount;

  private boolean isActive;

  public boolean isValid() {
    return isActive && LocalDate.now().isBefore(expirationDate.plusDays(1));
  }
}