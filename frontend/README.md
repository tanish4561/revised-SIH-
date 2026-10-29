# NDRF Chemical Disaster Dashboard - Frontend

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend URL
Edit .env.local if your backend is not on http://localhost:5000

### 3. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

---

## Backend API Endpoints Required

### GET /analytics/overview
Returns dashboard statistics

### GET /analytics/session/<id>
Returns session detail with zone_demarcation and victims_saved data

### GET /analytics/search?q=<query>
Search sessions by user name

### POST /analytics/generate-report/<session_id>
Trigger AI report generation

### GET /reports/<report_id>
Get AI report status and content

---

## Enable CORS in Flask Backend

```python
from flask_cors import CORS

CORS(app, resources={
    r"/analytics/*": {"origins": "http://localhost:3000"},
    r"/reports/*": {"origins": "http://localhost:3000"}
})
```

Install: pip install flask-cors

---

## API Response Examples

See lib/api/types.ts for complete TypeScript interfaces.

**Dashboard Overview Response:**
```json
{
  "avg_completion_time": 425,
  "avg_victims_rescued": 6.8,
  "mask_compliance_rate": 75.5,
  "zone_accuracy": 82.3,
  "team_readiness_score": 68,
  "team_consistency_index": 82,
  "total_sessions": 50
}
```

**Session Detail Response:**
```json
{
  "session_id": 1,
  "users": ["John Doe"],
  "num_users": 1,
  "completion_time": 450,
  "victims_saved": ["AM", "B", "CM"],
  "zone_demarcation": [
    {
      "boundary_type": "COLD_TO_WARM",
      "ppm_readings": {
        "at_cone": 0.5,
        "5m_towards_leak": 0.9,
        "5m_away_leak": 0.1
      }
    }
  ],
  "mistakes": ["delayed_rescue"],
  "created_at": "2025-12-10T12:00:00"
}
```

---

## Key Files
- lib/api/dashboard.ts - Dashboard data fetching
- lib/api/reports.ts - Session reports & search
- lib/api/types.ts - TypeScript interfaces
- .env.local - Backend URL configuration
