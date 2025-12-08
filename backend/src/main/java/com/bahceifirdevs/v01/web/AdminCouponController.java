package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Coupon;
import com.bahceifirdevs.v01.repository.CouponRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

  private final CouponRepository couponRepo;

  @GetMapping
  public List<Coupon> listCoupons() {
    return couponRepo.findAll();
  }

  @PostMapping
  public Coupon createCoupon(@Valid @RequestBody CreateCouponRequest req) {
    if (couponRepo.existsByCode(req.code)) {
      throw new IllegalArgumentException("Bu kupon kodu zaten var.");
    }
    var coupon = Coupon.builder()
        .code(req.code.toUpperCase())
        .discountPercentage(req.discountPercentage)
        .expirationDate(req.expirationDate)
        .minCartAmount(req.minCartAmount)
        .isActive(true)
        .build();
    return couponRepo.save(coupon);
  }

  @DeleteMapping("/{id}")
  public void deleteCoupon(@PathVariable Long id) {
    couponRepo.deleteById(id);
  }

  public record CreateCouponRequest(
      @NotBlank String code,
      @NotNull @Min(1) @Max(100) Integer discountPercentage,
      @NotNull LocalDate expirationDate,
      @NotNull @Min(0) BigDecimal minCartAmount
  ) {}
}