# LifeLink AI API Documentation

This document specifies the core REST endpoints for the LifeLink AI emergency matching engine, authentication gateway, and dashboard synchronization services.

---

## 1. Authentication Service

### Register New User
* **Endpoint:** `POST /api/auth/register`
* **Access:** Public
* **Payload:**
```json
{
  "email": "donor1@lifelink.ai",
  "password": "SecurePassword123",
  "name": "Alex Mercer",
  "phone": "+15550192834",
  "role": "DONOR",
  "location": "Metro Center Block A",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```
* **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "DONOR",
  "email": "donor1@lifelink.ai",
  "name": "Alex Mercer"
}
```

### Authenticate Account (Login)
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Payload:**
```json
{
  "email": "donor1@lifelink.ai",
  "password": "SecurePassword123"
}
```
* **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "DONOR",
  "email": "donor1@lifelink.ai",
  "name": "Alex Mercer"
}
```

---

## 2. Emergency SOS Service

### Create SOS Requirement
* **Endpoint:** `POST /api/emergency/request`
* **Headers:** `Authorization: Bearer <token>`
* **Access:** Hospital, Admin
* **Payload:**
```json
{
  "patientName": "Robert Vance",
  "bloodGroup": "O-",
  "unitsRequired": 3,
  "urgency": "CRITICAL_SOS",
  "location": "St. Jude Trauma Ward Room 4",
  "latitude": 40.7150,
  "longitude": -74.0090
}
```
* **Response (200 OK):**
```json
{
  "message": "Emergency SOS triggered successfully",
  "request": {
    "id": 412,
    "patientName": "Robert Vance",
    "bloodGroup": "O-",
    "unitsRequired": 3,
    "urgency": "CRITICAL_SOS",
    "location": "St. Jude Trauma Ward Room 4",
    "status": "MATCHING",
    "createdAt": "2026-06-15T11:20:00Z"
  },
  "matchedDonorsCount": 4
}
```

---

## 3. Inventory Service

### Update Blood Bank Inventory
* **Endpoint:** `PUT /api/bloodbank/inventory`
* **Headers:** `Authorization: Bearer <token>`
* **Access:** BloodBank, Admin
* **Payload:**
```json
{
  "bloodGroup": "O-",
  "units": 15
}
```
* **Response (200 OK):**
```json
{
  "status": "Success",
  "message": "Inventory updated",
  "inventory": {
    "O-": 15,
    "O+": 45
  }
}
```

---

## 4. AI Recommendation Microservice

### Query Ranked Compatible Donors
* **Endpoint:** `POST /api/match` (Exposed by Python service internal node)
* **Access:** Internal Only (Spring Boot API Gateway calling Python app)
* **Payload:**
```json
{
  "blood_group": "O-",
  "latitude": 40.7150,
  "longitude": -74.0090,
  "max_distance_km": 15.0,
  "donors_registry": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "+15550192834",
      "bloodGroup": "O-",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "availability": "AVAILABLE"
    }
  ]
}
```
* **Response (200 OK):**
```json
[
  {
    "donorId": 1,
    "name": "John Doe",
    "phone": "+15550192834",
    "bloodGroup": "O-",
    "distanceKm": 0.62,
    "matchScore": 98
  }
}
```
