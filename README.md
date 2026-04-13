# CollabHub 🚀

CollabHub is a full-stack developer collaboration platform designed to bridge the gap between idea generation and team execution. It allows developers to publish technical projects, discover open repositories, apply to join teams, and manage inbound collaboration requests through a dedicated dashboard and global notification system.

## 📖 Table of Contents
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [System Architecture & Engineering](#-system-architecture--engineering)
- [Database Schema & Integrity](#-database-schema--integrity)
- [Local Setup & Installation](#-local-setup--installation)

---

## 🎯 Core Features

### 1. Authentication & User Profiles
* **Secure Access:** JWT-based stateless authentication with cryptographically salted passwords (bcrypt) and protected API routes.
* **Dynamic Profiles:** Users maintain profiles containing their tech stack interests, location, and bio.
* **Auto-Initialization:** Database transactions ensure a connected profile is automatically generated the moment a user registers.

### 2. Project Management (CRUD)
* **Creation & Formatting:** Users can launch projects defining a Title, Description, GitHub Repo URL, and a customized Tech Stack using an interactive tagging system.
* **Ownership Control:** Projects are strictly bound to their creators. Only the owner can edit details, change the project status (Active, Completed), or delete the repository.
* **Discovery Feed:** A global Explore page allows users to search the entire database of projects by title or specific technologies.

### 3. The Collaboration Engine
* **Application Workflow:** Users can view detailed project pages and submit "Join Requests" to the owner.
* **State Tracking:** The system prevents duplicate applications and tracks the exact state of the request (Pending, Accepted, Rejected).
* **Owner Dashboard:** A dedicated command center where project owners view incoming applications, review applicant profiles, and explicitly Accept or Decline requests.

### 4. Global Notification System
* **Real-Time Alerts:** A stateful Bell Icon in the navigation bar tracks unread alerts.
* **Action-Triggered:** Notifications are automatically generated in the backend when applications are submitted or updated.
* **Smart Polling & Read States:** Opening the notification dropdown automatically communicates with the backend to mark all alerts as "Read," clearing the UI badges.

---

## 💻 Tech Stack

**Frontend (Client)**
* **Framework:** React 18 + Vite + TypeScript
* **Routing:** React Router v6 (with custom `<ProtectedRoutes />`)
* **Styling:** Tailwind CSS (Dark-mode optimized)
* **HTTP Client:** Axios (with custom interceptors for global error handling and JWT injection)
* **State & UI:** React Hooks, Lucide-React (Icons), React-Hot-Toast (Notifications)

**Backend (API)**
* **Environment:** Node.js + Express
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Drizzle ORM (Type-safe SQL queries and schema management)
* **Validation:** Zod (Strict runtime schema validation)

---

## 🧠 System Architecture & Engineering

This project was built using a strict **Layered Architecture** (Controller-Route-Middleware-Service), enforcing **Separation of Concerns**, the **DRY (Don't Repeat Yourself) principle**, and highly defensible API design.

### 1. The Network Layer & Global Interceptors
The frontend does not handle API requests blindly. All HTTP traffic flows through a centralized Axios instance configured with robust interceptors:
* **Request Interceptor (Token Injection):** Automatically retrieves the JWT from `localStorage` and injects it into the `Authorization` header of every outgoing request, creating a DRY centralized configuration.
* **Response Interceptor (Global Security Guard):** Monitors all incoming traffic. If the backend throws a `401 Unauthorized` or `403 Forbidden`, the interceptor automatically scrubs stale tokens from local storage and forces a secure redirect to the login page, preventing the UI from crashing on expired sessions.

### 2. Advanced Security & Defense in Depth
* **Cryptographic Salting:** Passwords are not just hashed; they are cryptographically salted using `bcrypt.genSalt(10)` before hashing to defend against pre-computation (Rainbow Table) attacks.
* **Validation as a Security Layer:** Incoming payloads are strictly validated using **Zod** middleware *before* the request ever reaches the database controller. This prevents malicious payloads from bypassing frontend restrictions via tools like Postman.
* **"Bouncer" Middlewares:** Route-level authorization is decoupled from business logic. The `isProjectOwner` middleware intercepts `PATCH` and `DELETE` requests, querying the database to verify the acting user actually owns the target project before allowing the controller to execute.

### 3. Global Error Handling Pipeline
To prevent massive `try/catch` boilerplate in the controllers, the backend utilizes a centralized error-handling architecture:
* **`catchAsync` Wrapper:** Automatically catches rejected promises in asynchronous controllers and passes them to Express's `next()` function.
* **`AppError` Class:** A custom extension of the native JavaScript Error object that injects specific HTTP status codes.
* **Global Error Middleware:** A terminal bouncer that catches all downstream errors, formats them safely (hiding stack traces in production), and returns a standardized JSON response to the frontend.

### 4. Database Query Optimization & DRY Design
* **Centralized Selectors:** To avoid rewriting identical SQL `SELECT` and `LEFT JOIN` operations across different routes, the core project data shape is extracted into a centralized `selectors.ts` file (`baseProjectSelection`).
* **DRY Schema Validation:** Instead of writing a duplicate Zod schema for the `PATCH` route, the backend utilizes Zod's `.partial()` method (`updateProjectSchema`) to allow isolated field updates while maintaining strict length and type constraints.

---

## 🗄️ Database Schema & Integrity

The PostgreSQL database is heavily normalized, leveraging Drizzle ORM's relational API to ensure strict data purity and referential integrity.

### 1. ACID Transactions
User registration executes inside a strict `db.transaction()`. When a new user registers, the system creates the `users` row and the linked `profiles` row simultaneously. If either operation fails, the entire transaction rolls back, guaranteeing no orphaned data is ever saved to the database.

### 2. Referential Integrity & Cascading Deletes
Foreign keys (`ownerId`, `userId`, `projectId`) are explicitly configured with `onDelete: 'cascade'`. This guarantees referential integrity; deleting a user automatically scrubs their associated projects, profiles, notifications, and applications from the database instantly.

### 3. Relational Mapping
1. **`users`**: Core identity (ID, Email, HashedPassword).
2. **`profiles`**: Extended metadata (Bio, Location, Interests) linked 1:1 with Users.
3. **`projects`**: The core entities linked 1:Many to Users (Owner).
4. **`applications`**: The join table facilitating the Many:Many relationship between Users and Projects, tracking the exact `status` enum (pending, accepted, rejected).
5. **`notifications`**: An isolated logging table linked directly to Users to track system events and read receipts.

---

## 🛠️ Local Setup & Installation

### Prerequisites
* Node.js (v18+)
* PostgreSQL (Local installation or cloud provider Supabase)

