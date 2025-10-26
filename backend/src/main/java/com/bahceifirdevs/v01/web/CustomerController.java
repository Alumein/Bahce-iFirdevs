package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Customer;
import com.bahceifirdevs.v01.repository.CustomerRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

  private final CustomerRepository customerRepo;
  private final PasswordEncoder passwordEncoder;

  @PostMapping("/register")
  public CustomerResponse register(@Valid @RequestBody RegisterRequest req) {
    if (customerRepo.existsByEmail(req.email())) {
      throw new IllegalArgumentException("Bu e-posta ile kayıt zaten var.");
    }
    var c = Customer.builder()
        .fullName(req.fullName())
        .email(req.email())
        .phone(req.phone())
        .passwordHash(passwordEncoder.encode(req.password()))
        .build();
    var saved = customerRepo.save(c);
    return new CustomerResponse(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getPhone());
  }

  // === İç DTO'lar ===
  public record RegisterRequest(
      @NotBlank @Size(max = 120) String fullName,
      @NotBlank @Email @Size(max = 120) String email,
      @Size(max = 30) String phone,
      @NotBlank @Size(min = 6, max = 72) String password
  ) {}

  public record CustomerResponse(Long id, String fullName, String email, String phone) {}
}
