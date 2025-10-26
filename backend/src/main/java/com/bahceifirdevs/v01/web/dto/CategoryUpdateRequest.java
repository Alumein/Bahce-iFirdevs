package com.bahceifirdevs.v01.web.dto;

import jakarta.validation.constraints.Size;

public record CategoryUpdateRequest(
    @Size(max = 100) String name,
    @Size(max = 255) String description
) {}
