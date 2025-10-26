package com.bahceifirdevs.v01.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    // {bcrypt}, {noop}, {pbkdf2} vb. id-prefix'leri destekler
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        // health/ping
        .requestMatchers("/actuator/health", "/ping").permitAll()

        // Public auth-free uçlar
        .requestMatchers(HttpMethod.POST, "/api/customers/register").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
        .requestMatchers(HttpMethod.GET,  "/api/orders").permitAll()
        .requestMatchers(HttpMethod.GET,  "/api/products/**", "/api/categories/**").permitAll()

        // Order status & history: yalnız admin değiştirebilir; history GET herkese açık kalsın istersen aşağıyı değiştir.
        .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasRole("ADMIN")
        .requestMatchers(HttpMethod.GET, "/api/orders/*/history").permitAll()

        // Katalog CRUD: yalnız admin
        .requestMatchers(HttpMethod.POST,   "/api/products/**", "/api/categories/**").hasRole("ADMIN")
        .requestMatchers(HttpMethod.PUT,    "/api/products/**", "/api/categories/**").hasRole("ADMIN")
        .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/categories/**").hasRole("ADMIN")

        // Diğer her şey
        .anyRequest().authenticated()
      )
      // Dev’de Basic Auth; prod’da JWT/OAuth2'ye geçebilirsin
      .httpBasic(Customizer.withDefaults());

    return http.build();
  }
}
