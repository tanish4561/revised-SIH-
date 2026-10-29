# Technical Explanation: Flask Backend

This document explains the technical details of the backend implementation. It is intended to help you understand the code and make future modifications.

## Phase 1: Foundation & Database Design

### 1. Project Structure
We have organized the project into a modular structure to keep things clean as the application grows.

- **`app.py`**: The entry point of the application. It initializes the Flask app, configures the database, and registers blueprints (routes).
- **`models.py`**: Contains the database schema defined using SQLAlchemy classes.
- **`config.py`**: Stores configuration variables like the database URI and secret keys.
- **`requirements.txt`**: Lists all the Python dependencies required to run the project.

### 2. Database Models (`models.py`)
We use **SQLAlchemy** as our ORM (Object-Relational Mapper). This allows us to interact with the database using Python classes instead of writing raw SQL.

#### `User` Model
Represents a registered user (Admin or Player).
- `id`: Unique identifier.
- `username`: Unique name for login.
- `password_hash`: Securely stored password (never plain text).
- `role`: Distinguishes between 'admin' and 'player'.

#### `Session` Model
Represents a game session (a lobby).
- `id`: Unique identifier.
- `created_by`: ID of the admin who created it.
- `status`: Current state (CREATED, STARTED, COMPLETED).
- `config`: JSON field to store game settings (e.g., difficulty, max players).

#### `SessionPlayer` Model
Links a `User` to a `Session`.
- `game_role`: The specific role the player has in *this* session (e.g., 'Rescuer', 'ChemicalExpert').
- `status`: Tracks if the player has accepted the invite (`PENDING` vs `JOINED`).

#### `GameResult` Model
Stores the final metrics after a game session ends.
- `metrics`: JSON field to store flexible data (e.g., time taken, people saved). Using JSON allows us to change game metrics without changing the database schema.

#### `PerformanceReport` Model
Stores AI-generated performance reviews.
- `user_id`: The user being reviewed.
- `session_id`: The session this report is based on.
- `report_content`: The text content of the AI report.

### 3. Configuration (`config.py`)
We separate configuration from code.
- `SQLALCHEMY_DATABASE_URI`: Tells Flask where to find the database file (`site.db`).
- `SECRET_KEY`: Used for security (e.g., signing session cookies).

---
---
## Phase 2: Authentication & User Management

### 1. Authentication (`routes/auth.py`)
We use **JWT (JSON Web Tokens)** for stateless authentication. This is a standard industry practice for securing APIs.

#### How it works:
1.  **Registration (`/register`)**:
    - User submits `username` and `password`.
    - Server generates a **Salt** (random data) and combines it with the password.
    - It hashes this combination using **Bcrypt** (a slow hashing algorithm designed to resist brute-force attacks).
    - The resulting `password_hash` is stored in the database. *We never store the actual password.*

2.  **Login (`/login`)**:
    - User submits credentials.
    - Server finds the user and uses Bcrypt to check if the submitted password matches the stored hash.
    - If valid, the server creates a **JWT**.
    - **JWT Structure**:
        - **Header**: Algorithm used (HS256).
        - **Payload**: User data (`user_id`, `role`) and Expiration (`exp`).
        - **Signature**: The Header and Payload are signed using the server's `SECRET_KEY`.
    - The token is returned to the client.

3.  **Protected Requests**:
    - The client must send the token in the `Authorization` header: `Bearer <token>`.
    - The server verifies the signature using its `SECRET_KEY`. If valid, it trusts the `user_id` inside.
    - This means the server doesn't need to query the database to check if a user is "logged in" for every request, making it very fast and scalable.

### 2. Blueprint Registration
We use Flask Blueprints to organize routes. The `auth_bp` is registered in `app.py` with the prefix `/auth`.
- `/auth/register`
- `/auth/login`

- `/auth/login`

## Phase 3: Session Management

### 1. Session Logic (`routes/sessions.py`)
Handles the lifecycle of a game session.
- **Create Session**: Admin creates a session AND assigns players/roles immediately.
- **Pending Sessions**: Players poll `/sessions/pending` to see if they have been invited.
- **Join Session**: Players accept the invite, updating their status to `JOINED`.
- **Start Session**: Admin starts the game.

### 2. Endpoints
- `POST /sessions/`: Create a new session with assigned players.
- `GET /sessions/pending`: Get list of sessions user is invited to.
- `POST /sessions/<id>/join`: Accept invite.
- `POST /sessions/<id>/start`: Start the session.

- `POST /sessions/<id>/start`: Start the session.

## Phase 4: Game Integration

### 1. Game Logic (`routes/game.py`)
Handles data coming from the game client.
- **Submit Metrics**: Receives JSON data from the game after a session ends.
- **Validation**: Ensures the user was actually part of the session they are submitting data for.

### 2. Endpoints
- `POST /game/submit`: Submit game metrics.

- `POST /game/submit`: Submit game metrics.

## Phase 5: Dashboard Integration

### 1. Data Access (`routes/dashboard.py`)
Provides read-only access to game data for the frontend dashboard.
- **Session History**: Lists all sessions.
- **Session Details**: Aggregates everything about a session:
    - Basic Info (Status, Config)
    - Players (Who played, what role)
    - Results (Metrics submitted by game)
    - Reports (AI Performance reviews)

### 2. Endpoints
- `GET /dashboard/sessions`: List all sessions.
- `GET /dashboard/sessions/<id>`: Get full report for a session.

*This document will be updated as we progress through the phases.*
