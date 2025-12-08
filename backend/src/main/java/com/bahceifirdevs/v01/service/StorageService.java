package com.bahceifirdevs.v01.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

  private final MinioClient minioClient;

  @Value("${app.storage.minio.bucket}")
  private String bucketName;

  @Value("${app.storage.minio.endpoint}")
  private String endpoint;

  /**
   * Dosyayı MinIO'ya yükler ve public URL'ini döner.
   */
  public String uploadImage(MultipartFile file) {
    try {
      // 1. Bucket var mı kontrol et, yoksa oluştur
      boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
      if (!found) {
        minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        // Bucket'ı public yap (resimler tarayıcıda görünsün diye)
        String policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":[\"*\"]},\"Action\":[\"s3:GetBucketLocation\",\"s3:ListBucket\",\"s3:ListBucketMultipartUploads\"],\"Resource\":[\"arn:aws:s3:::" + bucketName + "\"]},{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":[\"*\"]},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]}]}";
        minioClient.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucketName).config(policy).build());
      }

      // 2. Benzersiz dosya adı oluştur
      String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename().replace(" ", "_");

      // 3. Yükle
      try (InputStream inputStream = file.getInputStream()) {
        minioClient.putObject(
            PutObjectArgs.builder()
                .bucket(bucketName)
                .object(fileName)
                .stream(inputStream, file.getSize(), -1)
                .contentType(file.getContentType())
                .build());
      }

      // 4. URL'i oluştur ve dön
      // (localhost:9000/product-images/resim.jpg)
      return endpoint + "/" + bucketName + "/" + fileName;

    } catch (Exception e) {
      log.error("Dosya yükleme hatası", e);
      throw new RuntimeException("Resim yüklenemedi: " + e.getMessage());
    }
  }
}