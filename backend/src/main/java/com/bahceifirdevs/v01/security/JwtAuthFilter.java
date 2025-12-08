package com.bahceifirdevs.v01.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends GenericFilter {

  private final JwtService jwtService;

  @Override
  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
      throws IOException, ServletException {
    var request = (HttpServletRequest) req;

    String header = request.getHeader("Authorization");
    if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      try {
        var jws = jwtService.parse(token);
        Claims claims = jws.getBody();
        String username = claims.getSubject();
        String rolesCsv = (String) claims.get("roles");
        var authorities = rolesCsv == null ? java.util.List.<SimpleGrantedAuthority>of()
            : Arrays.stream(rolesCsv.split(","))
                .filter(s -> !s.isBlank())
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.trim()))
                .toList();

        var auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
      } catch (Exception ignored) {
        SecurityContextHolder.clearContext(); // geçersiz token → anonymous devam
      }
    }
    chain.doFilter(req, res);
  }
}
