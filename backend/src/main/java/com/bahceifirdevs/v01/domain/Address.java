package com.bahceifirdevs.v01.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Address extends BaseEntity {

  // Hangi müşteriye ait
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "customer_id")
  @JsonIgnore // Bu adresi API'de döndürürken müşteriyi tekrar gösterme
  private Customer customer;

  // Adres bilgileri
  @Column(nullable = false, length = 100)
  private String addressLabel; // Örn: "Ev Adresim", "İş Adresim"

  @Column(nullable = false, length = 120)
  private String fullName; // Alıcı Adı (farklı olabilir)
  
  @Column(nullable = false, length = 30)
  private String phone; // Alıcı Telefonu

  @Column(nullable = false, length = 180)
  private String addressLine;

  @Column(nullable = false, length = 90)
  private String city;

  @Column(length = 90)
  private String district;
}