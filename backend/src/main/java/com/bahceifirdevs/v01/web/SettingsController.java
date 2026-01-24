package com.bahceifirdevs.v01.web;

import com.bahceifirdevs.v01.domain.AppSetting;
import com.bahceifirdevs.v01.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final AppSettingRepository settingRepository;

    @GetMapping("/hero-video")
    public Map<String, String> getHeroVideo() {
        Map<String, String> response = new HashMap<>();
        
        // Veritabanından "hero-video" anahtarına sahip ayarı çek
        String url = settingRepository.findByKey("hero-video")
                .map(AppSetting::getValue)
                .orElse("/video.mp4"); // Veritabanında yoksa varsayılanı döndür

        response.put("url", url);
        return response;
    }

    @PostMapping("/hero-video")
    public Map<String, String> setHeroVideo(@RequestBody Map<String, String> payload) {
        String url = payload.get("url");
        
        if (url != null && !url.isEmpty()) {
            // Varsa güncelle, yoksa yeni oluştur
            AppSetting setting = settingRepository.findByKey("hero-video")
                    .orElse(AppSetting.builder().key("hero-video").build());
            
            setting.setValue(url);
            settingRepository.save(setting);
        }
        
        return getHeroVideo();
    }
}