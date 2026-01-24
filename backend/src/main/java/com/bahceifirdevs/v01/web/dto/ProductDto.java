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
    String imageUrl2, // YENİ
    String imageUrl3, // YENİ
    Double averageRating
) {
  
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
        p.getImageUrl2(), // YENİ: Eklendi
        p.getImageUrl3(), // YENİ: Eklendi
        (averageRating != null ? averageRating : 0.0)
    );
  }

  public static ProductDto from(Product p) {
    return from(p, 0.0);
  }
}