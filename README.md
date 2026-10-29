# NDRF VR Training Backend (Alpha Skunk)

This is the backend system for the NDRF Virtual Reality Chemical Disaster Response Training Simulator. It provides API endpoints for the VR application, handles user authentication, tracks training session data, and generates comprehensive AI-powered performance reports.

## 🚀 Key Features

*   **VR Data Integration**: Receives real-time telemetry from VR training sessions (gas types, zone demarcation, triage decisions, etc.).
*   **AI-Powered Reporting**: Utilizes **Groq (Llama 3.3 70B)** to generate personalized, context-aware training feedback and actionable "Next Steps".
*   **PDF Report Generation**: Creates professional, detailed PDF reports with visualizations using `ReportLab` and `Matplotlib`.
*   **Analytics Dashboard**: backend support for visualization of trainee performance trends over time.
*   **User & Session Management**: Secure authentication (JWT) and persistent tracking of trainee progress.

## 🛠️ Tech Stack

*   **Framework**: Flask (Python)
*   **Database**: SQLite (SQLAlchemy ORM)
*   **AI/LLM**: Groq API (Llama-3.3-70b-versatile)
*   **PDF Generation**: ReportLab, LaTeX-style formatting
*   **Authentication**: PyJWT, Flask-Bcrypt
*   **Data Processing**: NumPy, Pandas (implied by analytics)

## 📋 Prerequisites

*   Python 3.10+
*   A valid **Groq API Key**.
*   Windows OS (for PowerShell scripts provided)

## 🔧 Installation & Setup

1.  **Clone the repository** (if not already done).

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root directory or rename `.env.example` if available. You **MUST** set your Groq API key:
    ```env
    GROQ_API_KEY=gsk_your_actual_api_key_here
    SECRET_KEY=your_flask_secret_key
    ```
    *Alternatively, on Windows, you can run:*
    ```powershell
    .\set_groq_key.ps1
    ```

4.  **Database Migration**:
    Initialize the database (if running for the first time):
    ```bash
    flask db upgrade
    ```
    *Or run the migration scripts provided in the root folder.*

## 🏃‍♂️ Running the Server

### Standard Launch
```bash
python run.py
```
The server will start at `http://localhost:5000`.

### With Groq Configuration (Windows)
```powershell
.\restart_with_groq.ps1
```

## 🧠 AI Integration (Groq Migration)

This project has been migrated from Google Gemini to **Groq**. 
*   **Model**: `llama-3.3-70b-versatile`
*   **Performance**: faster inference and comparable/better reasoning for training analysis.
*   **Reference**: See `GROQ_MIGRATION_GUIDE.md` for detailed migration info.

## 📂 Project Structure

*   `app/`: Core application logic.
    *   `routes/`: API endpoints (`auth`, `game`, `reports`, `analytics`).
    *   `services/`: Business logic (`ai_report_generator.py`).
    *   `models.py`: Database schema.
*   `frontend/`: Frontend assets (if applicable).
*   `instance/`: SQLite database file (`site.db`).
*   `tests/`: Unit tests.

## 📝 API Endpoints Overview

*   **Auth**: `/api/auth/login`, `/api/auth/register`
*   **Game**: `/api/game/submit` (Submit VR session data)
*   **Reports**: `/api/reports/generate/<session_id>` (Get PDF report)
*   **Analytics**: `/api/analytics/user/<user_id>`

## ⚠️ Troubleshooting

*   **"Groq API Key not found"**: Ensure you have set `GROQ_API_KEY` in your `.env` file or environment variables. Restart the server after setting it.
*   **Git Pull Errors**: If you encounter issues with `instance/site.db`, run `.\fix_git_pull.ps1` to stash changes and pull safely.

---

## Prototype Disclaimer

This project is currently in prototype/demo mode for SIH dashboard workflows.

*   Some analytics and dashboard values are currently AI-generated mock/sample data because the live VR APIs are offline/unavailable at this stage.
*   Authentication/login credentials were intentionally removed in the current prototype build to simplify testing and demonstrations.
*   Security and production-hardening steps (full auth restoration, strict role enforcement, and live VR data integration) are pending for production release.
