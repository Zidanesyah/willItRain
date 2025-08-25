# willItRain
# Will It Rain Tomorrow? (Express + Axios)

A mini capstone project that builds a small website & API to answer a simple question: **“Will it rain tomorrow in the city I choose?”**

> **Stack**: Node.js, Express, Axios, Zod, Helmet, CORS, Morgan

---

## Table of Contents

* [Project Goals](#project-goals)
* [How It Works (Mental Model)](#how-it-works-mental-model)
* [Architecture & Folder Structure](#architecture--folder-structure)
* [Prerequisites](#prerequisites)
* [Quickstart](#quickstart)
* [Configuration](#configuration)
* [Run the App](#run-the-app)
* [API Reference](#api-reference)
* [Frontend (Static Website)](#frontend-static-website)
* [Design Decisions](#design-decisions)
* [Common Errors & Troubleshooting](#common-errors--troubleshooting)
* [Extending the Project](#extending-the-project)
* [License](#license)
* [Acknowledgements](#acknowledgements)

---

## Project Goals

1. **Backend-first thinking**: expose a clean JSON endpoint that tells if it will rain **tomorrow** for a chosen location.
2. **Modularization**: split responsibilities into `routes/`, `controllers/`, `services/`, `utils/`, `config/` — mirroring real-world projects.
3. **Use a real external API**: integrate with **OpenWeather** Geocoding + 5 Day / 3 Hour Forecast.
4. **Simple UI**: a single static HTML page that calls our API and shows a clear **YES/NO** + a few risk details.

> This project is intentionally small but production-minded (error handler, basic security middlewares, input validation with Zod).

---

## How It Works (Mental Model)

* User enters a city (e.g. `Jakarta`).
* Backend:

  1. **Geocoding**: convert city → lat/lon with OpenWeather Geocoding API.
  2. **Forecast**: fetch 5-day forecast (3-hour slots) via OpenWeather `/data/2.5/forecast`.
  3. **Timezone-aware filtering**: select **only the slots that fall on “tomorrow”** in the city’s local time.
  4. **Rule of thumb**: if any slot tomorrow has `rain["3h"] > 0` **or** `pop ≥ 0.3`, we say **will rain**.
  5. Return concise JSON summary.
* Frontend calls `GET /api/will-it-rain?q=<city>` and renders the answer.

**Analogy**: Think of the controller as a receptionist checking your form, the service as a weather researcher calling OpenWeather, and the utils as a clock expert ensuring that “tomorrow” is measured in the city’s local time, not the server’s.

---

## Architecture & Folder Structure

```
will-it-rain/
├─ src/
│  ├─ app.js                  # Bootstrap Express, middlewares, static, routes, error handler
│  ├─ server.js               # Start the HTTP server
│  ├─ config/
│  │   └─ env.js              # Load & validate env vars
│  ├─ routes/
│  │   └─ weather.route.js    # Route → controller mapping
│  ├─ controllers/
│  │   └─ weather.controller.js # Validate input, call service, format output
│  ├─ services/
│  │   └─ weather.service.js  # Integrate with OpenWeather; business logic “will it rain?”
│  ├─ utils/
│  │   ├─ http.js             # Axios client, baseURL, interceptors, error normalization
│  │   └─ date.js             # Timezone helpers; detect “tomorrow” for target location
│  ├─ middlewares/
│  │   └─ errorHandler.js     # Centralized error handler
│  └─ public/
│      └─ index.html          # Simple UI (form + result)
└─ .env                       # API keys & config (NEVER commit this)
```

**Key Separation of Concerns**

* **Route**: defines URL path & method.
* **Controller**: validates input, orchestrates the use case.
* **Service**: talks to OpenWeather & implements precipitation rules.
* **Utils**: small pure helpers (HTTP client, time calculations).
* **Config**: environment variables, app-wide constants.

---

## Prerequisites

* Node.js LTS installed (18+ recommended)
* An **OpenWeather API Key** (free tier works). Create an account and generate a key.

---

## Quickstart

```bash
# 1) Clone and enter the project
# git clone <your-repo-url>
cd will-it-rain

# 2) Install dependencies
npm install

# 3) Create your .env
cp .env.example .env   # if you have an example file, otherwise create manually
# then open .env and set OPENWEATHER_API_KEY

# 4) Run the server
npm run dev
# Server will start at http://localhost:3000

# 5) Open the website
# Visit http://localhost:5000 and try a city (e.g., Jakarta)
```

---

## Configuration

Create a `.env` file in the project root:

```
PORT=3000
OPENWEATHER_API_KEY=YOUR_KEY_HERE
OPENWEATHER_BASE_URL=https://api.openweathermap.org
```

> **Security Tip**: Do **not** commit `.env` to Git. Add it to `.gitignore`.

---

## Run the App

Dev script is defined in `package.json`:

```json
{
  "scripts": {
    "dev": "node src/server.js",
    "start": "NODE_ENV=production node src/server.js"
  }
}
```

Start the app:

```bash
npm run dev
# http://localhost:3000
```

* API base: `http://localhost:3000/api`
* Web UI: serves from `src/public/index.html` (root path `/`).

---

## API Reference

### GET `/api/will-it-rain`

**Query params**

* `q` *(required)* — city name (e.g., `Jakarta`, `Bandung`, `Singapore`).
* `units` *(optional)* — `standard` (default), `metric`, or `imperial`.
* `lang` *(optional)* — language code (e.g., `en`, `id`).

**Response 200**

```json
{
  "success": true,
  "data": {
    "location": {
      "query": "Jakarta",
      "resolved": "Jakarta, ID",
      "lat": -6.1751,
      "lon": 106.865,
      "timezoneOffsetSec": 25200
    },
    "tomorrow": {
      "willRain": true,
      "highestProbability": 0.56,
      "rainySlots": [
        { "time": 1724560800, "pop": 0.52, "volume": 2.01 },
        { "time": 1724571600, "pop": 0.31, "volume": 0 }
      ]
    }
  }
}
```

**Error Responses**

* `400 Bad Request` — Validation error (e.g., empty `q`).
* `404 Not Found` — Location not found (if geocoding returns empty).
* `429 Too Many Requests` — You might hit OpenWeather rate limits.
* `500 Internal Server Error` — Unhandled errors or upstream issues.

**Curl Examples**

```bash
# Success
curl "http://localhost:3000/api/will-it-rain?q=Jakarta&units=metric"

# Invalid input (short city name)
curl "http://localhost:3000/api/will-it-rain?q=J"
```

---

## Frontend (Static Website)

* Served from `/` (root). Open `http://localhost:3000`.
* Simple form posts to `/api/will-it-rain` and renders **YES/NO** + top 3–5 risky slots (`POP` and rain `mm`).

**Local time conversion** is done client-side by adjusting with `timezoneOffsetSec` from the API.

---

## Design Decisions

1. **OpenWeather endpoints**:

   * **Geocoding** (`/geo/1.0/direct`) to convert city → lat/lon.
   * **Forecast** (`/data/2.5/forecast`) for 3-hourly predictions up to 5 days.
2. **Rain heuristic**: return **willRain = true** if *any* tomorrow slot has:

   * rainfall volume `rain["3h"] > 0`, **or**
   * precipitation probability `pop ≥ 0.3` (tunable threshold).
3. **Timezone correctness**: we determine “tomorrow” using the **city’s timezone**, not the server’s, to avoid off-by-one-day errors.
4. **Validation**: `zod` in controller provides helpful error messages and reduces 400-series confusion.
5. **HTTP client**: centralized Axios instance with baseURL, API key params, and error normalization.

**Potential Trade-offs**

* 3-hour granularity means “light passing showers” may or may not be captured precisely.
* POP threshold (0.3) is opinionated; adjust as needed.

---

## Common Errors & Troubleshooting

* **401 Unauthorized / 403 Forbidden**: wrong or missing `OPENWEATHER_API_KEY`.
* **404 Location not found**: city name not recognized. Try a more specific query (`city, state, country`).
* **429 Too Many Requests**: rate-limited by OpenWeather (free tier). Add caching (see below) or reduce request frequency.
* **CORS issues** (if calling from a different origin): project enables `cors()` with default settings; tweak as needed.
* **Timezone surprises**: verify the city object from OpenWeather includes `timezone`. Our logic uses that offset to define “tomorrow”.

---

## Extending the Project

* **Caching**: Add a simple in-memory cache (e.g., Map with TTL 5–10 minutes) for geocoding + forecast to save quota & speed up.
* **Rate limiting**: Use `express-rate-limit` to protect the endpoint from abuse.
* **Testing**: Add Jest + Supertest; mock Axios for service-level tests.
* **TypeScript**: Migrate files to `.ts`, add types for responses and DTOs.
* **Dockerize**: Add a `Dockerfile` and `docker-compose.yml` for consistent deployments.
* **UI polish**: Show hourly charts, icons, and better error states.

---

## License

MIT — do whatever you want, just don’t remove attribution.

---

## Acknowledgements

* Weather data by **OpenWeather**.
* Built with **Express** + **Axios** and a sprinkle of **Zod**, **Helmet**, **CORS**, and **Morgan**.
