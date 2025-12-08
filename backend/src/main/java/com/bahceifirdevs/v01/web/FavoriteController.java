package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.service.FavoriteService;
import com.bahceifirdevs.v01.web.dto.ProductDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

  private final FavoriteService favoriteService;

  @GetMapping("/me")
  public List<ProductDto> getMyFavorites(Authentication authentication) {
    return favoriteService.listMyFavorites(authentication.getName());
  }

  @PostMapping("/add/{productId}")
  public ResponseEntity<?> addFavorite(@PathVariable Long productId, Authentication authentication) {
    favoriteService.addFavorite(authentication.getName(), productId);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/remove/{productId}")
  public ResponseEntity<?> removeFavorite(@PathVariable Long productId, Authentication authentication) {
    favoriteService.removeFavorite(authentication.getName(), productId);
    return ResponseEntity.noContent().build();
  }
  
  @GetMapping("/check/{productId}")
  public ResponseEntity<Boolean> isFavorite(@PathVariable Long productId, Authentication authentication) {
      return ResponseEntity.ok(favoriteService.isFavorite(authentication.getName(), productId));
  }
}