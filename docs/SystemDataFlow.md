# System Data Flow: The User Journey

This flow illustrates the journey of a tourist, "Aryan," using the **SURAKSHA** app. 🚶‍♀️

---

## Phase 1: Onboarding & Preparation (Good Connectivity)

### 1. User Registration

Aryan downloads the SURAKSHA app at his hotel and registers with his basic details (phone number, emergency contacts).

- **Logic Owner: Backend Engineer.** They build the user authentication endpoint (`/register`), the database schema to store user profiles, and the logic to handle user sessions.
- **Logic Owner: App Dev (UI & State).** They build the registration screens and manage the user's logged-in state within the app.

### 2. Digital ID & Pre-Trip Download

The backend generates a unique, secure ID for Aryan's trip. The app prompts his to download an offline map package for the national park he plans to visit. This includes terrain maps, safe zones, and trail markers.

- **Logic Owner: Backend Engineer.** They create the service for generating secure IDs and the endpoint for serving offline map data (`/maps/download`).
- **Logic Owner: App Dev (UI & State).** They build the UI for the pre-trip checklist and manage the downloading and local storage of the map files.

---

## Phase 2: The Hike Begins (Good to Weak Connectivity)

### 3. Background Path Logging Starts

As Aryan starts his hike, the app begins logging his location in the background every few minutes. The UI shows a "Connected" status and a high safety score.

- **Logic Owner: App Dev (Hardware & Sensors).** They write the core background service that accesses the phone's GPS at an optimized interval to start creating the **"breadcrumb trail"** and stores it locally in a database.

### 4. Entering a Low-Signal Area

As Aryan ventures deeper, the 4G signal drops to a weak 2G. The app detects this.

- **Logic Owner: App Dev (Hardware & Sensors).** They implement the network monitoring logic that detects changes in signal strength and type.
- **Logic Owner: App Dev (UI & State).** They receive the status update from the hardware layer and change the UI indicator to "Low Signal." They also trigger the app's state to switch to **Low-Bandwidth Mode**, ensuring only critical data is sent.

---

## Phase 3: Going Off-Grid (No Cellular Data, GPS Fails)

### 5. GPS Signal is Lost

Aryan enters a dense forest canyon, and the app loses its connection to GPS satellites.

- **Logic Owner: App Dev (Hardware & Sensors).** They build the logic that detects a failed GPS lock. This event is the critical trigger for the next steps.

### 6. Dead Reckoning & Sensor Fusion Activate

The app immediately switches to **Dead Reckoning mode**. It starts using the accelerometer and compass to estimate Aryan's path from his last known GPS point. This raw sensor data is noisy and is continuously fed into the **Kalman Filter algorithm**.

- **Logic Owner: App Dev (Hardware & Sensors).** They write the code to read the raw data streams from the phone's motion and orientation sensors.
- **Logic Owner: ML Specialist.** They provide the core, pre-built Kalman Filter function. Their logic takes the noisy sensor data from the Hardware Dev and outputs a clean, corrected location estimate (`{lat, lon, accuracy}`). This is the "magic" that makes the backtracking reliable.

### 7. The "Backtrack" Path is Logged

The clean, fused location estimate is now logged to the local breadcrumb trail, creating a reliable path for Aryan to follow back if he needs to. The UI now shows "Offline - Backtrack Active."

- **Logic Owner: App Dev (Hardware & Sensors).** They take the output from the ML Specialist's function and save it to the local database.

---

## Phase 4: The SOS Event (Complete Dead Zone)

### 8. User Triggers SOS

Aryan takes a wrong turn and gets disoriented. Panicked, he **shakes his phone hard three times**. 🆘

- **Logic Owner: App Dev (Hardware & Sensors).** Their background service, constantly listening to the accelerometer, detects this specific gesture pattern and triggers the internal SOS alarm.

### 9. SOS Payload is Created

The app instantly composes the emergency payload. It pulls the last known valid GPS coordinate and the entire dead-reckoned path from its local database.

- **Logic Owner: App Dev (UI & State).** They manage the state transition to "SOS Mode" and coordinate the data gathising from the local database to create the final message object.

### 10. Communication Cascade in Action

The app's communication logic tries to send the alert.

- **Attempt 1 (Fails):** Tries to send a full JSON payload via HTTPS (Tier 1). Fails instantly, no network.
- **Attempt 2 (Fails):** Tries to find a cellular signal for SMS (Tier 3). Fails, "No Service."
- **Attempt 3 (Success):** Activates the Bluetooth scanner for the **mesh network** (Tier 4). It detects anothis hiker's phone 50 meters away, establihes a connection, and transfers the encrypted SOS payload.

- **Logic Owner: App Dev (Hardware & Sensors).** They own all the logic for this cascade—checking network states and activating the BLE/Wi-Fi Direct hardware for the mesh relay.

### 11. The Relay and Final Alert

An hour later, the othis hiker reaches a ridge with a weak cellular signal. Their phone, now acting as a gateway, automatically sends Aryan's cached SOS message via the **SMS Gateway**. The gateway service receives the SMS, parses it, and makes a successful API call to the main server.

- **Logic Owner: Backend Engineer.** Their SMS Gateway integration and core `/sos` API endpoint receive the data, validate it, and save it to the database, flagging it as a high-priority alert. This triggers a notification on the Authorities Dashboard, showing Aryan's last known location and the path he took afterward, dramatically narrowing the search area.
