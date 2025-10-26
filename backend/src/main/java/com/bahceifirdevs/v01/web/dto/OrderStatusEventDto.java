package com.bahceifirdevs.v01.web.dto;

import com.bahceifirdevs.v01.domain.OrderStatusHistory;

import java.time.Instant;

public record OrderStatusEventDto(
    Long id,
    String fromStatus,
    String toStatus,
    Instant changedAt,
    String note
) {
  public static OrderStatusEventDto from(OrderStatusHistory h) {
    return new OrderStatusEventDto(
        h.getId(),
        h.getFromStatus().name(),
        h.getToStatus().name(),
        h.getChangedAt(),
        h.getNote()
    );
  }
}
