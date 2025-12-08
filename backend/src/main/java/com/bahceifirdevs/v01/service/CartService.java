package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Coupon;
import com.bahceifirdevs.v01.domain.Product;
import com.bahceifirdevs.v01.repository.CouponRepository; // YENİ
import com.bahceifirdevs.v01.repository.ProductRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

  private final RedisTemplate<String, Object> redisTemplate;
  private final ProductRepository productRepo;
  private final CouponRepository couponRepo; // YENİ: Geri eklendi

  private static final String CART_KEY_PREFIX = "cart:";
  private static final Duration CART_TTL = Duration.ofDays(7);

  public CartDto getCart(String cartKey) {
    CartDto cart = (CartDto) redisTemplate.opsForValue().get(getRedisKey(cartKey));
    // Sepet her çekildiğinde (varsa) kuponu tekrar doğrula
    if (cart != null && cart.getCouponCode() != null) {
      validateAndRecalculateCoupon(cart);
    }
    return (cart != null) ? cart : createEmptyCart(cartKey);
  }

  private void saveCart(CartDto cart) {
    redisTemplate.opsForValue().set(getRedisKey(cart.getCartId()), cart, CART_TTL);
  }

  @Transactional(readOnly = true)
  public CartDto addItemToCart(String cartKey, Long productId, int quantity) {
    Product product = productRepo.findById(productId)
        .orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı: " + productId));
    if (product.getStock() < quantity) {
      throw new IllegalArgumentException("Yetersiz stok: " + product.getName());
    }
    
    CartDto cart = getCart(cartKey);
    Optional<CartItemDto> existingItem = cart.getItems().stream()
        .filter(item -> item.getProductId().equals(productId)).findFirst();

    if (existingItem.isPresent()) {
      CartItemDto item = existingItem.get();
      int newQuantity = item.getQuantity() + quantity;
      if (product.getStock() < newQuantity) throw new IllegalArgumentException("Stok yetersiz.");
      item.setQuantity(newQuantity);
      item.setMaxStock(product.getStock());
    } else {
      CartItemDto newItem = CartItemDto.builder()
          .productId(product.getId()).productName(product.getName())
          .unitPriceTry(product.getPriceTry()).quantity(quantity)
          .maxStock(product.getStock()).build();
      cart.getItems().add(newItem);
    }
    recalculateCart(cart);
    saveCart(cart);
    return cart;
  }

  public CartDto removeItemFromCart(String cartKey, Long productId) {
    CartDto cart = getCart(cartKey);
    cart.getItems().removeIf(item -> item.getProductId().equals(productId));
    recalculateCart(cart);
    saveCart(cart);
    return cart;
  }

  @Transactional(readOnly = true)
  public CartDto updateItemQuantity(String cartKey, Long productId, int newQuantity) {
    if (newQuantity <= 0) return removeItemFromCart(cartKey, productId);
    Product product = productRepo.findById(productId)
        .orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı."));
    if (product.getStock() < newQuantity) throw new IllegalArgumentException("Stok yetersiz.");

    CartDto cart = getCart(cartKey);
    cart.getItems().stream().filter(i -> i.getProductId().equals(productId))
        .findFirst().ifPresent(i -> { i.setQuantity(newQuantity); i.setMaxStock(product.getStock()); });
    
    recalculateCart(cart);
    saveCart(cart);
    return cart;
  }

  public void clearCart(String cartKey) {
    redisTemplate.delete(getRedisKey(cartKey));
  }

  // === YENİ: KUPON İŞLEMLERİ (GERİ GELDİ) ===

  @Transactional(readOnly = true)
  public CartDto applyCoupon(String cartKey, String code) {
    CartDto cart = getCart(cartKey);
    Coupon coupon = couponRepo.findByCode(code)
        .orElseThrow(() -> new IllegalArgumentException("Geçersiz kupon kodu."));

    if (!coupon.isValid()) {
      throw new IllegalArgumentException("Bu kuponun süresi dolmuş veya pasif.");
    }
    
    BigDecimal subTotal = calculateSubTotal(cart);
    if (subTotal.compareTo(coupon.getMinCartAmount()) < 0) {
      throw new IllegalArgumentException("Kupon için sepet tutarı en az " + coupon.getMinCartAmount() + " TL olmalıdır.");
    }

    cart.setCouponCode(coupon.getCode());
    cart.setDiscountPercent(coupon.getDiscountPercentage());
    recalculateCart(cart);
    saveCart(cart);
    return cart;
  }

  public CartDto removeCoupon(String cartKey) {
    CartDto cart = getCart(cartKey);
    cart.setCouponCode(null);
    cart.setDiscountPercent(null);
    cart.setDiscountAmount(BigDecimal.ZERO);
    recalculateCart(cart);
    saveCart(cart);
    return cart;
  }

  // === YARDIMCI METOTLAR ===

  private String getRedisKey(String cartKey) { return CART_KEY_PREFIX + cartKey; }

  private CartDto createEmptyCart(String cartKey) {
    return CartDto.builder().cartId(cartKey).items(new ArrayList<>())
        .totalTry(BigDecimal.ZERO).subTotalTry(BigDecimal.ZERO).discountAmount(BigDecimal.ZERO).build();
  }

  private BigDecimal calculateSubTotal(CartDto cart) {
    BigDecimal subTotal = BigDecimal.ZERO;
    for (CartItemDto item : cart.getItems()) {
      item.setLineTotalTry(item.getUnitPriceTry().multiply(BigDecimal.valueOf(item.getQuantity())));
      subTotal = subTotal.add(item.getLineTotalTry());
    }
    return subTotal;
  }

  private void recalculateCart(CartDto cart) {
    BigDecimal subTotal = calculateSubTotal(cart);
    cart.setSubTotalTry(subTotal);

    BigDecimal discount = BigDecimal.ZERO;
    if (cart.getCouponCode() != null && cart.getDiscountPercent() != null) {
      discount = subTotal.multiply(BigDecimal.valueOf(cart.getDiscountPercent()))
                         .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }
    cart.setDiscountAmount(discount);
    cart.setTotalTry(subTotal.subtract(discount).max(BigDecimal.ZERO));
  }

  private void validateAndRecalculateCoupon(CartDto cart) {
    try {
      Coupon coupon = couponRepo.findByCode(cart.getCouponCode()).orElse(null);
      if (coupon == null || !coupon.isValid() || cart.getSubTotalTry().compareTo(coupon.getMinCartAmount()) < 0) {
        cart.setCouponCode(null);
        cart.setDiscountPercent(null);
        cart.setDiscountAmount(BigDecimal.ZERO);
      }
      recalculateCart(cart);
    } catch (Exception e) {
      cart.setCouponCode(null);
      recalculateCart(cart);
    }
  }

  // ====== DTOs ======

  @Data @Builder @NoArgsConstructor @AllArgsConstructor
  public static class CartDto implements Serializable {
    private String cartId;
    private List<CartItemDto> items;
    private BigDecimal subTotalTry; 
    private BigDecimal discountAmount; 
    private BigDecimal totalTry; 
    private String couponCode; 
    private Integer discountPercent; 
  }

  @Data @Builder @NoArgsConstructor @AllArgsConstructor
  public static class CartItemDto implements Serializable {
    private Long productId;
    private String productName;
    private BigDecimal unitPriceTry;
    private int quantity;
    private int maxStock; 
    private BigDecimal lineTotalTry;
  }
}