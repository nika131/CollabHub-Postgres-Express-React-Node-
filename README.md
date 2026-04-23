# CollabHub 🚀

CollabHub is a full-stack developer collaboration platform built with a strict **TypeScript-first** approach. It bridges the gap between idea generation and team execution by enabling developers to publish technical projects, define specific engineering roles, and manage team assembly through a real-time, event-driven architecture.

## 📖 Table of Contents

  - [Core Features](https://www.google.com/search?q=%23-core-features)
  - [Tech Stack](https://www.google.com/search?q=%23-tech-stack)
  - [System Architecture & Engineering](https://www.google.com/search?q=%23-system-architecture--engineering)
  - [Database Schema & Integrity](https://www.google.com/search?q=%23-database-schema--integrity)
  - [Local Setup & Installation](https://www.google.com/search?q=%23-local-setup--installation)

-----

## 🎯 Core Features

### 1\. Real-Time Collaboration Engine

  * **Role-Based Matching:** Project owners define specific technical needs (e.g., "DevOps," "Frontend") with explicit seat counts. The system tracks capacity in real-time.
  * **Owner Command Center:** A dedicated dashboard for managing inbound talent. Accepting an applicant triggers an atomic chain: updating role capacity, firing a WebSocket notification, and potentially auto-closing the project.
  * **The Secure Vault:** Integrated Discord/Slack "Vault" links that are cryptographically restricted at the database level and revealed only to accepted team members.

### 2\. Live Notification System

  * **Socket.io Integration:** Powered by a persistent WebSocket layer for instant, bi-directional communication, replacing legacy polling methods.
  * **Action-Triggered Alerts:** Applicants receive instant haptic-style notifications for status changes (Accepted/Declined) the moment they occur.
  * **Read-State Tracking:** Intelligent UI badge management that synchronizes unread counts with the backend the moment the tray is accessed.

### 3\. Project Management & Discovery

  * **Advanced CRUD:** Robust project refactoring featuring "Role Upserts"—the ability to modify existing roles without breaking active applicant links or role history.
  * **Automated Lifecycle:** Projects transition through `Active`, `Looking-for-Collab`, and `Closed` states, managed by both manual overrides and automated system triggers.
  * **Discovery Feed:** A global Explore page using server-side `$dynamic` queries to filter the database by technology or title while strictly hiding completed projects.

### 4\. Global UX & Performance

  * **Optimistic UI:** Local state updates immediately upon action (e.g., accepting an applicant), providing a high-performance, zero-latency feel.
  * **Global Loading States:** Centralized loading indicators and interceptors ensure a smooth, professional transition during high-latency network operations.

-----

## 💻 Tech Stack

**Frontend (Client)**

  * **Framework:** React 18 + Vite + TypeScript
  * **Real-Time:** Socket.io-client
  * **Styling:** Tailwind CSS (Dark-mode optimized)
  * **HTTP Client:** Axios (Custom interceptors for JWT injection and global 401/403 security handling)

**Backend (API)**

  * **Environment:** Node.js + Express
  * **Language:** TypeScript
  * **Real-Time:** Socket.io (with custom Socket-to-User ID Registry)
  * **Database:** PostgreSQL (Supabase)
  * **ORM:** Drizzle ORM (Type-safe SQL queries)
  * **Validation:** Zod (Strict runtime schema enforcement)

-----

## 🧠 System Architecture & Engineering

### 1\. The Event-Driven Network Layer

The system utilizes a custom **Socket Registry** that maps internal `userIds` to active `socketIds`. This allows the server to target specific users for private data emission, ensuring real-time updates without broadcasting sensitive information to the entire network.

### 2\. Native Database Intelligence

To ensure 100% data integrity, the system utilizes a native **PL/pgSQL Trigger** (`check_and_close_project`). This ensures that the second a role hits capacity, the database itself locks the project from discovery—making the integrity logic independent of the Application Layer.

### 3\. Transactional Upsert Logic

Project refactoring is handled via complex **Transactional Upserts**. The update engine identifies existing roles via ID and distinguishes them from new additions, ensuring that team data is preserved even during significant project scope changes.

### 4\. Security & Defense in Depth

  * **Cryptographic Salting:** Passwords are cryptographically salted and hashed using `bcrypt` before storage.
  * **Validation as a Firewall:** Zod middleware strictly validates incoming payloads *before* they reach the controllers, preventing malformed data from hitting the database.
  * **Bouncer Middlewares:** Authorization is decoupled from business logic. Centralized middlewares verify resource ownership before allowing `PATCH` or `DELETE` executions.

-----

## 🗄️ Database Schema & Integrity

The PostgreSQL database is heavily normalized, leveraging Drizzle ORM's relational API to ensure strict data purity.

### 1\. ACID Transactions

Critical operations, such as user registration or role updates, execute inside strict `db.transaction()` blocks. If any part of the process fails, the entire operation rolls back to prevent orphaned or corrupted data.

### 2\. Referential Integrity

Foreign keys are configured with `onDelete: 'cascade'`. This guarantees that deleting a project or user automatically scrubs all associated applications, roles, and notifications instantly.

### 3\. Core Relational Mapping

1.  **`users`**: Core identity and auth.
2.  **`project_roles`**: Tracks specific project needs, seats, and capacity status.
3.  **`applications`**: The join table facilitating the relationship between talent and projects.
4.  **`notifications`**: Isolated event logging with read/unread state management.

-----

## 🛠️ Local Setup & Installation

### Prerequisites

  * Node.js (v18+)
  * PostgreSQL (Local or Supabase)

*(Installation steps follow here)*