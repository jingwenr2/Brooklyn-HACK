# Mogul Blocks

**Mogul Blocks** is a single-player, isometric real estate tycoon web game. Designed with a warm pixel-art aesthetic and built for speed, players compete against an AI Rival ("The Flipper") to buy, develop, and flip properties across a 10-property staggered diamond grid. 

The game emphasizes cash flow management, tension (via a 20-turn limit), and interactive pop-culture finance mechanics driven by GPT-4o-mini.

## Tech Stack
* **Frontend:** React + Vite + TypeScript (Zustand for state management)
* **Backend:** FastAPI (Python) + SQLite + SQLAlchemy
* **Style:** Corporate Dystopia / Warm Isometric Pixel Art

---

## 🚀 Quick Start Guide

To run Mogul Blocks locally, you'll need two terminal windows open—one for the backend API and one for the frontend UI.

### 1. Launch the Backend (FastAPI)

Ensure you have Python 3.9+ installed. From the root directory:

```bash
# Optional: Create and activate a virtual environment
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Mac/Linux: source .venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt

# Start the FastAPI server
uvicorn backend.main:app --reload
```
*The backend API will be running at `http://localhost:8000`. You can view the auto-generated API docs at `http://localhost:8000/docs`.*

### 2. Launch the Frontend (Vite)

Ensure you have Node.js (v18+) installed. From the root directory, open a new terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend UI will be running at `https://mogul-blocks-game.onrender.com/`. Open this URL in your browser to play the game!*

---

## 📁 Repository Structure

* **`/frontend`**: React web app. Contains the property grid map, UI panels, and interactive components.
* **`/backend`**: FastAPI server. Contains the core Game Engine rules, SQLite data models, and the AI/Trivia generation handlers.
* **`/sprites`**: Original SVG UI assets and isometric building models used by the frontend.
* **`architecture.md` / `plan.md` / `ui_design.md`**: Core system, design, and layout documentation.
