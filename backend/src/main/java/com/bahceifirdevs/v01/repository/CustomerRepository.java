package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
  boolean existsByEmail(String email);
  Optional<Customer> findByEmail(String email);
  long countByCreatedAtAfter(Instant timestamp);
}
