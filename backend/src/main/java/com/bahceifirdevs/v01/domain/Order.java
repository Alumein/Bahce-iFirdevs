package com.bahceifirdevs.v01.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order extends BaseEntity {
  
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id") private Customer customer;
  @Column(nullable = false, length = 120) private String buyerName;
  @Column(nullable = false, length = 120) private String buyerEmail;
  @Column(length = 30)                    private String buyerPhone;
  @Column(nullable = false, length = 180) private String addressLine;
  @Column(nullable = false, length = 90)  private String city;
  @Column(length = 90)                    private String district;
  @Column(length = 255)                   private String notes;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private OrderStatus status;

  // Ödeme/izleme
  @Column(length = 100, unique = true)
  private String paymentRef;
  
  private LocalDate deliveryDate;
  private String deliveryTime;

  // Sipariş özeti
  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal orderTotalTry;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<OrderItem> items = new ArrayList<>();

  public void addItem(OrderItem item) {
    item.setOrder(this);
    this.items.add(item);
  }
}
