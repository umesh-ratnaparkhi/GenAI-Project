# GenAi Project 🚀

A full-stack MERN (MongoDB, Express.js, React, Node.js) application. This project features a clean monorepo architecture separating the frontend and backend architectures under a unified structure.

---

## 📁 Project Structure

```text
GenAi-Project/
├── backend/               # Node.js + Express API server
│   ├── node_modules/
│   ├── .env               # Backend environment secrets (Local only)
│   ├── package.json
│   └── server.js
├── frontend/              # React frontend (Vite/CRA)
│   ├── node_modules/
│   ├── package.json
│   └── src/
└── README.md
```

---

## 🛠️ Prerequisites

Before running this project, ensure you have the following installed:
* [Node.js](https://nodejs.org) (v16+ recommended)
* [npm](https://npmjs.com)
* [MongoDB Atlas Account](https://mongodb.com) or a local MongoDB instance

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally.

### 1. Clone the Repository
```bash
git clone https://github.com
cd GenAi-Project
```

### 2. Set Up the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder and add your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(Or `node server.js` depending on your scripts setup)*

### 3. Set Up the Frontend
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

The application should now be accessible locally! 
* **Frontend:** `http://localhost:5173` (or `http://localhost:3000`)
* **Backend API:** `http://localhost:5000`

---

## 🔒 Environment Variables

> ⚠️ **Important:** Do not commit `.env` files to public version control. They are blocked by the root `.gitignore` file. Ensure you define these variables manually on your cloud hosting services (e.g., Render, Vercel) during deployment.

---

## 🧰 Technologies Used

* **Frontend:** React.js, Tailwind CSS / CSS3, Axios
* **Backend:** Node.js, Express.js, Mongoose
* **Database:** MongoDB
