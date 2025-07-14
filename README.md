# Room Ambiance Monitor

[![ESP32](https://img.shields.io/badge/Hardware-ESP32-blueviolet.svg)](https://www.espressif.com/en/products/socs/esp32)
[![PlatformIO](https://img.shields.io/badge/Firmware-PlatformIO-orange.svg)](https://platformio.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)
[![MQTT](https://img.shields.io/badge/Protocol-MQTT-lightgrey.svg)](https://mqtt.org/)
[![Express.js](https://img.shields.io/badge/Framework-Express.js-yellow.svg)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO-blue.svg)](https://socket.io/)

A comprehensive IoT platform built on the ESP32 microcontroller, designed to monitor key environmental conditions and display them in real-time on a web dashboard. This project serves as a foundational layer for a future full-stack smart gardening system, showcasing a modular and scalable approach to IoT development.

*(Images coming soon!)*

## 🌟 Core Features

-   **End-to-End Real-Time Monitoring:** Continuously reads, processes, and transmits data from the sensor to the browser with minimal latency.
-   **Multi-Sensor System:**
    -   **Air Temperature & Humidity:** Utilizes a high-precision HTU21D I²C sensor.
    -   **Ambient Light Intensity:** Measures ambient light levels using a Light-Dependent Resistor (LDR) module.
-   **Secure IoT Communication:** Implements the MQTT protocol over a secure TLS connection to publish sensor data to a cloud broker (HiveMQ).
-   **Node.js Backend:** A robust backend server that subscribes to MQTT topics, processes incoming data, and broadcasts it to web clients.
-   **Live Web Dashboard:** A dynamic web-based frontend using HTML, CSS, and JavaScript that visualizes real-time data via Socket.IO.

## 🛠️ Tech Stack

### Hardware
-   **Microcontroller:** ESP32 (on a 30-pin development board).
-   **Sensors:**
    -   **HTU21D:** I²C sensor for air temperature and humidity.
    -   **LDR Module:** Analog sensor for light intensity.
-   **Indicator:** A standard LED and a 220 Ohm resistor for status indication.
-   **Prototyping:** Breadboard and jumper wires.

### Software & Cloud
-   **Firmware:** **Arduino Framework** on **PlatformIO** IDE.
-   **Backend:** **Node.js** with **Express.js**, **Socket.IO**, and **MQTT.js**.
-   **Frontend:** Vanilla **HTML, CSS, and JavaScript**.
-   **MQTT Broker:** **HiveMQ Cloud**.

## 🔌 Hardware Setup & Wiring

Connecting the components to the ESP32 is straightforward. Follow the wiring diagram and pinout table below for a successful setup.


| Component          | Component Pin    | Connect to ESP32 Pin    |
| ------------------ | ---------------- | ----------------------- |
| **HTU21D Sensor**  | `SDA`            | `GPIO 21` (SDA)         |
|                    | `SCL`            | `GPIO 22` (SCL)         |
|                    | `VCC` / `VIN`    | `3.3V`                  |
|                    | `GND`            | `GND`                   |
| **LDR Sensor**     | `A0` (Analog Out)| `GPIO 34` (ADC1_CH6)    |
|                    | `VCC` / `+`      | `3.3V`                  |
|                    | `GND`            | `GND`                   |
| **Status LED**     | Anode (long leg) | `GPIO 17`               |
|                    | Cathode (short leg)| 220Ω Resistor -> `GND`|

**Key Wiring Notes:**
-   Ensure all sensors are powered by the **3.3V** pin of the ESP32, not 5V.
-   `GPIO 34` is an input-only pin, which makes it ideal for analog readings without risk of misconfiguration.

## 🚀 Getting Started

### Prerequisites
-   [Visual Studio Code](https://code.visualstudio.com/) with the [PlatformIO IDE Extension](https://platformio.org/platformio-ide).
-   [Node.js](https://nodejs.org/) (v16 or newer).
-   Git.
-   A [HiveMQ Cloud](https://www.hivemq.com/cloud/) account (the free plan is sufficient).

### Installation & Setup
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/anndreipopa/Room-Ambiance-Monitor.git
    cd Room-Ambiance-Monitor
    ```

2.  **Setup Firmware (`/firmware`):**
    -   Create a `secrets.h` file in `firmware/src/` and add your Wi-Fi and HiveMQ credentials.
    -   Open the `firmware` folder in VS Code. PlatformIO will automatically install the library dependencies.
    -   Connect your ESP32 board and click the `Upload` button in the PlatformIO toolbar.

3.  **Setup Backend (`/server`):**
    -   Navigate to the `server` directory.
    -   Create a `.env` file and fill it with your HiveMQ credentials.
    -   Install the dependencies:
        ```bash
        npm install
        ```
    -   Start the server:
        ```bash
        node server.js
        ```

4.  **View the Dashboard:**
    -   Once the server is running, open your browser and navigate to **`http://localhost:3000`**.

## 🌱 Future Development & Project Roadmap

This project is the first phase of a larger, more ambitious goal: a fully autonomous smart gardening system. The current platform serves as a robust foundation for the following planned features:

-   [ ] **Soil Moisture Sensing:** Integrate capacitive soil moisture sensors to directly monitor the plant's water needs.
-   [ ] **Data Persistence:** Implement a time-series database (e.g., **InfluxDB** or **TimescaleDB**) to store historical sensor data.
-   [ ] **Advanced Web Dashboard:**
    -   Rebuild the frontend using a modern framework like **React** or **Vue.js**.
    -   Visualize historical and real-time data using an interactive charting library like **Chart.js**.
-   [ ] **Autonomous Irrigation with Manual Override:**
    -   Implement a fully **autonomous watering system** by adding a relay module to control a water pump, triggered by low soil moisture data.
    -   Crucially, the system will include **manual override capabilities** via the web dashboard. This allows for manual watering on demand and ensures system resilience in case of sensor failure or for specific plant care needs.
-   [ ] **Alerts and Notifications:** Implement a system to send push notifications or emails for critical events, such as low soil moisture, extreme temperatures, or if the water reservoir is empty.

## 🙏 Acknowledgements

This project is a learning journey inspired by the incredible maker community. Special thanks to the authors of the open-source libraries that make IoT development accessible and powerful.
