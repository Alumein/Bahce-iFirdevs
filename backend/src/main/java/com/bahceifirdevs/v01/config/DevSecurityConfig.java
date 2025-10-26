package com.bahceifirdevs.v01.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
@Profile("dev")
public class DevSecurityConfig {

  @Bean
  public UserDetailsService users(PasswordEncoder pe) {
    // Dev ortamı için in-memory ADMIN
    var admin = User.withUsername("admin")
        .password(pe.encode("pass123"))
        .roles("ADMIN")
        .build();
    return new InMemoryUserDetailsManager(admin);
  }
}
