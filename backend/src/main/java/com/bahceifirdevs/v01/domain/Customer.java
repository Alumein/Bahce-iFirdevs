package com.bahceifirdevs.v01.domain;

import jakarta.persistence.*;
import lombok.*;

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
}
