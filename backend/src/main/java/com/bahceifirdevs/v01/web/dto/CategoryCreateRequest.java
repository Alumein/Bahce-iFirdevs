package com.bahceifirdevs.v01.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(
    @NotBlank @Size(max = 100) String name,
    @Size(max = 255) String description
) {}
