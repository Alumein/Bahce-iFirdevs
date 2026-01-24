package com.bahceifirdevs.v01.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList; // YENİ
import java.util.List; // YENİ

@Entity @Table(name = "customers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer extends BaseEntity {

  @Column(nullable = false, length = 120)
  private String fullName;

  @Column(nullable = false, unique = true, length = 120)
  private String email;

  @Column(length = 30)
  private String phone;

  @Column(nullable = false, length = 72) // bcrypt hash uzunluğu
  private String passwordHash;

  @Column(nullable = false)
  @Builder.Default
  private boolean marketingAllowed = false;

  @Column(length = 20)
  @Builder.Default
  private String role = "CUSTOMER";
  
  @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<Address> addresses = new ArrayList<>();

  @Column(name = "reset_password_token")
  private String resetPasswordToken;

  @Column(name = "reset_password_token_expiry")
  private LocalDateTime resetPasswordTokenExpiry;
}