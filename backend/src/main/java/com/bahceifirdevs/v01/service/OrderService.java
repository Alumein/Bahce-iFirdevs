package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.*;
import com.bahceifirdevs.v01.repository.OrderRepository;
import com.bahceifirdevs.v01.repository.OrderStatusHistoryRepository;
import com.bahceifirdevs.v01.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

  private final OrderRepository orderRepo;
  private final ProductRepository productRepo;
  private final OrderStatusHistoryRepository historyRepo;

  // === CREATE ===
  @Transactional
  public Order createOrder(String buyerName, String buyerEmail, String buyerPhone,
                           String addressLine, String city, String district, String notes,
                           List<ItemReq> items) {

    if (items == null || items.isEmpty()) {
      throw new IllegalArgumentException("Sipariş kalemi yok.");
    }

    Order order = Order.builder()
        .buyerName(buyerName)
        .buyerEmail(buyerEmail)
        .buyerPhone(buyerPhone)
        .addressLine(addressLine)
        .city(city)
        .district(district)
        .notes(notes)
        .status(OrderStatus.PENDING)
        .orderTotalTry(BigDecimal.ZERO)
        .build();

    BigDecimal total = BigDecimal.ZERO;

    for (ItemReq i : items) {
      var product = productRepo.findById(i.productId())
          .orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı: " + i.productId()));

      if (i.quantity() <= 0) {
        throw new IllegalArgumentException("Geçersiz adet: " + i.quantity());
      }
      if (product.getStock() < i.quantity()) {
        throw new IllegalArgumentException("Yetersiz stok: " + product.getName());
      }

      product.setStock(product.getStock() - i.quantity());

      var lineTotal = product.getPriceTry().multiply(BigDecimal.valueOf(i.quantity()));

      OrderItem oi = OrderItem.builder()
          .product(product)
          .productName(product.getName())
          .unitPriceTry(product.getPriceTry())
          .quantity(i.quantity())
          .lineTotalTry(lineTotal)
          .build();

      order.addItem(oi);
      total = total.add(lineTotal);
    }

    order.setOrderTotalTry(total);
    var saved = orderRepo.save(order);

    // İlk durum kaydı (PENDING)
    logStatusChange(saved, null, OrderStatus.PENDING, "Order created");

    Hibernate.initialize(saved.getItems());
    saved.getItems().forEach(oi -> { if (oi.getProduct() != null) Hibernate.initialize(oi.getProduct()); });

    return saved;
  }

  // === QUERY BY EMAIL ===
  @Transactional(readOnly = true)
  public List<Order> findByEmail(String email) {
    var orders = orderRepo.findByBuyerEmailOrderByCreatedAtDesc(email);
    orders.forEach(o -> {
      Hibernate.initialize(o.getItems());
      o.getItems().forEach(oi -> { if (oi.getProduct() != null) Hibernate.initialize(oi.getProduct()); });
    });
    return orders;
  }

  public record ItemReq(Long productId, Integer quantity) {}

  // === STATUS UPDATE ===
  private static final Set<OrderStatus> TERMINAL = EnumSet.of(OrderStatus.DELIVERED, OrderStatus.CANCELED);

  @Transactional
  public Order updateStatus(Long orderId, OrderStatus toStatus) {
    var order = orderRepo.findWithItemsById(orderId)
        .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderId));

    var from = order.getStatus();
    if (from == toStatus) {
      initializeGraph(order);
      return order;
    }
    if (TERMINAL.contains(from)) {
      throw new IllegalArgumentException("Bu sipariş son durumdadır (" + from + "). Değiştirilemez.");
    }
    if (!isAllowedTransition(from, toStatus)) {
      throw new IllegalArgumentException("Geçersiz durum geçişi: " + from + " -> " + toStatus);
    }

    if (toStatus == OrderStatus.CANCELED && canRestockOnCancel(from)) {
      for (var oi : order.getItems()) {
        var p = oi.getProduct();
        if (p != null) {
          p.setStock(p.getStock() + oi.getQuantity());
          productRepo.save(p);
        }
      }
    }

    order.setStatus(toStatus);
    var saved = orderRepo.save(order);

    // Geçişi logla
    logStatusChange(saved, from, toStatus, null);

    initializeGraph(saved);
    return saved;
  }

  // === HISTORY ===
  @Transactional(readOnly = true)
  public List<OrderStatusHistory> history(Long orderId) {
    return historyRepo.findByOrderIdOrderByChangedAtAsc(orderId);
  }

  private void initializeGraph(Order order) {
    Hibernate.initialize(order.getItems());
    order.getItems().forEach(oi -> { if (oi.getProduct() != null) Hibernate.initialize(oi.getProduct()); });
  }

  private boolean isAllowedTransition(OrderStatus from, OrderStatus to) {
    return switch (from) {
      case PENDING   -> (to == OrderStatus.PAID || to == OrderStatus.CANCELED);
      case PAID      -> (to == OrderStatus.PREPARING || to == OrderStatus.CANCELED);
      case PREPARING -> (to == OrderStatus.SHIPPED || to == OrderStatus.CANCELED);
      case SHIPPED   -> (to == OrderStatus.DELIVERED);
      case DELIVERED, CANCELED -> false;
    };
  }

  private boolean canRestockOnCancel(OrderStatus from) {
    return from == OrderStatus.PENDING
        || from == OrderStatus.PAID
        || from == OrderStatus.PREPARING;
  }

  private void logStatusChange(Order order, OrderStatus from, OrderStatus to, String note) {
    var h = OrderStatusHistory.builder()
        .order(order)
        .fromStatus(from == null ? OrderStatus.PENDING : from)
        .toStatus(to)
        .note(note)
        .build();
    historyRepo.save(h);
  }
}
