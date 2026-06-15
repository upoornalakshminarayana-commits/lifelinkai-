import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from matcher import AIDonorMatcher

app = FastAPI(
    title="LifeLink AI Recommendation Engine",
    description="Microservice calculating donor compatibility coordinates matching.",
    version="1.0.0"
)

class MatchRequest(BaseModel):
    blood_group: str
    latitude: float
    longitude: float
    max_distance_km: float = 15.0
    donors_registry: List[Dict[str, Any]]

class MatchResponse(BaseModel):
    donorId: int
    name: str
    phone: str
    bloodGroup: str
    distanceKm: float
    matchScore: int

@app.post("/api/match", response_model=List[MatchResponse])
def get_donor_matches(payload: MatchRequest):
    try:
        matcher = AIDonorMatcher(payload.donors_registry)
        results = matcher.match(
            target_blood=payload.blood_group,
            lat=payload.latitude,
            lng=payload.longitude,
            max_distance_km=payload.max_distance_km
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
