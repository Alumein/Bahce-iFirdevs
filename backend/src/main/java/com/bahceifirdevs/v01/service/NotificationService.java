package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.config.RabbitConfig;
import com.bahceifirdevs.v01.repository.OrderRepository;
import com.bahceifirdevs.v01.web.dto.CustomerEventDto;
import com.bahceifirdevs.v01.web.dto.OrderEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailService emailService;
    private final OrderRepository orderRepo;

    // 1. KAYIT OLMA (Welcome Queue Dinleyicisi)
    @RabbitListener(queues = RabbitConfig.QUEUE_WELCOME_EMAIL)
    public void handleWelcomeEvent(CustomerEventDto event) {
        log.info("📨 RabbitMQ: Kayıt olundu, mail atılıyor -> {}", event.email());
        emailService.sendWelcomeEmail(event.email(), event.fullName());
    }

    // 2. SİPARİŞ VERİLDİ (Order Created Queue Dinleyicisi)
    @RabbitListener(queues = RabbitConfig.QUEUE_ORDER_CREATED_EMAIL)
    public void handleOrderCreatedEvent(OrderEventDto event) {
        log.info("📦 RabbitMQ: Sipariş oluşturuldu, mail atılıyor -> ID: {}", event.orderId());
        
        // Mesajda sadece ID var, siparişin detaylarını veritabanından çekip mail atıyoruz
        orderRepo.findWithItemsById(event.orderId()).ifPresentOrElse(
            order -> emailService.sendOrderReceivedEmail(order.getBuyerEmail(), order),
            () -> log.error("❌ Sipariş veritabanında bulunamadı ID: {}", event.orderId())
        );
    }
}