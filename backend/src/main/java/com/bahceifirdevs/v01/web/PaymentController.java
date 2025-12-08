package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Order;
import com.bahceifirdevs.v01.domain.OrderStatus;
import com.bahceifirdevs.v01.service.CartService;
import com.bahceifirdevs.v01.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime; // YENİ IMPORT
import java.time.LocalTime;     // YENİ IMPORT
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

  private final PaymentService paymentService;
  private final CartController cartController; 

  @PostMapping("/checkout")
  public OrderController.OrderResponse checkout(
      @Valid @RequestBody CheckoutRequest req,
      Authentication authentication,
      @RequestHeader(name = "X-Cart-ID", required = false) String cartIdHeader) {

    // 1. KESİN YETKİ KONTROLÜ
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new AccessDeniedException("Sipariş oluşturmak için lütfen giriş yapın veya kayıt olun.");
    }

    String cartKey = cartController.resolveCartKey(authentication, cartIdHeader);
    if (cartKey == null) {
      throw new IllegalArgumentException("Aktif bir sepet bulunamadı.");
    }

    Order paidOrder = paymentService.processCheckout(
        authentication, 
        cartKey, 
        req.addressLine(), 
        req.city(), 
        req.district(), 
        req.notes(),
        req.deliveryDate(), 
        req.deliveryTime()
    );

    return OrderController.OrderResponse.from(paidOrder);
  }

  // --- DTO ---
  public record CheckoutRequest(
      @NotNull String addressLine,
      @NotNull String city,
      String district,
      String notes,
      LocalDate deliveryDate, 
      String deliveryTime     
  ) {}


  // --- PAYMENT SERVICE ---
  @Service
  @RequiredArgsConstructor
  @Slf4j
  public static class PaymentService {
    
    private final CartService cartService;
    private final OrderService orderService;

    @Transactional
    public Order processCheckout(Authentication auth, String cartKey,
                                 String address, String city, String district, String notes,
                                 LocalDate deliveryDate, String deliveryTime) {
      
      // 1. ZAMAN DOĞRULAMASI (YENİ)
      validateDeliveryTime(deliveryDate, deliveryTime);

      // 2. SEPET KONTROLÜ
      CartService.CartDto cart = cartService.getCart(cartKey);
      if (cart == null || cart.getItems().isEmpty()) {
        throw new IllegalArgumentException("Sepetiniz boş.");
      }

      // 3. SİPARİŞ OLUŞTURMA
      List<OrderService.ItemReq> orderItems = cart.getItems().stream()
          .map(ci -> new OrderService.ItemReq(ci.getProductId(), ci.getQuantity()))
          .collect(Collectors.toList());

      Order pendingOrder = orderService.createOrderForCustomer(
          auth, address, city, district, notes, 
          deliveryDate, deliveryTime, 
          orderItems
      );
      
      log.info(">>> PAYMENT SERVICE: Sipariş (ID: {}) oluşturuldu. Teslimat: {} {}", pendingOrder.getId(), deliveryDate, deliveryTime);

      // 4. ÖDEME SİMÜLASYONU
      boolean paymentSuccess = simulatePaymentGateway(pendingOrder.getId(), pendingOrder.getOrderTotalTry());

      if (paymentSuccess) {
        Order paidOrder = orderService.updateStatus(pendingOrder.getId(), OrderStatus.PAID);
        cartService.clearCart(cartKey);
        return paidOrder;
      } else {
        throw new IllegalStateException("Ödeme işlemi banka tarafından reddedildi.");
      }
    }

    // --- YENİ: BACKEND TARAFLI ZAMAN DOĞRULAMA ---
    private void validateDeliveryTime(LocalDate date, String timeRange) {
        if (date == null || timeRange == null) {
            throw new IllegalArgumentException("Teslimat tarihi ve saati zorunludur.");
        }

        // Örn: "09:00 - 12:00" -> Sadece "09:00" kısmını alıp parse ediyoruz
        String startHourStr = timeRange.split("-")[0].trim(); // "09:00"
        LocalTime startTime = LocalTime.parse(startHourStr);
        
        LocalDateTime selectedDateTime = LocalDateTime.of(date, startTime);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime minAllowedTime = now.plusHours(2); // Şu an + 2 saat

        if (selectedDateTime.isBefore(now)) {
            throw new IllegalArgumentException("Geçmiş bir zamana sipariş verilemez.");
        }
        
        if (selectedDateTime.isBefore(minAllowedTime)) {
            throw new IllegalArgumentException("Siparişler teslimat saatinden en az 2 saat önce verilmelidir.");
        }
    }

    private boolean simulatePaymentGateway(Long orderId, BigDecimal amount) {
      try { Thread.sleep(500); } catch (InterruptedException e) { }
      return true;
    }
  }
}