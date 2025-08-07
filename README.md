# HireMind Frontend

A React TypeScript frontend for the HireMind job search platform, fully integrated with the backend API.

## Backend - https://github.com/iampratt/HireMind-Backend.git

## Features

- **Authentication**: Sign up, login, and profile management
- **Resume Management**: Upload, view, and manage resumes with AI-powered extraction
- **Job Search**: Search jobs with advanced filters and get AI-powered recommendations
- **Dashboard**: Overview of profile completeness and recent activity
- **Modern UI**: Responsive design with dark/light theme support

## Backend Integration

This frontend is fully integrated with the HireMind backend API. All endpoints from the backend are implemented:

### Authentication Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile and resume list

### Resume Endpoints

- `POST /resume/upload` - Upload and parse resume
- `GET /resume` - Get all user resumes
- `GET /resume/:id` - Get specific resume details
- `DELETE /resume/:id` - Delete a resume
- `POST /resume/:id/reparse` - Re-parse resume with updated AI extraction

### Job Search Endpoints

- `GET /jobs/search` - Search jobs with filters
- `GET /jobs/:jobId/details` - Get detailed job information
- `GET /jobs/recommendations` - Get AI-powered job recommendations
- `GET /jobs/recommendations/:resumeId` - Get recommendations for specific resume

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Make sure the backend server is running on `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard and header components
│   ├── Jobs/          # Job search components
│   ├── Resume/        # Resume management components
│   └── UI/            # Reusable UI components
├── contexts/          # React contexts (Auth, Theme)
├── hooks/             # Custom React hooks
├── services/          # API service layer
├── types/             # TypeScript type definitions
└── App.tsx           # Main application component
```

## API Service Layer

The `src/services/api.ts` file contains a comprehensive API service that handles all backend communication with proper error handling and TypeScript types.

## Key Components

- **AuthScreen**: Handles user registration and login
- **Dashboard**: Shows user stats and quick actions
- **ResumeUpload**: Drag-and-drop resume upload with AI extraction
- **ResumeList**: Manage and view uploaded resumes
- **JobSearch**: Search jobs and get AI recommendations
- **Header**: Navigation and user menu

## Environment Setup

The frontend expects the backend to be running on `http://localhost:3000`. You can modify the API base URL in `src/services/api.ts` if needed.

## Build and Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls
