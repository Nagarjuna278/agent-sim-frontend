# Grid Simulation: Real-time Reinforcement Learning Agent Simulation

This project demonstrates a real-time interactive application where users can build and simulate a grid-based environment, observing the actions of pre-trained reinforcement learning agents (a runner and a catcher).  The application features a modern React/Next.js frontend communicating with a Python backend via Socket.IO for real-time updates.


## Table of Contents

* [Overview](#overview)
* [Project Structure](#project-structure)
* [Frontend](#frontend)
    * [Component Structure and Logic](#frontend-component-structure)
    * [Grid Interaction](#frontend-grid-interaction)
    * [Control Panel](#frontend-control-panel)
    * [Socket.IO Communication](#frontend-socketio)
* [Backend](#backend)
    * [Simulation Environment](#backend-environment)
    * [Model Loading and Inference](#backend-models)
    * [Simulation Loop and Logic](#backend-simulation)
    * [Error Handling](#backend-errors)
* [Installation and Setup](#installation-and-setup)
* [Running the Application](#running-the-application)
* [Troubleshooting](#troubleshooting)
* [License](#license)


## Overview

The application consists of two parts:

* **Frontend (React/Next.js):** A user interface rendering a 10x10 grid where users configure the initial simulation state (placing obstacles, runner, and catcher).  The frontend uses Socket.IO for real-time communication with the backend.
* **Backend (Python with Socket.IO and AsyncIO):** A Python server handling the simulation logic.  It loads pre-trained reinforcement learning models (CNNs), executes the simulation steps, and sends updates back to the frontend via Socket.IO.


## Project Structure

```
├── agent-sim/
│   ├── pages/
│   │   └── index.tsx  // Main frontend component
│   ├── styles/
│   │   └── globals.css // Global styles (e.g., Tailwind CSS)
│   └── package.json   // Frontend dependencies
│   └── README.md
└── agent-sim-backend/
    ├── server.py       // Main backend server (Socket.IO, simulation logic)
    ├── policy_network.py // Definition of the CNN policy network
    ├── environment.py   // Custom grid environment
    └── requirements.txt // Backend dependencies

```

## Frontend

### Frontend Component Structure and Logic

The frontend uses Next.js's "use client" directive for client-side rendering.  It leverages React's `useState` hook to manage:

* The grid state (a 2D array representing cell types).
* The currently selected cell type.
* The Socket.IO connection.
* Simulation status (running/stopped).
* Error messages.


### Frontend Grid Interaction

The 10x10 grid allows users to click on cells to place obstacles, the runner, and the catcher.  The grid updates are validated to ensure only one runner and one catcher are present.  While the simulation is running, cell modifications are disabled.


### Frontend Control Panel

A control panel provides buttons for selecting cell types (empty, obstacle, runner, catcher) and controls for starting and resetting the simulation.


### Frontend Socket.IO Communication

The frontend uses `useEffect` to manage the Socket.IO connection:

* **`connect` and `connect_error` events:** Handle connection establishment and errors.
* **`grid_update` event:** Receives updated grid states from the backend.
* **`error` event:** Receives error messages from the backend.

On "Start Simulation," the frontend validates the grid and emits a `start_simulation` event with the grid configuration to the backend.


## Backend

### Backend Simulation Environment

The `environment.py` file defines the `RunnerCatcherEnv` class, which handles the grid state, agent actions, and reward calculation.


### Backend Model Loading and Inference

The backend loads two pre-trained CNN models (`policy_network.py`) for the runner and catcher agents.  These models predict actions based on the current grid state.


### Backend Simulation Loop and Logic

The `server.py`'s `run_simulation` function executes the simulation loop:

1. It receives the grid from the frontend.
2. It iteratively calls the agents' models to get actions.
3. It updates the environment state (`environment.py`).
4. It sends updated grid states back to the frontend via Socket.IO.
5. It includes logic to prevent infinite loops by detecting consecutive identical grid states.


### Backend Error Handling

The backend handles potential errors (e.g., model loading failures, invalid grid configurations) and sends error messages back to the frontend.



## Installation and Setup

### Frontend

1.  `cd agent-sim`
2.  `npm install` (or `yarn install`)

### Backend

1.  Create a virtual environment: `python -m venv venv`
2.  Activate the virtual environment: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
3.  Install dependencies: `pip install -r agent-sim-backend/requirements.txt`
4.  Place pre-trained models (if not already included) in the appropriate location (see `server.py`).


## Running the Application

1.  **Start the Backend:**  `uvicorn server:app --host 0.0.0.0 --port 8000`
2.  **Start the Frontend:** `npm run dev` (or `yarn dev`)
3.  Open your browser at `http://localhost:3000`.


## Troubleshooting

* **Connection Errors:** Ensure the backend server is running and that CORS is correctly configured.
* **Invalid Grid:** The grid must have exactly one runner and one catcher before starting the simulation.
* **Model Errors:** Verify that the model files exist in the correct locations and are in the expected format.
* Check browser console and server logs for detailed error messages.


## License

agent-sim is licensed under MIT License
