# System Data Flow: The User Journey

This flow illustrates the journey of a tourist, **"Aryan,"** using the **SURAKSHA** app — from onboarding through an off-grid SOS and the subsequent actions by authorities.

---

## Phase 1: Onboarding & Preparation (Good Connectivity)

### 1. User Registration / Onboarding & Authentication

- Aryan downloads the SURAKSHA app at his hotel and registers with his basic details (phone number, emergency contacts).
- **Alternate / additional flow:** At a check-post, an official verifies Aryan's ID. Aryan scans a **one-time QR code** which securely pairs his device, logs him in, and issues a trip-specific **JWT (JSON Web Token)**.
- The app then prompts him to set up an offline-capable **4-digit PIN** or **Biometric Lock** for securing the app. OTP-based login is available as a recovery mechanism.
- **Logic Owner: Backend Engineer.** Build the user authentication endpoint (`/register`), secure QR code generation, JWT session management, OTP recovery endpoints, and the database schema to store user profiles and sessions.
- **Logic Owner: App Dev (UI & State).** Build the registration and QR scanning UI, PIN/Biometric setup screens, manage secure storage of the JWT on the device's keychain, and manage the user's logged-in state within the app.

### 2. Digital ID, Pre-Trip Download & Threat Intelligence

- The backend generates a unique, secure ID for Aryan's trip. The app prompts him to download an offline map package for the national park he plans to visit. This includes terrain maps, safe zones, and trail markers.
- **New / additional feature:** The app also sends the coordinates of the planned area to a new endpoint (`/risk-heatmap`) and **caches a "threat heatmap"** — a grid of pre-calculated risk scores derived from recent news of animal attacks, scams, or other dangers.
- **Logic Owner: Backend Engineer.** Create the service for generating secure IDs, the endpoint for serving offline map data (`/maps/download`), and the **Dynamic Risk Assessment Engine** (News API scraping, risk scoring, `/risk-heatmap` endpoint).
- **Logic Owner: App Dev (UI & State).** Build the UI for the pre-trip checklist and manage the downloading and local storage of map files and the threat heatmap data.

---

## Phase 2: The Hike Begins (Good to Weak Connectivity)

### 3. Background Path Logging & Proactive Alerts

- As Aryan starts his hike, the app begins logging his location in the background every few minutes, creating a **breadcrumb trail** stored locally.
- The UI shows a **dynamic Safety Score**, calculated from connectivity status and the cached threat level of Aryan's current grid location.
- As he approaches an area with a high cached risk score, the app uses **offline geofencing** to trigger a proactive alert: _"Warning: You are entering an area with recent reports of leopard sightings."_
- **Logic Owner: App Dev (Hardware & Sensors).** Write the background service for GPS logging and local geofencing logic that checks position against cached threat data.
- **Logic Owner: App Dev (UI & State).** Show safety score and proactive alert UI.

### 4. Entering a Low-Signal Area

- As Aryan ventures deeper, the 4G signal drops to a weak 2G. The app detects this and changes the UI to "Low Signal".
- The app triggers **Low-Bandwidth Mode**, ensuring only critical data is sent.
- **Logic Owner: App Dev (Hardware & Sensors).** Implement network monitoring logic that detects changes in signal strength and type.
- **Logic Owner: App Dev (UI & State).** Receive status updates from hardware layer, change UI indicator, and handle state transition to low-bandwidth behavior.

---

## Phase 3: Going Off-Grid (No Cellular Data, GPS Fails)

### 5. GPS Signal is Lost

- Aryan enters a dense forest canyon and the app loses its connection to GPS satellites. The app detects a failed GPS lock — a critical trigger for fallback mechanisms.
- **Logic Owner: App Dev (Hardware & Sensors).** Build the detection logic for GPS lock failure.

### 6. Dead Reckoning & Sensor Fusion Activate

- The app immediately switches to **Dead Reckoning mode**. It uses the accelerometer, compass, and device motion sensors to estimate Aryan's path from the last known GPS point.
- Raw sensor data is noisy and is continuously fed into a **Kalman Filter algorithm** (or similar sensor-fusion filter).
- **Logic Owner: App Dev (Hardware & Sensors).** Read raw data streams from motion and orientation sensors and manage the dead-reckoning pipeline.
- **Logic Owner: ML Specialist.** Provide the pre-built Kalman Filter function that takes noisy sensor data and outputs corrected location estimates (`{lat, lon, accuracy}`).

