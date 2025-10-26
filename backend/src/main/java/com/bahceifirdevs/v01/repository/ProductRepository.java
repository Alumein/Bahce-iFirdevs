package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> { }
