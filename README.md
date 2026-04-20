# 📸 CaptureStamp

Webcam capture app with live timestamp and geolocation. Captures photos with a clean bottom-right overlay showing UTC time, GPS coordinates, and reverse-geocoded address.

**[Open the app →](https://asus-won-adware-shares.trycloudflare.com/capturestamp.html)**

> Currently deployed via Cloudflare Tunnel (trycloudflare) — temporary URL. See [Deployment](#deployment) for permanent hosting options.

---

## Features

- 📷 **Webcam capture** — uses rear-facing camera on mobile, webcam on desktop
- 🕒 **Live UTC timestamp** — updates in real-time, burned into the captured image
- 📍 **GPS + reverse geocoding** — coordinates resolved to street address via OpenStreetMap Nominatim
- ✏️ **Clean overlay** — bottom-right, white text with thin black stroke border (no background box)
- 📥 **Dual download** — PNG image + JSON metadata file on every capture
- 📱 **PWA installable** — add to home screen on iOS/Android/Desktop
- 🌐 **Works offline** — app shell cached via service worker

---

## Files

```
/
├── capturestamp.html   # Main app (single self-contained HTML)
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline caching)
└── README.md
```

---

## Deployment

### Option A — Cloudflare Tunnel (current, temporary)

```bash
# Start a local server
python3 -m http.server 8080

# In another terminal, start cloudflared
cloudflared tunnel --url http://localhost:8080
```

### Option B — Static hosting (Netlify, Vercel, GitHub Pages, Cloudflare Pages)

1. Push this repo to GitHub
2. Connect to Netlify/Vercel/Cloudflare Pages — point at `/`
3. Done — zero config, free hosting forever

### Option C — Cloudflare Named Tunnel (persistent URL)

```bash
cloudflared tunnel create capturestamp
cloudflared tunnel route dns capturestamp yourdomain.com
cloudflared tunnel run capturestamp
```

---

## Development

No build step needed — open `capturestamp.html` directly in a browser.

For local HTTPS testing (required for camera on some browsers):
```bash
mkcert localhost
# then serve over https
```

---

## Tech

- Vanilla JS (no framework, no dependencies)
- HTML5 Canvas API — webcam capture + overlay rendering
- Service Worker + Cache API — offline PWA
- Nominatim API — reverse geocoding (rate-limited, ~1 req/sec)
- Cloudflare Tunnel — temporary public URL
