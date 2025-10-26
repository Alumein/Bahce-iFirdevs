package com.bahceifirdevs.v01.web.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductCreateRequest(
    @NotBlank @Size(max = 150) String name,
    @Size(max = 255) String shortDescription,
    @NotNull @Positive BigDecimal priceTry,
    @NotNull @Min(0) Integer stock,
    @NotNull Long categoryId,
    @Size(max = 255) String imageUrl
) {}
