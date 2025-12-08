package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.config.RabbitConfig;
import com.bahceifirdevs.v01.domain.Customer;
import com.bahceifirdevs.v01.repository.CustomerRepository;
import com.bahceifirdevs.v01.web.dto.CustomerEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

  private final CustomerRepository customerRepo;
  private final PasswordEncoder passwordEncoder;
  private final RabbitTemplate rabbitTemplate;

  @Transactional(readOnly = true)
  public List<Customer> listAll() {
    return customerRepo.findAll();
  }

  @Transactional
  public Customer register(String fullName, String email, String phone, String password, boolean marketingAllowed) {
    if (customerRepo.existsByEmail(email)) {
      throw new IllegalArgumentException("Bu e-posta ile kayıt zaten var.");
    }

    // YENİ: Telefon Doğrulama (Zorunlu, 10 hane, 0 ile başlamaz)
    if (phone == null || !phone.matches("^[1-9]\\d{9}$")) {
      throw new IllegalArgumentException("Telefon numarası başında 0 olmadan, 10 haneli girilmelidir (Örn: 5551234567).");
    }

    var c = Customer.builder()
        .fullName(fullName)
        .email(email)
        .phone(phone)
        .passwordHash(passwordEncoder.encode(password))
        .marketingAllowed(marketingAllowed)
        .build();
    var saved = customerRepo.save(c);

    try {
      CustomerEventDto event = new CustomerEventDto(saved.getId(), saved.getEmail(), saved.getFullName());
      rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, RabbitConfig.ROUTING_KEY_CUSTOMER_REGISTERED, event);
    } catch (Exception e) {
      log.error("RabbitMQ hatası", e);
    }

    return saved;
  }

  @Transactional
  public Customer updateProfile(String email, String newFullName, String newPhone) {
    var customer = customerRepo.findByEmail(email)
        .orElseThrow(() -> new AccessDeniedException("Müşteri profili bulunamadı."));
    
    // Profil güncellerken de telefon formatını kontrol edelim
    if (newPhone != null && !newPhone.matches("^[1-9]\\d{9}$")) {
      throw new IllegalArgumentException("Telefon numarası geçersiz.");
    }

    customer.setFullName(newFullName);
    customer.setPhone(newPhone);
    return customerRepo.save(customer);
  }

  @Transactional
  public void changePassword(String email, String oldPassword, String newPassword) {
    var customer = customerRepo.findByEmail(email)
        .orElseThrow(() -> new AccessDeniedException("Müşteri profili bulunamadı."));

    if (!passwordEncoder.matches(oldPassword, customer.getPasswordHash())) {
      throw new IllegalArgumentException("Mevcut şifreniz yanlış.");
    }
    
    customer.setPasswordHash(passwordEncoder.encode(newPassword));
    customerRepo.save(customer);
  }
}