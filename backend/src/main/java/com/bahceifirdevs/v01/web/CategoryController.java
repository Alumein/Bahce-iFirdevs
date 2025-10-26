package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Category;
import com.bahceifirdevs.v01.service.CategoryService;
import com.bahceifirdevs.v01.web.dto.CategoryCreateRequest;
import com.bahceifirdevs.v01.web.dto.CategoryDto;
import com.bahceifirdevs.v01.web.dto.CategoryUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryService categoryService;

  // LIST
  @GetMapping(produces = "application/json")
  public List<CategoryDto> list() {
    return categoryService.listAll().stream().map(CategoryDto::from).toList();
  }

  // CREATE
  @PostMapping(consumes = "application/json", produces = "application/json")
  public CategoryDto create(@Valid @RequestBody CategoryCreateRequest req) {
    var saved = categoryService.create(
        Category.builder().name(req.name()).description(req.description()).build()
    );
    return CategoryDto.from(saved);
  }

  // UPDATE
  @PutMapping(value = "/{id}", consumes = "application/json", produces = "application/json")
  public CategoryDto update(@PathVariable Long id, @Valid @RequestBody CategoryUpdateRequest req) {
    var saved = categoryService.update(id, req.name(), req.description());
    return CategoryDto.from(saved);
  }

  // DELETE
  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    categoryService.delete(id);
  }
}
