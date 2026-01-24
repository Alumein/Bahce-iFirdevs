package com.bahceifirdevs.v01.repository;

import com.bahceifirdevs.v01.domain.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AppSettingRepository extends JpaRepository<AppSetting, String> {
    Optional<AppSetting> findByKey(String key);
}