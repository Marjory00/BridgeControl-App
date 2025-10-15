
# 🌉 BridgeControl-App: Multi-Modal Traffic & Incident Dashboard

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Marjory00/BridgeControl-App?style=social)](https://github.com/Marjory00/BridgeControl-App)

## ✍️ Author & Portfolio Notice

This project, **BridgeControl-App**, was solely **created, designed, and developed by Marjory D. Marquez** as a technical demonstration for a professional portfolio.

* **Author:** Marjory D. Marquez
* **GitHub:** [@Marjory00](https://github.com/Marjory00)
* **Date:** October 2025 (Based on project context)

---

## 🎯 Project Overview

BridgeControl-App is a **simulated, single-page application (SPA)** designed to serve as a high-stakes, real-time control center for managing multi-modal traffic flow across critical urban infrastructure, specifically demonstrated using the Brooklyn Bridge.

Its core function is to fuse disparate data streams—vehicular volume, traffic speed, transit status (subway/ferry), and environmental metrics (CO₂) into one cohesive dashboard. This design empowers traffic managers to move from **reactive incident response** to **proactive, data-driven decision-making**, ultimately minimizing congestion, improving public safety, and optimizing resource allocation. The app features a fully **responsive layout** and dynamic D3.js visualizations that adapt to both desktop and mobile environments.


---

## 💡 Case Study: Congestion on the Brooklyn Bridge

### Why was this app designed?

Urban infrastructure, particularly iconic crossings like the Brooklyn Bridge, faces immense pressure from vehicle, pedestrian, and cyclist traffic. Current management systems often rely on siloed data (e.g., separate systems for traffic cameras, subway signals, and air quality). **BridgeControl-App** was designed to demonstrate a **unified, real-time, multi-modal control dashboard** that integrates diverse data streams—traffic flow, transit status, environmental impact, and predictive analytics—into a single, actionable interface.

### The Need for BridgeControl-App

The primary need is to transition from *reactive* incident response to *proactive* traffic management.

| Present Issues (Reactive) | Solutions Provided by BridgeControl-App (Proactive) |
| :--- | :--- |
| **Gridlock Incidents:** Accidents or disabled vehicles cause severe, long-lasting congestion because they are identified and addressed too slowly. | **Real-Time Map & Alerts:** Provides immediate, color-coded visual feedback and critical alerts (`STAND STILL TRAFFIC ALERT!`) to dispatch teams faster. |
| **Inefficient Lane Reversal:** Managers rely on historical time slots to reverse lanes, often missing current, dynamic demand. | **Predictive Forecast:** Uses simulated data (`2-Hour Traffic Forecast`) to project future congestion trends, enabling managers to execute **proactive lane configuration changes** (via the Control Manager panel). |
| **Siloed Data:** Environmental, transit, and traffic data are viewed in separate screens, making holistic management impossible. | **Unified Dashboard:** Integrates all key metrics (Traffic Speed, AQI, CO₂ Score, Subway/Ferry Status) in a single view, allowing management to suggest **transit alternatives** to commuters during peak congestion. |
| **Lack of Mobile Access:** Critical controls are often confined to desktop control rooms. | **Fully Responsive Design:** Ensures traffic managers can access all data, charts, and controls securely from a **mobile device** or tablet while on-site or in transit. |

---

## 💻 Technical Details

### Technologies Used in this Project

This project leverages modern frontend technologies to create a high-performance, data-driven visualization platform.

* **HTML5 / CSS3:** Provides the structure and responsive styling.
* **D3.js (Data-Driven Documents):** Core technology for creating the complex, interactive visualizations, including the **Vehicle Volume Chart** (Area/Line) and the **Animated Congestion Map** (SVG/Rects).
* **JavaScript (ES6+):** Handles all application logic, including data simulation, time-based updates, alert generation, and user interaction.
* **Flexbox/Grid (CSS):** Ensures the dashboard layout is fully **responsive** and scales gracefully across desktops, tablets, and mobile devices.
* **Font Awesome:** Used for all professional, recognizable icons.

### Scalability Assessment

**The project is designed to be highly scalable.**

1.  **Data Source:** The current version uses static mock data (`mockTrafficData` in `script.js`). In a production environment, this data structure is easily replaced by calls to a **RESTful API endpoint** (`fetch(API_URL)`).
2.  **Visualization:** D3.js is exceptionally efficient for redrawing charts and SVG maps with large datasets, ensuring performance scales with the volume of traffic data.
3.  **Architecture:** The core logic is entirely client-side (frontend), separating presentation logic from backend data processing. This is ideal for dashboards where the backend focuses solely on providing optimized, aggregated data streams.

### Project Design and Planning Research

The concept of a unified, predictive, and multi-modal traffic control dashboard is a leading trend in smart city development. It addresses real-world problems by improving public safety, reducing commuter stress, and providing better data to public officials for making informed, multi-million dollar infrastructure and resource allocation decisions. It serves as a strong technical demonstration of integrating **data visualization, responsiveness, and complex application state management** in a frontend context.

---

## 📁 File Structure

The project is structured with a clear separation of concerns, utilizing the main folder `WorkPay` as the root for Git version control.

/WorkPay ├── BridgeControl-App/ │ ├── index.html // Main application structure │ ├── style.css // All application styling, including responsiveness │ └── script.js // All JavaScript logic, D3.js functions, and data simulation ├── .gitignore ├── README.md └── LICENSE

---

## 🚀 Getting Started

To view and interact with this dashboard:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/Marjory00/BridgeControl-App.git](https://github.com/Marjory00/BridgeControl-App.git)
    cd BridgeControl-App
    ```
2.  **Open in Browser:** Open the `index.html` file directly in any modern web browser (Chrome, Firefox, Edge, Safari).
3.  **Explore the Simulation:** The dashboard will automatically begin a 24-hour traffic simulation, cycling through peak rush hours and incidents every 2 seconds. Resize your browser window to test the mobile responsiveness.

