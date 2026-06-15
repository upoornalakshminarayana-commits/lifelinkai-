# LifeLink AI 🩸

LifeLink AI is an intelligent platform connecting blood donors, hospitals, and recipients efficiently and rapidly during emergencies. Powered by an AI matching algorithm, LifeLink optimizes the process of identifying the best possible donor based on location, blood type, availability, and urgency.

## Features ✨

* **Smart AI Matching:** Advanced Python-based AI service that connects patients with nearby compatible donors instantly.
* **Real-time Dashboards:** Dedicated interactive dashboards for Admins, Blood Banks, Donors, Hospitals, NGOs, and Recipients.
* **Emergency Response:** Prioritized matching and alert systems for critical emergency requests.
* **Modern Interface:** Fast, responsive frontend built with Next.js and styled with Tailwind CSS and Framer Motion animations.
* **Robust Backend:** Secure and scalable Java Spring Boot backend handling authentication, data management, and coordination.

## Tech Stack 🛠️

* **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
* **Backend:** Java, Spring Boot, Spring Security, JWT Auth
* **AI Service:** Python, FastAPI/Flask (for matching service algorithms)
* **Database:** PostgreSQL (with potential for Redis caching)

## Project Structure 📁

- `/frontend` - Next.js application containing the web UI.
- `/backend` - Java Spring Boot application exposing the main REST API.
- `/ai-service` - Python service handling the matching algorithm.
- `/docs` - System architecture and API documentation.

## Getting Started 🚀

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

### Backend
1. Navigate to the backend directory: `cd backend`
2. Configure your database settings in `src/main/resources/application.yml`
3. Build and run using Maven: `./mvnw spring-boot:run`

### AI Service
1. Navigate to the AI service directory: `cd ai-service`
2. Install dependencies: `pip install -r requirements.txt`
3. Run the python service: `python app.py`

## License 📄
This project is licensed under the MIT License.