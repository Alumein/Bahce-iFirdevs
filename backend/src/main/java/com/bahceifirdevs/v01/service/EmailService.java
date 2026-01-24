package com.bahceifirdevs.v01.service;

import com.bahceifirdevs.v01.domain.Order;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    // 1. HOŞ GELDİN MAİLİ
    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // UTF-8 karakter setini burada belirtiyoruz
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom("admin@bahce-ifirdevs.com.tr", "Bahçe-i Firdevs"); // Hata veren satır burasıydı
            helper.setTo(toEmail);
            helper.setSubject("Aramıza Hoş Geldiniz! 🌱");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #2e7d32;">Merhaba %s,</h2>
                    <p>Bahçe-i Firdevs ailesine katıldığınız için teşekkür ederiz.</p>
                    <p>En taze çiçekler ve özel tasarımlarımızla hizmetinizdeyiz.</p>
                    <br>
                    <p>Sevgiler,<br>Bahçe-i Firdevs Ekibi</p>
                </div>
                """.formatted(fullName);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ Hoş geldin maili gönderildi: {}", toEmail);

        } catch (Exception e) { 
            // DÜZELTME: Sadece MessagingException yerine genel Exception yakalıyoruz.
            // Böylece UnsupportedEncodingException hatası da kapsanıyor.
            log.error("❌ Mail gönderme hatası: ", e);
        }
    }

    // 2. SİPARİŞ ALINDI MAİLİ
    @Async
    public void sendOrderReceivedEmail(String toEmail, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom("admin@bahce-ifirdevs.com.tr", "Bahçe-i Firdevs"); // Burası da düzeldi
            helper.setTo(toEmail);
            helper.setSubject("Siparişiniz Alındı #" + order.getId());

            StringBuilder itemsHtml = new StringBuilder();
            order.getItems().forEach(item -> 
                itemsHtml.append("<li>")
                         .append(item.getProductName())
                         .append(" (").append(item.getQuantity()).append(" adet) - ")
                         .append(item.getLineTotalTry()).append(" TL")
                         .append("</li>")
            );

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #2e7d32;">Siparişiniz Alındı! 📦</h2>
                    <p>Sipariş numaranız: <strong>#%d</strong></p>
                    <p>Toplam Tutar: <strong>%s TL</strong></p>
                    <hr>
                    <h3>Ürünler:</h3>
                    <ul>%s</ul>
                    <hr>
                    <p>Teslimat Adresi: %s, %s</p>
                    <br>
                    <p>Bizi tercih ettiğiniz için teşekkürler.</p>
                </div>
                """.formatted(order.getId(), order.getOrderTotalTry(), itemsHtml.toString(), order.getAddressLine(), order.getCity());

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ Sipariş maili gönderildi: {}", toEmail);

        } catch (Exception e) {
            // DÜZELTME: Burada da genel Exception kullanıyoruz.
            log.error("❌ Sipariş maili hatası: ", e);
        }
    }
    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom("admin@bahce-ifirdevs.com.tr", "Bahçe-i Firdevs");
            helper.setTo(toEmail);
            helper.setSubject("Şifre Sıfırlama Kodu 🔐");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2e7d32;">Şifre Sıfırlama Talebi</h2>
                    <p>Sayın <strong>%s</strong>,</p>
                    <p>Hesabınız için şifre yenileme talebinde bulundunuz.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">%s</span>
                    </div>
                    <p>Bu kodu ilgili alana girerek şifrenizi yenileyebilirsiniz.</p>
                    <p style="color: #666; font-size: 12px;">Bu kod 15 dakika süreyle geçerlidir.</p>
                    <br>
                    <p>Sevgiler,<br>Bahçe-i Firdevs Ekibi</p>
                </div>
                """.formatted(fullName, code);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("🔐 Şifre sıfırlama kodu gönderildi: {}", toEmail);

        } catch (Exception e) {
            log.error("❌ Şifre maili hatası: ", e);
        }
    }
}