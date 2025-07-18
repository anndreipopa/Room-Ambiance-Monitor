# IoT Smart Irrigation System Prototype

[![ESP32](https://img.shields.io/badge/Hardware-ESP32-blueviolet.svg)](https://www.espressif.com/en/products/socs/esp32)
[![PlatformIO](https://img.shields.io/badge/Firmware-PlatformIO-orange.svg)](https://platformio.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![JavaScript](https://img.shields.io/badge/Frontend-Vanilla_JS-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![MQTT](https://img.shields.io/badge/Protocol-MQTT-lightgrey.svg)](https://mqtt.org/)

An end-to-end **Smart Irrigation System** designed to automate plant care. The current deployed prototype provides the core functionality, successfully streaming, storing, and visualizing live environmental sensor data on a globally accessible web dashboard.

*Images coming soon!*

## 🌟 Core Features

-   **Full-Stack Real-Time Monitoring:** A complete, deployed data pipeline from a physical ESP32 sensor, through a secure cloud broker, to a live web dashboard.
-   **Precision Multi-Sensor System:**
    -   **Air Temperature & Humidity:** Utilizes a high-precision **HTU21D** I²C sensor.
    -   **Ambient Light Intensity:** Employs a **BH1750** digital sensor to provide accurate illuminance readings in **Lux**.
-   **Data Persistence & Visualization:** Sensor data is periodically stored in a **PostgreSQL** database and rendered in dynamic, trend-colored historical charts using **Chart.js**.
-   **Secure & Robust Communication:** Implements the MQTT protocol over a secure TLS connection and a real-time WebSocket layer for instant data delivery to the frontend.

## 🛠️ Tech Stack

### Hardware
-   **Microcontroller:** ESP32
-   **Sensors:** HTU21D (I²C), BH1750 (I²C)

### Software & Cloud
-   **Firmware:** C++ on **Arduino Framework** with **PlatformIO**.
-   **Backend:** **Node.js** with **Express.js** & **Socket.IO**.
-   **Frontend:** **Vanilla HTML5, CSS3, and JavaScript** with **Chart.js**.
-   **Database:** **PostgreSQL** (hosted on Render).
-   **Deployment:** Backend on **Render**, Frontend on **Netlify**, with CI/CD from GitHub.
-   **MQTT Broker:** **HiveMQ Cloud**.

## 📁 Project Structure

This repository is a monorepo containing all parts of the application:
-   `/src`: Contains the C++ firmware for the ESP32, managed by PlatformIO.
-   `/BackendServer`: The Node.js backend server.
-   `/frontend`: The static web dashboard files (HTML, CSS, JS).

## 🔌 Hardware Setup & Wiring

Both I2C sensors (HTU21D and BH1750) share the same I2C bus, simplifying the wiring.

| Component           | Component Pin | Connect to ESP32 Pin    | Notes                                  |
| ------------------- | ------------- | ----------------------- | -------------------------------------- |
| **HTU21D Sensor**   | `SDA`         | `GPIO 21` (SDA)         | Shared I2C Data Line                   |
|                     | `SCL`         | `GPIO 22` (SCL)         | Shared I2C Clock Line                  |
|                     | `VCC` / `VIN` | `3.3V`                  |                                        |
|                     | `GND`         | `GND`                   |                                        |
| **BH1750 Sensor**   | `SDA`         | `GPIO 21` (SDA)         | Connect to the same pin as HTU21D's SDA |
|                     | `SCL`         | `GPIO 22` (SCL)         | Connect to the same pin as HTU21D's SCL |
|                     | `VCC`         | `3.3V`                  |                                        |
|                     | `GND`         | `GND`                   |                                        |

## 🚀 Getting Started

### Prerequisites
-   [Visual Studio Code](https://code.visualstudio.com/) with the [PlatformIO IDE Extension](https://platformio.org/platformio-ide).
-   [Node.js](https://nodejs.org/) (v16 or newer).
-   A cloud-hosted PostgreSQL database (e.g., on [Render](https://render.com/)).
-   A [HiveMQ Cloud](https://www.hivemq.com/cloud/) account.

### Installation & Setup
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Setup Firmware:**
    -   Create a `secrets.h` file inside the `/src` directory with your Wi-Fi and MQTT credentials.
    -   Use the PlatformIO extension in VS Code to build and `Upload` the firmware to your ESP32.

3.  **Setup Backend:**
    -   Navigate to the `/BackendServer` directory: `cd BackendServer`.
    -   Run `npm install` to install dependencies.
    -   Create a `.env` file and fill it with your MQTT and PostgreSQL `DATABASE_URL` credentials.
    -   Start the server for local development: `node server.js`.

4.  **View the Dashboard:**
    -   For local development, use a tool like the `live-server` VS Code extension in the `/frontend` directory.
    -   Ensure your frontend's `script.js` points to your local backend (`http://localhost:3000`).
    -   The deployed version is available at [ramdashboard.netlify.app](https://ramdashboard.netlify.app).

## 🌱 Project Roadmap

This project is under active development. The roadmap is structured to build upon the current stable foundation.

-   [x] **Data Persistence:** Implement a PostgreSQL database to store historical sensor data.
-   [x] **Advanced Data Visualization:** Build a dynamic web dashboard with Chart.js to render historical data.
-   [ ] **Modernize Frontend:** Explore rebuilding the user interface using a modern framework like **React** for a more modular and scalable architecture.
-   [ ] **Integrate Soil Moisture Sensors:** Add capacitive soil moisture sensors to gather the most critical data for irrigation.
-   [ ] **Implement Control Logic:** Add a relay module and water pump, controlled via MQTT commands from the backend.
-   [ ] **Develop Automation Algorithms:** Create logic on the server to trigger watering cycles based on soil moisture, light history, and other sensor data.

## 🙏 Acknowledgements

This project is a learning journey inspired by the incredible maker community. Special thanks to the authors of the open-source libraries that make IoT development accessible and powerful.
