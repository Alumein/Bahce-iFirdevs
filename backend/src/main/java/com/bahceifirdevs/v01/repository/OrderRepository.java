package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.Order;
import com.bahceifirdevs.v01.domain.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

  // Mevcut: E-postaya göre filtrele
  List<Order> findByBuyerEmailOrderByCreatedAtDesc(String buyerEmail);
  
  // YENİ: Tüm siparişleri tarihe göre (yeniden eskiye) getir
  List<Order> findAllByOrderByCreatedAtDesc();

  long countByStatus(OrderStatus status);
  
  @EntityGraph(attributePaths = {"items", "items.product"})
  Optional<Order> findWithItemsById(Long id);

  // === Dashboard Sorguları ===
  
  @Query("SELECT SUM(o.orderTotalTry) FROM Order o WHERE o.status = 'DELIVERED' OR o.status = 'PAID'")
  BigDecimal findTotalRevenue();

  long countByCreatedAtAfter(Instant timestamp);
  List<Order> findAllByStatusAndCreatedAtBefore(OrderStatus status, Instant createdAt);

  // === Yorum Yetki Sorgusu ===
  @Query("SELECT o FROM Order o JOIN o.items oi " +
         "WHERE o.customer.id = :customerId " +
         "AND oi.product.id = :productId " +
         "AND o.status = :status " +
         "ORDER BY o.createdAt DESC " +
         "LIMIT 1")
  Optional<Order> findFirstDeliveredOrderForProduct(
      @Param("customerId") Long customerId, 
      @Param("productId") Long productId, 
      @Param("status") OrderStatus status
  );
}