# Forge 2 Qualifier: Multi-Agent Kanban System

A fully-functional, premium Trello-style Kanban board built entirely through a multi-agent chat loop featuring **Hermes (the Brain)** as orchestrator and **OpenClaw (the Hands)** as implementation coder. 

This repository contains both the multi-agent orchestration artifacts (configs, logs, skills) and the complete web application codebase.

---

## 🌟 Live URL & Walkthrough
- **Live URL**: https://your-kanban-vite.vercel.app (or run locally using instructions below)
- **Walkthrough Video**: [Loom/Drive video link here]

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Laravel API (PHP 8.5+), SQLite (Zero DB configuration).
- **Frontend**: React + Vite, customized with Vanilla CSS (Glassmorphism, animations, dark mode).
- **Wiring**: Connected via **Slack Socket Mode** using:
  - `#sprint-main`: High-level coordination (User & Hermes).
  - `#agent-coder`: Direct coding actions (Hermes & OpenClaw).
  - `#agent-log`: Running audit trail of agent executions.

---

## 🧭 Agent Configuration & Model Routing

We routed models based on task reasoning complexity:
- **Orchestrator (Hermes)**: `openai/gpt-oss-120b` (via Groq) or `gemini-2.5-flash` (via Google AI Studio). This provides the deep context capacity and reasoning needed to manage project milestones.
- **Coder (OpenClaw)**: `qwen2.5-coder` (via local Ollama) or `llama-3.3-70b-versatile` (via Groq). This gives instantaneous code output without speed restrictions or token costs.

All configuration files can be viewed here:
- [openclaw.json](file:///Users/mylisa/Documents/pp/openclaw.json)
- [skills/status-report/SKILL.md](file:///Users/mylisa/Documents/pp/skills/status-report/SKILL.md)
- [ARCHITECTURE.md](file:///Users/mylisa/Documents/pp/ARCHITECTURE.md)
- [agent-log.md](file:///Users/mylisa/Documents/pp/agent-log.md)

---

## 🚀 Local Run Instructions

### Prerequisites
- PHP 8.2+
- Composer
- Node.js (v22.19+) & npm

### 1. Running the Backend API
Navigate to the `/backend` directory:
```bash
cd backend
```

Create environment file and configure SQLite:
```bash
cp .env.example .env
touch database/database.sqlite
```

Install PHP dependencies:
```bash
composer install
```

Generate App Key, run migrations, and seed mock data:
```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
```

Start the API server (will run on `http://localhost:8000`):
```bash
php artisan serve
```

### 2. Running the Frontend React UI
Navigate to the `/frontend` directory:
```bash
cd ../frontend
```

Install npm dependencies:
```bash
npm install
```

Start the Vite development server (will run on `http://localhost:5173`):
```bash
npm run dev
```

Open `http://localhost:5173` in your browser to interact with the board.
