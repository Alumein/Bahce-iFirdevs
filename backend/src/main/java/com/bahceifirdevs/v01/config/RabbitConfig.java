package com.bahceifirdevs.v01.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

  public static final String EXCHANGE_NAME = "bahce-exchange";
  
  // Kuyruk İsimleri
  public static final String QUEUE_NOTIFICATIONS = "q.notifications"; // (Mevcut)
  public static final String QUEUE_WELCOME_EMAIL = "q.welcome"; // YENİ
  public static final String QUEUE_SHIPPING_EMAIL = "q.shipping"; // YENİ

  // Rota Anahtarları
  public static final String ROUTING_KEY_ORDER_PAID = "order.paid"; // (Mevcut)
  public static final String ROUTING_KEY_ORDER_SHIPPED = "order.shipped"; // YENİ
  public static final String ROUTING_KEY_CUSTOMER_REGISTERED = "customer.registered"; // YENİ


  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(EXCHANGE_NAME);
  }

  // --- Kuyruk (Queue) Tanımları ---
  @Bean
  public Queue notificationQueue() {
    return new Queue(QUEUE_NOTIFICATIONS, true);
  }
  @Bean
  public Queue welcomeQueue() {
    return new Queue(QUEUE_WELCOME_EMAIL, true);
  }
  @Bean
  public Queue shippingQueue() {
    return new Queue(QUEUE_SHIPPING_EMAIL, true);
  }

  // --- Rota (Binding) Tanımları ---
  @Bean
  public Binding notificationBinding(Queue notificationQueue, TopicExchange exchange) {
    return BindingBuilder.bind(notificationQueue).to(exchange).with(ROUTING_KEY_ORDER_PAID);
  }
  @Bean
  public Binding welcomeBinding(Queue welcomeQueue, TopicExchange exchange) {
    return BindingBuilder.bind(welcomeQueue).to(exchange).with(ROUTING_KEY_CUSTOMER_REGISTERED);
  }
  @Bean
  public Binding shippingBinding(Queue shippingQueue, TopicExchange exchange) {
    return BindingBuilder.bind(shippingQueue).to(exchange).with(ROUTING_KEY_ORDER_SHIPPED);
  }

  
  @Bean
  public MessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }
}