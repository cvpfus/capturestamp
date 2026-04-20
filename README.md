# CaptureStamp

A privacy-first webcam capture PWA that stamps every photo with a timestamp and street address — no cloud, no account, no tracking.

**Live:** [cvpfus.github.io/capturestamp](https://cvpfus.github.io/capturestamp/)

---

## Features

- **Live webcam preview** — full-screen film-frame viewport
- **One-tap capture** — freezes frame with overlay baked in
- **Timestamp** — DD Month YYYY HH:MM:SS format (e.g. *20 April 2026 14:32:07*)
- **GPS + reverse geocoding** — fetches current coordinates, resolves to street address (city, region, country)
- **Address overlay** — stacked below the timestamp in monospace type
- **Location toggle** — include or exclude location data per shot
- **PWA installable** — works offline, add to home screen
- **Download** — captured image saves directly to your device

---

## Privacy

All processing happens on-device. GPS coordinates are never transmitted to any server — only the reverse geocoded street address (fetched from a public Nominatim instance) is displayed. No analytics, no accounts, no data collection.

---

## Tech

- Pure HTML/CSS/JS — no build step, no framework
- Service Worker with cache-first strategy
- `getUserMedia` API for webcam
- `Geolocation API` + Nominatim reverse geocoding
- Canvas API for overlay compositing
