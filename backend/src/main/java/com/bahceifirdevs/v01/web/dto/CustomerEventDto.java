package com.bahceifirdevs.v01.web.dto;

import java.io.Serializable;

/**
 * RabbitMQ'ya gönderilecek "Müşteri Kaydoldu" olayı (event) mesajı.
 */
public record CustomerEventDto(
    Long customerId,
    String email,
    String fullName
) implements Serializable {}