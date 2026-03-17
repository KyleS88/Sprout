# Sprout

![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat-square&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat-square&logo=express&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON%20web%20tokens)

A full-stack web application for creating, editing, and saving interactive concept maps. 

 [[**Live Demo**](https://sprout-flame.vercel.app/)]  
*(An account must be created before you can use the application).*

## Overview

Sprout allows users to visualize relationships between ideas using a 2D node-based canvas. The application persists user data across sessions, saving the exact spatial coordinates and relationships of the graph structure to a relational database.

## Tech Stack

* **Frontend:** React, TypeScript, Vite, Bootstrap
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Authentication:** JWT (JSON Web Tokens), bcrypt

## Key Features

- [x]  **Interactive Canvas:** Draggable nodes and connectable edges for dynamic map creation.
- [x]  **Persistent Storage:** Maps are tied to individual user accounts and saved automatically.
- [x]  **Stateless Authentication:** Secure login and registration flows utilizing HTTP-only JWTs.
- [x]  **Responsive SPA Routing:** Configured server-side rewrites to support client-side routing on Vercel.

## Technical Implementation Details

### Database Architecture
Storing graph data in a relational database required separating the UI state into two primary models:
* **Nodes:** Stores the X/Y coordinates, dimensions, and text content.
* **Edges:** Acts as an association table tracking the directed connections between a `source` node and a `target` node. 
Instead of complex SQL joins, the backend serves these as independent arrays, allowing the frontend client to efficiently reconstruct the graph state.

### Authentication Flow
User passwords are computationally hashed via `bcrypt` before database insertion. Session management is handled via JSON Web Tokens (JWT) verified via custom Express middleware, ensuring that users can only fetch or modify nodes associated with their specific `user_id`.

## Core Architecture & Data Flow

The primary engineering challenge of Sprout was maintaining synchronization between a highly interactive frontend canvas and a persistent relational database. 

### 1. The Canvas Engine (React Flow + Zustand)
To handle the complex UI of a node-based editor, Sprout utilizes **React Flow** (`@xyflow/react`). 
Because concept maps require continuous, rapid state updates (e.g., dragging a node across the screen, dynamically drawing edges), passing state through standard React props was too slow. I implemented **Zustand** as a lightweight global store to manage the spatial coordinates and relational data of the graph in real-time, independent of the React render cycle.

### 2. Relational Graph Serialization
Graph data inherently conflicts with flat relational tables. To solve this without using a dedicated GraphDB, the state is serialized into two separate PostgreSQL models:
* **Nodes:** Stores the UUID, X/Y coordinates, dimensions, and textual content.
* **Edges:** Stores the directed relationship by tracking a `source_id` and a `target_id`.
By storing nodes and edges independently, the application avoids complex SQL `JOIN` overhead. The backend queries these tables in parallel and serves flat arrays directly to the React client.

### 3. State Persistence
When a user finishes manipulating the canvas, the frontend extracts the updated graph state from Zustand and sends `PATCH` requests to the Express.js API. The backend then executes parameterized SQL updates to save the new coordinates and connections, ensuring the user's map renders exactly as they left it upon their next login.

## License
The Sprout project is open-sourced software licensed under the [MIT License](https://opensource.org/licenses/MIT).

