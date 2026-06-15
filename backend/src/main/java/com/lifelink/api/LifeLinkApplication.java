package com.lifelink.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class LifeLinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(LifeLinkApplication.class, args);
    }
}
