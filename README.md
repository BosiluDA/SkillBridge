========================================
        SKILLBRIDGE - README
========================================

Project Title   : SkillBridge - A Comparative Study of Simple and 
                  Weighted Trust Scoring Systems in Peer Skill 
                  Exchange Platforms

Student         : H.G.A.I. Bosilu
Student ID      : 2541569
Supervisor      : Mrs. Dilushini Fernando
University      : University of Bedfordshire
Course          : BSc (Hons) Software Engineering

Live URL        : https://skill-bridge-c8e8wsuvq-ac-me6.vercel.app/
Backend API     : https://skillbridge-618z.onrender.com/api
GitHub Repo     : https://github.com/BosiluDA/SkillBridge

----------------------------------------
PROJECT OVERVIEW
----------------------------------------

SkillBridge is a full-stack MERN web application built to compare 
two trust scoring systems in a peer skill exchange environment.

Users who register are automatically assigned to:
  - Group A: Simple Star Rating (average x 20)
  - Group B: Weighted Trust Score (recency + reviewer trust + 
             completion rate)

The goal is to find out which system better reflects how 
trustworthy a user actually is.

----------------------------------------
TECH STACK
----------------------------------------

Frontend  : React.js (Create React App)
Backend   : Node.js + Express.js
Database  : MongoDB Atlas
Auth      : JWT (JSON Web Tokens) + bcryptjs
Hosting   : Vercel (frontend), Render.com (backend)
Tools     : Postman, GitHub Desktop, Power BI


----------------------------------------
HOW TO RUN LOCALLY
----------------------------------------

REQUIREMENTS:
  - Node.js v18 or higher
  - npm
  - MongoDB Atlas account (or local MongoDB)

STEP 1 - Clone the repository
  git clone https://github.com/BosiluDA/SkillBridge.git
  cd SkillBridge

STEP 2 - Set up the backend
  cd server
  npm install

  Create a .env file in the server folder with:
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=5000

  Start the backend:
    npm start

  Backend runs on: http://localhost:5000

STEP 3 - Set up the frontend
  Open a new terminal window
  cd client
  npm install
  npm start

  Frontend runs on: http://localhost:3000

----------------------------------------
API ENDPOINTS
----------------------------------------

AUTH
  POST   /api/auth/register       Register new user
  POST   /api/auth/login          Login and get JWT token
  GET    /api/auth/me             Get current user (auth required)

USERS
  GET    /api/users               Get all users
  GET    /api/users?search=       Search users by skill
  GET    /api/users/:id           Get user by ID
  PUT    /api/users/profile       Update own profile

EXCHANGES
  POST   /api/exchanges           Create exchange request
  GET    /api/exchanges           Get user's exchanges
  PATCH  /api/exchanges/:id/status  Update exchange status

REVIEWS
  POST   /api/reviews             Submit a review
  GET    /api/reviews/user/:id    Get reviews for a user

MESSAGES
  POST   /api/messages            Send a message
  GET    /api/messages/:exchangeId  Get messages for an exchange

ADMIN (admin token required)
  GET    /api/admin/stats         Platform statistics
  GET    /api/admin/users         All users
  GET    /api/admin/exchanges     All exchanges
  GET    /api/admin/export        Export data as JSON

----------------------------------------
TEST ACCOUNTS
----------------------------------------

Admin:
  Email    : admin@skillbridge.com
  Password : admin123

Test User 1:
  Email    : sarah@skillbridge.com
  Password : password123

Test User 2:
  Email    : james@skillbridge.com
  Password : password123

----------------------------------------
ENVIRONMENT VARIABLES
----------------------------------------

The .env file is NOT included in this repository for security.
You must create your own with the following keys:

  MONGO_URI     = MongoDB Atlas connection string
  JWT_SECRET    = Any secure random string
  PORT          = 5000 (or any available port)

----------------------------------------
NOTES
----------------------------------------

- The backend is hosted on Render.com free tier. It may take 
  20-30 seconds to respond on first load after inactivity.

- node_modules folders are excluded from this zip. Run 
  npm install inside both /client and /server before starting.

- The .env file is excluded. You must create your own to 
  run the project locally.


