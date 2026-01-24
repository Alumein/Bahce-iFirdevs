package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.security.JwtService;
import com.bahceifirdevs.v01.service.AuthService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;


import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  // Birden fazla provider'ı (Admin ve Müşteri) yöneten Manager
  private final AuthenticationManager authManager;
  private final JwtService jwtService;
  private final AuthService authService;

  private final UserDetailsService customerUserDetailsService;
  private final UserDetailsService inMemoryAdmin;

  public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
  public record TokenResponse(String accessToken, String refreshToken, String tokenType) {}

  @PostMapping("/login")
  public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest req) {
    Authentication auth = authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.username(), req.password()));
    SecurityContextHolder.getContext().setAuthentication(auth);

    String roles = auth.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority) // "ROLE_CUSTOMER" veya "ROLE_ADMIN"
        .map(s -> s.replace("ROLE_", "")) // "CUSTOMER" veya "ADMIN"
        .collect(Collectors.joining(","));

    String access = jwtService.generateAccess(auth.getName(), roles);
    String refresh = jwtService.generateRefresh(auth.getName());
    return ResponseEntity.ok(new TokenResponse(access, refresh, "Bearer"));
  }

  @PostMapping("/refresh")
  public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
    String token = body.get("refreshToken");
    var jws = jwtService.parse(token);
    if (!"refresh".equals(jws.getBody().get("type"))) {
      return ResponseEntity.badRequest().body(Map.of("message","Geçersiz refresh token"));
    }
    String username = jws.getBody().getSubject();

    // DÜZELTME: Token'ı yenilerken de doğru rolleri bul
    UserDetails user = findUserDetails(username);
    String roles = user.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .map(s -> s.replace("ROLE_", ""))
        .collect(Collectors.joining(","));

    String access = jwtService.generateAccess(username, roles);
    return ResponseEntity.ok(Map.of("accessToken", access, "tokenType","Bearer"));
  }

  // Admin'i veya Müşteri'yi bulmak için yardımcı metot
  private UserDetails findUserDetails(String username) {
    try {
      return customerUserDetailsService.loadUserByUsername(username);
    } catch (Exception e) {
      try {
        return inMemoryAdmin.loadUserByUsername(username);
      } catch (Exception e2) {
        throw new AuthenticationServiceException("Refresh token sahibi bulunamadı: " + username);
      }
    }
  }
  @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok("Doğrulama kodu e-posta adresinize gönderildi.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.email(), req.code(), req.newPassword());
        return ResponseEntity.ok("Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.");
    }

    public record ResetPasswordRequest(String email, String code, String newPassword) {}
}