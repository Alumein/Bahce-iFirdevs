package com.bahceifirdevs.v01.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public class SecurityProps {

  private String adminUsername;
  private String adminPassword; // {bcrypt} ile başlamalı
  private String jwtSecret;
  private int accessMinutes = 60;
  private int refreshDays = 7;

  public String getAdminUsername() { return adminUsername; }
  public void setAdminUsername(String adminUsername) { this.adminUsername = adminUsername; }

  public String getAdminPassword() { return adminPassword; }
  public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }

  public String getJwtSecret() { return jwtSecret; }
  public void setJwtSecret(String jwtSecret) { this.jwtSecret = jwtSecret; }

  public int getAccessMinutes() { return accessMinutes; }
  public void setAccessMinutes(int accessMinutes) { this.accessMinutes = accessMinutes; }

  public int getRefreshDays() { return refreshDays; }
  public void setRefreshDays(int refreshDays) { this.refreshDays = refreshDays; }
}
