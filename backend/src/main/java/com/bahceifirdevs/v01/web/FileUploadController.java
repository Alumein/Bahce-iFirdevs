package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

  private final StorageService storageService;

  @PostMapping("/image")
  public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
    if (file.isEmpty()) {
      return ResponseEntity.badRequest().body("Dosya seçilmedi.");
    }
    String imageUrl = storageService.uploadImage(file);
    return ResponseEntity.ok(Map.of("url", imageUrl));
  }
}