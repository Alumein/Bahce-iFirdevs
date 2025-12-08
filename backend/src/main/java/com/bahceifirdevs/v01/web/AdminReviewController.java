package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Review;
import com.bahceifirdevs.v01.service.ReviewService;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

  private final ReviewService reviewService;

  /**
   * Admin paneli için tüm yorumları listeler
   * (Daha detaylı bir DTO ile)
   */
  @GetMapping
  public List<AdminReviewResponse> listAllReviews() {
    return reviewService.listAllReviewsForAdmin().stream()
        .map(AdminReviewResponse::from)
        .toList();
  }

  /**
   * Admin'in bir yorumu ID ile silmesini sağlar
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteReview(@PathVariable Long id) {
    reviewService.deleteReviewAsAdmin(id);
    return ResponseEntity.noContent().build();
  }


  // --- DTO: AdminReviewResponse ---
  // Public DTO'dan (ReviewResponse) farklı olarak, Admin'in
  // müşterinin e-postasını ve ürünün adını görmesini sağlar.
  @Builder
  public record AdminReviewResponse(
      Long id,
      Integer rating,
      String comment,
      Instant createdAt,
      // Müşteri Bilgisi
      Long customerId,
      String customerName,
      String customerEmail,
      // Ürün Bilgisi
      Long productId,
      String productName
  ) {
    public static AdminReviewResponse from(Review r) {
      return AdminReviewResponse.builder()
          .id(r.getId())
          .rating(r.getRating())
          .comment(r.getComment())
          .createdAt(r.getCreatedAt())
          .customerId(r.getCustomer().getId())
          .customerName(r.getCustomer().getFullName())
          .customerEmail(r.getCustomer().getEmail())
          .productId(r.getProduct().getId())
          .productName(r.getProduct().getName())
          .build();
    }
  }
}