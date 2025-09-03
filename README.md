# Project SURAKSHA

A multi-layered mobile safety application for tourists, combining proactive threat intelligence with a resilient, zero-connectivity emergency response system.

---

## Core Problem

Tourist safety in remote areas is compromised by the lack of reliable communication. Standard apps fail when GPS or cellular networks are unavailable, leaving individuals stranded and rescue operations delayed. Furthermore, tourists often lack real-time awareness of localized, emerging threats.

## Our Solution

SURAKSHA provides a complete safety ecosystem that functions even when all networks are down. It is built on four key innovations:

- **Proactive Threat Intelligence:** A backend engine analyzes news data (crime, animal attacks) to create a "threat heatmap." This is cached on the device, providing **offline geofencing alerts** to warn tourists before they enter a high-risk area.

- **Automated Wellness Checks:** A backend AI monitors for anomalous travel patterns (e.g., prolonged inactivity off-trail). If a potential distress event is detected, the system can trigger an alert even if the user is physically unable to.

- **Tiered Communication Cascade:** An intelligent system that automatically switches between Internet (HTTPS), SMS, and a peer-to-peer **Ad-Hoc Mesh Network** to transmit an SOS, prioritizing connections to nearby Rangers acting as mobile gateways.

- **Blockchain-Anchored Auditing:** Critical event logs are asynchronously notarized to the Polygon blockchain. This creates a **tamper-proof, immutable audit trail** for evidence and reporting, without impacting the real-time performance of the app.

---

## Tech Stack

**Backend:**

- Node.js with Express.js
- MongoDB
- Twilio SMS Gateway
- NewsAPI.org for threat intelligence
- Polygon SDK for blockchain anchoring

**Mobile App:**

- React Native
- Zustand (State Management)
- Native Modules for Hardware Access (GPS, BLE, Sensors)

**AI/ML:**

- **On-Device:** JavaScript implementation of a Kalman Filter for sensor fusion.
- **Backend:** Python model for travel path anomaly detection.

---

## Quick Setup & Run

### Backend

1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Set up your `.env` file with database and service credentials.
4. Run the server: `npm start`

### Mobile App

1. Navigate to the `mobile-app` directory: `cd mobile-app`
2. Install dependencies: `npm install`
3. Install pods (for iOS): `npx pod-install`
4. Run the application: `npm run ios` or `npm run android`

---

### Team B.O.D.M.A.S.

- **Backend:** TBD, TBD
- **Mobile App (UI & State):** TBD
- **Mobile App (Hardware & Connectivity):** TBD, TBD
- **AI/ML (Sensor Fusion & Anomaly Detection):** TBD
