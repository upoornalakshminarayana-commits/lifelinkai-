import numpy as np
import pandas as pd
from geopy.distance import geodesic

# Blood compatibility index maps
# 1 = Compatible, 0 = Incompatible
COMPATIBILITY_MATRIX = {
    'O-': {'O-': 1, 'O+': 0, 'A-': 0, 'A+': 0, 'B-': 0, 'B+': 0, 'AB-': 0, 'AB+': 0},
    'O+': {'O-': 1, 'O+': 1, 'A-': 0, 'A+': 0, 'B-': 0, 'B+': 0, 'AB-': 0, 'AB+': 0},
    'A-': {'O-': 1, 'O+': 0, 'A-': 1, 'A+': 0, 'B-': 0, 'B+': 0, 'AB-': 0, 'AB+': 0},
    'A+': {'O-': 1, 'O+': 1, 'A-': 1, 'A+': 1, 'B-': 0, 'B+': 0, 'AB-': 0, 'AB+': 0},
    'B-': {'O-': 1, 'O+': 0, 'B-': 1, 'B+': 0, 'A-': 0, 'A+': 0, 'AB-': 0, 'AB+': 0},
    'B+': {'O-': 1, 'O+': 1, 'B-': 1, 'B+': 1, 'A-': 0, 'A+': 0, 'AB-': 0, 'AB+': 0},
    'AB-': {'O-': 1, 'A-': 1, 'B-': 1, 'AB-': 1, 'O+': 0, 'A+': 0, 'B+': 0, 'AB+': 0},
    'AB+': {'O-': 1, 'O+': 1, 'A-': 1, 'A+': 1, 'B-': 1, 'B+': 1, 'AB-': 1, 'AB+': 1}
}

class AIDonorMatcher:
    def __init__(self, donors_list):
        """
        donors_list: List of dictionaries containing donor details
        """
        self.df_donors = pd.DataFrame(donors_list)

    def match(self, target_blood, lat, lng, max_distance_km=15.0):
        if self.df_donors.empty:
            return []

        scored_results = []
        target_coords = (lat, lng)

        for _, donor in self.df_donors.iterrows():
            # 1. Blood compatibility score (out of 50 pts)
            donor_group = donor['bloodGroup']
            # Can donor donate to target_blood?
            compatible = COMPATIBILITY_MATRIX.get(target_blood, {}).get(donor_group, 0)
            
            if not compatible:
                continue # Incompatible donor
                
            blood_score = 50.0 if donor_group == target_blood else 35.0

            # 2. Geodesic distance calculation (out of 30 pts)
            donor_coords = (donor['latitude'], donor['longitude'])
            dist = geodesic(target_coords, donor_coords).kilometers
            
            if dist > max_distance_km:
                continue # Out of emergency zone radius
                
            # Score decays linearly with distance
            dist_score = max(0.0, 30.0 * (1.0 - (dist / max_distance_km)))

            # 3. Availability score (out of 20 pts)
            avail = donor.get('availability', 'AVAILABLE')
            if avail == 'EMERGENCY_AVAILABLE':
                avail_score = 20.0
            elif avail == 'AVAILABLE':
                avail_score = 15.0
            else:
                avail_score = 0.0

            # Compute combined raw match score
            total_score = blood_score + dist_score + avail_score

            scored_results.append({
                "donorId": int(donor['id']),
                "name": donor['name'],
                "phone": donor['phone'],
                "bloodGroup": donor_group,
                "distanceKm": float(dist),
                "matchScore": int(min(100, total_score))
            })

        # Sort by matchScore (descending) and then distance (ascending)
        scored_results.sort(key=lambda x: (-x['matchScore'], x['distanceKm']))
        return scored_results
