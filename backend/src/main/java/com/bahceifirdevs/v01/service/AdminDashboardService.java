package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Order;
import com.bahceifirdevs.v01.domain.OrderStatus;
import com.bahceifirdevs.v01.domain.Product;
import com.bahceifirdevs.v01.repository.CustomerRepository;
import com.bahceifirdevs.v01.repository.OrderRepository;
import com.bahceifirdevs.v01.repository.ProductRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

  private final OrderRepository orderRepo;
  private final CustomerRepository customerRepo;
  private final ProductRepository productRepo;
  
  private static final int LOW_STOCK_THRESHOLD = 10; // Stok sınırı 10

  @Transactional(readOnly = true)
  public DashboardStatsDto getDashboardStats() {
    
    Instant last24Hours = Instant.now().minus(24, ChronoUnit.HOURS);
    
    // 1. Sipariş İstatistikleri
    BigDecimal totalRevenue = orderRepo.findTotalRevenue();
    long newOrdersToday = orderRepo.countByCreatedAtAfter(last24Hours);
    long pendingOrders = orderRepo.countByStatus(OrderStatus.PENDING);
    long preparingOrders = orderRepo.countByStatus(OrderStatus.PREPARING);

    // 2. Müşteri İstatistikleri
    long newCustomersToday = customerRepo.countByCreatedAtAfter(last24Hours);
    long totalCustomers = customerRepo.count();

    // 3. Ürün İstatistikleri
    List<Product> lowStock = productRepo.findLowStockProducts(LOW_STOCK_THRESHOLD);
    List<LowStockProductDto> lowStockProducts = lowStock.stream()
        .map(p -> new LowStockProductDto(p.getId(), p.getName(), p.getStock()))
        .toList();
        
    return DashboardStatsDto.builder()
        .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
        .newOrdersToday(newOrdersToday)
        .pendingOrders(pendingOrders)
        .preparingOrders(preparingOrders)
        .newCustomersToday(newCustomersToday)
        .totalCustomers(totalCustomers)
        .lowStockProducts(lowStockProducts)
        .build();
  }

  // --- DTOs ---
  @Builder
  public record DashboardStatsDto(
      BigDecimal totalRevenue,
      long newOrdersToday,
      long pendingOrders,
      long preparingOrders,
      long newCustomersToday,
      long totalCustomers,
      List<LowStockProductDto> lowStockProducts
  ) {}

  public record LowStockProductDto(Long id, String name, Integer stock) {}
}