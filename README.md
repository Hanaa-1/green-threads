# green-threads
#  Green Threads

**Transparent sustainability data for your favorite clothing brands.**

Green Threads is a full-stack web application that aggregates, analyzes, and visualizes environmental and labor sustainability data for fashion brands. It features an automated Python data pipeline, a C# REST API, and a React frontend with custom D3.js data visualizations.

###  Live Demo
* **Frontend:** https://green-threads-iota.vercel.app/
* **Backend API:** 

---



## Local Setup & Prerequisites

### Prerequisites
* [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js & npm](https://nodejs.org/)
* [Python 3.12+](https://www.python.org/downloads/)

### 1. Backend (C# API)
```bash
cd GreenThreadsAPI
dotnet run --urls "http://localhost:5190"
```


---


## Architecture & Tech Stack

This project utilizes a decoupled, multi-language architecture designed for resilience and scalability:

**Data Pipeline (Python):** A custom web scraper using `requests`, `BeautifulSoup`, and `Playwright` (for JavaScript-rendered sites). It utilizes a heuristic keyword-scoring engine to dynamically analyze sustainability reports.
**Database (SQLite):** Stores historical scrape data with timestamps. If a live scrape fails (e.g., due to anti-bot firewalls or 404s), the system gracefully falls back to the last known verified data, ensuring zero downtime for the user.
**Backend API (C# / ASP.NET Core 8):** A lightweight REST API that serves the data to the frontend. It also includes a real-time `/analyze-url` endpoint that scrapes and scores custom URLs on demand using `HtmlAgilityPack`.
**Frontend (React / Vite):** A responsive UI featuring a custom D3.js animated gauge chart and a "Data Transparency" section that shows users exactly how scores are calculated and where the data came from.
**CI/CD & Deployment:** Automated daily scraping via GitHub Actions, frontend hosted on Vercel, and backend containerized with Docker and hosted on Render.

---

## Key Features

**Resilient Data Pipeline:** Implements a "graceful degradation" pattern. If a target website blocks the scraper, the UI transparently displays cached historical data with a timestamped note, rather than crashing or showing fake data.
**Two-Tier Scraping:** Attempts fast, lightweight HTTP requests first. If it detects an empty JavaScript shell, it automatically upgrades to a headless Chromium browser via Playwright.
**Real-Time Custom URL Analyzer:** Users can paste any brand's sustainability page URL. The C# backend fetches, cleans, and dynamically scores the page in real-time without needing Python.
**Data Transparency:** The UI explicitly shows the source URL, the exact sustainability keywords detected (e.g., "organic", "fair trade"), and the methodology behind the score.

