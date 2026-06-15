package com.lifelink.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
    
    @Column(name = "patient_name", nullable = false)
    private String patientName;
    
    @Column(name = "blood_group", nullable = false, length = 5)
    private String bloodGroup;
    
    @Column(name = "units_required", nullable = false)
    private Integer unitsRequired;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Urgency urgency = Urgency.CRITICAL_SOS;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_donor_id")
    private Donor assignedDonor;
    
    @Column(name = "match_score")
    private Integer matchScore;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum Urgency {
        ROUTINE,
        URGENT,
        CRITICAL_SOS
    }
    
    public enum RequestStatus {
        PENDING,
        MATCHING,
        NOTIFIED,
        ACCEPTED,
        COMPLETED
    }
}
