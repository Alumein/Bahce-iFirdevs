package com.bahceifirdevs.v01.config;

import com.bahceifirdevs.v01.service.CustomerUserDetailsService; 
import com.bahceifirdevs.v01.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@Profile("prod")
@RequiredArgsConstructor
public class ProdSecurityConfig {

  private final JwtAuthFilter jwtAuthFilter;
  private final SecurityProps props;
  private final CustomerUserDetailsService customerUserDetailsService;
  private final PasswordEncoder passwordEncoder;

  @Bean
  public UserDetailsService inMemoryAdmin() {
    var username = props.getAdminUsername();
    var password = props.getAdminPassword(); 

    if (username == null || username.isBlank() || password == null || password.isBlank()) {
      throw new IllegalStateException("Admin kullanıcı adı veya şifresi eksik. (app.security.admin[...])");
    }
    var admin = User.withUsername(username).password(password).roles("ADMIN").build();
    return new InMemoryUserDetailsManager(admin);
  }

  @Bean
  @SuppressWarnings("deprecation")
  public DaoAuthenticationProvider customerAuthProvider() {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(customerUserDetailsService);
    provider.setPasswordEncoder(passwordEncoder);
    return provider;
  }

  @Bean
  @SuppressWarnings("deprecation")
  public DaoAuthenticationProvider adminAuthProvider() {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(inMemoryAdmin());
    provider.setPasswordEncoder(passwordEncoder);
    return provider;
  }

  @Bean
  public AuthenticationManager authenticationManager() {
    return new ProviderManager(List.of(customerAuthProvider(), adminAuthProvider()));
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    if (props.getJwtSecret() == null || props.getJwtSecret().length() < 48) {
      throw new IllegalStateException("JWT secret eksik veya çok kısa. (app.security.jwtSecret)");
    }

    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .headers(headers -> headers
            .contentTypeOptions(cto -> {})
            .frameOptions(fo -> fo.sameOrigin())
            .referrerPolicy(rp -> rp.policy(
                ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).preload(true))
            .contentSecurityPolicy(csp -> csp.policyDirectives(
                "default-src 'self'; img-src 'self' data: http://localhost:9000; script-src 'self'; style-src 'self' 'unsafe-inline'"))
        )
        // --- GÜVENLİK KURALLARI (Final) ---
        .authorizeHttpRequests(auth -> auth
            // Public (Herkes Erişebilir)
            .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
            .requestMatchers("/actuator/health", "/ping").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/refresh").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/customers/register").permitAll() 
            .requestMatchers(HttpMethod.GET,  "/api/products/**", "/api/categories/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/products/{productId}/reviews").permitAll()
            .requestMatchers("/api/cart/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/payment/callback").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/settings/**").permitAll()

            // KISITLI ALANLAR (Sadece Üyeler)
            // Sipariş vermek ve Ödeme yapmak için artık ÜYE olmak zorunlu:
            .requestMatchers(HttpMethod.POST, "/api/payment/checkout").hasRole("CUSTOMER") 
            .requestMatchers(HttpMethod.POST, "/api/orders").hasRole("CUSTOMER") 

            // Profil, Adres, Sipariş Geçmişi, Favoriler, Yorum Yapma
            .requestMatchers(HttpMethod.GET, "/api/customers/me").hasRole("CUSTOMER")
            .requestMatchers(HttpMethod.PUT, "/api/customers/me").hasRole("CUSTOMER")
            .requestMatchers(HttpMethod.POST, "/api/customers/change-password").hasRole("CUSTOMER")
            .requestMatchers("/api/addresses/me/**").hasRole("CUSTOMER")
            .requestMatchers(HttpMethod.GET, "/api/orders/me").hasRole("CUSTOMER") 
            .requestMatchers(HttpMethod.GET, "/api/orders/{id}/**").hasAnyRole("CUSTOMER", "ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/orders/{id}/note").hasRole("CUSTOMER")
            .requestMatchers(HttpMethod.POST, "/api/products/{productId}/reviews").hasRole("CUSTOMER")
            .requestMatchers("/api/favorites/**").hasRole("CUSTOMER")

            // YÖNETİCİ ALANI (Sadece Admin)
            .requestMatchers("/api/admin/dashboard/**").hasRole("ADMIN")
            .requestMatchers("/api/admin/reviews/**").hasRole("ADMIN")
            .requestMatchers("/api/admin/coupons/**").hasRole("ADMIN")
            .requestMatchers("/api/admin/customers/**").hasRole("ADMIN")
            .requestMatchers("/api/upload/**").hasRole("ADMIN")
            
            .requestMatchers(HttpMethod.GET, "/api/orders").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT,    "/api/orders/*/status").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST,   "/api/products/**", "/api/categories/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT,    "/api/products/**", "/api/categories/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/categories/**").hasRole("ADMIN")

            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "http://localhost:5173",
        "http://185.33.234.44",
        "https://bahce-ifirdevs.com.tr",
        "https://www.bahce-ifirdevs.com.tr"
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Cart-ID"));
    config.setAllowCredentials(true); 
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}