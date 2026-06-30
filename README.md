# 🌆 CityPulse

CityPulse is a full-stack MERN web application that enables users to share real-time city updates, discover hidden local gems, ask questions to locals, find nearby places, and explore upcoming events. It provides a centralized platform for hyperlocal community engagement with secure authentication, image uploads, geolocation support, and an admin dashboard.

---
## 🌐 Live Demo

**Frontend:**  
https://citypulse-frontend-cmdk.onrender.com/pulse

**Backend API:**  
https://citypulse-backend-4cio.onrender.com/api/health

---
## ✨ Features

### 🔐 Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Role-based authorization (User/Admin)

### 📢 Pulse
- Post real-time city updates
- Categories (Traffic, Accident, Power Cut, Water Issue, Events, etc.)
- Image uploads
- Confirm/Unconfirm updates
- Auto-delete expired posts using Cron Jobs

### 💎 Discover
- Share hidden gems
- Rate locations
- Upload images
- Categories such as:
  - Cafes
  - Restaurants
  - Parks
  - Study Spots
  - Shopping
  - Scenic Places

### ❓ Ask Locals
- Ask city-specific questions
- Community answers
- Discussion threads

### 📅 Events
- Create events
- RSVP to events
- Event categories
- Date & time scheduling

### 📍 Nearby
- Discover nearby places
- Distance-based search
- Interactive maps using Leaflet
- Current location support

### 🛠 Admin Dashboard
- User management
- Report management
- Content moderation
- Analytics dashboard

### ☁ Media Upload
- Cloudinary integration
- Image optimization
- Secure uploads

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Query
- Axios
- React Router
- Framer Motion
- Leaflet

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Multer
- Cloudinary
- Node-Cron

---

## 📂 Project Structure

```
CityPulse/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Automation

A scheduled Cron Job runs every 15 minutes to automatically remove expired Pulse posts.

---
