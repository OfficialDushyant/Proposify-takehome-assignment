# Real-Time Collaborative Notes Application

A real-time collaborative note-taking application built with React, Node.js, Socket.io, and Quill.js. This application allows multiple users to create, edit, and delete notes in real-time, with live updates and synchronization across all connected clients.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Additional Notes](#additional-notes)


---

## Features

- **Real-Time Collaboration:** Edit notes simultaneously with other users.
- **Multiple Notes Support:** Create, select, edit, and delete individual notes.
- **Live Updates:** Notes are synchronized in real-time across all connected clients.
- **Rich Text Editing:** Utilize a rich text editor with formatting options.
- **User Authentication:** Simple username prompt for user identification.
- **Persistent Connections:** Maintain live connections using Socket.io.

---

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher (comes with Node.js)
- **Git**: For cloning the repository (optional)

---

## Installation

### Backend Setup

1. Navigate to server dir form project root `cd server` 
2. Run `npm install`
    **Dependencies**
    - **Express**: Web framework for Node.js
    - **Socket.io**: Real-time bidirectional event-based communication
    - **Quill**: For Delta operations on the server side
    - **TypeScript**: Typed superset of JavaScript
    - **Nodemon**: Utility that monitors for changes and automatically restarts your    server
    - **@types/…**: Type definitions for Node.js, Express, and Socket.io

### Frontend Setup

1. Navigate to frontend dir form project root `cd frontend`
2. Run `npm install`
    Dependencies:
	- **React**: Frontend library for building user interfaces
	- **React DOM**: Serves as the entry point to the DOM and server renderers
	- **Socket.io Client**: Client library for Socket.io
	- **Quill**: Rich text editor
	- **React-Quill**: React component for Quill
	- **TypeScript**: For type safety in JavaScript code
	- **Vitest**: A blazing fast unit test framework powered by Vite
	- **@testing-library/react**: For testing React components
	- **@testing-library/jest-dom**: Custom matchers for Jest
	- **Vite**: Next Generation Frontend Tooling

## Running the Application

**Start the Backend Server**

- Navigate to server dir `cd server`
- Run the server `npm run dev`
The server should start on http://localhost:4000.
**Note:** The dev script uses nodemon to automatically restart the server on file changes.

**Start the Frontend Application**

- Navigate to frontend dir `cd frontend`
- Run the server `npm run dev`
The application should be accessible at http://localhost:3000

## Running Tests

**Frontend Tests**
From frontend dit run `npm run test`.
This will run the unit tests using **Vitest**.

**Backend Tests**
From server dir run `npm run test`.
This will run the unit tests using **Vitest**.

## Project s
```realtime-collaborative-notes/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   └── SocketServer.ts
│   └── tests
│   │   └── socketServer.test.ts
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.test.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   └── NoteEditor.tsx
│   │       └── NoteEditor.test.tsx
│   └── ...
├── README.md
```
### Technologies Used
- Frontend 
    - react
    - Typescript
    - Vite
    - QuillJS
    - Socket.io Client
    - React Testing Library
    - Vitest
- Backend
    - Node.js
    - Express.js
    - Typescript
    - Socket.io

## Additional Notes

- **Cross-Origin Resource Sharing (CORS):** 
    - The backend server is configured to allow CORS from any origin (*). Adjust this in SocketServer.ts if necessary.

- **Known Issues:**
    - **Whitespace Handling:** The application requires using Quill’s Delta format to manage text content, ensuring that spaces and formatting are preserved during real-time collaboration. After reviewing the documentation, I identified a solution; however, implementing it would have exceeded the time constraints, so I did not include it in the initial submission. I plan to address this in a future update.
    - **Testing Quill Components:** When writing tests involving Quill, it’s recommended to mock the editor to avoid complexities.

- **Future Enhancements:**
    - **User Authentication:** Implement a robust authentication system.
    - **Database Integration:** Persist notes in a database like MongoDB or PostgreSQL.
    - **Conflict Resolution:** Improve collaborative editing with operational transforms or CRDTs.
    - **UI/UX Improvements:** Enhance the user interface for better usability.