### 7. The "Backtrack" Path is Logged

- The fused, corrected location estimates are logged to the local breadcrumb trail, enabling a reliable backtrack path for the user.
- The UI now shows "Offline - Backtrack Active."
- **Logic Owner: App Dev (Hardware & Sensors).** Save fused estimates to the local database for later retrieval.

---

## Phase 4: The SOS Event & Immediate Communication Cascade

### 8. User Triggers SOS

- Aryan gets disoriented and **shakes his phone hard three times**. The background accelerometer listener detects this gesture pattern and triggers an internal SOS alarm.
- **Logic Owner: App Dev (Hardware & Sensors).** Implement gesture detection and SOS trigger logic.

### 9. SOS Payload is Created

- The app composes the emergency payload: it pulls the last known valid GPS coordinate and the entire dead-reckoned path from its local database.
- **Logic Owner: App Dev (UI & State).** Manage the state transition to "SOS Mode" and coordinate data gathering from local storage to assemble the final message object.

### 10. Communication Cascade in Action (4-Tier Cascade)

- The app tries multiple communication tiers in sequence:

  1. **Tier 1 (Full JSON over HTTPS):** Attempts to send a full JSON payload to the backend via HTTPS. If network is unavailable, this fails instantly.
  2. **Tier 2 (Compressed / Minimal Data over Low Bandwidth):** Attempts to send compacted critical fields; may fail in complete dead zones.
  3. **Tier 3 (SMS):** Attempts to send an SMS. If there's no cellular service, this fails.
  4. **Tier 4 (Mesh — BLE / Wi-Fi Direct Relay):** Activates Bluetooth/Wi-Fi Direct to discover nearby devices and transfer the encrypted SOS payload to nearby phones acting as data mules or gateways.

- **Logic Owner: App Dev (Hardware & Sensors).** Own the cascade logic, network state checks, and activation of BLE/Wi-Fi Direct for mesh relaying.

### 11. Mesh Relay Scenarios & Gateways (both variations preserved)

- **Hiker-to-Hiker Relay Example (from File A):** The mesh detects another hiker's phone \~50 meters away; connection is established and the encrypted SOS payload is transferred.
- **Ranger/Data-Mule Relay Example (from File B):** The mesh connects to a **Ranger's device** \~100 meters away, pre-configured as a high-priority gateway. The Ranger's device is prioritized by the mesh protocol to act as a reliable data mule/gateway.
- The mesh logic prioritizes Ranger/Field Agent devices when available.
- **Logic Owner: App Dev (Hardware & Sensors).** Implement mesh protocol that prioritizes high-value gateways and handles secure, encrypted transfer.

### 12. The Relay and Initial Alert

- When the gateway device (hiker or Ranger) gains cellular signal, it automatically forwards cached SOS messages to the backend via an **SMS Gateway** or HTTPS relay.
- The gateway service (SMS Gateway or gateway client) parses the payload and makes an API call to the main server.
- **Logic Owner: Backend Engineer.** Build the SMS Gateway integration and the core `/sos` API endpoint to receive, validate, and save high-priority alerts in the database. This triggers notifications on the Authorities Dashboard, showing the last known location and the traced path to narrow search areas.

---

## Phase 5: Proactive Server-Side Detection & Escalation (System-Initiated)

### 13. Backend Anomaly Detection

- Whenever the app has connectivity, it syncs anonymized breadcrumb trails to the backend.
- A backend ML model analyzes incoming paths against normal tourist patterns and can detect a **"potential distress event"** — e.g., the user has deviated 2 km from any known trail and has remained inactive in a high-risk area for over 90 minutes.
- **Logic Owner: ML Specialist.** Design and train path-analysis models and anomaly detectors on backend data.
- **Logic Owner: Backend Engineer.** Build infrastructure to run the model on incoming path data and trigger alerts based on output.

### 14. Automated Wellness Check

- The backend dispatches a "Wellness Check" push notification to Aryan's device: _"SURAKSHA Check: We've detected unusual inactivity. Are you okay? Please respond within 15 minutes."_
- **Logic Owner: Backend Engineer.** Build the notification dispatch service and escalation timers.
- **Logic Owner: App Dev (UI & State).** Build UI to receive and respond to wellness check notifications.

