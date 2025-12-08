package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.config.RabbitConfig;
import com.bahceifirdevs.v01.web.dto.OrderEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j // Loglama için
@Service
@RequiredArgsConstructor
public class NotificationService {

  /**
   * RabbitMQ'daki 'q.notifications' kuyruğunu dinler.
   * Bu metot, kuyruğa mesaj geldiğinde ASENKRON olarak çalışır.
   */
  @RabbitListener(queues = RabbitConfig.QUEUE_NOTIFICATIONS)
  public void handleOrderPaidEvent(OrderEventDto event) {
    log.info(">>> NOTIFICATION: Sipariş Ödendi Mesajı Alındı!");
    log.info(">>> Sipariş ID: {}", event.orderId());
    log.info(">>> Müşteri: {}", event.customerName());
    
    //
    // BURASI GERÇEK E-POSTA GÖNDERİMİNİN (örn: Mailgun, SendGrid)
    // VEYA SMS GÖNDERİMİNİN YAPILACAĞI YERDİR
    //
    
    log.info(">>> SIMULASYON: '{}' adresine '{} TL tutarındaki " + 
             "siparişiniz (ID: {}) alındı' e-postası gönderiliyor...", 
             event.customerEmail(), event.totalAmount(), event.orderId());
    
    // Simülasyon için 2 saniye bekletelim (asenkron olduğunu görmek için)
    try {
      Thread.sleep(2000);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
    
    log.info(">>> SIMULASYON: E-posta gönderildi.");
  }
}