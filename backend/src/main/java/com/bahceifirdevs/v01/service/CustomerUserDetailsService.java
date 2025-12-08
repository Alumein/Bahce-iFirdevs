package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerUserDetailsService implements UserDetailsService {

  private final CustomerRepository customerRepo;

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    var customer = customerRepo.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("Müşteri bulunamadı: " + email));

    // Sisteme kayıtlı her müşteriye "CUSTOMER" rolünü otomatik olarak atıyoruz.
    return new User(
        customer.getEmail(),
        customer.getPasswordHash(),
        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
    );
  }
}