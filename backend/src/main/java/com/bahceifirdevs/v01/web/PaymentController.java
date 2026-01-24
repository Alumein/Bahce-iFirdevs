package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.Order;
import com.bahceifirdevs.v01.domain.OrderStatus;
import com.bahceifirdevs.v01.repository.OrderRepository;
import com.bahceifirdevs.v01.service.CartService;
import com.bahceifirdevs.v01.service.OrderService;
import com.bahceifirdevs.v01.service.ShippingService; // EKLENDİ
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final CartController cartController;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    // --- PAYTR AYARLARI ---
    @Value("${paytr.merchant.id}")
    private String merchantId;

    @Value("${paytr.merchant.key}")
    private String merchantKey;

    @Value("${paytr.merchant.salt}")
    private String merchantSalt;

    // ============================================================
    // 1. ÖDEME BAŞLATMA (TOKEN ALMA)
    // ============================================================
    @PostMapping("/checkout")
    public PaymentInitResponse checkout(
            @Valid @RequestBody CheckoutRequest req,
            Authentication authentication,
            @RequestHeader(name = "X-Cart-ID", required = false) String cartIdHeader,
            HttpServletRequest request) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Giriş yapmalısınız.");
        }

        String cartKey = cartController.resolveCartKey(authentication, cartIdHeader);
        if (cartKey == null) throw new IllegalArgumentException("Sepet bulunamadı.");

        // Siparişi oluştur (Kargo dahil toplam tutar burada hesaplanıyor)
        Order order = paymentService.processCheckout(
                authentication, cartKey, req.addressLine(), req.city(), req.district(), req.notes(), req.deliveryDate(), req.deliveryTime()
        );

        // 2. PayTR'den Token İste
        try {
            String token = getPaytrToken(order, request.getRemoteAddr(), authentication.getName());
            return new PaymentInitResponse("success", token, order.getId());
        } catch (Exception e) {
            log.error("PayTR Token Hatası", e);
            order.setStatus(OrderStatus.CANCELED);
            orderRepository.save(order);
            throw new RuntimeException("Ödeme sayfası yüklenemedi: " + e.getMessage());
        }
    }

    // ============================================================
    // 2. PAYTR CALLBACK
    // ============================================================
    @PostMapping(value = "/callback", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public String paytrCallback(@RequestParam Map<String, String> params) {
        String merchantOid = params.get("merchant_oid");
        String status = params.get("status");
        String totalAmount = params.get("total_amount");
        String hash = params.get("hash");

        if (hash == null) return "PAYTR notification failed: hash is null";

        String generatedHash = generatePaytrHash(merchantOid, merchantSalt, status, totalAmount, merchantKey);
        if (!hash.equals(generatedHash)) return "PAYTR notification failed: bad hash";

        Long orderId = Long.parseLong(merchantOid);
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return "OK";

        if ("success".equals(status)) {
            if (order.getStatus() == OrderStatus.PENDING) {
                orderService.updateStatus(orderId, OrderStatus.PAID);
                log.info("Sipariş #{} ödemesi ONAYLANDI.", orderId);
            }
        } else {
            log.warn("Sipariş #{} ödemesi BAŞARISIZ.", orderId);
        }
        return "OK";
    }

    // --- PAYTR TOKEN İSTEĞİ ---
    private String getPaytrToken(Order order, String userIp, String email) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://www.paytr.com/odeme/api/get-token";

        // Order üzerindeki tutar artık (Sepet + Kargo) olduğu için direkt bunu kullanıyoruz.
        BigDecimal finalAmount = order.getOrderTotalTry();

        // 1. Sepet Verisini Hazırla
        String productName = "Siparis #" + order.getId();
        String priceStr = finalAmount.toString();
        
        // PayTR sepet formatı: [["Ürün", "Fiyat", 1]]
        String basketJson = "[[\"" + productName + "\", \"" + priceStr + "\", 1]]";
        String userBasket = Base64.encodeBase64String(basketJson.getBytes(StandardCharsets.UTF_8));

        String merchantOid = order.getId().toString();
        String paymentAmount = finalAmount.multiply(new BigDecimal(100)).toBigInteger().toString(); // Kuruş cinsinden
        String noInstallment = "1";
        String maxInstallment = "0";
        String currency = "TL";
        String testMode = "0";

        // Hash Oluşturma
        String dataToHash = merchantId + userIp + merchantOid + email + paymentAmount + userBasket + noInstallment + maxInstallment + currency + testMode;
        String paytrToken = generatePaytrTokenHash(dataToHash, merchantSalt, merchantKey);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("merchant_id", merchantId);
        body.add("user_ip", userIp);
        body.add("merchant_oid", merchantOid);
        body.add("email", email);
        body.add("payment_amount", paymentAmount);
        body.add("user_basket", userBasket);
        body.add("paytr_token", paytrToken);
        body.add("no_installment", noInstallment);
        body.add("max_installment", maxInstallment);
        body.add("currency", currency);
        body.add("test_mode", testMode);
        body.add("user_name", order.getBuyerName());
        body.add("user_address", order.getAddressLine() + " " + order.getCity());
        body.add("user_phone", order.getBuyerPhone());
        body.add("merchant_ok_url", "https://bahce-ifirdevs.com.tr/order-success");
        body.add("merchant_fail_url", "https://bahce-ifirdevs.com.tr/order-fail");
        body.add("timeout_limit", "30");
        body.add("debug_on", "1");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response.getBody());
        
        if ("success".equals(root.path("status").asText())) {
            return root.path("token").asText();
        } else {
            throw new RuntimeException("PayTR Token Alınamadı: " + root.path("reason").asText());
        }
    }

    private String generatePaytrTokenHash(String data, String salt, String key) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        return Base64.encodeBase64String(sha256_HMAC.doFinal((data + salt).getBytes(StandardCharsets.UTF_8)));
    }

    private String generatePaytrHash(String merchantOid, String salt, String status, String totalAmount, String merchantKey) {
        try {
            String paytrString = merchantOid + salt + status + totalAmount;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(merchantKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            return Base64.encodeBase64String(sha256_HMAC.doFinal(paytrString.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            log.error("Hash hatası", e);
            return "";
        }
    }

    public record CheckoutRequest(
            @NotNull String addressLine, @NotNull String city, String district, String notes, LocalDate deliveryDate, String deliveryTime
    ) {}

    public record PaymentInitResponse(String status, String token, Long orderId) {}

    // --- SERVICE (GÜNCELLENDİ) ---
    @Service
    @RequiredArgsConstructor
    public static class PaymentService {
        private final CartService cartService;
        private final OrderService orderService;
        private final OrderRepository orderRepository; 
        private final ShippingService shippingService; // YENİ: Kargo Servisi Eklendi

        @Transactional
        public Order processCheckout(Authentication auth, String cartKey, String address, String city, String district, String notes, LocalDate deliveryDate, String deliveryTime) {
            CartService.CartDto cart = cartService.getCart(cartKey);
            if (cart == null || cart.getItems().isEmpty()) throw new IllegalArgumentException("Sepet boş.");

            List<OrderService.ItemReq> orderItems = cart.getItems().stream()
                    .map(ci -> new OrderService.ItemReq(ci.getProductId(), ci.getQuantity())).collect(Collectors.toList());

            // 1. Siparişi oluştur (OrderService ham haliyle oluşturur)
            Order pendingOrder = orderService.createOrderForCustomer(auth, address, city, district, notes, deliveryDate, deliveryTime, orderItems);
            
            // 2. DÜZELTME: Kargo Dahil Toplamı Hesapla
            if (cart.getTotalTry() != null) {
                BigDecimal cartTotal = cart.getTotalTry(); // Bu zaten indirim düşülmüş sepet tutarıdır.
                
                // Kargo Ücretini Hesapla (DB'den veya kurallardan)
                BigDecimal shippingCost = shippingService.calculateShippingCost(cartTotal, district);
                
                // Genel Toplam = Sepet + Kargo
                BigDecimal finalTotal = cartTotal.add(shippingCost);

                // Siparişi Güncelle
                pendingOrder.setOrderTotalTry(finalTotal);
                orderRepository.save(pendingOrder);
                
                log.info("Sipariş #{} güncellendi. Sepet: {} TL, Kargo: {} TL, Toplam: {} TL", 
                        pendingOrder.getId(), cartTotal, shippingCost, finalTotal);
            }

            try {
                cartService.clearCart(cartKey);
            } catch (Exception e) {
                log.error("Sepet temizlenemedi: {}", e.getMessage());
            }
            return pendingOrder;
        }
    }
}