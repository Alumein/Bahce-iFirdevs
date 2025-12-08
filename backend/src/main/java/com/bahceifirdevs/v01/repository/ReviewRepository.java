package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

  // --- YENİ: ORTALAMA PUAN SORGUSU ---
  // Eğer hiç yorum yoksa 'null' dönebilir, bunu COALESCE ile 0.0 yapıyoruz
  @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.product.id = :productId")
  Double getAverageRating(@Param("productId") Long productId);


  // --- Diğer Metotlar (Aynı) ---
  
  @EntityGraph(attributePaths = {"customer"})
  List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

  boolean existsByOrderIdAndProductIdAndCustomerId(Long orderId, Long productId, Long customerId);
  
  boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

  @EntityGraph(attributePaths = {"customer", "product"})
  List<Review> findAllByOrderByCreatedAtDesc();
}