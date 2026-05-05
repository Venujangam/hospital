# 🏥 CareFlow — Hospital Management System

A full-stack hospital management system built with Node.js, Express, MongoDB, and vanilla JS.

## Features
- 🧑‍⚕️ Patient management (Admit / Discharge / Track)
- 👨‍⚕️ Doctor management
- 📅 Appointment scheduling
- 💳 Fee payments with receipt printing
- 🔒 JWT authentication (Register / Login / Logout)
- 📊 Dashboard with live stats

---

## 🚀 Deploy on Render (Free)

### Step 1 — Set up MongoDB Atlas (free)
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0 cluster**
3. Create a database user (username + password)
4. Under **Network Access** → Add IP → `0.0.0.0/0` (allow all)
5. Click **Connect** → **Drivers** → Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `careflow`

### Step 2 — Deploy on Render
1. Go to [https://render.com](https://render.com) and sign in with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Fill in the settings:
   | Field | Value |
   |-------|-------|
   | **Root Directory** | `backend` |
   | **Build Command** | `npm install --omit=dev` |
   | **Start Command** | `npm start` |
   | **Environment** | `Node` |

5. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Any long random string |
   | `NODE_ENV` | `production` |

6. Click **Create Web Service**
7. Wait ~2 minutes for the first deploy ✅

### Step 3 — Access your app
Your app will be live at:
```
https://careflow-hospital.onrender.com
```

---

## 💻 Run Locally

```bash
cd backend
npm install
node server.js
```

Open: http://localhost:5000

> No MongoDB needed locally — uses in-memory database automatically.

---

## 📁 Project Structure

```
hospital-management-main/
├── backend/
│   ├── models/          # Mongoose schemas
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Payment.js
│   │   └── User.js
│   ├── routes/          # Express route handlers
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── paymentRoutes.js
│   ├── server.js        # Main entry point
│   ├── .env.example     # Environment variable template
│   └── package.json
├── frontend/
│   ├── index.html       # Dashboard
│   ├── login.html
│   ├── register.html
│   ├── logout.html
│   ├── script.js        # Dashboard logic
│   ├── auth.js          # Login/Register logic
│   └── styles.css
├── render.yaml          # Render deployment config
└── README.md
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET/POST | `/patients` | List / Add patients |
| PUT/DELETE | `/patients/:id` | Update / Delete patient |
| POST | `/patients/:id/admit` | Admit patient |
| POST | `/patients/:id/discharge` | Discharge patient |
| GET/POST | `/doctors` | List / Add doctors |
| PUT/DELETE | `/doctors/:id` | Update / Delete doctor |
| GET/POST | `/appointments` | List / Book appointments |
| PUT/DELETE | `/appointments/:id` | Update / Cancel appointment |
| GET/POST | `/payments` | List / Record payments |
| GET | `/payments/summary/stats` | Payment summary |
| DELETE | `/payments/:id` | Delete payment |
| GET | `/api/health` | Health check |
