package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Address;
import com.bahceifirdevs.v01.repository.AddressRepository;
import com.bahceifirdevs.v01.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

  private final AddressRepository addressRepo;
  private final CustomerRepository customerRepo;

  /**
   * Giriş yapmış müşterinin tüm kayıtlı adreslerini getirir.
   */
  @Transactional(readOnly = true)
  public List<Address> listMyAddresses(String customerEmail) {
    return addressRepo.findByCustomerEmail(customerEmail);
  }

  /**
   * Giriş yapmış müşteri için yeni bir adres oluşturur.
   */
  @Transactional
  public Address createAddress(String customerEmail, String label, String fullName,
                               String phone, String line, String city, String district) {
    
    var customer = customerRepo.findByEmail(customerEmail)
        .orElseThrow(() -> new AccessDeniedException("Müşteri bulunamadı."));
    
    var address = Address.builder()
        .customer(customer)
        .addressLabel(label)
        .fullName(fullName)
        .phone(phone)
        .addressLine(line)
        .city(city)
        .district(district)
        .build();
        
    return addressRepo.save(address);
  }

  /**
   * Giriş yapmış müşteriye ait bir adresi siler.
   */
  @Transactional
  public void deleteAddress(String customerEmail, Long addressId) {
    // Adresin hem var olduğunu hem de bu müşteriye ait olduğunu doğrula
    var address = addressRepo.findByIdAndCustomerEmail(addressId, customerEmail)
        .orElseThrow(() -> new AccessDeniedException("Bu adresi silme yetkiniz yok veya adres bulunamadı."));
        
    addressRepo.delete(address);
  }
}