# LifeLink AI User Journeys

This document models the end-to-end user journeys for the 4 core roles interacting on the LifeLink AI platform.

---

## 1. Donor User Journey: "Bridges of Life"
* **Objective:** Register availability, maintain healthy eligibility cycles, and volunteer for local drives.

```
┌──────────────┐      ┌──────────────────┐      ┌────────────────────┐
│ 1. Sign Up   ├─────►│ 2. Set Status    ├─────►│ 3. Receive SOS     │
│ Register on  │      │ Set availability │      │ Receive Twilio SMS │
│ Auth Portal  │      │ to "AVAILABLE"   │      │ of nearby patient  │
└──────────────┘      └──────────────────┘      └─────────┬──────────┘
                                                          │
┌──────────────┐      ┌──────────────────┐      ┌─────────▼──────────┐
│ 6. Reset     │      │ 5. Get Verif.    │      │ 4. Donate Blood    │
│ Set to 'UN-  │◄─────┤ Hospital checks  │◄─────┤ Visit hospital,    │
│ AVAILABLE'   │      │ donation code &  │      │ complete clinical  │
│ for 90 days  │      │ awards +25 pts   │      │ blood draw         │
└──────────────┘      └──────────────────┘      └────────────────────┘
```

---

## 2. Patient / Recipient Journey: "Emergency Dispatch"
* **Objective:** Initiate donor calls, trace compatibility matches, and secure critical units.

1. **Access Web App:** The patient visits LifeLink, navigates to the Request Blood panel.
2. **Submit Medical Form:** Enters required blood group, units needed, Urgency (CRITICAL), and Location coordinates.
3. **AI Search Phase:** The system triggers matching, displaying a radar scan animation.
4. **Instant Match Discovery:** AI maps coordinates, ranks candidates, and routes the request to the top donor.
5. **Twilio SMS Alert Broadcast:** The system automatically pushes a Twilio SMS notifying the target donor.
6. **Acceptance and Delivery:** Donor accepts, arrives at the clinic, and units are collected and verified.

---

## 3. Hospital Staff Journey: "Clinical Emergency Verification"
* **Objective:** Coordinate requests, analyze compatibility matches, and log audits.

1. **Dashboard Check:** The Emergency Coordinator views the active SOS requests.
2. **Review Recommendations:** Staff views the AI Match Matrix showing compatibility scores and distances.
3. **Verify Collections:** Once the donor arrives and blood is drawn, staff clicks "Verify Donation".
4. **Audit and Points:** The system archives the request as Completed, increases the donor's impact score, resets donor status, and logs a HIPAA compliant audit log trail.

---

## 4. Blood Bank Journey: "Inventory Management & Forecast"
* **Objective:** Track stock levels, forecast demand trends, and alert clinical networks on shortages.

1. **Monitor Stock meters:** Core inventory screen tracks units for A+, A-, B+, B-, O+, O-, AB+, AB-.
2. **Update Stock levels:** Staff scans incoming bags, incrementing units.
3. **Resolve Expiry Warnings:** Checks alerts flags for bags expiring within 7 days.
4. **Analyze Demand Forecasts:** Reviews Recharts AI forecasting charts mapping historic dispatches against predicted targets to schedule campaigns.
5. **Campaign Collaboration:** NGO handles drives based on Blood Bank shortages to restore stock level stability.
