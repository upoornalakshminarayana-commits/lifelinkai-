package com.lifelink.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "blood_banks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloodBank {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "licence_number", nullable = false, unique = true)
    private String licenceNumber;
    
    // Blood inventory mapping (e.g. A+ -> 24 Units)
    @ElementCollection
    @CollectionTable(name = "blood_bank_inventory", joinColumns = @JoinColumn(name = "blood_bank_id"))
    @MapKeyColumn(name = "blood_group")
    @Column(name = "units")
    private Map<String, Integer> inventory = new HashMap<>();
}
