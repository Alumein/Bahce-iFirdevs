package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Customer;
import com.bahceifirdevs.v01.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

  private final CustomerService customerService;

  @GetMapping
  public List<CustomerDto> listCustomers() {
    return customerService.listAll().stream()
        .map(c -> new CustomerDto(c.getId(), c.getFullName(), c.getEmail(), c.getPhone()))
        .toList();
  }

  public record CustomerDto(Long id, String fullName, String email, String phone) {}
}