package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.service.CartService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

  private final CartService cartService;

  public record CartResponse(String cartId, CartService.CartDto cart) {}
  public record AddItemRequest(@NotNull Long productId, @NotNull @Min(1) Integer quantity) {}
  public record UpdateQtyRequest(@NotNull Long productId, @NotNull @Min(0) Integer quantity) {}
  public record ApplyCouponRequest(@NotBlank String code) {} // YENİ

  @GetMapping
  public ResponseEntity<CartResponse> getCart(
      Authentication authentication,
      @RequestHeader(name = "X-Cart-ID", required = false) String cartIdHeader) {
    String cartKey = resolveCartKey(authentication, cartIdHeader);
    var cart = cartService.getCart(cartKey);
    return ResponseEntity.ok(new CartResponse(cart.getCartId(), cart));
  }

  @PostMapping("/add")
  public ResponseEntity<CartResponse> addItem(
      @Valid @RequestBody AddItemRequest req,
      Authentication authentication,
      @RequestHeader(name = "X-Cart-ID", required = false) String cartIdHeader) {
    String cartKey = resolveCartKey(authentication, cartIdHeader);
    var cart = cartService.addItemToCart(cartKey, req.productId(), req.quantity());
    return ResponseEntity.ok(new CartResponse(cart.getCartId(), cart));
  }

  @DeleteMapping("/remove/{productId}")
  public ResponseEntity<CartResponse> removeItem(
      @PathVariable Long productId,
      Authentication authentication,
      @RequestHeader(name = "X-Cart-ID", required = false) String cartIdHeader) {
    String cartKey = resolveCartKey(authentication, cartIdHeader);
    if (cartKey == null) return ResponseEntity.ok(new CartResponse(null, null));
    var cart = cartService.removeItemFromCart(cartKey, productId);
    return ResponseEntity.ok(new CartResponse(cart.getCartId(), cart));
  }

  @PutMapping("/update")
  public ResponseEntity<CartResponse> updateQuantity(
      @Valid @RequestBody UpdateQtyRequest req,
      Authentication authentication,
      @RequestHeader(name = "X-Cart-ID", required = false) String cartIdHeader) {
    String cartKey = resolveCartKey(authentication, cartIdHeader);
    if (cartKey == null) return ResponseEntity.ok(new CartResponse(null, null));
    var cart = cartService.updateItemQuantity(cartKey, req.productId(), req.quantity());
    return ResponseEntity.ok(new CartResponse(cart.getCartId(), cart));
  }

  @DeleteMapping
  public ResponseEntity<?> clearCart(
      Authentication authentication,
      @RequestHeader(name = "X-Cart-ID", required = false) String cartIdHeader) {
    String cartKey = resolveCartKey(authentication, cartIdHeader);
    if (cartKey != null) cartService.clearCart(cartKey);
    return ResponseEntity.noContent().build();
  }

  // === YENİ: KUPON ENDPOINT'LERİ ===

  @PostMapping("/coupon")
  public ResponseEntity<CartResponse> applyCoupon(
      @Valid @RequestBody ApplyCouponRequest req,
      Authentication authentication,
      @RequestHeader(name = "X-Cart-ID", required = false) String cartIdHeader) {
    
    String cartKey = resolveCartKey(authentication, cartIdHeader);
    if (cartKey == null) throw new IllegalArgumentException("Sepetiniz boş.");
    
    var cart = cartService.applyCoupon(cartKey, req.code());
    return ResponseEntity.ok(new CartResponse(cart.getCartId(), cart));
  }

  @DeleteMapping("/coupon")
  public ResponseEntity<CartResponse> removeCoupon(
      Authentication authentication,
      @RequestHeader(name = "X-Cart-ID", required = false) String cartIdHeader) {
    
    String cartKey = resolveCartKey(authentication, cartIdHeader);
    if (cartKey == null) return ResponseEntity.ok(new CartResponse(null, null));
    var cart = cartService.removeCoupon(cartKey);
    return ResponseEntity.ok(new CartResponse(cart.getCartId(), cart));
  }

  // ------------------------------------------------

  public String resolveCartKey(Authentication authentication, String cartIdHeader) {
    if (authentication != null && authentication.isAuthenticated()) {
      return authentication.getName();
    }
    if (cartIdHeader != null && !cartIdHeader.isBlank()) {
      return cartIdHeader;
    }
    return UUID.randomUUID().toString();
  }
}