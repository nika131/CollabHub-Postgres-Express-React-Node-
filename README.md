# CollabHub 🚀

CollabHub is a full-stack developer collaboration platform built with a strict **TypeScript-first** approach. It bridges the gap between idea generation and team execution by enabling developers to publish technical projects, define specific engineering roles, and manage team assembly through a real-time, event-driven architecture.

## 📖 Table of Contents

- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [System Architecture & Engineering](#-system-architecture--engineering)
- [Database Schema & Integrity](#-database-schema--integrity)
- [Local Setup & Installation](#-local-setup--installation)

---

## 🎯 Core Features

### 1. Advanced Real-Time Collaboration
* **Role-Based Matching:** Project owners define specific technical needs (e.g., "DevOps," "Frontend") with explicit seat counts. The system tracks capacity in real-time.
* **Cascade Resolution Engine:** Accepting an applicant triggers a "Soft Choice" state machine. If the final seat is filled, the system can automatically bulk-reject all other pending applicants and notify them instantly via WebSockets.
* **The Secure Vault:** Integrated Discord/Slack "Vault" links that are cryptographically restricted at the database level and revealed only to accepted team members.

### 2. Intelligent Notification & Socket Layer
* **Targeted Socket Registry:** Powered by a dual-map O(1) registry (`userTOSocket` & `socketToUser`) for instant, private bi-directional communication.
* **Action-Triggered Alerts:** Applicants receive instant notifications for status changes (Accepted/Declined/Filled) the moment they occur.
* **Reliability & Cleanup:** Implemented **Graceful Shutdown** listeners (SIGINT/SIGTERM) to ensure the Node process releases Port 3000 and closes all active WebSocket heartbeats cleanly, preventing "Zombie Processes."

### 3. Hardened Auth & Navigation
* **Stateful JWT Refresh:** A secure "Silent Refresh" strategy using `httpOnly` rotation. Access tokens are short-lived (15m), while refresh tokens are securely rotated on each use.
* **Recursive Route Guarding:** Implemented `ProtectedRoute` and `PublicRoute` components. Authenticated users are automatically redirected from auth pages to the dashboard, while unauthenticated users are gated from private resources.
* **Session Verification:** The UI does not "blindly" trust LocalStorage; on every mount, the Navbar synchronizes with the `/auth/me` endpoint to ensure the session is cryptographically valid.

### 4. Global UX & Decision Gates
* **Confirmation Gates (409 Conflict):** A specialized "Confirmation-Required" flow for destructive actions. When filling a role, the UI prompts the owner to choose between manual cleanup or automated cascade rejection.
* **Optimistic UI:** Local state updates immediately upon action, providing a high-performance, zero-latency feel while the backend handles complex multi-table transactions.

---

## 💻 Tech Stack

**Frontend (Client)**
* **Framework:** React 18 + Vite + TypeScript
* **Real-Time:** Socket.io-client
* **Styling:** Tailwind CSS (Dark-mode optimized)
* **HTTP Client:** Axios (Custom interceptors for JWT injection and global 401/403 security handling)

**Backend (API)**
* **Environment:** Node.js + Express
* **Language:** TypeScript
* **Real-Time:** Socket.io (with custom O(1) Dual-Registry)
* **Database:** PostgreSQL (Supabase)
* **ORM:** Drizzle ORM (Type-safe SQL queries)
* **Validation:** Zod (Strict runtime schema enforcement)

---

## 🧠 System Architecture & Engineering

### 1. The Cascade State Machine
The system handles the "last seat" scenario using a transactional domino effect. When a role status changes to `filled`, the backend can execute a bulk update across the `applications` and `notifications` tables in a single ACID transaction, ensuring the project owner never has to manually "clean up" stale requests.

### 2. Dual-Map Socket Registry
Unlike standard implementations, CollabHub uses two synchronized Maps to track user-to-socket relationships. This ensures that even during a "dirty" disconnect, the server can identify and purge the correct user session in $O(1)$ time, keeping the memory footprint minimal.

### 3. Defensive Programming & Truth Verification
The backend utilizes strict identity checks (`=== true`) for destructive actions like mass rejections. This ensures that malformed payloads or "truthy" JavaScript values cannot accidentally trigger a cascade unless the user's intent is explicitly verified.

### 4. Resilience & Process Management
The API is built for high availability. It includes custom process listeners that intercept termination signals to manually close the HTTP server and the WebSocket server, ensuring that the development port is never held hostage by background "ghost" processes.

---

## 🗄️ Database Schema & Integrity

The PostgreSQL database is heavily normalized, leveraging Drizzle ORM's relational API to ensure strict data purity.

### 1. ACID Transactions
Critical operations, such as the **Cascade Rejection Logic**, execute inside strict `db.transaction()` blocks. If any part of the process fails (e.g., a notification fails to save), the entire operation rolls back.

### 2. Referential Integrity
Foreign keys are configured with `onDelete: 'cascade'`. This guarantees that deleting a project or user automatically scrubs all associated applications, roles, and notifications instantly.

### 3. Core Relational Mapping
1.  **`users`**: Core identity and auth.
2.  **`refresh_tokens`**: Database-backed JTI tracking for secure token rotation and breach detection.
3.  **`project_roles`**: Tracks specific project needs, seats, and capacity status.
4.  **`applications`**: The join table facilitating the relationship between talent and projects.
5.  **`notifications`**: Isolated event logging with real-time push integration.

---

## 🛠️ Local Setup & Installation

### Prerequisites
* Node.js (v18+)
* PostgreSQL (Local or Supabase)

### Installation
1.  **Clone the Repo**
    ```bash
    git clone https://github.com/nika131/collabhub.git
    cd collabhub
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    cd client && npm install
    ```
3.  **Environment Variables**
    Create a `.env` file in the root:
    ```env
    DATABASE_URL=your_postgres_url
    JWT_SECRET=your_secret
    REFRESH_SECRET=your_refresh_secret
    CLIENT_URL=http://localhost:5173
    PORT=3000
    ```
4.  **Run Migrations**
    ```bash
    npx drizzle-kit push:pg
    ```
5.  **Start Development**
    ```bash
    npm run dev
    ```
