package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
  boolean existsByName(String name);
}
