package com.lifelink.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "donors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "blood_group", nullable = false, length = 5)
    private String bloodGroup;
    
    @Column(nullable = false)
    private Integer age;
    
    @Column(nullable = false)
    private Double weight;
    
    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Availability availability = Availability.AVAILABLE;
    
    @Column(name = "organ_donor", nullable = false)
    private Boolean organDonor = false;
    
    @Column(name = "impact_score", nullable = false)
    private Integer impactScore = 0;
    
    @Column(name = "lives_saved", nullable = false)
    private Integer livesSaved = 0;
    
    public enum Availability {
        AVAILABLE,
        UNAVAILABLE,
        EMERGENCY_AVAILABLE
    }
}
