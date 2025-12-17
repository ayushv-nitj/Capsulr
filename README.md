# 🕰️ Capsulr — Digital Time Capsules for the Future

**Capsulr** is a modern full-stack web application that lets users create **digital time capsules** containing text, images, audio, and video — locked until a future date or life event.

> *“Some memories deserve to be opened later.”*

---
# 🎥 Demo Video:

https://youtu.be/wyDj9zrrPZ4

## Welcome to Capsulr
![WhatsApp Image 2025-12-15 at 11 37 51_2ee43d61](https://github.com/user-attachments/assets/54573263-8d20-4889-82a8-7ffd63f8d95d)
<img width="929" height="934" alt="image" src="https://github.com/user-attachments/assets/8e801dd6-dde0-4cc8-837b-6386fe21531b" />
<img width="1400" height="970" alt="image" src="https://github.com/user-attachments/assets/e9e7ea25-4982-4bda-8b29-4c84f840319a" />
<img width="1888" height="977" alt="image" src="https://github.com/user-attachments/assets/3baf1e7d-307a-4099-bc34-3183a3eda29c" />
<img width="1033" height="675" alt="image" src="https://github.com/user-attachments/assets/5a560e25-8284-4fde-a763-91bc1fe74f89" />





# Running Locally
## Backend 
cd backend
npm install
npm start

## Frontend
cd frontend
npm install
npm run dev

## visit 
http://localhost:3000

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
### Frontend (frontend/.env.local)
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

## ✨ Features

### 📦 Core Features
- Create **digital time capsules**
- Add **rich text memories**
- Upload **images, audio, and video**
- Add **captions** to media
- Lock capsules until a **specific date & time**
- Real-time **countdown timers**
- Profile system with **unique avatars**
- Upload custom profile pictures

---

### 🔐 Access Control
- **Owner (Admin)**
  - Full control over capsule
  - Add/remove collaborators
  - Edit or delete capsule
- **Collaborators**
  - Add memories before unlock
- **Recipients**
  - View capsule contents after unlock

---

### 👥 Collaboration & Sharing
- Add collaborators by **email**
- Shared capsules for families, friends, or teams
- Owner shown as **Admin**
- Collaborators displayed with avatars

---

### 🎨 User Experience
- Modern, responsive UI
- Rich-text editor (bold, italic, lists, links)
- Media previews before upload
- Upload animations & success toasts
- Clean card-based dashboard layout

---

## 🏗️ Tech Stack

### Frontend
- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **React Quill**

### Backend
- **Node.js**
- **Express.js**
- **JWT Authentication**

### Database & Storage
- **MongoDB Atlas**
- **Cloudinary** (images, audio, video)

### Deployment
- **Vercel** (Frontend)
- **Render** (Backend)

---

## 📂 Project Structure

capsulr/
│
├── frontend/
│ ├── src/app/
│ ├── components/
│ ├── lib/
│ └── styles/
│
├── backend/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── config/
│ └── index.js
│
└── README.md


---

## 🖥️ Frontend Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **React Quill**
- **Client Components**

### Frontend Responsibilities
- Authentication handling
- Capsule creation & listing
- Real-time countdown updates
- Rich text editor for memories
- Media previews before upload
- Permission-based rendering
- Smooth animations & UX

---

## ⚙️ Backend Tech Stack

- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Multer**
- **Cloudinary**
- **Nodemailer (emails)**

### Backend Responsibilities
- Authentication & authorization
- Capsule lifecycle management
- Auto-unlock logic
- Media upload & storage
- Collaborator management
- Secure data persistence

---

## 🗄️ Database Models

### User

{
  name: String,
  email: String,
  password: String,
  profileImage: String
}

### Capsule

{
  title: String,
  theme: String,
  unlockAt: Date,
  owner: ObjectId,
  contributors: [ObjectId],
  recipients: [String],
  isLocked: Boolean,
  isUnlocked: Boolean
}

### Memory

{
  capsuleId: ObjectId,
  type: "text" | "image" | "audio" | "video",
  content: String,
  caption: String,
  createdBy: ObjectId
}


---

# 🔐 Authentication & Roles

Role	Permissions

Owner	Full control
Collaborator	Add/edit memories
Recipient	View after unlock


JWT tokens are stored securely in local storage and validated on every API request.


---

# ⏳ Capsule Locking Logic

Capsules are locked by default

Countdown runs in real time (frontend)

Backend auto-unlocks capsules after unlock time

Locked capsules:

Editable by owner & collaborators

Hidden from recipients

Unlocked capsules:

Visible to recipients

Read-only access


---

## ☁️ Media Upload Flow

1. User selects media file


2. Preview displayed instantly


3. File sent using FormData


4. Multer processes file


5. Cloudinary uploads file


6. Secure URL stored in MongoDB



👨‍💻 Author

Ayush
Full-stack Developer
Building meaningful products at the intersection of technology, memory, and human experience.

📜 License

Licensed under the MIT License
