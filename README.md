# Mockzy

Mockzy is a full-stack web application for scheduling and managing mock interviews. It provides a platform for candidates to book interviews with experienced interviewers, upload and analyze resumes, and track their progress. Interviewers can manage their slots, update their profiles, and mark interviews as complete. The system includes role-based access for candidates, interviewers, and admins.

## Features

### For Candidates
- Register and login securely
- Upload resume (PDF) for automated analysis and expertise classification
- Browse, filter, and book available interview slots based on your expertise level
- View and manage your bookings (cancel if needed)
- Get alternative slot suggestions if a conflict is detected

### For Interviewers
- Register and login securely
- Create and update a detailed profile (bio, skills, certifications, etc.)
- Create, view, and manage interview slots (date, time, duration, mode, expertise level)
- Mark interviews as complete
- View statistics: total, available, booked, and completed slots

### For Admins
- View all slots in the system
- Detect and view conflicting bookings

### General
- JWT-based authentication and role-based access control
- Responsive, modern UI built with React, Ant Design, and Flowbite
- Toast notifications for user feedback
- RESTful API backend with Express and PostgreSQL

## Tech Stack
- **Frontend:** React, Ant Design, Flowbite, React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL
- **Authentication:** JWT

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL

### Setup

#### 1. Clone the repository
```bash
git clone <repo-url>
cd Mockzy
```

#### 2. Backend Setup
```bash
cd backend
npm install
# Configure your PostgreSQL credentials in .env
npm start
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

#### 4. Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Folder Structure
- `backend/` - Express API, database models, controllers, routes
- `frontend/` - React app, pages, components, context, styles

## Environment Variables
Create a `.env` file in the `backend/` directory with your PostgreSQL credentials:
```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=mockzy
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

## License
MIT

---
Feel free to contribute or open issues for improvements!
