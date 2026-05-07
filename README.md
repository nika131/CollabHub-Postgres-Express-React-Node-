# CollabHub 🚀

CollabHub is a full-stack developer collaboration platform built with a strict **TypeScript-first** approach. It bridges the gap between idea generation and team execution by enabling developers to publish technical projects, define specific engineering roles, and manage team assembly through a real-time, event-driven architecture.

## 📖 Table of Contents

- [Core Features](#-core-features)
- [API Security & Cryptography](#-api-security--cryptography)
- [System Architecture & Engineering](#-system-architecture--engineering)
- [Tech Stack](#-tech-stack)
- [Database Schema & Integrity](#-database-schema--integrity)
- [Local Setup & Installation](#-local-setup--installation)

---

## 🎯 Core Features

### 1. Advanced Real-Time Collaboration
* **Role-Based Matching:** Project owners define specific technical needs (e.g., "DevOps," "Frontend") with explicit seat counts. The system tracks capacity in real-time.
* **Cascade Resolution Engine:** Accepting an applicant triggers a "Soft Choice" state machine. If the final seat is filled, the system can automatically bulk-reject all other pending applicants and notify them instantly via WebSockets.
* **The Secure Vault:** Integrated Discord/Slack "Vault" links that are cryptographically restricted at the database level and revealed only to accepted team members.
* **Dynamic Status Synchronization:** Role capacities and UI styling update dynamically across the client as seats are filled, preventing over-booking and stale views.

### 2. High-Performance UI & Dashboards
* **Unified Developer Dashboard:** A centralized control panel featuring a dedicated "Participating Projects" widget, giving users instant visibility into external projects they are actively contributing to.
* **Transparent Team Rosters:** Project detail pages dynamically render the roster of accepted team members and their respective roles, fostering immediate team visibility.
* **Optimized Render Cycles:** Heavy form inputs and dashboard components are shielded by strict `React.memo` and `useCallback` implementations, drastically reducing React render-waterfalls and completely eliminating typing lag.
* **Network Debouncing:** Client-side search queries are throttled via a custom `useDebounce` hook, dropping network traffic by over 80% and protecting the backend from query spam during rapid typing.

### 3. Intelligent Notification & Socket Layer
* **Targeted Socket Registry:** Powered by a dual-map O(1) registry (`userTOSocket` & `socketToUser`) for instant, private bi-directional communication.
* **Action-Triggered Alerts:** Applicants receive instant notifications for status changes (Accepted/Declined/Filled) the moment they occur.
* **Reliability & Cleanup:** Implemented **Graceful Shutdown** listeners (SIGINT/SIGTERM) to ensure the Node process releases Port 3000 and closes all active WebSocket heartbeats cleanly, preventing "Zombie Processes."

### 4. Hardened Auth & Navigation
* **Stateful JWT Refresh:** A secure "Silent Refresh" strategy using `httpOnly` rotation. Access tokens are short-lived (15m), while refresh tokens are securely rotated on each use.
* **Recursive Route Guarding:** Implemented `ProtectedRoute` and `PublicRoute` components. Authenticated users are automatically redirected from auth pages to the dashboard, while unauthenticated users are gated from private resources.
* **Session Verification:** The UI does not "blindly" trust LocalStorage; on every mount, the Navbar synchronizes with the `/auth/me` endpoint to ensure the session is cryptographically valid.

### 5. Global UX & Decision Gates
* **Confirmation Gates (409 Conflict):** A specialized "Confirmation-Required" flow for destructive actions. When filling a role, the UI prompts the owner to choose between manual cleanup or automated cascade rejection.
* **Optimistic UI:** Local state updates immediately upon action, providing a high-performance, zero-latency feel while the backend handles complex multi-table transactions.

### 6. Intelligent Discovery & Profiles
* **Dynamic Explore Engine:** A dedicated discovery page featuring a toggleable "Global" feed and a personalized "For You" feed. Built with an infinite-scroll style cursor pagination system to efficiently fetch 10 heavily-sorted projects at a time without overwhelming the DOM.
* **Full-Text Relevancy Search:** Advanced search capabilities that rank projects based on keyword density and exact matches across titles, descriptions, and tech stacks using PostgreSQL GIN indexes.
* **"For You" Array Intersection:** A recommended project feed that cross-references a user's defined profile interests against project tech stacks using native database array math.
* **Dynamic Cloud Profiles:** Full image upload pipeline for interactive profile avatars securely hosted in the cloud, with profile data guarded by strict Zod schema validation.

---

## 🛡️ API Security & Cryptography

### 1. Cryptographic Engine Migration
`bcrypt` is utilized as the industry standard for user passwords, but to bypass its inherent 72-byte input truncation limit, the JWT Refresh Token architecture was migrated to a dedicated hashing engine using Node's native `crypto` module to perform deterministic SHA-256 hashes on high-entropy strings.

### 2. Two-Tier Rate Limiting
The Express API is hardened against DoS and credential stuffing via a multi-layered defense system:
* **Global Limiter:** Protects standard data-fetching routes to preserve database connection pools.
* **Strict Limiter:** A hyper-aggressive throttle placed explicitly on vulnerable mutation endpoints (`/login`, `/register`, `/join`) to neutralize brute-force attacks and application spam.
* **Proxy Trust Integration:** Configured to accurately extract client IPs via the `X-Forwarded-For` header, ensuring rate limits function correctly behind production load balancers.

---

## 🧠 System Architecture & Engineering

### 1. Concurrency & TOCTOU Prevention
Application seating logic is secured against Time-of-Check to Time-of-Use (TOCTOU) race conditions. If multiple users are accepted for the final project seat at the exact same millisecond, the database relies on atomic `sql` update operators rather than in-memory calculations to strictly enforce capacity limits and prevent role over-filling.

### 2. Eliminating N+1 Database Bottlenecks
The project update controllers bypass standard sequential loop updates. By refactoring the logic to utilize bulk `inArray` reads and concurrent `Promise.all` upserts, the backend reduces database trips from O(N) to O(1), keeping transaction windows minimal and freeing up the event loop.

### 3. 2D Composite Cursor Pagination (FTS)
Moved away from slow, sequential `ILIKE` scans by implementing PostgreSQL `tsvector` and `tsquery`. To resolve silent data-loss bugs native to standard 1D cursors during complex searches, the pagination engine uses **Composite Cursors**. When sorting search results by Relevance (`ts_rank`) first and `ID` second, the backend expects a 2D cursor and executes complex `OR/AND` matrix logic to guarantee zero skipped records across page loads.

### 4. The Cascade State Machine
The system handles the "last seat" scenario using a transactional domino effect. When a role status changes to `filled`, the backend can execute a bulk update across the `applications` and `notifications` tables in a single ACID transaction, ensuring the project owner never has to manually "clean up" stale requests.

### 5. Dual-Map Socket Registry
Unlike standard implementations, CollabHub uses two synchronized Maps to track user-to-socket relationships. This ensures that even during a "dirty" disconnect, the server can identify and purge the correct user session in O(1) time, keeping the memory footprint minimal.

### 6. Defensive Programming & Truth Verification
The backend utilizes strict identity checks (`=== true`) for destructive actions like mass rejections. This ensures that malformed payloads or "truthy" JavaScript values cannot accidentally trigger a cascade unless the user's intent is explicitly verified.

---

## 💻 Tech Stack

**Frontend (Client)**
* **Framework:** React 18 + Vite + TypeScript
* **State & Caching:** TanStack Query (React Query)
* **Real-Time:** Socket.io-client
* **Styling:** Tailwind CSS (Dark-mode optimized)
* **HTTP Client:** Axios (Custom interceptors for JWT injection and global 401/403 security handling)

**Backend (API)**
* **Environment:** Node.js + Express
* **Language:** TypeScript
* **Real-Time:** Socket.io (with custom O(1) Dual-Registry)
* **Database:** PostgreSQL (Supabase)
* **ORM:** Drizzle ORM (Type-safe SQL queries)
* **Security:** `express-rate-limit`, Node `crypto`, `bcrypt`
* **Validation:** Zod (Strict runtime schema enforcement)
* **Media:** Cloud-based image upload integration

---

## 🗄️ Database Schema & Integrity

The PostgreSQL database is heavily normalized, leveraging Drizzle ORM's relational API to ensure strict data purity.

### 1. ACID Transactions
Critical operations, such as the **Cascade Rejection Logic** and multi-role insertions, execute inside strict `db.transaction()` blocks. If any part of the process fails (e.g., a notification fails to save), the entire operation rolls back.

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
    git clone [https://github.com/nika131/collabhub.git](https://github.com/nika131/collabhub.git)
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