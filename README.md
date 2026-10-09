# Insta Job – AI-Powered Temporary Job Platform

**Insta Job** is a responsive, modern full-stack web application designed to connect students and temporary workers with verified employers offering short-term gigs (2–4 days, hourly, event-based work).

---

## Technical Stack

* **Frontend:** React.js + Vite + Tailwind CSS + Lucide Icons + Recharts
* **Backend:** Node.js + Express.js + MongoDB + Mongoose
* **AI Model:** Groq API (fallback included)
* **Telemetry Maps:** Vector-based Interactive Proximity Grid (Indiranagar / MG Road tech hubs Bangalore)
* **Attendance System:** Simulated QR Check-in/out scanner and GPS validation checks.

---

## Architectural Features

1. **Authentication-Free Role Simulation:** Toggle dynamically between **Student/Worker**, **Employer**, and **Admin** profiles via a floating header selector.
2. **Proximity Maps:** Recalculate distance dynamically in kilometers from your active relocatable GPS marker. Filters gigs within customizable thresholds.
3. **Groq AI Service:**
   * **Smart Recommendations:** Semantic job matching with workers based on skills & bios.
   * **Fake Listing Verification:** Evaluates descriptions, contacts, and payout rates to flag suspicious listings.
   * **Career Coaching:** Llama-3-70b written guide advice, resumes generation, and hourly rate estimation.
4. **Attendance QR Check-in:** Worker scans QR site code validated by GPS radius check (limits logging if worker is >500 meters from job site coordinates).
5. **Worker Credentials:** Auto-generates work experience certificates upon employer gig approvals.

---

## Project Structure

```
Project/
├── backend/
│   ├── config/db.js          # MongoDB Connection
│   ├── models/               # Mongoose Schemas (Worker, Employer, Job, Application, etc.)
│   ├── routes/               # API endpoints
│   ├── services/aiService.js # Groq API & rules-based fallback logic
│   ├── scripts/seed.js       # Pre-populates DB with realistic test profiles
│   ├── .env                  # Configuration keys (PORT, GROQ_API_KEY)
│   └── server.js             # API entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable interactive layout components (Map, QR Scanner)
│   │   ├── pages/            # Dashboards (Worker, Employer, Admin Panels)
│   │   ├── utils/api.js      # Axios clients with context headers injection
│   │   ├── App.jsx           # Theme & context orchestrator
│   │   └── index.css         # Styling directives and glass panels styles
│   ├── index.html            # Main viewport
│   └── tailwind.config.js    # Tailwind configuration
└── README.md
```

---

## Installation & Setup Instructions

Ensure Node.js is installed. (Node.js and NPM paths can be run directly using `D:\NPM\node.exe` or by adding the directory to the path if needed).

### Step 1: Pre-populate Database
Ensure MongoDB is running locally. Then run the seed script to wipe any mock remnants and insert fresh worker profiles:
```bash
# Navigate to backend directory
cd backend

# Execute seeding script
npm run seed
```

### Step 2: Configure AI Keys
Open `backend/.env` and paste your Groq API Key:
```env
GROQ_API_KEY=paste_your_actual_key_here
```
*Note: If no key is provided, the platform automatically switches to a rules-based parser fallback ensuring 100% interactive responsiveness!*

### Step 3: Run the API Server
Start the Express server (starts on `http://localhost:5000`):
```bash
npm start
```

### Step 4: Run the Client App
In a new terminal window, navigate to the frontend folder and boot the Vite server:
```bash
# Navigate to frontend directory
cd ../frontend

# Start Vite client dev server
npm run dev
```

Open `http://localhost:5173` (or the port specified by Vite) in your browser and toggle modes to preview the workflows.
