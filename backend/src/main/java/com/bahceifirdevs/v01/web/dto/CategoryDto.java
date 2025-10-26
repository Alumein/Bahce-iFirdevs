package com.bahceifirdevs.v01.web.dto;

import com.bahceifirdevs.v01.domain.Category;

public record CategoryDto(
    Long id,
    String name,
    String description
) {
  public static CategoryDto from(Category c) {
    return new CategoryDto(
        c.getId(),
        c.getName(),
        c.getDescription()
    );
  }
}
