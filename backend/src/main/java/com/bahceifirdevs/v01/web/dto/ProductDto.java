package com.bahceifirdevs.v01.web.dto;

import com.bahceifirdevs.v01.domain.Product;
import java.math.BigDecimal;

public record ProductDto(
    Long id,
    String name,
    String shortDescription,
    BigDecimal priceTry,
    Integer stock,
    Long categoryId,
    String categoryName,
    String imageUrl,
    Double averageRating // YENİ ALAN
) {
  
  // YENİ: Ortalama puanı da alan metot (Detay sayfası için)
  public static ProductDto from(Product p, Double averageRating) {
    var cat = p.getCategory();
    return new ProductDto(
        p.getId(),
        p.getName(),
        p.getShortDescription(),
        p.getPriceTry(),
        p.getStock(),
        (cat != null ? cat.getId() : null),
        (cat != null ? cat.getName() : null),
        p.getImageUrl(),
        averageRating
    );
  }

  // ESKİ: Sadece ürünü alan metot (Liste sayfaları için, puanı 0.0 varsayarız)
  // Bu sayede liste sayfalarında N+1 sorgu performansı sorunu yaşamayız.
  public static ProductDto from(Product p) {
    return from(p, 0.0);
  }
}