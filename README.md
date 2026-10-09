# Nearfield · Hyperlocal Environmental Observatory

<p align="center">
  <img src="public/logo.svg" alt="Nearfield Logo" width="120" height="120" />
</p>

<p align="center">
  <strong>Your neighbourhood, in context.</strong><br>
  Free and open-source hyperlocal air quality and groundwater monitoring for India.
</p>

<p align="center">
  <a href="https://nearfield-preview.three-parenthesis.workers.dev"><img src="https://img.shields.io/badge/Live%20Demo-Cloudflare%20Workers-0052FF?style=flat-square&logo=cloudflare" alt="Live Demo"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-41684c?style=flat-square" alt="License: MIT"></a>
  <a href="https://www.openstreetmap.org"><img src="https://img.shields.io/badge/Map-OpenStreetMap-7EBC6F?style=flat-square&logo=openstreetmap" alt="OpenStreetMap"></a>
  <a href="https://cpcb.nic.in"><img src="https://img.shields.io/badge/Air-CPCB%20NAQI-f9a825?style=flat-square" alt="CPCB NAQI"></a>
  <a href="https://cgwb.gov.in"><img src="https://img.shields.io/badge/Water-CGWB%20NWDP-2f6d7a?style=flat-square" alt="CGWB"></a>
</p>

---

## 🌐 Public Live Site

Nearfield is publicly deployed and live at:
👉 **[https://nearfield-preview.three-parenthesis.workers.dev](https://nearfield-preview.three-parenthesis.workers.dev)**

---

## 🌟 Highlights & Features

- **🗺️ OpenStreetMap Local Geo-Mapping**: High-contrast, privacy-respecting cartography using [OpenStreetMap](https://www.openstreetmap.org) and Leaflet. Accurately plots your selected Indian post office and surrounding Central Ground Water Board (CGWB) observation borewells with Haversine distance calculations in kilometers.
- **🚬 Cigarette Smoke Equivalency (Berkeley Earth Standard)**:
  - Translates fine particulate exposure ($\text{PM}_{2.5}$) into equivalent commercial cigarettes passively inhaled per day.
  - **Dynamic Health Alert**: Triggers an alert state whenever $\text{AQI} > 100$, illuminating glowing ember visualizations and exposure projections across **Today (24h)**, **7 Days**, **30 Days**, and **1 Year**.
  - Formula: $\text{Cigarettes/day} \approx \frac{\text{PM}_{2.5}\ (\mu\text{g/m}^3)}{22\ \mu\text{g/m}^3}$.
- **🌬️ National Air Quality Index (NAQI)**:
  - Official CPCB sub-index piecewise calculation algorithm.
  - Real-time parameter readings: $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$.
  - 48-hour continuous trend sparkline.
  - Automatic fallback between live CPCB feeds and Open-Meteo & ECMWF CAMS atmospheric models.
- **💧 Authentic Groundwater Chemical Profiles**:
  - Connects to official Central Ground Water Board (CGWB) lab test datasets via the National Water Data Portal (NWDP/NWIC).
  - Evaluates 27 chemical parameters including Fluoride, Arsenic, Electrical Conductivity, Total Dissolved Solids (TDS), Total Hardness, and Nitrate against **BIS IS 10500:2012** drinking water safety standards.
- **📈 5-Year Historical Lab Observations**:
  - Interactive multi-year SVG line charts tracing chemical concentration changes over time.
  - Zero synthetic smoothing—honoring genuine scientific sample dates.
- **🌓 Midnight Deep & Daylight Themes**:
  - Hand-crafted design system with Manrope and DM Sans typography, responsive layout, glassmorphic HUD accents, and seamless theme persistence.

---

## 🛠️ System Architecture

Nearfield runs on an edge-native stack:

```
                  ┌───────────────────────────────────────┐
                  │    User Browser / Frontend Client     │
                  │ (Vanilla JS + Leaflet + OpenStreetMap)│
                  └──────────────────┬────────────────────┘
                                     │
                                     ▼
                  ┌───────────────────────────────────────┐
                  │     Cloudflare Worker Edge API        │
                  │             (worker.js)               │
                  └──────┬───────────┬────────────┬───────┘
                         │           │            │
            ┌────────────┘           │            └────────────┐
            ▼                        ▼                         ▼
   Postal & OSM Geo          CPCB & Open-Meteo          CGWB / NWDP Water
  • PIN Code Directory      • Real-time NAQI           • Lab Chemical Data
  • Nominatim Geocoding     • Break-point matrix       • BIS 10500 Ratings
                            • Cigarette formula        • Distance & History
```

---

## 🚀 API Reference

All endpoints return JSON and include CORS headers:

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/lookup` | `GET` | `q` (PIN or locality name) | Resolves 6-digit PIN codes to postal offices and coordinates. |
| `/api/aqi` | `GET` | `state`, `city`, `lat`, `lon` | Returns NAQI index, pollutant concentrations, 48h trend, and cigarette metrics. |
| `/api/water` | `GET` | `state`, `district`, `lat`, `lon` | Returns nearby CGWB borewells, distance (km), chemical parameters, and BIS ratings. |
| `/api/status`| `GET` | *(none)* | Service health check and version metadata. |

---

## 💻 Local Development

Clone the repository and run with Wrangler:

```bash
# Clone the repository
git clone https://github.com/nearfield-india/nearfield.git
cd nearfield

# Start local edge development server
npx --yes wrangler dev --port 8787
```

Visit `http://localhost:8787` in your browser.

---

## ☁️ Deployment

Deploy to your own Cloudflare account:

```bash
# Deploy to Cloudflare Workers
npx --yes wrangler deploy
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free and open source for the public interest.
