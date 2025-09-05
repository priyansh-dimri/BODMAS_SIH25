#  SURAKSHA: Smart Tourist Safety System

## Technical Design Document v1.0

**Date:** September 3, 2025
**Status:** DRAFT
**Audience:** Engineering Team, System Architects, Product Managers

### 1. Introduction & System Overview

This document outlines the technical architecture and design of **Project SURAKSHA**, a multi-layered mobile application and backend system designed to ensure tourist safety, particularly in remote and communication-challenged environments.

The system's primary objective is to provide a resilient and reliable method for tourists to signal for help, and for authorities to receive timely, actionable alerts. The design prioritizes robustness and functionality in offline or low-connectivity scenarios over rich media features.

#### 1.1. High-Level Architecture

The SURAKSHA ecosystem consists of three main components:

1. **SURAKSHA Mobile Client**: A smartphone application for tourists (iOS/Android).

2. **SURAKSHA Backend Service**: A cloud-hosted API and data processing engine.

3. **Authorities Dashboard**: A web-based interface for monitoring and response.

#### 1.2. Core Architectural Principles

- **Offline-First**: The mobile client is designed to be functional without an active internet connection.

- **Resilience over Richness**: In degraded network conditions, the system prioritizes the transmission of critical, low-bandwidth data (location, status) over high-bandwidth data (photos, video).

- **Low Battery Consumption**: All background processes and sensor usage are optimized to minimize battery drain, using adaptive algorithms.

- **Privacy by Design**: Personally Identifiable Information (PII) and location data are encrypted at rest and in transit. Fine-grained location data is only accessible to authorities after an explicit SOS trigger.

### 2. Mobile Client: The Layered Architecture

The mobile client is the core of the system and is built on a three-layer functional stack.

#### 2.1. Layer 1: The Communication Layer

This layer is responsible for the transmission of alerts and data. It operates as an intelligent, state-aware finite state machine, automatically selecting the best available communication channel.

**Decision Flow Diagram:**

```bash

[Start] --\> [Check Internet (WiFi/Cellular Data)]
|
\+-- Yes --\> [Tier 1: Full App Communication (HTTPS)]
|
\+-- No --\> [Check for Weak Signal (2G/EDGE)]
|
\+-- Yes --\> [Tier 2: Low-Bandwidth Mode]
|
\+-- No --\> [Check for Cellular Signal (Voice/SMS)]
|
\+-- Yes --\> [Tier 3: SMS Fallback]
|
\+-- No --\> [Tier 4: Ad-Hoc Mesh Network]

```

- **Tier 1: Full App Communication**:

  - **Technology**: Standard HTTPS/REST API calls.
  - **Payload**: Full JSON object with rich data (see Data Models).
  - **Use Case**: Normal operating conditions.

- **Tier 2: Low-Bandwidth Mode**:

  - **Technology**: HTTPS with heavily compressed Protobuf or minified JSON payloads.
  - **Action**: Disables non-essential data sync. Focuses on sending a compressed packet containing only `userID`, `lat`, `lon`, `timestamp`, `battery`, `status`.

- **Tier 3: SMS Fallback**:

  - **Technology**: Native device SMS functionality.
  - **Action**: Composes a machine-readable SMS sent to a dedicated number. This number is routed to an SMS Gateway service (e.g., Twilio, Vonage) which parses the message and forwards it to the backend API.
  - **Payload**: A structured key-value string (see Data Models).

- **Tier 4: Ad-Hoc Mesh Network**:
  - **Technology**:
    - **Discovery**: Bluetooth Low Energy (BLE) advertising to find nearby peers with minimal battery usage.
    - **Data Transfer**: Wi-Fi Direct for a high-speed, secure connection between two peers to transfer cached alert data.
  - **Action**: Activates in absolute "dead zones." Implements a store, carry, and forward protocol.

#### 2.2. Layer 2: The Navigation Layer

This layer is responsible for acquiring, processing, and storing location data. It is designed to function reliably even when the primary location service (GPS) fails.

- **Feature: Continuous Path Logging**:

  - **Description**: In the background, the app logs the user's GPS coordinates every 1-5 minutes (adaptively) to create a "breadcrumb trail." This data is stored locally in an efficient format (e.g., SQLite database).

- **Feature: "Digital Breadcrumbs" with Dead Reckoning**:

  - **Trigger**: Activates automatically upon detection of GPS signal loss.
  - **Technology**: Utilizes the phone's built-in sensors, which work offline:
    - **`TYPE_ACCELEROMETER`**: To measure step count and estimate distance traveled.
    - **`TYPE_GYROSCOPE`**: To measure changes in orientation/turns.
    - **`TYPE_MAGNETOMETER`**: To determine heading (compass direction).
  - **Action**: Starting from the last known valid GPS coordinate, it estimates the subsequent path using the sensor data.

- **Feature: "Backtrack" Navigation**:
  - **Description**: A user-facing feature that renders the complete path log (both GPS and dead-reckoned segments) on a pre-downloaded offline map. It provides a simple directional arrow guiding the user back along their own trail.

