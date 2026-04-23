# 🔍 Lost & Found Item Management System

A full-stack **MERN** web application for managing lost and found items on a college campus. Students can register, log in, report lost or found items, search the database, and edit/delete their own posts.

---

## 🛠 Tech Stack

| Layer     | Technology                              |
|-----------|------------------------------------------|
| Frontend  | React 18, Vite, React Router DOM v6, Axios |
| Backend   | Node.js, Express.js                      |
| Database  | MongoDB Atlas + Mongoose                 |
| Auth      | JWT (jsonwebtoken) + bcryptjs            |
| Styling   | Vanilla CSS (dark glassmorphism theme)   |

---

## 📁 Project Structure

```
lost-found-app/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Item.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── items.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── App.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free tier works)

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/lost-found-app.git
cd lost-found-app
```

### 2 — Backend Setup

```bash
cd backend
npm install
```

Edit the `.env` file and replace placeholders with your real values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/lostfound?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key_change_me
PORT=5000
```

Start the backend (development with auto-reload):

```bash
npm run dev
```

Or in production:

```bash
npm start
```

The backend will run at **http://localhost:5000**

### 3 — Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run at **http://localhost:5173**

---

## 🌐 API Endpoints

### Auth

| Method | Endpoint        | Auth | Description              |
|--------|-----------------|------|--------------------------|
| POST   | /api/register   | ❌    | Register a new user      |
| POST   | /api/login      | ❌    | Login, returns JWT token |

### Items

| Method | Endpoint                    | Auth | Description                      |
|--------|-----------------------------|------|----------------------------------|
| GET    | /api/items                  | ❌    | Fetch all items (newest first)   |
| GET    | /api/items/search?name=xyz  | ❌    | Search items by name/description |
| GET    | /api/items/:id              | ❌    | Get a single item by ID          |
| POST   | /api/items                  | ✅    | Create a new item                |
| PUT    | /api/items/:id              | ✅    | Update own item                  |
| DELETE | /api/items/:id              | ✅    | Delete own item                  |

**Protected routes** require an `Authorization: Bearer <token>` header.

---

## 🚀 Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repository.
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your GitHub repo.
4. Set:
   - **Build command**: `npm install`
   - **Start command**: `npm start`
5. Add Environment Variables in the Render dashboard:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — your secret key
   - `PORT` — `5000` (Render overrides this automatically)
6. Deploy — Render gives you a public URL like `https://your-app.onrender.com`.

### Frontend → Render (Static Site) or Netlify / GitHub Pages

1. Update `API_BASE` in all frontend files to your Render backend URL:
   ```js
   const API_BASE = 'https://your-app.onrender.com';
   ```
2. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
3. **Render Static Site**: Point publish directory to `frontend/dist`.
4. **Netlify**: Drag & drop the `dist/` folder at [app.netlify.com](https://app.netlify.com).

---

## 🔒 Security Notes

- Never commit `.env` to version control — add it to `.gitignore`.
- Use a strong, random `JWT_SECRET` in production.
- Restrict CORS `origin` to your frontend domain in production.

---

## 📄 License

MIT License — free to use, modify, and distribute.
