-- ==========================================
-- LifeLink AI Database Schema (PostgreSQL)
-- Production DDL with Relational Constraints
-- ==========================================

-- Enable PostGIS extension for geo-spatial distance query indexes
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table (Core Auth Entity)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('DONOR', 'RECIPIENT', 'HOSPITAL', 'BLOODBANK', 'NGO', 'ADMIN')),
    location VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326), -- Spatial geometric column
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to automatically synchronize geography points on lat/lng updates
CREATE OR REPLACE FUNCTION update_geom_column()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_geom
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_geom_column();


-- 2. Donors Table (Medical parameters & status)
CREATE TABLE donors (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
    age INT NOT NULL CHECK (age BETWEEN 18 AND 65),
    weight DOUBLE PRECISION NOT NULL CHECK (weight >= 45.0),
    last_donation_date DATE,
    availability VARCHAR(25) NOT NULL DEFAULT 'AVAILABLE' CHECK (availability IN ('AVAILABLE', 'UNAVAILABLE', 'EMERGENCY_AVAILABLE')),
    organ_donor BOOLEAN NOT NULL DEFAULT FALSE,
    impact_score INT NOT NULL DEFAULT 0 CHECK (impact_score >= 0),
    lives_saved INT NOT NULL DEFAULT 0 CHECK (lives_saved >= 0)
);


-- 3. Hospitals Table (Verification licenses)
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    licence_number VARCHAR(100) NOT NULL UNIQUE,
    emergency_contact VARCHAR(30) NOT NULL,
    verified_status BOOLEAN NOT NULL DEFAULT FALSE
);


-- 4. Blood Banks Table
CREATE TABLE blood_banks (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    licence_number VARCHAR(100) NOT NULL UNIQUE
);

-- 5. Blood Bank Inventory Sub-table
CREATE TABLE blood_bank_inventory (
    id SERIAL PRIMARY KEY,
    blood_bank_id INT NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
    units INT NOT NULL DEFAULT 0 CHECK (units >= 0),
    min_threshold INT NOT NULL DEFAULT 15 CHECK (min_threshold > 0),
    expiry_alerts INT NOT NULL DEFAULT 0 CHECK (expiry_alerts >= 0),
    UNIQUE (blood_bank_id, blood_group)
);


-- 6. Emergency Requests Table
CREATE TABLE emergency_requests (
    id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    patient_name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
    units_required INT NOT NULL CHECK (units_required > 0),
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('ROUTINE', 'URGENT', 'CRITICAL_SOS')),
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'MATCHING', 'NOTIFIED', 'ACCEPTED', 'COMPLETED')),
    assigned_donor_id INT REFERENCES donors(id) ON DELETE SET NULL,
    match_score INT CHECK (match_score BETWEEN 0 AND 100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_update_emergency_geom
BEFORE INSERT OR UPDATE ON emergency_requests
FOR EACH ROW EXECUTE FUNCTION update_geom_column();


-- 7. Donation History Ledger
CREATE TABLE donation_history (
    id SERIAL PRIMARY KEY,
    emergency_request_id INT REFERENCES emergency_requests(id) ON DELETE SET NULL,
    donor_id INT NOT NULL REFERENCES donors(id) ON DELETE RESTRICT,
    blood_group VARCHAR(5) NOT NULL,
    units_collected INT NOT NULL CHECK (units_collected > 0),
    completed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 8. Campaigns Table (NGO coordination)
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    target_units INT NOT NULL CHECK (target_units > 0),
    collected_units INT NOT NULL DEFAULT 0 CHECK (collected_units >= 0),
    volunteers_count INT NOT NULL DEFAULT 0 CHECK (volunteers_count >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ACTIVE', 'COMPLETED'))
);


-- 9. Audit Logs Table (HIPAA compliance tracking)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- Spatial & Relational Indexes for Search Performance
-- ==========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_donors_blood_group ON donors(blood_group);
CREATE INDEX idx_users_geom ON users USING GIST(geom);
CREATE INDEX idx_emergency_requests_geom ON emergency_requests USING GIST(geom);
CREATE INDEX idx_emergency_requests_status ON emergency_requests(status);
