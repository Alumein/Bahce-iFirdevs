package com.bahceifirdevs.v01.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

    // 1. Resimlerin sunucuda fiziksel olarak duracağı klasör
    private final Path fileStorageLocation = Paths.get("/var/www/uploads");

    // 2. Tarayıcıda görünecek adresin başı (Domainin)
    private final String baseUrl = "https://bahce-ifirdevs.com.tr/uploads/";

    public StorageService() {
        try {
            // Klasör yoksa oluştur
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Yükleme klasörü oluşturulamadı.", ex);
        }
    }

    public String uploadImage(MultipartFile file) {
        // Dosya ismini temizle
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) originalFileName = "image.jpg";

        // Benzersiz isim yap (örn: 550e8400-resim.jpg)
        String fileName = UUID.randomUUID().toString() + "-" + originalFileName.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");

        try {
            // Hedef dosya yolu
            Path targetLocation = this.fileStorageLocation.resolve(fileName);

            // Dosyayı kaydet (Varsa üzerine yaz)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Geriye resmin tam internet adresini döndür
            return baseUrl + fileName;

        } catch (IOException ex) {
            throw new RuntimeException("Dosya kaydedilemedi: " + fileName, ex);
        }
    }
}