# Project SURAKSHA

A multi-layered mobile safety application for tourists in remote, zero-connectivity environments.

---

## Core Problem

Tourist safety in remote areas is compromised by the lack of reliable communication. Standard apps fail when GPS or cellular networks are unavailable, leaving individuals stranded and rescue operations delayed.

## Our Solution

SURAKSHA provides a resilient safety net that functions even when all networks are down. Our key innovations are:

- **Tiered Communication Cascade:** An intelligent system that automatically switches between Internet (HTTPS), SMS, and a peer-to-peer **Ad-Hoc Mesh Network** to transmit an SOS.
- **"Digital Breadcrumbs" & Dead Reckoning:** When GPS fails, the app uses on-device sensors and a **Kalman Filter** to accurately track a user's path, enabling them to backtrack to safety.

---

## Tech Stack

**Backend:**

- Node.js with Express.js
- PostgreSQL
- Twilio SMS Gateway

**Mobile App:**

- React Native
- Zustand (State Management)
- Native Modules for Hardware Access (GPS, BLE, Sensors)

**AI/ML:**

- JavaScript implementation of a Kalman Filter for on-device sensor fusion.

---

## Quick Setup & Run

### Backend

1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Set up your `.env` file with database and Twilio credentials.
4. Run the server: `npm start`

### Mobile App

1. Navigate to the `mobile-app` directory: `cd mobile-app`
2. Install dependencies: `npm install`
3. Install pods (for iOS): `npx pod-install`
4. Run the application: `npm run ios` or `npm run android`

---

### Team BODMAS

- **Backend:** TBD, TBD
- **Mobile App (UI & State):** TBD
- **Mobile App (Hardware & Connectivity):** TBD, TBD
- **AI/ML (Sensor Fusion):** TBD