### 15. Alert Escalation (Failsafe)

- If Aryan is unable to respond (e.g., injured), after the configured timeout (15 minutes), the system automatically escalates the wellness check into a **high-priority alert** on the Authorities Dashboard. The alert includes his last known location and anomalous path data.
- **Logic Owner: Backend Engineer.** Implement escalation logic, the 15-minute timer, and the API call to create the official alert.

---

## Phase 6: Command, Control, Verification & Post-Event Evidence

### 16. Actionable Response on the Authorities Dashboard

- New alerts (user-initiated or system-initiated) appear on the **Authorities Dashboard**. Operators can:

  1. **Acknowledge** the alert.
  2. **Dispatch** the alert details to the nearest Ranger's device.

- **Logic Owner: Backend Engineer.** Build APIs that power dashboard actions (e.g., `/alert/acknowledge`, `/alert/dispatch`).
- **Logic Owner: App Dev (UI & State).** Build the operator UI for acknowledging and dispatching.

### 17. Asynchronous Blockchain Notarization

- A backend cron job batches the last hour's critical event logs (including SOS events), creates a **Merkle Root hash** of the batch, and anchors that single hash onto a public blockchain (example: **Polygon**) for tamper-evident notarization.
- **Logic Owner: Backend Engineer.** Build the scheduled job, hashing logic, and smart contract interaction for anchoring the Merkle root.

### 18. Immutable Evidence Generation & E-FIR

- Once the rescue and verification are complete, an operator can click **"Generate E-FIR"** on the dashboard.
- The system pulls the complete event log, verifies integrity against the hash anchored on-chain, and generates a tamper-proof, legally admissible PDF report.
- **Logic Owner: Backend Engineer.** Build the PDF generation service and verification logic cross-referencing internal logs with the public blockchain hash.

---

## Additional Notes, Logic Owners & Integrations (consolidated)

- **Endpoints referenced:** `/register`, `/maps/download`, `/risk-heatmap`, `/sos`, `/alert/acknowledge`, `/alert/dispatch`.
- **Key backend components:** SMS Gateway integration, Dynamic Risk Assessment Engine, path-analysis ML models, scheduled blockchain notarization job, PDF/E-FIR generation service.
- **Key app components:** Background GPS/path logger, Dead Reckoning + Kalman Filter sensor fusion, Local breadcrumb DB, Gesture-based SOS trigger, Mesh (BLE/Wi-Fi Direct) relay protocol, Low-Bandwidth Mode, Offline geofencing and threat-heatmap usage, secure JWT/PIN/Biometric storage.
- **Security & privacy considerations:** Securely store trip-specific JWTs in device keychain, protect offline map and heatmap caches, encrypt SOS payloads end-to-end during mesh transfers, anonymize path data for backend analysis where possible, and provide clear consent/opt-in for any data sharing with authorities.
- **Actors in relay scenarios preserved:** other hikers (≈50 m), Ranger devices (≈100 m), both treated as mesh relay peers with Ranger devices prioritized as gateways.
- **ML responsibilities preserved:** both client-side (Kalman / sensor fusion) and server-side (path anomaly detection, risk-heatmap generation) roles are included.
- **Operational timers & thresholds preserved:** 15-minute wellness check response window, 2 km deviation + 90 minutes inactivity anomaly trigger (as example thresholds captured from source content).

---

## End-to-End Example (merged timeline)

1. Aryan registers (hotel or check-post QR), receives trip JWT, downloads offline maps + threat-heatmap, sets PIN/biometric.
2. App logs breadcrumb trail while showing Safety Score; offline geofencing warns of nearby threats.
3. GPS fails; Dead Reckoning + Kalman Filter logs backtrack path locally.
4. Aryan shakes phone → SOS. App attempts HTTPS → SMS → Mesh. Mesh transfers encrypted SOS to nearby hiker (50 m) or Ranger gateway (100 m) depending on proximity and priority.
5. Gateway relays via SMS Gateway to backend `/sos`. Authorities Dashboard receives high-priority alert with last-known location + backtrack path.
6. Backend ML also detects anomalous inactivity (2 km off-trail + 90 min), triggers wellness check; no response → alert escalated.
7. Operator dispatches Rangers, rescue completes; backend notarizes event logs on-chain and operator generates tamper-proof E-FIR PDF.
