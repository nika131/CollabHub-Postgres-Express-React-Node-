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
* **Dynamic Status Synchronization:** Role capacities and UI styling update dynamically across the client as seats are filled, preventing over-booking and stale views.

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

### 5. Intelligent Discovery & Profiles
* **Full-Text Relevancy Search:** Advanced search capabilities that rank projects based on keyword density and exact matches across titles, descriptions, and tech stacks using PostgreSQL GIN indexes.
* **"For You" Array Intersection:** A recommended project feed that cross-references a user's defined profile interests against project tech stacks using native database array math.
* **Dynamic Cloud Profiles:** Full image upload pipeline for interactive profile avatars securely hosted in the cloud, with profile data guarded by strict Zod schema validation.

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
* **Media:** Cloud-based image upload integration

---

## 🧠 System Architecture & Engineering

### 1. The Cascade State Machine
The system handles the "last seat" scenario using a transactional domino effect. When a role status changes to `filled`, the backend can execute a bulk update across the `applications` and `notifications` tables in a single ACID transaction, ensuring the project owner never has to manually "clean up" stale requests.

### 2. Dual-Map Socket Registry
Unlike standard implementations, CollabHub uses two synchronized Maps to track user-to-socket relationships. This ensures that even during a "dirty" disconnect, the server can identify and purge the correct user session in O(1) time, keeping the memory footprint minimal.

### 3. Defensive Programming & Truth Verification
The backend utilizes strict identity checks (`=== true`) for destructive actions like mass rejections. This ensures that malformed payloads or "truthy" JavaScript values cannot accidentally trigger a cascade unless the user's intent is explicitly verified.

### 4. Resilience & Process Management
The API is built for high availability. It includes custom process listeners that intercept termination signals to manually close the HTTP server and the WebSocket server, ensuring that the development port is never held hostage by background "ghost" processes.

### 5. Postgres Full-Text Search (FTS) & Pagination
Moved away from slow, sequential `ILIKE` scans by implementing PostgreSQL `tsvector` and `tsquery`. The backend utilizes a custom search utility that computes a `ts_rank` on the fly. To support massive data scalability, the feed architecture utilizes O(1) cursor-based pagination instead of standard offset pagination.

---

## 🗄️ Database Schema & Integrity

The PostgreSQL database is heavily normalized, leveraging Drizzle ORM's relational API to ensure strict data purity.

### 1. ACID Transactions
Critical operations, such as the **Cascade Rejection Logic**, execute inside strict `db.transaction()` blocks. If any part of the process fails (e.g., a notification fails to save), the entire operation rolls back.

### 2. Referential Integrity
Foreign keys are configured with `onDelete: 'cascade'`. This guarantees that deleting a project or user automatically scrubs all associated applications, roles, and notifications instantly.

### 3. Core Relational Mapping
1.  **`users`**: Core identity and auth.
2.  **`profiles`**: Extended user data containing cloud asset URLs, bios, and `interests` arrays.
3.  **`refresh_tokens`**: Database-backed JTI tracking for secure token rotation and breach detection.
4.  **`projects`**: Configured with GIN indexing on computed `tsvector` fields for high-speed text search.
5.  **`project_roles`**: Tracks specific project needs, seats, and capacity status.
6.  **`applications`**: The join table facilitating the relationship between talent and projects.
7.  **`notifications`**: Isolated event logging with real-time push integration.

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
    npx drizzle-kit push
    ```
5.  **Start Development**
    ```bash
    npm run dev
    ```