# Nearfield Website Source

Nearfield connects Indian neighbourhoods with authentic, localized air quality and groundwater monitoring data—with the real station, sample context, coordinates, and observation dates attached.

## Overview

- **`public/index.html`** — Interactive web application featuring:
  - Direct PIN code and locality search.
  - Interactive Leaflet map with CartoDB Voyager tiles showing the selected post office and nearby CGWB borewells.
  - Real-time Air Quality panel with official Indian NAQI score, pollutant grid (PM₂.₅, PM₁₀, NO₂, SO₂, CO, O₃), and 48-hour trend sparkline.
  - Groundwater Chemistry cards with calculated distance in kilometers and BIS IS 10500:2012 safety rating badges.
  - Interactive Multi-Year Trend chart plotting verified historical sampling data.
- **`worker.js`** — Cloudflare Worker API backend:
  - `/api/lookup` — Unified postal lookup and geographic geocoding.
  - `/api/aqi` — Official CPCB feed with automated, high-precision Open-Meteo & CAMS model fallback, calculating Indian NAQI via official CPCB breakpoints.
  - `/api/water` — Central Ground Water Board (CGWB) chemical sample records via NWIC/NWDP with smart district alias matching, distance calculations, and multi-year timelines.
  - `/api/status` — Health check and active routes.
- **`wrangler.jsonc`** — Cloudflare Worker configuration with static assets binding.

## Running Locally

To launch the local development server:

```sh
npx --yes wrangler dev --port 8787
```

Then open `http://localhost:8787` in your browser.

## Deploying to Cloudflare

1. (Optional) Configure CPCB data.gov.in API key:
   ```sh
   npx --yes wrangler secret put DATA_GOV_API_KEY
   ```
   *Note: If no key is set or the upstream government feed is unavailable, Nearfield automatically provides live Open-Meteo calibrated air quality metrics.*

2. Deploy:
   ```sh
   npx --yes wrangler deploy
   ```
