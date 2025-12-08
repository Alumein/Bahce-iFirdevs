package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Product;
import com.bahceifirdevs.v01.repository.ReviewRepository; // YENİ
import com.bahceifirdevs.v01.service.ProductService;
import com.bahceifirdevs.v01.web.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

  private final ProductService productService;
  private final ReviewRepository reviewRepo; // YENİ: Puan hesaplamak için

  // ---- GET BY ID (GÜNCELLENDİ) ----
  @GetMapping(value = "/{id}", produces = "application/json")
  public ProductDto getById(@PathVariable Long id) {
    var product = productService.getById(id);
    // Puan ortalamasını hesapla
    Double avgRating = reviewRepo.getAverageRating(id);
    // DTO'yu puanla birlikte oluştur
    return ProductDto.from(product, avgRating);
  }

  // ---- LIST (AYNI - Puan 0.0 döner) ----
  @GetMapping(produces = "application/json")
  public List<ProductDto> list(@RequestParam(name = "categoryId", required = false) Long categoryId) {
    return (categoryId != null)
        ? productService.listByCategoryDto(categoryId)
        : productService.listAllDto();
  }

  // ---- PAGE (AYNI - Puan 0.0 döner) ----
  @GetMapping(value = "/page", produces = "application/json")
  public PageResponse<ProductDto> page(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      @RequestParam(defaultValue = "id,desc") String sort,
      @RequestParam(required = false) Long categoryId,
      @RequestParam(required = false) String q
  ) {
    Sort s = parseSort(sort);
    Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 100), s);
    Page<Product> result = productService.search(categoryId, q, pageable);
    return PageResponse.of(result.map(ProductDto::from), sort);
  }

  private Sort parseSort(String sort) {
    try {
      String[] parts = sort.split(",");
      String field = parts[0].trim();
      String dir = (parts.length > 1 ? parts[1].trim().toLowerCase() : "desc");
      return "asc".equals(dir) ? Sort.by(field).ascending() : Sort.by(field).descending();
    } catch (Exception e) {
      return Sort.by("id").descending();
    }
  }

  // CREATE
  @PostMapping(consumes = "application/json", produces = "application/json")
  public ProductDto create(@Valid @RequestBody ProductCreateRequest req) {
    var saved = productService.create(
        req.name(), req.shortDescription(), req.priceTry(),
        req.stock(), req.categoryId(), req.imageUrl()
    );
    return ProductDto.from(saved);
  }

  // UPDATE
  @PutMapping(value = "/{id}", consumes = "application/json", produces = "application/json")
  public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest req) {
    var saved = productService.update(
        id, req.name(), req.shortDescription(), req.priceTry(),
        req.stock(), req.categoryId(), req.imageUrl()
    );
    return ProductDto.from(saved);
  }

  // DELETE
  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    productService.delete(id);
  }
}