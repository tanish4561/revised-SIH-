# Implementation Plan - Flask Backend for Game Mechanics

## Goal Description
Create a robust Flask backend to manage game sessions, player roles, and game metrics for a simulation game involving Rescuers and Chemical Experts. The backend will serve as the central hub connecting the Admin Dashboard, the Game Client, and the Database.

## User Review Required
> [!IMPORTANT]
> **Database Choice**: We will use **SQLite** for development (easy to set up, single file) but design it using **SQLAlchemy** ORM so it can be easily switched to **PostgreSQL** for production if needed.

> [!NOTE]
> **Authentication**: We will use **JWT (JSON Web Tokens)**. This is a standard for modern single-page apps (like React) and mobile/game clients because it is stateless (server doesn't need to store session info in memory).

## Proposed Changes

### Phase 1: Foundation & Database Design
**Goal**: Set up the project structure and define how data is stored.
**Educational Context**: 
- **Flask**: A micro-framework for Python. It's lightweight and flexible.
- **ORM (Object Relational Mapper)**: We use SQLAlchemy. Instead of writing raw SQL queries (like `SELECT * FROM users`), we work with Python classes (`User.query.all()`). This prevents SQL injection attacks and makes code cleaner.
- **Relationships**:
    - A `Session` has many `SessionPlayers` (One-to-Many).
    - A `SessionPlayer` links a `User` to a `Session` with a specific `Role`.

#### [NEW] [models.py](file:///c:/Users/Ishtpreet/Desktop/SIH%20Code/Backend%20Alpha/models.py)
- `User`: id, username, password_hash, role (admin/user)
- `Session`: id, created_by (admin_id), status (active/completed), config (json)
- `SessionPlayer`: id, session_id, user_id, game_role (Rescuer/ChemicalExpert)
- `GameResult`: id, session_id, user_id, metrics (json)
- `PerformanceReport`: id, user_id, session_id, report_content (text), created_at

### Phase 2: Authentication & User Management
**Goal**: Secure the API so only authorized users/admins can access it.
**Educational Context**:
- **Hashing**: We never store passwords as plain text. We use `bcrypt` to hash them. If the DB is hacked, passwords remain safe.
- **JWT**: When a user logs in, they get a "Token". They send this token in the header of every subsequent request. The server verifies the signature of the token to know who they are.

#### [NEW] [auth.py](file:///c:/Users/Ishtpreet/Desktop/SIH%20Code/Backend%20Alpha/routes/auth.py)
- `POST /register`: Create new account.
- `POST /login`: Returns JWT token.

### Phase 3: Session Management (The "Lobby")
**Goal**: Allow admins to set up the game environment.
**Educational Context**:
- **State Management**: A session goes through states: `CREATED` -> `STARTED` -> `COMPLETED`. The backend must enforce valid transitions (e.g., can't finish a session that hasn't started).

#### [NEW] [sessions.py](file:///c:/Users/Ishtpreet/Desktop/SIH%20Code/Backend%20Alpha/routes/sessions.py)
- `POST /sessions`: Admin creates a session, specifying # of players and roles.
- `POST /sessions/<id>/join`: Players (or Admin assigning them) join the session.
- `POST /sessions/<id>/start`: Locks the session and generates a "Game ID" or "Invite Code".

### Phase 4: Game Integration API
**Goal**: Receive data from the game client.
**Educational Context**:
- **API Contract**: The Game and Backend must agree on the JSON structure. If the game sends `time_taken` but backend expects `duration`, it fails.
- **Validation**: We verify the data before saving. e.g., `score` cannot be negative.

#### [NEW] [game.py](file:///c:/Users/Ishtpreet/Desktop/SIH%20Code/Backend%20Alpha/routes/game.py)
- `POST /game/submit`: Receives JSON payload with metrics.
    - Example Payload:
      ```json
      {
        "session_id": 123,
        "user_id": 45,
        "role": "Rescuer",
        "metrics": {
          "rescued": 5,
          "decontaminated": 3,
          "time_taken_seconds": 300
        }
      }
      ```

### Phase 5: Dashboard Integration
**Goal**: Visualize the data.
**Educational Context**:
- **RESTful API**: We provide endpoints that return JSON data. The React frontend consumes this data to render charts/tables. The backend doesn't care about HTML/CSS here, just data.

#### [NEW] [dashboard.py](file:///c:/Users/Ishtpreet/Desktop/SIH%20Code/Backend%20Alpha/routes/dashboard.py)
- `GET /dashboard/sessions`: List all past sessions.
- `GET /dashboard/sessions/<id>`: Get detailed metrics for a specific session.

## Verification Plan

### Automated Tests
- **Unit Tests**: Test individual functions (e.g., "Does calculating score work?").
- **Integration Tests**: Test API endpoints (e.g., "Can I register, login, and then create a session?").

### Manual Verification
- **Postman/cURL**: We will manually send HTTP requests to our API to verify it responds correctly before connecting the frontend.
- **React Dashboard**: We will build a minimal React app to fetch and display the data to prove the end-to-end flow works.
