# LifeLink AI System Architecture

This document blueprints the production AWS deployment design for the LifeLink AI Emergency Network to service national-level scale.

---

## 1. Network Architecture (AWS VPC)

The system is deployed inside a multi-Availability Zone (AZ) Virtual Private Cloud (VPC) to ensure high availability and disaster recovery.

```
                  Internet (Route 53 latency routing)
                               │
                       AWS Application LB
                               │
          ┌────────────────────┴────────────────────┐
          ▼ AZ-1                                    ▼ AZ-2
   ┌──────────────┐                          ┌──────────────┐
   │ Public Subnet│                          │ Public Subnet│
   │ (Nat Gateway)│                          │ (Nat Gateway)│
   └──────┬───────┘                          └──────┬───────┘
          │                                         │
   ┌──────▼───────┐                          ┌──────▼───────┐
   │Private Subnet│                          │Private Subnet│
   │ (Spring ECS) │                          │ (Spring ECS) │
   └──────┬───────┘                          └──────┬───────┘
          │                                         │
          └────────────────────┬────────────────────┘
                               ▼
                        Private Subnet
               ┌──────────────────────────────┐
               ▼                              ▼
          PostgreSQL RDS                   Redis Cache
          (Primary Master)             (Cluster Replication)
```

---

## 2. Infrastructure Deployment Stack

### Frontend Application
* **Hosting:** Next.js static files exported and served via **AWS S3** + **Amazon CloudFront** CDN cache edges.
* **DNS:** **Amazon Route 53** managing domains and routing clients to nearest CloudFront endpoints.

### API Gateway & Application Servers
* **Containerization:** Spring Boot backend and Python AI recommendations engine packaged into Docker containers.
* **Orchestration:** **AWS Elastic Container Service (ECS)** on **AWS Fargate** (serverless containers) behind an **Application Load Balancer (ALB)**.
* **Scaling:** Horizontal Auto Scaling triggers when Average CPU utilization exceeds 70% or active HTTP connection counts spike.

### Databases and Cache
* **Primary DB:** **Amazon RDS for PostgreSQL** (Multi-AZ replication). PostGIS geometry spatial columns indexed using GIST trees.
* **Caching:** **Amazon ElastiCache for Redis** caching compatibility tables, coordinates data logs, and matching lists to lower DB read load.

### Notification Dispatches
* **SMS Gateway:** **Twilio SMS API** called asynchronously by Spring Boot thread executors.
* **Email Service:** **Amazon Simple Email Service (SES)** for hospital verify tickets and registration receipts.

---

## 3. Data Flow Metrics: SOS Request Lifecycle
1. **Hospital creates emergency:** Sends lat/lng coordinates and blood group requirements to Spring Boot REST endpoint.
2. **Spring Boot pulls active local donors:** Fetches eligible donors within a 15km bounding coordinates box.
3. **AI Matching Calculation:** Spring Boot forwards candidate array to Python FastAPI microservice (Fargate instance). Python computes geodesic distances and composite compatibility scoring vectors.
4. **SMS Dispatch Broadcast:** Spring Boot receives ranked list, commits audit logs to PostgreSQL, updates Redis active caches, and invokes Twilio SMS dispatch asynchronously.
