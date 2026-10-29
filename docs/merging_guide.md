# Merging Guide: Connecting React to Flask

This guide explains how to connect your React Frontend to the Flask Backend. It is written for developers who may be new to integrating these two technologies.

## Core Concept: The API Client
The Frontend and Backend are two separate programs. They talk to each other using **HTTP Requests** (like a browser loading a page).
-   **Frontend (React)**: Runs in the user's browser. It *asks* for data.
-   **Backend (Flask)**: Runs on the server. It *gives* data.

To make this easy, we use a library called **Axios** in React. It acts as the "messenger".

## Phase 1: Setup & Infrastructure

### 1. CORS (Cross-Origin Resource Sharing)
**The Problem**: Browsers block React (running on port 5173) from talking to Flask (running on port 5000) for security reasons.
**The Fix**: We must install `flask-cors` on the backend to allow these requests.

**Action Required (Backend)**:
1.  `pip install flask-cors`
2.  Update `app/__init__.py` to enable CORS.

### 2. The API Client (`api.js`)
**The Problem**: Writing `fetch('http://127.0.0.1:5000/auth/login')` every time is repetitive and hard to change later.
**The Fix**: We create a central file `src/api.js`.
-   It knows the **Base URL** (`http://127.0.0.1:5000`).
-   It automatically attaches the **JWT Token** to every request so we don't have to manually add it every time.

---
*This guide will be updated as we complete each phase.*

## Phase 2: Authentication

### 1. The Auth Context (`context/AuthContext.jsx`)
**The Problem**: We need to know *who* is logged in across the entire app.
**The Fix**: We use React Context. It's like a global variable that holds the `user` object.
-   **Login**: Sends username/password to Flask -> Gets Token -> Saves to `localStorage`.
-   **Logout**: Clears `localStorage`.
-   **Loading**: Waits for the app to check `localStorage` before showing the page.

### 2. Protected Routes
**The Problem**: Anyone can type `/dashboard` and see the admin panel.
**The Fix**: We create a wrapper component `<ProtectedRoute />`.
-   If `user` exists -> Show the page.
-   If `user` is null -> Redirect to `/login`.

## Phase 3: Session Management

### 1. Fetching Data (`pages/Sessions.jsx`)
-   **Hook**: `useEffect` runs once when the page loads.
-   **API Call**: `api.get('/dashboard/sessions')`.
-   **State**: Stores the list in `sessions` variable.

### 2. Sending Data (`pages/CreateSession.jsx`)
-   **Form**: Collects difficulty and player list.
-   **API Call**: `api.post('/sessions/', payload)`.
-   **Redirect**: Uses `useNavigate` to go back to the list after success.

## Phase 4: Analytics & Results

### 1. Detailed View (`pages/SessionDetails.jsx`)
-   **Routing**: Uses `useParams()` to get the session ID from the URL (`/sessions/:id`).
-   **Data**: Fetches a complex object containing:
    -   `session`: Basic info.
    -   `players`: Who is in the squad.
    -   `results`: Raw data from the game (gas levels, time).
    -   `reports`: AI-generated text analysis.
