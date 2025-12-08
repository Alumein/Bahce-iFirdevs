package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.Favorite;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
  @EntityGraph(attributePaths = {"product", "product.category"})
  List<Favorite> findByCustomerEmailOrderByCreatedAtDesc(String email);

  boolean existsByCustomerEmailAndProductId(String email, Long productId);
  Optional<Favorite> findByCustomerEmailAndProductId(String email, Long productId);
}