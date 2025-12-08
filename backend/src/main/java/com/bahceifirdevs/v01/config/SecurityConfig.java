package com.bahceifirdevs.v01.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@Profile("dev")
public class SecurityConfig {

  @Bean
  public SecurityFilterChain devFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(Customizer.withDefaults())
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        // Public GET uçları
        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**").permitAll()
        // Auth uçları (login/refresh dev'de de serbest)
        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/refresh").permitAll()
        // CRUD ve admin işlemleri
        .requestMatchers(HttpMethod.POST,   "/api/products/**", "/api/categories/**").hasRole("ADMIN")
        .requestMatchers(HttpMethod.PUT,    "/api/products/**", "/api/categories/**").hasRole("ADMIN")
        .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/categories/**").hasRole("ADMIN")
        // Diğer her şey
        .anyRequest().authenticated()
      )
      .httpBasic(Customizer.withDefaults());

    return http.build();
  }
}