#### 2.3. Layer 3: The Reporting & UI/UX Layer

This layer is the user-facing interface, designed for simplicity and usability under extreme stress.

- **Feature: Standard Panic Button**:

  - **Interaction**: A large, easily accessible on-screen button. Requires a "press and hold" for 3 seconds to activate, followed by a 10-second cancellable countdown to prevent false alarms.

- **Feature: Zero-Interaction Triggers**:

  - **Description**: Alternative, non-visual methods to activate an SOS.
  - **Voice Activation**: Implements a low-power, on-device "wake word" detection model (e.g., using TensorFlow Lite) to listen for a user-defined emergency phrase.
  - **Gesture Activation**: The app registers a background service that listens for a specific accelerometer pattern (e.g., three sharp, consecutive shakes on the Y-axis) to trigger the alarm.

- **Feature: Multi-Modal Feedback**:
  - **Description**: Confirms that an SOS has been successfully transmitted.
  - **Haptic Feedback**: A distinct, strong vibration pattern.
  - **Audio Feedback**: A loud, clear sound confirmation (user can disable).
  - **Visual Feedback**: The screen displays a clear "SOS SENT" message and the current communication tier being used.

### 3. Addressing Critical System Challenges & Solutions

#### 3.1. Challenge 1: Channel Congestion ("The Screaming Crowd")

- **Problem**: In a large-scale disaster, simultaneous alerts from many users via SMS or Cellular Data can overwhelm the local network infrastructure, leading to failed transmissions.
- **Solution: Delay-Tolerant Networking (DTN) Implementation**:
  - We enhance the Tier 4 Mesh with a sophisticated routing protocol based on DTN principles.
  - **Epidemic Routing**: The SOS message is treated as an infectious agent. A device carrying the message will attempt to transfer it to any peer it encounters that does not already have the message. This probabilistic approach maximizes the chances of the alert reaching a gateway device. The message payload will contain a unique message ID to prevent infinite loops.

#### 3.2. Challenge 2: Cumulative Error in Navigation ("The Wandering Path")

- **Problem**: Dead reckoning is inherently inaccurate. Over time, small errors from the accelerometer and gyroscope (sensor drift) accumulate, leading to a significant deviation between the estimated position and the true position.
- **Solution: On-Device Sensor Fusion via Kalman Filter**:
  - We will implement a **Kalman Filter** algorithm within the Navigation Layer.
  - **Process**: The algorithm uses a dynamic model to _predict_ the user's position based on accelerometer and gyroscope readings. It then uses any available (even noisy) measurement—from the magnetometer or a weak, intermittent GPS signal—to _correct_ this prediction. This continuous predict-correct cycle fuses data from multiple sources to produce a location estimate that is statistically more accurate than any single sensor, drastically mitigating cumulative error.

#### 3.3. Challenge 3: User Incapacitation ("The Panic Button" Problem)

- **Problem**: A panicked, injured, or hypothermic user may lack the fine motor skills or cognitive clarity to operate a standard app UI.
- **Solution: HCI-Informed Zero-Interaction Triggers & Automated Detection**:
  - The voice and gesture triggers are the primary mitigation.
  - **(v2.0 Feature)** **Automated Anomaly Detection**: A background ML model will be trained to recognize sensor patterns indicative of a distress event (e.g., the high-g-force signature of a fall from the accelerometer, followed by prolonged inactivity). If such an event is detected, the app can send a "Wellness Check" notification. If unanswered within a set time, it can automatically escalate to an SOS alert.

### 4. Data Models & Payloads

#### 4.1. Standard Alert Payload (JSON for Tiers 1 & 2)

```json
{
  "userID": "string_unique_tourist_id",
  "messageID": "string_uuid",
  "timestamp": "integer_unix_epoch_utc",
  "status": "enum(PANIC|TEST|OK)",
  "location": {
    "lat": "float",
    "lon": "float",
    "accuracy_m": "integer",
    "source": "enum(GPS|FUSED|DEAD_RECKONING)"
  },
  "deviceState": {
    "battery_percent": "integer",
    "connection_tier": "integer(1-4)"
  },
  "pathHistory": {
    "lastValidGPS": { "lat": "float", "lon": "float", "ts": "integer" },
    "deadReckoningPath": "string_compressed_path_data"
  }
}
```

#### 4.2. Compressed SMS Payload (String for Tier 3)

A compact, key-value string format for minimal character count.
> `SURAKSHA_SOS:id=t123;mid=abc;ts=1725327228;lat=28.70;lon=77.10;acc=15;src=FUSED;bat=45;path=300m_SE;150m_S`

### 5\. Future Scope (v2.0)

- **Proactive Wellness Checks**: The app can periodically prompt for a simple "I'm OK" tap in high-risk zones.
- **V2X Integration**: Integration with vehicle systems (e.g., park ranger jeeps, tour buses) to turn them into high-priority "data mules" in the mesh network.
- **Backend Anomaly Detection**: Server-side ML models to detect unusual deviations from planned itineraries or group travel patterns.
