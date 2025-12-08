package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Favorite;
import com.bahceifirdevs.v01.repository.CustomerRepository;
import com.bahceifirdevs.v01.repository.FavoriteRepository;
import com.bahceifirdevs.v01.repository.ProductRepository;
import com.bahceifirdevs.v01.web.dto.ProductDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

  private final FavoriteRepository favRepo;
  private final CustomerRepository customerRepo;
  private final ProductRepository productRepo;

  @Transactional(readOnly = true)
  public List<ProductDto> listMyFavorites(String email) {
    return favRepo.findByCustomerEmailOrderByCreatedAtDesc(email).stream()
        .map(fav -> ProductDto.from(fav.getProduct()))
        .toList();
  }

  @Transactional
  public void addFavorite(String email, Long productId) {
    if (favRepo.existsByCustomerEmailAndProductId(email, productId)) return;

    var customer = customerRepo.findByEmail(email).orElseThrow(() -> new AccessDeniedException("Müşteri bulunamadı."));
    var product = productRepo.findById(productId).orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı."));

    favRepo.save(Favorite.builder().customer(customer).product(product).build());
  }

  @Transactional
  public void removeFavorite(String email, Long productId) {
    favRepo.findByCustomerEmailAndProductId(email, productId).ifPresent(favRepo::delete);
  }
  
  @Transactional(readOnly = true)
  public boolean isFavorite(String email, Long productId) {
      return favRepo.existsByCustomerEmailAndProductId(email, productId);
  }
}