package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Category;
import com.bahceifirdevs.v01.domain.Product;
import com.bahceifirdevs.v01.repository.CategoryRepository;
import com.bahceifirdevs.v01.repository.ProductRepository;
import com.bahceifirdevs.v01.web.dto.ProductDto;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate; // Bu import önemli
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

  private final ProductRepository repo;
  private final CategoryRepository categoryRepo;

  // ---- TEK ÜRÜN GETİRME ----
  @Cacheable(cacheNames = "product_details", key = "#id")
  @Transactional(readOnly = true)
  public Product getById(Long id) {
    var p = repo.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı: " + id));
    // Repository'de @EntityGraph eklediğimiz için burası artık güvende
    return p;
  }

  // ---- LİSTELEME ----
  @Cacheable(cacheNames = "products_all")
  @Transactional(readOnly = true)
  public List<ProductDto> listAllDto() {
    return repo.findAllBy().stream().map(ProductDto::from).toList();
  }

  @Cacheable(cacheNames = "products_by_category", key = "#categoryId")
  @Transactional(readOnly = true)
  public List<ProductDto> listByCategoryDto(Long categoryId) {
    return repo.findAllByCategory_Id(categoryId).stream().map(ProductDto::from).toList();
  }

  @Transactional(readOnly = true)
  public Page<Product> search(Long categoryId, String q, Pageable pageable) {
    String query = (q == null) ? "" : q.trim();
    if (categoryId != null && !query.isEmpty()) {
      return repo.findByCategory_IdAndNameContainingIgnoreCase(categoryId, query, pageable);
    } else if (categoryId != null) {
      return repo.findByCategory_Id(categoryId, pageable);
    } else if (!query.isEmpty()) {
      return repo.findByNameContainingIgnoreCase(query, pageable);
    } else {
      return repo.findAll(pageable);
    }
  }

  // ---- CRUD (YENİ VE GÜNCELLENMİŞ) ----

  @CacheEvict(cacheNames = {"products_all", "products_by_category", "product_details"}, allEntries = true)
  @Transactional
  public Product create(String name, String shortDescription, BigDecimal priceTry,
                        Integer stock, Long categoryId, String imageUrl) {

    Category categoryRef = getManagedCategory(categoryId);

    var p = Product.builder()
        .name(name)
        .shortDescription(shortDescription)
        .priceTry(priceTry)
        .stock(stock)
        .category(categoryRef)
        .imageUrl(imageUrl)
        .build();

    Product saved = repo.save(p);
    
    // DÜZELTME: Kategoriyi proxy durumundan çıkarıp yüklüyoruz
    if (saved.getCategory() != null) {
        Hibernate.initialize(saved.getCategory());
    }
    
    return saved;
  }

  @CacheEvict(cacheNames = {"products_all", "products_by_category", "product_details"}, allEntries = true)
  @Transactional
  public Product update(Long id, String name, String shortDescription, BigDecimal priceTry,
                        Integer stock, Long categoryId, String imageUrl) {
    var p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Ürün bulunamadı: " + id));

    if (name != null && !name.isBlank()) p.setName(name);
    p.setShortDescription(shortDescription);
    if (priceTry != null) p.setPriceTry(priceTry);
    if (stock != null) p.setStock(stock);
    
    if (categoryId != null) {
      p.setCategory(getManagedCategory(categoryId));
    }
    p.setImageUrl(imageUrl);

    Product saved = repo.save(p);

    // DÜZELTME: Kategoriyi proxy durumundan çıkarıp yüklüyoruz
    // Bu satır "500 Internal Server Error" hatasını çözer.
    if (saved.getCategory() != null) {
        Hibernate.initialize(saved.getCategory());
    }

    return saved;
  }

  @CacheEvict(cacheNames = {"products_all", "products_by_category", "product_details"}, allEntries = true)
  @Transactional
  public void delete(Long id) {
    if (!repo.existsById(id)) throw new IllegalArgumentException("Ürün bulunamadı: " + id);
    repo.deleteById(id);
  }

  // ---- Helper ----
  private Category getManagedCategory(Long categoryId) {
    if (categoryId == null) {
      throw new IllegalArgumentException("Kategori zorunludur.");
    }
    if (!categoryRepo.existsById(categoryId)) {
      throw new IllegalArgumentException("Kategori bulunamadı: " + categoryId);
    }
    return categoryRepo.getReferenceById(categoryId);
  }
}