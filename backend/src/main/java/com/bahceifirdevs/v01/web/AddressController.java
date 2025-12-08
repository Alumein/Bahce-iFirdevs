package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Address;
import com.bahceifirdevs.v01.service.AddressService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

  private final AddressService addressService;

  /**
   * Müşterinin kayıtlı tüm adreslerini listeler.
   */
  @GetMapping("/me")
  public List<Address> getMyAddresses(Authentication authentication) {
    return addressService.listMyAddresses(authentication.getName());
  }

  /**
   * Müşteri için yeni bir adres kaydeder.
   */
  @PostMapping("/me")
  public Address createAddress(@Valid @RequestBody AddressCreateRequest req, 
                               Authentication authentication) {
    return addressService.createAddress(
        authentication.getName(),
        req.addressLabel(),
        req.fullName(),
        req.phone(),
        req.addressLine(),
        req.city(),
        req.district()
    );
  }

  /**
   * Müşteriye ait bir adresi siler.
   */
  @DeleteMapping("/me/{id}")
  public ResponseEntity<?> deleteAddress(@PathVariable Long id, 
                                       Authentication authentication) {
    addressService.deleteAddress(authentication.getName(), id);
    return ResponseEntity.noContent().build();
  }

  // --- DTO ---
  public record AddressCreateRequest(
      @NotBlank @Size(max = 100) String addressLabel,
      @NotBlank @Size(max = 120) String fullName,
      @NotBlank @Size(max = 30) String phone,
      @NotBlank @Size(max = 180) String addressLine,
      @NotBlank @Size(max = 90) String city,
      @Size(max = 90) String district
  ) {}
}