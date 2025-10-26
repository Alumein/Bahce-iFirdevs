package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Category;
import com.bahceifirdevs.v01.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

  private final CategoryRepository repo;

  @Cacheable(cacheNames = "categories_all")
  @Transactional(readOnly = true)
  public List<Category> listAll() {
    return repo.findAll();
  }

  @CacheEvict(cacheNames = "categories_all", allEntries = true)
  @Transactional
  public Category create(Category c) {
    if (repo.existsByName(c.getName())) {
      throw new IllegalArgumentException("Kategori zaten var: " + c.getName());
    }
    return repo.save(c);
  }

  @CacheEvict(cacheNames = "categories_all", allEntries = true)
  @Transactional
  public Category update(Long id, String name, String description) {
    var c = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Kategori bulunamadı: " + id));
    if (name != null && !name.isBlank() && !name.equals(c.getName())) {
      if (repo.existsByName(name)) throw new IllegalArgumentException("Kategori adı kullanımda: " + name);
      c.setName(name);
    }
    c.setDescription(description);
    return repo.save(c);
  }

  @CacheEvict(cacheNames = "categories_all", allEntries = true)
  @Transactional
  public void delete(Long id) {
    if (!repo.existsById(id)) throw new IllegalArgumentException("Kategori bulunamadı: " + id);
    repo.deleteById(id);
  }
}
