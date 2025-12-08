package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Review;
import com.bahceifirdevs.v01.service.ReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewService reviewService;

  /**
   * Bir ürüne ait tüm yorumları listeler (Public)
   */
  @GetMapping
  public List<ReviewResponse> listReviews(@PathVariable Long productId) {
    return reviewService.listReviewsByProduct(productId).stream()
        .map(ReviewResponse::from)
        .toList();
  }

  /**
   * Bir ürüne yeni yorum ekler (Sadece Müşteri)
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ReviewResponse createReview(@PathVariable Long productId,
                                     @Valid @RequestBody ReviewCreateRequest req,
                                     Authentication authentication) {
    
    var saved = reviewService.createReview(
        authentication.getName(), // Müşteri e-postası
        productId,
        req.rating(),
        req.comment()
    );
    return ReviewResponse.from(saved);
  }

  // --- DTOs ---

  public record ReviewCreateRequest(
      @NotNull @Min(1) @Max(5) Integer rating,
      @Size(max = 1000) String comment
  ) {}

  public record ReviewResponse(
      Long id,
      Integer rating,
      String comment,
      String customerName,
      Instant createdAt
  ) {
    public static ReviewResponse from(Review r) {
      // DÜZELTME: NullPointerException koruması eklendi
      String name = "Anonim";
      if (r.getCustomer() != null) {
          name = r.getCustomer().getFullName();
      }
      
      return new ReviewResponse(
          r.getId(),
          r.getRating(),
          r.getComment(),
          name, 
          r.getCreatedAt()
      );
    }
  }
}