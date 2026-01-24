package com.bahceifirdevs.v01.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductUpdateRequest(
    @Size(max = 150) String name,
    @Size(max = 255) String shortDescription,
    @Positive BigDecimal priceTry,
    @Min(0) Integer stock,
    Long categoryId,
    @Size(max = 255) String imageUrl,
    @Size(max = 255) String imageUrl2, // YENİ
    @Size(max = 255) String imageUrl3  // YENİ
) {}