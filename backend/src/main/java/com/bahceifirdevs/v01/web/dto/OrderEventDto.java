package com.bahceifirdevs.v01.web.dto;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * RabbitMQ'ya gönderilecek sipariş olayı (event) mesajı.
 * (Tüm DTO'lar 'Serializable' olmalıdır)
 */
public record OrderEventDto(
    Long orderId,
    String customerEmail,
    String customerName,
    BigDecimal totalAmount
) implements Serializable {}