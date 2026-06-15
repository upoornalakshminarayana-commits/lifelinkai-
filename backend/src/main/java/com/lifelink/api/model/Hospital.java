package com.lifelink.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hospitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hospital {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "licence_number", nullable = false, unique = true)
    private String licenceNumber;
    
    @Column(name = "emergency_contact", nullable = false)
    private String emergencyContact;
    
    @Column(name = "verified_status", nullable = false)
    private Boolean verifiedStatus = false;
}
