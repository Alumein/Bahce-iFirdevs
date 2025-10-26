package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Order;
import com.bahceifirdevs.v01.domain.OrderStatus;
import com.bahceifirdevs.v01.service.OrderService;
import com.bahceifirdevs.v01.web.dto.OrderStatusEventDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;

  // CREATE
  @PostMapping(consumes = "application/json", produces = "application/json")
  public OrderResponse create(@Valid @RequestBody CreateOrderRequest req) {
    var created = orderService.createOrder(
        req.buyerName(), req.buyerEmail(), req.buyerPhone(),
        req.addressLine(), req.city(), req.district(), req.notes(),
        req.items().stream().map(i -> new OrderService.ItemReq(i.productId(), i.quantity())).toList()
    );
    return OrderResponse.from(created);
  }

  // LIST BY EMAIL
  @GetMapping(produces = "application/json")
  public List<OrderResponse> listByEmail(@RequestParam("email") @Email String email) {
    return orderService.findByEmail(email).stream().map(OrderResponse::from).toList();
  }

  // UPDATE STATUS
  @PutMapping(value = "/{id}/status", consumes = "application/json", produces = "application/json")
  public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest req) {
    Order updated = orderService.updateStatus(id, req.status());
    return OrderResponse.from(updated);
  }

  // HISTORY
  @GetMapping(value = "/{id}/history", produces = "application/json")
  public List<OrderStatusEventDto> history(@PathVariable Long id) {
    return orderService.history(id).stream().map(OrderStatusEventDto::from).toList();
  }

  // ====== DTOs ======

  public record CreateOrderRequest(
      @NotNull String buyerName,
      @NotNull @Email String buyerEmail,
      String buyerPhone,
      @NotNull String addressLine,
      @NotNull String city,
      String district,
      String notes,
      @NotNull List<Item> items
  ) {
    public record Item(@NotNull Long productId, @NotNull Integer quantity) {}
  }

  public record UpdateStatusRequest(@NotNull OrderStatus status) {}

  public record OrderResponse(
      Long id,
      String status,
      BigDecimal orderTotalTry,
      String buyerName,
      String buyerEmail,
      List<OrderLine> items
  ) {
    public static OrderResponse from(Order o) {
      return new OrderResponse(
          o.getId(),
          o.getStatus().name(),
          o.getOrderTotalTry(),
          o.getBuyerName(),
          o.getBuyerEmail(),
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
}
