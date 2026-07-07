
  # 🍽️ Luxury Restaurant Management System

## 📖 Overview

Luxury Restaurant Management System is a full-stack web application that allows customers to explore the restaurant menu, make reservations, and enables restaurant administrators to manage menu items through APIs and Excel uploads.

---

# ✨ Features

### Customer Side
- 🍽️ Beautiful luxury restaurant website
- 📋 Dynamic menu display
- 📅 Table reservation system
- 📱 Responsive design

### Admin Side
- ➕ Add menu items
- ✏️ Update menu items
- ❌ Delete menu items
- 📊 View all reservations
- 📤 Upload menu using Excel (.xlsx)
- 📄 Swagger API Documentation

---

# 🛠️ Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

## Backend
- FastAPI
- SQLAlchemy
- SQLite
- Pandas
- OpenPyXL

---

# 📂 Project Structure

```
restaurent website
│
├── backend
│   ├── routers
│   ├── uploads
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── main.py
│
├── src
├── public
├── package.json
├── README.md
```

---

# 🚀 API Endpoints

## Menu APIs

- GET /menu
- POST /menu
- PUT /menu/{id}
- DELETE /menu/{id}

## Reservation APIs

- POST /reservation
- GET /reservation

## Excel Upload

- POST /upload-menu

## Dashboard

- GET /dashboard

---

# 📊 Database

SQLite Database

Tables

- Menu
- Reservations

---

# 📥 Excel Upload

The restaurant owner can upload a `.xlsx` file containing menu items.

Required columns:

- name
- desc
- category
- price
- tag
- img
- rating
- time

---

# ▶️ How to Run

## Backend

```bash
cd backend
venv\Scripts\activate
python -m uvicorn main:app --reload
```

## Frontend

```bash
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

Swagger:

```
http://127.0.0.1:8000/docs
```

---

# 🎯 Future Enhancements

- Authentication
- Online Payments
- Order Management
- Email Notifications
- Admin Dashboard
- AI Recommendation System

---

