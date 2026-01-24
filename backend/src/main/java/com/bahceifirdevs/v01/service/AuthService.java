package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Customer;
import com.bahceifirdevs.v01.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final CustomerRepository customerRepository;
    private final EmailService emailService; // Kendi EmailService'imizi kullanıyoruz
    private final PasswordEncoder passwordEncoder;

    // 1. Kod Üret ve Mail At
    @Transactional
    public void forgotPassword(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı."));

        // 6 Haneli Kod
        String code = String.valueOf(new Random().nextInt(900000) + 100000);

        // Token Kaydet
        customer.setResetPasswordToken(code);
        customer.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
        customerRepository.save(customer);

        // Mail Gönder
        emailService.sendPasswordResetEmail(email, customer.getFullName(), code);
    }

    // 2. Kodu Doğrula ve Şifreyi Değiştir
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        if (customer.getResetPasswordToken() == null || 
            !customer.getResetPasswordToken().equals(code)) {
            throw new RuntimeException("Geçersiz doğrulama kodu.");
        }

        if (customer.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Kodun süresi dolmuş. Lütfen tekrar deneyin.");
        }

        // Şifreyi Hashleyip Kaydet (Dikkat: setPasswordHash kullanıyoruz)
        customer.setPasswordHash(passwordEncoder.encode(newPassword));
        
        // Token'ı temizle
        customer.setResetPasswordToken(null);
        customer.setResetPasswordTokenExpiry(null);
        
        customerRepository.save(customer);
    }
}