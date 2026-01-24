package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Order;
import com.bahceifirdevs.v01.domain.OrderStatus;
import com.bahceifirdevs.v01.service.OrderService;
import com.bahceifirdevs.v01.web.dto.OrderStatusEventDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;

  // GET ONE ORDER (SİPARİŞ DETAYI)
  @GetMapping(value = "/{id}", produces = "application/json")
  public OrderResponse getOrderById(@PathVariable Long id, Authentication authentication) {
    var order = orderService.getOneOrderSecured(id, authentication);
    return OrderResponse.from(order);
  }

  // CREATE (Misafir veya Müşteri)
  @PostMapping(consumes = "application/json", produces = "application/json")
  public OrderResponse create(@Valid @RequestBody CreateOrderRequest req,
                              Authentication authentication) {
    
    var itemsList = req.items().stream()
        .map(i -> new OrderService.ItemReq(i.productId(), i.quantity()))
        .toList();

    Order createdOrder;

    if (authentication != null && authentication.isAuthenticated()) {
      // 1. KULLANICI GİRİŞ YAPMIŞ (HESABA BAĞLA)
      createdOrder = orderService.createOrderForCustomer(
          authentication,
          req.addressLine(), req.city(), req.district(), req.notes(),
          req.deliveryDate(), req.deliveryTime(),
          itemsList
      );
    } else {
      // 2. MİSAFİR KULLANICI (GUEST CHECKOUT)
      createdOrder = orderService.createOrder(
          req.buyerName(), req.buyerEmail(), req.buyerPhone(),
          req.deliveryDate(), req.deliveryTime(),
          req.addressLine(), req.city(), req.district(), req.notes(),
          itemsList
      );
    }
    return OrderResponse.from(createdOrder);
  }

  // LIST MY ORDERS (Müşteri için)
  @GetMapping(value = "/me", produces = "application/json")
  public List<OrderResponse> listMyOrders(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      return List.of();
    }
    String email = authentication.getName(); // Giriş yapan kullanıcının e-postası
    // searchOrders metodu artık email ile çağrılırsa filtreler
    return orderService.searchOrders(email).stream().map(OrderResponse::from).toList();
  }


  // LIST ALL / SEARCH ORDERS (Sadece Admin için)
  // 'email' parametresi required=false yapıldı. Boşsa tümünü getirir.
  @GetMapping(produces = "application/json")
  public List<OrderResponse> listOrders(@RequestParam(name = "email", required = false) String email) {
    return orderService.searchOrders(email).stream().map(OrderResponse::from).toList();
  }

  // UPDATE STATUS (Sadece Admin için)
  @PutMapping(value = "/{id}/status", consumes = "application/json", produces = "application/json")
  public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest req) {
    Order updated = orderService.updateStatus(id, req.status());
    return OrderResponse.from(updated);
  }
  
  // YENİ: Müşteri Sipariş Notu Güncelleme (V3)
  @PutMapping(value = "/{id}/note", consumes = "application/json")
  public ResponseEntity<?> updateOrderNote(@PathVariable Long id, 
                                           @Valid @RequestBody UpdateNoteRequest req,
                                           Authentication authentication) {
    orderService.updateOrderNote(id, req.note(), authentication);
    return ResponseEntity.ok().build();
  }

  // HISTORY (Güvenli)
  @GetMapping(value = "/{id}/history", produces = "application/json")
  public List<OrderStatusEventDto> history(@PathVariable Long id, Authentication authentication) {
    return orderService.history(id, authentication).stream()
        .map(OrderStatusEventDto::from).toList();
  }

  // ====== DTOs ======

public record CreateOrderRequest(
      String buyerName, 
      @Email String buyerEmail, 
      String buyerPhone,
      @NotNull String addressLine, 
      @NotNull String city, 
      String district,
      String notes, 
      LocalDate deliveryDate,
      String deliveryTime,
      @NotNull List<Item> items
  ) {
    public record Item(@NotNull Long productId, @NotNull Integer quantity) {}
  }
  
  public record UpdateNoteRequest(
      @Size(max = 255, message = "Not çok uzun") String note
  ) {}

  public record UpdateStatusRequest(@NotNull OrderStatus status) {}


  public record OrderResponse(
      Long id,
      String status,
      BigDecimal orderTotalTry,
      String buyerName,
      String buyerEmail,
      String buyerPhone, 
      String addressLine, 
      String city,        
      String district,    
      String notes,
      LocalDate deliveryDate,
      String deliveryTime,
      List<OrderLine> items
  ) {
    public static OrderResponse from(Order o) {
      return new OrderResponse(
          o.getId(),
          o.getStatus().name(),
          o.getOrderTotalTry(),
          o.getBuyerName(),
          o.getBuyerEmail(),
          o.getBuyerPhone(),
          o.getAddressLine(),
          o.getCity(),
          o.getDistrict(),
          o.getNotes(),
          o.getDeliveryDate(),
          o.getDeliveryTime(),
          o.getItems().stream()
            .map(oi -> new OrderLine(
                oi.getProduct() != null ? oi.getProduct().getId() : null,
                oi.getProductName(),
                oi.getUnitPriceTry(),
                oi.getQuantity(),
                oi.getLineTotalTry()
            )).toList()
      );
    }
    public record OrderLine(Long productId, String productName,
                            BigDecimal unitPriceTry, Integer quantity,
                            BigDecimal lineTotalTry) {}
  }
  @DeleteMapping(value = "/{id}")
  public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
    orderService.deleteOrder(id);
    return ResponseEntity.noContent().build();
  }
}