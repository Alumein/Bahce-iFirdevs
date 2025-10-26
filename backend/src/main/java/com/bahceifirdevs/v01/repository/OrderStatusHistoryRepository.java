package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {
  List<OrderStatusHistory> findByOrderIdOrderByChangedAtAsc(Long orderId);
}
