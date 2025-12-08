package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Customer;
import com.bahceifirdevs.v01.repository.CustomerRepository;
import com.bahceifirdevs.v01.service.CustomerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

  private final CustomerService customerService;
  private final CustomerRepository customerRepo;

  // === GET MY PROFILE (HESABIM) ===
  @GetMapping("/me")
  public CustomerResponse getMyProfile(Authentication authentication) {
    var customer = findCustomer(authentication);
    return toResponse(customer);
  }

  // === UPDATE MY PROFILE ===
  @PutMapping("/me")
  public CustomerResponse updateMyProfile(@Valid @RequestBody UpdateProfileRequest req,
                                          Authentication authentication) {
    String email = authentication.getName();
    var updatedCustomer = customerService.updateProfile(email, req.fullName(), req.phone());
    return toResponse(updatedCustomer);
  }

  // === CHANGE PASSWORD ===
  @PostMapping("/change-password")
  public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest req,
                                          Authentication authentication) {
    String email = authentication.getName();
    customerService.changePassword(email, req.oldPassword(), req.newPassword());
    return ResponseEntity.ok(Map.of("message", "Şifre başarıyla güncellendi."));
  }

  // === KAYIT OLMA (REGISTER) - GÜNCELLENDİ ===
  @PostMapping("/register")
  public CustomerResponse register(@Valid @RequestBody RegisterRequest req) {
    // Service metoduna artık 'marketingAllowed' parametresini de gönderiyoruz
    var saved = customerService.register(
        req.fullName(), 
        req.email(), 
        req.phone(), 
        req.password(), 
        req.marketingAllowed() // YENİ EKLENEN
    );
    return toResponse(saved);
  }

  // === Yardımcı Metotlar ===

  private Customer findCustomer(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new AccessDeniedException("Bu bilgilere erişmek için giriş yapmalısınız.");
    }
    String email = authentication.getName();
    return customerRepo.findByEmail(email)
        .orElseThrow(() -> new AccessDeniedException("Müşteri profili bulunamadı."));
  }

  private CustomerResponse toResponse(Customer c) {
    return new CustomerResponse(c.getId(), c.getFullName(), c.getEmail(), c.getPhone());
  }

  // === İç DTO'lar ===

  // REGISTER REQUEST (GÜNCELLENDİ)
  public record RegisterRequest(
      @NotBlank @Size(max = 120) String fullName,
      @NotBlank @Email @Size(max = 120) String email,
      @Size(max = 30) String phone,
      @NotBlank @Size(min = 6, max = 72) String password,
      boolean marketingAllowed // YENİ ALAN
  ) {}

  public record UpdateProfileRequest(
      @NotBlank @Size(max = 120) String fullName,
      @Size(max = 30) String phone
  ) {}

  public record ChangePasswordRequest(
      @NotBlank String oldPassword,
      @NotBlank @Size(min = 6, max = 72) String newPassword
  ) {}

  public record CustomerResponse(Long id, String fullName, String email, String phone) {}
}