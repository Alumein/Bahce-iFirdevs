package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

  private final AdminDashboardService dashboardService;

  @GetMapping("/stats")
  public AdminDashboardService.DashboardStatsDto getStats() {
    return dashboardService.getDashboardStats();
  }
}