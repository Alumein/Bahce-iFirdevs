package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.Order;
import com.bahceifirdevs.v01.domain.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

  List<Order> findByBuyerEmailOrderByCreatedAtDesc(String buyerEmail);

  long countByStatus(OrderStatus status);

  // Sipariş + kalemleri birlikte çekmek için
  @EntityGraph(attributePaths = {"items", "items.product"})
  Optional<Order> findWithItemsById(Long id);
}
