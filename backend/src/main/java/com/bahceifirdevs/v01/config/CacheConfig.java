package com.bahceifirdevs.v01.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory; // YENİ
import org.springframework.data.redis.core.RedisTemplate; // YENİ
import org.springframework.data.redis.serializer.*;

import java.time.Duration;

@Configuration
public class CacheConfig {

  /**
   * Hem @Cacheable hem de manuel RedisTemplate için ortak JSON ayarları
   */
  private GenericJackson2JsonRedisSerializer createJsonSerializer() {
    var ptv = BasicPolymorphicTypeValidator.builder()
        .allowIfBaseType(Object.class)
        .build();

    ObjectMapper om = new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        .activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);

    return new GenericJackson2JsonRedisSerializer(om);
  }

  /**
   * @Cacheable anotasyonları için yapılandırma (Mevcut kodunuz)
   */
  @Bean
  public RedisCacheConfiguration redisCacheConfiguration() {
    GenericJackson2JsonRedisSerializer jsonSerializer = createJsonSerializer();

    return RedisCacheConfiguration.defaultCacheConfig()
        .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
        .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
        .entryTtl(Duration.ofMinutes(5));
  }

  /**
   * YENİ: Sepet (Cart) gibi verileri manuel okumak/yazmak için
   * RedisTemplate bean'i.
   */
  @Bean
  public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);
    
    // Anahtarlar (keys) için String serializer (örn: "cart:user@example.com")
    template.setKeySerializer(new StringRedisSerializer());
    template.setHashKeySerializer(new StringRedisSerializer());

    // Değerler (values) için özel JSON serializer'ımızı kullan
    GenericJackson2JsonRedisSerializer jsonSerializer = createJsonSerializer();
    template.setValueSerializer(jsonSerializer);
    template.setHashValueSerializer(jsonSerializer);

    template.afterPropertiesSet();
    return template;
  }
}