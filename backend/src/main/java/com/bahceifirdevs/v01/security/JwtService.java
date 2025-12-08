package com.bahceifirdevs.v01.security;

import com.bahceifirdevs.v01.config.SecurityProps;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.*;
import java.util.Date;
import java.util.Map;

@Service
@Profile("prod")
public class JwtService {

  private final Key key;
  private final int accessMinutes;
  private final int refreshDays;

  public JwtService(SecurityProps props) {
    if (props.getJwtSecret() == null || props.getJwtSecret().length() < 48) {
      throw new IllegalStateException("JWT secret eksik veya çok kısa (min ~48-64+ karakter önerilir).");
    }
    this.key = Keys.hmacShaKeyFor(props.getJwtSecret().getBytes());
    this.accessMinutes = props.getAccessMinutes();
    this.refreshDays = props.getRefreshDays();
  }

  public String generateAccess(String username, String... roles) {
    var now = Instant.now();
    return Jwts.builder()
        .setSubject(username)
        .addClaims(Map.of("roles", String.join(",", roles)))
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(now.plus(Duration.ofMinutes(accessMinutes))))
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  public String generateRefresh(String username) {
    var now = Instant.now();
    return Jwts.builder()
        .setSubject(username)
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(now.plus(Duration.ofDays(refreshDays))))
        .claim("type","refresh")
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  public Jws<Claims> parse(String jwt) {
    return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt);
  }
}
