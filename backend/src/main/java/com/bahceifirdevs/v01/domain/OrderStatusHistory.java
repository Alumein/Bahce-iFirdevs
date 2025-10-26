package com.bahceifirdevs.v01.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "order_status_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderStatusHistory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id")
  private Order order;

  @Enumerated(EnumType.STRING)
  @Column(name = "from_status", length = 20, nullable = false)
  private OrderStatus fromStatus;

  @Enumerated(EnumType.STRING)
  @Column(name = "to_status", length = 20, nullable = false)
  private OrderStatus toStatus;

  @Column(name = "changed_at", nullable = false, updatable = false)
  private Instant changedAt;

  @Column(name = "note", length = 255)
  private String note;

  @PrePersist
  void prePersist() {
    if (changedAt == null) changedAt = Instant.now();
  }
}
