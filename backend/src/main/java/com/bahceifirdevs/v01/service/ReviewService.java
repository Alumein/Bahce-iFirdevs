package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Order;
import com.bahceifirdevs.v01.domain.OrderStatus;
import com.bahceifirdevs.v01.domain.Review;
import com.bahceifirdevs.v01.repository.CustomerRepository;
import com.bahceifirdevs.v01.repository.OrderRepository;
import com.bahceifirdevs.v01.repository.ProductRepository;
import com.bahceifirdevs.v01.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final ReviewRepository reviewRepo;
  private final OrderRepository orderRepo;
  private final CustomerRepository customerRepo;
  private final ProductRepository productRepo;

  /**
   * Bir ürüne ait tüm yorumları listeler. (Public)
   */
  @Transactional(readOnly = true)
  public List<Review> listReviewsByProduct(Long productId) {
    if (!productRepo.existsById(productId)) {
      throw new IllegalArgumentException("Ürün bulunamadı: " + productId);
    }
    return reviewRepo.findByProductIdOrderByCreatedAtDesc(productId);
  }

  /**
   * Müşteri için yeni bir yorum oluşturur. (V5 Tamamlanmış Hali)
   */
  @Transactional
  public Review createReview(String customerEmail, Long productId, Integer rating, String comment) {
    
    // 1. Müşteri ve Ürünü bul
    var customer = customerRepo.findByEmail(customerEmail)
        .orElseThrow(() -> new AccessDeniedException("Müşteri bulunamadı."));
    var product = productRepo.findById(productId)
        .orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı."));

    // 2. Satın Alma Kontrolü VE Siparişi Alma
    Optional<Order> qualifyingOrderOpt = orderRepo.findFirstDeliveredOrderForProduct(
        customer.getId(), 
        productId, 
        OrderStatus.DELIVERED
    );

    if (qualifyingOrderOpt.isEmpty()) {
      throw new AccessDeniedException("Sadece satın aldığınız ve teslim edilen ürünlere yorum yapabilirsiniz.");
    }
    
    Order qualifyingOrder = qualifyingOrderOpt.get(); 

    // 3. Spam Kontrolü
    boolean hasAlreadyReviewed = reviewRepo.existsByCustomerIdAndProductId(customer.getId(), productId);
    if (hasAlreadyReviewed) {
      throw new IllegalArgumentException("Bu ürüne zaten daha önce yorum yapmışsınız.");
    }

    var review = Review.builder()
        .customer(customer)
        .product(product)
        .order(qualifyingOrder) // Yorumu siparişe bağla
        .rating(rating)
        .comment(comment)
        .build();
        
    return reviewRepo.save(review);
  }

  // === Admin Metotları ===

  @Transactional(readOnly = true)
  public List<Review> listAllReviewsForAdmin() {
    return reviewRepo.findAllByOrderByCreatedAtDesc();
  }

  /**
   * Bir yorumu ID'si ile (Admin yetkisiyle) siler.
   */
  @Transactional
  public void deleteReviewAsAdmin(Long reviewId) {
    if (!reviewRepo.existsById(reviewId)) {
      // DÜZELTME: 'm' harfi kaldırıldı.
      throw new IllegalArgumentException("Yorum bulunamadı: " + reviewId);
    }
    reviewRepo.deleteById(reviewId);
  }
}