package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Category;
import com.bahceifirdevs.v01.domain.Product;
import com.bahceifirdevs.v01.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

  private final ProductRepository repo;

  @Cacheable(cacheNames = "products_all")
  @Transactional(readOnly = true)
  public List<Product> listAll() {
    return repo.findAll();
  }

  @Cacheable(cacheNames = "products_by_category")
  @Transactional(readOnly = true)
  public List<Product> listByCategory(Long categoryId) {
    // Basit yaklaşım: mevcut findAll üstünde filtre (küçük projede yeterli)
    return repo.findAll().stream()
        .filter(p -> p.getCategory() != null && p.getCategory().getId().equals(categoryId))
        .toList();
  }

  @CacheEvict(cacheNames = {"products_all", "products_by_category"}, allEntries = true)
  @Transactional
  public Product create(String name, String shortDescription, BigDecimal priceTry,
                        Integer stock, Long categoryId, String imageUrl) {
    var categoryRef = new Category();
    categoryRef.setId(categoryId);

    var p = Product.builder()
        .name(name)
        .shortDescription(shortDescription)
        .priceTry(priceTry)
        .stock(stock)
        .category(categoryRef)
        .imageUrl(imageUrl)
        .build();
    return repo.save(p);
  }

  @CacheEvict(cacheNames = {"products_all", "products_by_category"}, allEntries = true)
  @Transactional
  public Product update(Long id, String name, String shortDescription, BigDecimal priceTry,
                        Integer stock, Long categoryId, String imageUrl) {
    var p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı: " + id));

    if (name != null && !name.isBlank()) p.setName(name);
    p.setShortDescription(shortDescription);
    if (priceTry != null) p.setPriceTry(priceTry);
    if (stock != null) p.setStock(stock);
    if (categoryId != null) {
      var categoryRef = new Category();
      categoryRef.setId(categoryId);
      p.setCategory(categoryRef);
    }
    p.setImageUrl(imageUrl);

    return repo.save(p);
  }

  @CacheEvict(cacheNames = {"products_all", "products_by_category"}, allEntries = true)
  @Transactional
  public void delete(Long id) {
    if (!repo.existsById(id)) throw new IllegalArgumentException("Ürün bulunamadı: " + id);
    repo.deleteById(id);
  }
}
