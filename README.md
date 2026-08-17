# Learning Center Management System (LCMS)

A full-stack Learning Center Management System designed to manage students, teachers, parents, secretaries, groups, attendance, exams, payments, schedules, notifications, and authentication in one platform.

## Overview

LCMS is built for educational centers that need a centralized system for managing academic and administrative operations.

The system supports multiple user roles with role-based access control:

* **Admin**
* **Teacher**
* **Student**
* **Parent**
* **Secretary**

Each role has its own permissions and dashboard.

## Main Features

### Authentication & Authorization

* User registration and login
* JWT-based authentication
* Password hashing with bcrypt
* Role-based authorization
* Teacher approval workflow
* Protected routes
* Token blacklist support
* Forgot/reset password flow
* Email-based password reset

### Student Management

* Student accounts and profiles
* Student information management
* Student codes for identification
* Student-group assignment
* Academic data management

### Teacher Management

* Teacher registration
* Admin approval system
* Teacher profile management
* Teacher dashboard
* Teacher-created secretary accounts
* Access to assigned groups and students

### Parent Management

* Parent account creation
* Linking parents with students
* Monitoring student academic information
* Attendance and results tracking

### Secretary Management

* Secretary accounts linked to teachers
* Administrative access based on assigned permissions

### Groups & Classes

* Create and manage grades and groups
* Assign teachers and students
* Manage group-related information
* Track students within each group

### Attendance

* Record student attendance
* Attendance sessions
* Manual attendance
* QR-based attendance support
* Attendance history and reports

### Exams & Results

* Create exams
* Assign exams to groups
* Record student results
* View student performance
* Manage grades and exam results

### Payments

* Manage student payments
* Track payment status
* Payment records and history

### Schedule

* Manage classes and schedules
* Organize group sessions and teacher schedules

### Notifications

* System notifications
* Real-time notifications using Socket.IO
* Real-time communication between server and clients

### Admin Dashboard

The admin can manage the main system entities, including:

* Teachers
* Students
* Parents
* Secretaries
* Groups
* Exams
* Payments
* System-level data

## System Roles

| Role      | Main Responsibilities                                                                |
| --------- | ------------------------------------------------------------------------------------ |
| Admin     | Manage the whole system, approve teachers, manage users and system data              |
| Teacher   | Manage assigned students/groups, attendance, exams, results, and academic activities |
| Student   | View personal academic information, attendance, results, schedule, and payments      |
| Parent    | Monitor linked student's attendance, results, schedule, and payments                 |
| Secretary | Handle administrative tasks according to assigned permissions                        |

## Technology Stack

### Backend

* Node.js
* Express.js
* JavaScript
* MongoDB
* Mongoose
* MongoDB Atlas
* JWT
* bcrypt / bcryptjs
* Express Validator
* Joi
* Multer
* Socket.IO
* Nodemailer / SMTP
* Morgan
* CORS

### Frontend

* Angular
* TypeScript
* HTML
* CSS

### Development Tools

* Git & GitHub
* Postman
* Hoppscotch
* MongoDB Compass
* MongoDB Atlas
* VS Code

## Teacher Approval Flow

Teachers require admin approval before accessing protected teacher features.

```text
Teacher Signup
      │
      ▼
Account Created
      │
      ▼
isApproved = false
      │
      ▼
Admin Reviews Teacher
      │
 ┌────┴────┐
 ▼         ▼
Approve   Reject
 │
 ▼
Teacher Can Access
Protected Features
```

## Frontend Responsibilities

* User interface
* Angular routing
* Forms
* Client-side validation
* API integration
* Authentication state
* Displaying system data
* Role-based dashboards
* Real-time notification handling

## Backend Responsibilities

* REST API
* Authentication
* Authorization
* Business logic
* Request validation
* Database operations
* Security
* Real-time communication
* Notifications
* API responses

## Project Status

**Development in progress**

The project is being developed as a full-stack Learning Center Management System using Angular for the frontend and Node.js/Express for the backend, with MongoDB as the database.

## Team

Developed as a collaborative team project.

Main development areas include:

* Authentication & Users
* Students & Teachers
* Parents & Secretaries
* Groups & Grades
* Attendance
* Exams & Results
* Payments
* Notifications
* Frontend Dashboards
* Backend API Integration

## License

This project is developed for educational and project purposes.

# Getting Started

Follow these instructions to set up and run the project locally on your machine.

## Prerequisites

Make sure you have the following installed on your system:

* **Node.js** (v18 or higher)
* **npm** (Node Package Manager)
* **Angular CLI**
* **MongoDB** (Local instance or MongoDB Atlas account)

Install Angular CLI if it is not already installed:

```bash
npm install -g @angular/cli
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ahmedramadan14/Learning-Center-Management-System-LCMS-.git
cd Learning-Center-Management-System-LCMS-
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install the backend dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory and configure the required environment variables.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password

CLIENT_URL=http://localhost:4200
```

Start the backend development server:

```bash
npm run dev
```

The backend will normally run on:

```text
http://localhost:3000
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the Angular development server:

```bash
ng serve
```

The frontend will normally run on:

```text
http://localhost:4200
```

## Running the Project

After starting both servers:

```text
Frontend
http://localhost:4200
       │
       │ HTTP / REST API
       ▼
Backend
http://localhost:3000
       │
       ▼
MongoDB
```

Open the frontend URL in your browser to use the system.

## Environment Variables

Do not commit your `.env` file to GitHub.

Make sure sensitive values such as:

* Database credentials
* JWT secret
* SMTP credentials
* API keys

are stored only in environment variables.

## API Testing

The backend APIs can be tested using:

* **Postman**
* **Hoppscotch**

For protected endpoints, include the JWT token in the request headers:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Git Workflow

The project uses Git and GitHub for version control.

Recommended workflow:

```text
main
  │
  └── dev
       │
       ├── feature/auth
       ├── feature/students
       ├── feature/attendance
       ├── feature/exams
       ├── feature/payments
       └── feature/notifications
```

Create a new feature branch:

```bash
git checkout dev
git pull origin dev

git checkout -b feature/your-feature
```

After completing the feature:

```bash
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

Then create a Pull Request targeting the `dev` branch.
