# 🔋 Battery Monitoring Setup Guide

To enable the **Real-time Battery Health Monitoring** feature on your dashboard (checking laptop charge, status, etc.), you need to run the backend services.

## 🚀 Quick Start (Windows)

1.  **Double-click** the `start_batt_iq.bat` file in the main project folder.
2.  Wait for the windows to open.
3.  Refresh your dashboard (http://localhost:5173).

The "Live Battery Agent" card should now appear at the top of your dashboard!

---

## 🛠 Manual Setup

If the script doesn't work, you can start the components manually:

### 1. Start the Backend (Email/Telemetry Service)
This service receives data from your laptop and sends it to the dashboard.

1.  Open a terminal in `email-service`.
2.  Install dependencies: `npm install`
3.  Start server: `npm start`
    *   *Runs on http://localhost:5001*

### 2. Start the Agent (Python Script)
This script reads your actual laptop battery status.

1.  Open a terminal in `battery-agent`.
2.  (Optional) Create/activate a virtual env: `python -m venv venv` & `venv\Scripts\activate`
3.  Install dependencies: `pip install -r requirements.txt`
4.  Run agent: `python agent.py`

## ❓ Troubleshooting

-   **I don't see the card:** Ensure both the backend (Port 5001) and the agent are running. Check the agent terminal for "Sent: XX%" messages.
-   **Agent Error:** If the agent fails, ensure you have Python installed and added to your PATH.
