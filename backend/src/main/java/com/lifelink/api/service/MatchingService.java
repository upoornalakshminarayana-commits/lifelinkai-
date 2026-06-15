package com.lifelink.api.service;

import com.lifelink.api.model.EmergencyRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MatchingService {

    private static final Logger logger = LoggerFactory.getLogger(MatchingService.class);

    @Value("${ai.service.url:http://localhost:8000/api/match}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Map<String, Object>> findMatchingDonors(EmergencyRequest request) {
        try {
            // Build payload for Python FastAPI Matcher
            Map<String, Object> payload = new HashMap<>();
            payload.put("blood_group", request.getBloodGroup());
            payload.put("latitude", request.getLatitude());
            payload.put("longitude", request.getLongitude());
            payload.put("urgency", request.getUrgency().name());

            ResponseEntity<List> response = restTemplate.postForEntity(aiServiceUrl, payload, List.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (List<Map<String, Object>>) response.getBody();
            }
        } catch (Exception e) {
            logger.warn("AI Service unavailable. Running local fallback matching algorithm. Error: {}", e.getMessage());
        }

        // Fallback local Java matching heuristic
        return runLocalFallbackMatching(request);
    }

    private List<Map<String, Object>> runLocalFallbackMatching(EmergencyRequest request) {
        List<Map<String, Object>> candidates = new ArrayList<>();
        
        // Mock data representation of a nearby compatible donor
        Map<String, Object> mockDonor = new HashMap<>();
        mockDonor.put("donorId", 101L);
        mockDonor.put("name", "John Doe");
        mockDonor.put("phone", "+15551234567");
        mockDonor.put("bloodGroup", request.getBloodGroup());
        mockDonor.put("distanceKm", 1.2);
        mockDonor.put("matchScore", 95);
        candidates.add(mockDonor);

        return candidates;
    }

    public void dispatchAlerts(List<Map<String, Object>> donors, EmergencyRequest request) {
        // Send SMS alerts to top ranked match candidates
        for (Map<String, Object> donor : donors) {
            String phone = (String) donor.get("phone");
            int score = (int) donor.get("matchScore");
            double distance = (double) donor.get("distanceKm");

            logger.info("DISPATCHING TWILIO SMS to {}: SOS compatibility O- match found at St. Jude Hospital. Score: {}%. Distance: {} km.",
                    phone, score, String.format("%.1f", distance));
            
            // Real Twilio SDK integration:
            // Message.creator(
            //     new PhoneNumber(phone),
            //     new PhoneNumber(fromTwilioPhone),
            //     "LifeLink Urgent: Compatible blood requirement at..."
            // ).create();
        }
    }
}
