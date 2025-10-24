# Project & Task Management System

A modern, AI-powered project and task management system built with the MERN stack and integrated with Google's Gemini AI for intelligent task summarization and Q&A capabilities.

## Features

- **Project Management**: Create, organize, and manage multiple projects
- **Kanban Board**: Drag-and-drop task management with customizable columns
- **AI Integration**: Gemini AI-powered task summarization and intelligent Q&A
- **User Authentication**: Secure user registration and login
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Live task updates and project synchronization

## Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Google Gemini AI** - AI integration

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **React Router** - Navigation
- **DnD Kit** - Drag and drop functionality

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Google Cloud Account** (for Gemini AI API access)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd assignment-devvoid
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

#### Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/taskmanager
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Gemini AI API
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
PORT=8000
NODE_ENV=development
```

#### Getting Gemini AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and add it to your `.env` file

#### Database Setup

**Option 1: Local MongoDB**

1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/taskmanager` as your `MONGODB_URI`

**Option 2: MongoDB Atlas (Recommended)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `<password>` with your database password
5. Use the connection string as your `MONGODB_URI`

#### Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal and navigate to the client directory:

```bash
cd client
npm install
```

#### Start the Frontend Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Running the Application

1. **Start the Backend**:

   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend** (in a new terminal):

   ```bash
   cd client
   npm run dev
   ```

3. **Access the Application**: Open your browser and go to `http://localhost:5173`

## Project Structure

```
assignment-devvoid/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and AI configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── server.js        # Main server file
│   ├── package.json
│   └── vercel.json         # Vercel deployment config
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/         # React contexts
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   └── main.tsx         # App entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Projects

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks

- `GET /api/tasks/:projectId` - Get all tasks for a project
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/move` - Move task between columns

### AI Features

- `POST /api/ai/summarize` - Get AI summary of project tasks
- `POST /api/ai/chat` - Chat with AI about tasks

## Deployment

### Backend Deployment (Vercel)

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Deploy from the backend directory:

   ```bash
   cd backend
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Frontend Deployment (Vercel)

1. Deploy from the client directory:

   ```bash
   cd client
   vercel
   ```

2. Update the backend URL in your frontend configuration

## Development

### Available Scripts

**Backend:**

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Secure API endpoints

## AI Features

The application integrates with Google's Gemini AI to provide:

- **Task Summarization**: Get AI-powered summaries of your project tasks
- **Intelligent Q&A**: Ask questions about your tasks and get contextual answers
- **Smart Task Management**: AI can help create, update, and organize tasks

## License

This project is licensed under the MIT License.
