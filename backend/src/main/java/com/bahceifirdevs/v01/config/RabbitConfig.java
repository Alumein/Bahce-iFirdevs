package com.bahceifirdevs.v01.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE_NAME = "bahce-exchange";

    // --- KUYRUK İSİMLERİ ---
    public static final String QUEUE_WELCOME_EMAIL = "q.welcome.email";      // Kayıt mailleri
    public static final String QUEUE_ORDER_CREATED_EMAIL = "q.order.created.email"; // Sipariş alındı mailleri
    public static final String QUEUE_NOTIFICATIONS = "q.notifications";      // Diğer bildirimler (Ödeme vb.)

    // --- ROTA ANAHTARLARI (ROUTING KEYS) ---
    public static final String ROUTING_KEY_CUSTOMER_REGISTERED = "customer.registered";
    public static final String ROUTING_KEY_ORDER_CREATED = "order.created";
    public static final String ROUTING_KEY_ORDER_PAID = "order.paid";
    public static final String ROUTING_KEY_ORDER_SHIPPED = "order.shipped";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // --- KUYRUK TANIMLARI ---
    @Bean
    public Queue welcomeQueue() {
        return new Queue(QUEUE_WELCOME_EMAIL, true);
    }

    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(QUEUE_ORDER_CREATED_EMAIL, true);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(QUEUE_NOTIFICATIONS, true);
    }

    // --- BAĞLAMALAR (BINDINGS) ---
    
    // 1. Kayıt Olunca -> Welcome Kuyruğuna
    @Bean
    public Binding welcomeBinding(Queue welcomeQueue, TopicExchange exchange) {
        return BindingBuilder.bind(welcomeQueue).to(exchange).with(ROUTING_KEY_CUSTOMER_REGISTERED);
    }

    // 2. Sipariş Oluşunca -> Order Created Kuyruğuna
    @Bean
    public Binding orderCreatedBinding(Queue orderCreatedQueue, TopicExchange exchange) {
        return BindingBuilder.bind(orderCreatedQueue).to(exchange).with(ROUTING_KEY_ORDER_CREATED);
    }

    // 3. Ödeme veya Kargo -> Notification Kuyruğuna (Mevcut yapını korumak için)
    @Bean
    public Binding paymentBinding(Queue notificationQueue, TopicExchange exchange) {
        return BindingBuilder.bind(notificationQueue).to(exchange).with("order.*"); // order.paid, order.shipped vb. hepsini yakalar
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}