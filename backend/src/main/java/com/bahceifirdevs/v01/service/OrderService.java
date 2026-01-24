package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.config.RabbitConfig;
import com.bahceifirdevs.v01.domain.*;
import com.bahceifirdevs.v01.repository.CustomerRepository;
import com.bahceifirdevs.v01.repository.OrderRepository;
import com.bahceifirdevs.v01.repository.OrderStatusHistoryRepository;
import com.bahceifirdevs.v01.repository.ProductRepository;
import com.bahceifirdevs.v01.web.dto.OrderEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

  private final OrderRepository orderRepo;
  private final ProductRepository productRepo;
  private final OrderStatusHistoryRepository historyRepo;
  private final CustomerRepository customerRepo;
  private final RabbitTemplate rabbitTemplate;
  private final ShippingService shippingService; // YENİ: Kargo Servisi Eklendi

  // === 1. GÜVENLİ SİPARİŞ GETİRME ===
  @Transactional(readOnly = true)
  public Order getOneOrderSecured(Long orderId, Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new AccessDeniedException("Sipariş detaylarını görmek için giriş yapmalısınız.");
    }
    
    var order = orderRepo.findWithItemsById(orderId)
        .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderId));

    boolean isAdmin = authentication.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .anyMatch(role -> role.equals("ROLE_ADMIN"));

    if (isAdmin) {
      initializeGraph(order);
      return order;
    }

    String userEmail = authentication.getName();
    if (order.getBuyerEmail().equalsIgnoreCase(userEmail)) {
      initializeGraph(order);
      return order;
    }

    throw new AccessDeniedException("Bu siparişi görme yetkiniz yok.");
  }

  // === 2. SİPARİŞ OLUŞTURMA ===

  @Transactional
  public Order createOrder(String buyerName, String buyerEmail, String buyerPhone,
                           LocalDate deliveryDate, String deliveryTime,
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
        .deliveryDate(deliveryDate)
        .deliveryTime(deliveryTime)
        .build();

    return processAndSaveOrder(order, items);
  }

  @Transactional
  public Order createOrderForCustomer(Authentication authentication,
                                      String addressLine, String city, String district, String notes,
                                      LocalDate deliveryDate, String deliveryTime,
                                      List<ItemReq> items) {

    if (items == null || items.isEmpty()) {
      throw new IllegalArgumentException("Sipariş kalemi yok.");
    }

    String email = authentication.getName();
    Customer customer = customerRepo.findByEmail(email)
        .orElseThrow(() -> new IllegalStateException("Kimliği doğrulanmış müşteri bulunamadı: " + email));

    Order order = Order.builder()
        .customer(customer)
        .buyerName(customer.getFullName())
        .buyerEmail(customer.getEmail())
        .buyerPhone(customer.getPhone())
        .addressLine(addressLine) 
        .city(city)
        .district(district)
        .notes(notes)
        .deliveryDate(deliveryDate)
        .deliveryTime(deliveryTime)
        .status(OrderStatus.PENDING)
        .orderTotalTry(BigDecimal.ZERO)
        .build();

    return processAndSaveOrder(order, items);
  }

  /**
   * YENİ MANTIK: Kargo hesaplaması burada yapılıyor.
   */
  private Order processAndSaveOrder(Order order, List<ItemReq> items) {
    BigDecimal itemTotal = BigDecimal.ZERO;

    // 1. Ürünlerin Fiyatını Hesapla ve Stoktan Düş
    for (ItemReq i : items) {
      var product = productRepo.findById(i.productId())
          .orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı: " + i.productId()));

      if (i.quantity() <= 0) { throw new IllegalArgumentException("Geçersiz adet: " + i.quantity()); }
      if (product.getStock() < i.quantity()) { throw new IllegalArgumentException("Yetersiz stok: " + product.getName()); }

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
      itemTotal = itemTotal.add(lineTotal);
    }

    // 2. Kargo Ücretini Hesapla (YENİ)
    BigDecimal shippingCost = shippingService.calculateShippingCost(itemTotal, order.getDistrict());

    // 3. Toplam Tutara Kargoyu Ekle
    BigDecimal finalTotal = itemTotal.add(shippingCost);
    order.setOrderTotalTry(finalTotal);
    
    // (Opsiyonel: Eğer entity'de shippingCost alanı varsa buraya eklenebilir)
    // order.setShippingCost(shippingCost);

    var saved = orderRepo.save(order); 

    String logNote = "Sipariş oluşturuldu. Kargo: " + shippingCost + " TL. " + (order.getNotes() != null ? "Not var." : "");
    logStatusChange(saved, null, OrderStatus.PENDING, logNote);

    initializeGraph(saved);
    return saved;
  }

  // === 3. SİPARİŞ NOTU GÜNCELLEME ===
  @Transactional
  public void updateOrderNote(Long orderId, String newNote, Authentication authentication) {
    Order order = getOneOrderSecured(orderId, authentication);
    Set<OrderStatus> editableStatuses = EnumSet.of(OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PREPARING);
    if (!editableStatuses.contains(order.getStatus())) {
      throw new IllegalStateException("Sipariş kargoya verildiği için not güncellenemez.");
    }
    order.setNotes(newNote);
    orderRepo.save(order);
  }

  // === 4. ARAMA ===
  @Transactional(readOnly = true)
  public List<Order> searchOrders(String email) {
    List<Order> orders;
    if (email != null && !email.isBlank()) {
      orders = orderRepo.findByBuyerEmailOrderByCreatedAtDesc(email);
    } else {
      orders = orderRepo.findAllByOrderByCreatedAtDesc();
    }
    orders.forEach(this::initializeGraph);
    return orders;
  }

  public record ItemReq(Long productId, Integer quantity) {}

  // === 5. DURUM GÜNCELLEME ===
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
      throw new IllegalArgumentException("Sipariş son durumdadır. Değiştirilemez.");
    }
    if (!isAllowedTransition(from, toStatus)) {
      throw new IllegalArgumentException("Geçersiz durum geçişi.");
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

    logStatusChange(saved, from, toStatus, null);

    try {
      OrderEventDto event = new OrderEventDto(saved.getId(), saved.getBuyerEmail(), saved.getBuyerName(), saved.getOrderTotalTry());
      rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, RabbitConfig.ROUTING_KEY_ORDER_CREATED, event);
      
      if (toStatus == OrderStatus.PAID) {
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, RabbitConfig.ROUTING_KEY_ORDER_PAID, event);
      } else if (toStatus == OrderStatus.SHIPPED) {
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, RabbitConfig.ROUTING_KEY_ORDER_SHIPPED, event);
      }
    } catch (Exception e) {
      log.error("RabbitMQ hatası", e);
    }

    initializeGraph(saved);
    return saved;
  }

  @Transactional(readOnly = true)
  public List<OrderStatusHistory> history(Long orderId, Authentication authentication) {
    var order = getOneOrderSecured(orderId, authentication);
    return historyRepo.findByOrderIdOrderByChangedAtAsc(order.getId());
  }

  // === HELPER ===
  private static final Set<OrderStatus> TERMINAL = EnumSet.of(OrderStatus.DELIVERED, OrderStatus.CANCELED);

  private void initializeGraph(Order order) {
    if (order == null || order.getItems() == null) return;
    Hibernate.initialize(order.getItems());
    order.getItems().forEach(oi -> {
      if (oi.getProduct() != null) Hibernate.initialize(oi.getProduct());
    });
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
    return from == OrderStatus.PENDING || from == OrderStatus.PAID || from == OrderStatus.PREPARING;
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
  @Transactional
  public void deleteOrder(Long orderId) {
      // 1. Önce sipariş var mı kontrol et
      if (!orderRepo.existsById(orderId)) {
          throw new IllegalArgumentException("Sipariş bulunamadı: " + orderId);
      }

      // 2. Siparişin "Geçmiş" (History) kayıtlarını bul ve sil
      // (Eğer bunu yapmazsan Foreign Key hatası verir)
      List<OrderStatusHistory> histories = historyRepo.findByOrderIdOrderByChangedAtAsc(orderId);
      historyRepo.deleteAll(histories);

      // 3. Şimdi Siparişin kendisini sil
      // (Not: Order entity'sinde 'items' listesi için CascadeType.ALL tanımlı olduğunu varsayıyoruz)
      orderRepo.deleteById(orderId);
  }
}