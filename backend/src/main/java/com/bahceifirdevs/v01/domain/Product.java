package com.bahceifirdevs.v01.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product extends BaseEntity {

  @Column(nullable = false, length = 150)
  private String name;

  @Column(length = 255)
  private String shortDescription;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal priceTry; // sadece TRY

  @Column(nullable = false)
  private Integer stock; // sade yaklaşım: toplam stok

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "category_id")
  private Category category;

  @Column(length = 255)
  private String imageUrl; // opsiyonel: bir kapak görseli
}
