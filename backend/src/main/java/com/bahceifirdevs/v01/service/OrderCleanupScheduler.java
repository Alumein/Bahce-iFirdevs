package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Order;
import com.bahceifirdevs.v01.domain.OrderStatus;
import com.bahceifirdevs.v01.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCleanupScheduler {

    private final OrderRepository orderRepository;

    @Scheduled(fixedRate = 600000) 
    @Transactional
    public void deleteAbandonedOrders() {
        log.info("--- ZAMANLAYICI TETİKLENDİ: Temizlik kontrolü yapılıyor... ---");
        // Kontrol süresi yine 1 saat kalabilir veya onu da değiştirmek istersen:
        // Örneğin: LocalDateTime.now().minusMinutes(30); (30 dk öncesi)
        Instant cutOffTime = Instant.now().minus(10, ChronoUnit.MINUTES);

        List<Order> abandonedOrders = orderRepository.findAllByStatusAndCreatedAtBefore(OrderStatus.PENDING, cutOffTime);

        if (!abandonedOrders.isEmpty()) {
            log.info("Temizlik Zamanı: {} adet ödenmemiş sipariş siliniyor...", abandonedOrders.size());
            orderRepository.deleteAll(abandonedOrders);
        }
    }
}