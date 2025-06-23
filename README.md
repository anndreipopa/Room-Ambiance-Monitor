# ESP32 Room Ambiance Monitor

A comprehensive IoT-powered station built on the ESP32 microcontroller, designed to monitor key environmental conditions in a room. This project serves as the foundational hardware layer for a future full-stack smart gardening system, showcasing a modular and scalable approach to IoT development.

[image soon]

## 🌟 Core Features

- **Real-Time Ambiance Monitoring:** Continuously reads and processes data from multiple environmental sensors.
- **Dual-Sensor System:**
    - **Air Temperature & Humidity:** Utilizes a high-precision HTU21D I²C sensor.
    - **Ambient Light Intensity:** Measures ambient light levels using a Light-Dependent Resistor (LDR) module.
- **Wi-Fi Ready:** The ESP32 platform is inherently capable of Wi-Fi connectivity, laying the groundwork for IoT integration.
- **Modular Firmware:** The code is structured with clear separation of concerns, making it easy to read, debug, and extend with new features.
- **Serial Data Output:** Provides a clean, formatted output of sensor data to the serial console for real-time debugging and monitoring.

## 🛠️ Tech Stack

### Hardware
- **Microcontroller:** ESP32 (on a 30-pin development board).
- **Sensors:**
    - **HTU21D:** I²C sensor for air temperature and humidity.
    - **LDR Module:** Analog sensor for light intensity.
- **Expansion Board:** A custom breakout board to simplify sensor connections without a breadboard.

### Firmware
- **Framework:** **Arduino** on **PlatformIO** IDE in **Visual Studio Code**.
- **Language:** C++
- **Key Libraries:**
    - `Wire.h`: For I²C communication.
    - `RobTillaart/SHT2x`: A robust and reliable library for the HTU21D sensor.

## 🚀 Getting Started

### Prerequisites
- [Visual Studio Code](https://code.visualstudio.com/)
- [PlatformIO IDE Extension](https://platformio.org/platformio-ide)
- Git

### Installation & Setup
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/anndreipopa/room-monitor.git
    cd room-monitor
    ```

2.  **Open in VS Code:**
    - Open the cloned project folder in Visual Studio Code.
    - PlatformIO will automatically detect the `platformio.ini` file and install the required library dependencies.

3.  **Hardware Connections:**
    - Connect the sensors to the ESP32 expansion board as follows:
        - **HTU21D Sensor:**
            - `SDA` -> `D21`
            - `SCL` -> `D22`
            - `VCC` -> `3.3V`
            - `GND` -> `GND`
        - **LDR Light Sensor:**
            - `AO` (Analog Out) -> `D34`
            - `VCC` -> `3.3V`
            - `GND` -> `GND`

4.  **Compile and Upload:**
    - Connect the ESP32 board to your computer via USB.
    - Use the `Upload` button (right-arrow icon) in the PlatformIO toolbar at the bottom of VS Code to build and flash the firmware.

5.  **Monitor:**
    - After a successful upload, click the `Serial Monitor` button (plug icon) to view the live sensor data streamed to your console.

## 🌱 Future Development & Project Roadmap

This project is the first phase of a larger, more ambitious goal: a fully autonomous smart gardening system. The current hardware and firmware serve as a robust foundation for the following planned features:

- [ ] **Full IoT Integration (MQTT):** Implement MQTT protocol on the ESP32 to publish sensor data to a cloud or local broker, making the device truly "smart".
- [ ] **Custom Backend Server:** Develop a **Node.js** backend to subscribe to MQTT topics, process incoming data, and store it in a time-series database (e.g., **MongoDB** or **TimescaleDB**).
- [ ] **Custom Web Dashboard:** Build a dynamic web-based frontend using **HTML, CSS, and JavaScript** (potentially with **React** or **Vue.js**) that visualizes historical and real-time data using a library like **Chart.js**.
- [ ] **Soil Moisture Sensing:** Integrate capacitive soil moisture sensors to directly monitor the plant's water needs.
- [ ] **Autonomous Irrigation with Manual Override:**
    - Implement a fully **autonomous watering system** by adding a relay module to control a water pump, triggered by low soil moisture data.
    - Crucially, the system will include **manual override capabilities** via the web dashboard. This allows for manual watering on demand and ensures system resilience in case of sensor failure or for specific plant care needs.
- [ ] **Alerts and Notifications:** Implement a system to send push notifications or emails for critical events, such as low soil moisture, extreme temperatures, or if the water reservoir is empty.

## 🙏 Acknowledgements

This project is a learning journey inspired by the incredible maker community. Special thanks to the authors of the open-source libraries that make IoT development accessible and powerful.