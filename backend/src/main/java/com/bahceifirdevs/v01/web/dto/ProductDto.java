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
    String imageUrl
) {
  public static ProductDto from(Product p) {
    var cat = p.getCategory();
    return new ProductDto(
        p.getId(),
        p.getName(),
        p.getShortDescription(),
        p.getPriceTry(),
        p.getStock(),
        (cat != null ? cat.getId() : null),
        (cat != null ? cat.getName() : null),
        p.getImageUrl()
    );
  }
}
