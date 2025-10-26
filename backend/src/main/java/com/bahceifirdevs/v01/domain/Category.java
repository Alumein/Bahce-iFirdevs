package com.bahceifirdevs.v01.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category extends BaseEntity implements java.io.Serializable {
  @Column(nullable = false, unique = true, length = 100)
  private String name;

  @Column(length = 255)
  private String description;
}

