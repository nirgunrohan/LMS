# 🧺 Laundry Management System (LMS)

A full-stack web application for managing laundry orders and services in a hostel or campus environment. The system allows users to place laundry orders, track order status, and raise complaints. Admins can manage all orders and respond to user issues.

---

## ✨ Features

### 👤 Users
- Register & Login securely
- Create laundry orders
- Track current and past orders with status updates
- Raise complaints about specific orders

### 🛠 Admin
- View all user orders
- Update laundry status (Pending → Picked → Washed → Delivered)
- View and resolve complaints

---

## 🏗️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React / HTML + Tailwind CSS |
| Backend   | Node.js, Express |
| Database  | MongoDB + Mongoose |
| Auth      | JWT (JSON Web Token) |
| Hosting   | (Optional) Vercel, Railway, Render |

---

## 📁 Project Structure

```bash
LMS/
├── backend/
│   ├── index.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── .gitignore
├── README.md

🚀 Backend Setup
cd backend
npm install

Create a .env file in backend/:
PORT=5000
MONGO_URI=mongodb://localhost:27017/laundry
JWT_SECRET=your_secret_key

Start the server:
npm start

🌐 Frontend Setup (React)
cd frontend
npm install
npm start
Visit: http://localhost:3000

🔐 API Endpoints
Method	Endpoint	Description
POST	/api/register	Register new user/admin
POST	/api/login	Login and receive JWT token
GET	/api/orders/mine	Get user-specific orders
POST	/api/orders	Create new laundry order
GET	/api/complaints/mine	Get user complaints
POST	/api/complaints	Raise complaint
GET	/api/orders	Admin - view all orders
PATCH	/api/orders/:id	Admin - update order status
