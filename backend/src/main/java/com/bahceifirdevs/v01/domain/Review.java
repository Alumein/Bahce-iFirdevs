package com.bahceifirdevs.v01.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity
@Table(name = "reviews", uniqueConstraints = {
    // Bir müşteri, bir siparişteki bir ürüne sadece 1 kez yorum yapabilir
    @UniqueConstraint(columnNames = {"order_id", "product_id", "customer_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "product_id")
  @JsonIgnore // Yorumu çekerken ürünü tekrar gösterme
  private Product product;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "customer_id")
  private Customer customer; // Yorumu yapan müşteri (isim/soyisim)

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id")
  @JsonIgnore // Güvenlik (sipariş ID'sini public API'de gösterme)
  private Order order; // Hangi siparişe istinaden yapıldığı

  @Column(nullable = false)
  @Min(1) @Max(5)
  private Integer rating; // 1-5 arası puan

  @Column(length = 1000)
  private String comment;
}