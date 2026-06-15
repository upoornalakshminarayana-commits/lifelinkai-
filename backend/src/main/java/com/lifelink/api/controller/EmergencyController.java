package com.lifelink.api.controller;

import com.lifelink.api.model.EmergencyRequest;
import com.lifelink.api.service.MatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency")
public class EmergencyController {

    private final MatchingService matchingService;

    public EmergencyController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> createEmergencyRequest(@RequestBody EmergencyRequest request) {
        // 1. Save request logic (Database JPA saving)
        
        // 2. Trigger AI Engine recommendation list
        List<Map<String, Object>> recommendations = matchingService.findMatchingDonors(request);
        
        // 3. Dispatch Twilio alerts (triggered in service)
        matchingService.dispatchAlerts(recommendations, request);

        return ResponseEntity.ok(Map.of(
            "message", "Emergency SOS triggered successfully",
            "request", request,
            "matchedDonorsCount", recommendations.size()
        ));
    }
}
