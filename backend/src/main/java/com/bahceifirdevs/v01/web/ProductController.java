package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Product;
import com.bahceifirdevs.v01.service.ProductService;
import com.bahceifirdevs.v01.web.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

  private final ProductService productService;

  // LIST
  @GetMapping(produces = "application/json")
  public List<ProductDto> list(@RequestParam(required = false) Long categoryId) {
    List<Product> products = (categoryId != null)
        ? productService.listByCategory(categoryId)
        : productService.listAll();
    return products.stream().map(ProductDto::from).toList();
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
