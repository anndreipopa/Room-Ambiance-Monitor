# Autonomous Smart Irrigation System

[![Hardware](https://img.shields.io/badge/Hardware-ESP32-blueviolet.svg)](https://www.espressif.com/en/products/socs/esp32)
[![Firmware](https://img.shields.io/badge/Firmware-PlatformIO-orange.svg)](https://platformio.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla_JS-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Protocol](https://img.shields.io/badge/Protocol-MQTT-lightgrey.svg)](https://mqtt.org/)

An end-to-end IoT prototype designed to bring intelligent automation to plant care. This system moves beyond simple timers, using real-time environmental data to make smart decisions. The deployed prototype successfully collects, processes, visualizes, and stores sensor data on a globally accessible web dashboard.

### **➡️ [View the Live Dashboard Here](https://ramdashboard.netlify.app/) ⬅️**

---

*<p align="center">A demo GIF/image showing the live dashboard updating will be added here soon!</p>*

## 🏛️ Architecture Overview

The project is built on a modern IoT architecture, ensuring a scalable and real-time data flow from the physical sensor to the user's screen.

1.  **Data Acquisition (Embedded):** An **ESP32** microcontroller reads temperature, humidity, and ambient light data from I²C sensors.
2.  **Secure Transmission (IoT Protocol):** The firmware sends this data as a JSON payload over a secure **MQTT (TLS)** connection to a cloud broker (HiveMQ).
3.  **Data Processing (Backend):** A **Node.js** server, subscribed to the MQTT topic, receives the data instantly.
4.  **Real-time Push & Persistence (Cloud Logic):**
    *   The backend immediately pushes the live data to all connected web clients using **WebSockets (Socket.IO)**.
    *   It also periodically saves the readings to a **PostgreSQL** database for historical analysis.
5.  **Data Visualization (Frontend):** A vanilla JavaScript dashboard listens for WebSocket events to display live data and fetches historical data from the backend's API to render interactive trend charts with **Chart.js**.

## 🌟 Key Features

-   **End-to-End Real-Time Pipeline:** A fully functioning data pipeline from a physical device to a cloud backend and a live user interface.
-   **High-Precision Sensing:** Utilizes dedicated I²C sensors for accurate temperature/humidity (**SHT2x/HTU21D**) and ambient light (**BH1750**) readings.
-   **Historical Data Analysis:** All sensor data is persisted, allowing for trend analysis and visualization through dynamic, interactive charts.
-   **Scalable Cloud Deployment:** The entire system is deployed on modern cloud platforms (Render & Netlify), demonstrating a full CI/CD workflow.

## 🛠️ Technology Stack

| Category      | Technologies                                                                   |
| ------------- | ------------------------------------------------------------------------------ |
| **Hardware**  | `ESP32 Microcontroller`, `SHT2x/HTU21D`, `BH1750` I²C Sensors                    |
| **Firmware**  | `C++`, `Arduino Framework`, `PlatformIO`                                       |
| **Backend**   | `Node.js`, `Express.js`, `Socket.IO`, `MQTT.js`                                |
| **Frontend**  | `Vanilla HTML5/CSS3`, `JavaScript (ES6+)`, `Chart.js`                          |
| **Database**  | `PostgreSQL`                                                                   |
| **Cloud & DevOps** | **Render** (Backend & DB), **Netlify** (Frontend), **Git/GitHub** (CI/CD), **HiveMQ Cloud** (MQTT Broker) |

## 📁 Project Structure

This monorepo contains the complete application stack:

-   `src/`: C++ firmware for the ESP32, managed by PlatformIO.
-   `BackendServer/`: The Node.js, Express, and Socket.IO backend server.
-   `frontend/`: All static assets for the web dashboard (HTML, CSS, JavaScript).

## 🔌 Hardware Setup & Wiring

| Component | Pin   | ESP32 Pin       | Notes                           |
| --------- | ----- | --------------- | ------------------------------- |
| **SHT2x** | `SDA` | `GPIO 21` (SDA) | Shared I²C Data Line            |
|           | `SCL` | `GPIO 22` (SCL) | Shared I²C Clock Line           |
|           | `VIN` | `3.3V`          |                                 |
|           | `GND` | `GND`           |                                 |
| **BH1750**| `SDA` | `GPIO 21` (SDA) | Shared with SHT2x               |
|           | `SCL` | `GPIO 22` (SCL) | Shared with SHT2x               |
|           | `VCC` | `3.3V`          |                                 |
|           | `GND` | `GND`           |                                 |

## 🚀 Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18 or newer)
-   [VS Code](https://code.visualstudio.com/) with the [PlatformIO IDE Extension](https://platformio.org/platformio-ide)
-   A free PostgreSQL database from [Render](https://render.com/)
-   A free account on [HiveMQ Cloud](https://www.hivemq.com/cloud/)

### 1. Clone the Repository
```bash
git clone https://github.com/annndreipopa/Room-Ambiance-Monitor.git
cd Room-Ambiance-Monitor
```

### 2. Configure and Deploy Firmware
-   In the `/src` directory, create a new file named `secrets.h`.
-   Copy the content below into `secrets.h` and fill in your credentials:
    ```cpp
    #pragma once
    // Wi-Fi Credentials
    #define WIFI_SSID "YOUR_WIFI_SSID"
    #define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

    // MQTT Broker Credentials
    #define MQTT_HOST "your-cluster-url.s1.eu.hivemq.cloud"
    #define MQTT_PORT 8883
    #define MQTT_USER "YOUR_HIVE_MQ_USERNAME"
    #define MQTT_PASSWORD "YOUR_HIVE_MQ_PASSWORD"
    #define MQTT_TOPIC "esp32/data"
    
    // HiveMQ Cloud CA Certificate
    static const char* aCACert = R"EOF(
    -----BEGIN CERTIFICATE-----
    // PASTE YOUR HIVEMQ CA CERTIFICATE HERE
    -----END CERTIFICATE-----
    )EOF";
    ```
-   Open the project in VS Code, and use the PlatformIO extension to **Build** and **Upload** the firmware to your ESP32.

### 3. Configure and Run Backend
-   Navigate to the backend directory: `cd BackendServer`.
-   Install dependencies: `npm install`.
-   Create a `.env` file in this directory.
-   Copy the content below into `.env` and fill in your credentials:
    ```env
    # MQTT Credentials
    MQTT_HOST=your-cluster-url.s1.eu.hivemq.cloud
    MQTT_PORT=8883
    MQTT_USER=YOUR_HIVE_MQ_USERNAME
    MQTT_PASSWORD=YOUR_HIVE_MQ_PASSWORD
    MQTT_TOPIC=esp32/data

    # PostgreSQL Database Connection URL
    DATABASE_URL=postgresql://user:password@host:port/database

    # Server Port
    PORT=3000
    ```
-   Start the server locally: `npm start` or `node server.js`.

### 4. View the Dashboard
-   The deployed version is ready to view at [ramdashboard.netlify.app](https://ramdashboard.netlify.app).
-   For local development, use an extension like **Live Server** in VS Code on the `index.html` file in the `/frontend` directory. Ensure the `socket` connection in `script.js` points to your local server (`http://localhost:3000`).

## 🌱 Project Roadmap

This project serves as the foundation for a fully autonomous system. The next steps are:

-   [ ] **Modernize Frontend:** Rebuild the UI with a modern framework like **React** or **Svelte** for better state management and component modularity.
-   [ ] **Integrate Control Hardware:** Add a relay module and a 12V water pump to the ESP32 circuit.
-   [ ] **Implement Control API:** Create secure backend endpoints to send watering commands to the device via MQTT.
-   [ ] **Develop Autonomous Logic:** Implement algorithms on the server to trigger irrigation cycles automatically based on historical data and real-time sensor readings (e.g., "if soil is dry AND it hasn't rained, water for 10 seconds").
-   [ ] **Add Soil Moisture Sensing:** Incorporate capacitive soil moisture sensors as the primary trigger for automation.

## 🤝 Contributing

This is a personal learning project, but suggestions and contributions are always welcome! Feel free to open an issue or submit a pull request.

## 📜 License

This project is open-source. Feel free to use the code for your own projects. Please consider giving credit if it helps you significantly.
