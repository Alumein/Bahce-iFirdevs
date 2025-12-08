package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
  
  // Müşterinin tüm adreslerini listele
  List<Address> findByCustomerEmail(String customerEmail);
  
  // Güvenlik kontrolü için: Bu adres (Id) bu müşteriye (Email) mi ait?
  Optional<Address> findByIdAndCustomerEmail(Long id, String customerEmail);
}