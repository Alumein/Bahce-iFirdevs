package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull; // Eklendi

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

  // === YENİ DÜZELTME: Tekil ürün çekerken de kategoriyi getir ===
  @Override
  @NonNull
  @EntityGraph(attributePaths = {"category"})
  Optional<Product> findById(@NonNull Long id);

  // === ARAMA METOTLARI ===
  @EntityGraph(attributePaths = {"category"})
  Page<Product> findByNameContainingIgnoreCase(String q, Pageable pageable);
  
  @EntityGraph(attributePaths = {"category"})
  Page<Product> findByCategory_IdAndNameContainingIgnoreCase(Long categoryId, String q, Pageable pageable);
  
  @EntityGraph(attributePaths = {"category"})
  Page<Product> findByCategory_Id(Long categoryId, Pageable pageable);

  // === LİSTELEME METOTLARI ===
  @Override
  @EntityGraph(attributePaths = {"category"})
  Page<Product> findAll(Pageable pageable);

  @EntityGraph(attributePaths = {"category"})
  List<Product> findAllBy();

  @EntityGraph(attributePaths = {"category"})
  List<Product> findAllByCategory_Id(Long categoryId);

  // === DASHBOARD SORGUSU ===
  @Query("SELECT p FROM Product p WHERE p.stock < :stockLevel ORDER BY p.stock ASC")
  List<Product> findLowStockProducts(@Param("stockLevel") int stockLevel);
}