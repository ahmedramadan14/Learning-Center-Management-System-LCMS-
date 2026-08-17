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
* Firebase-based notification support
* Real-time notification capability

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

- Node.js
- Express.js
- JavaScript
- MongoDB
- Mongoose
- MongoDB Atlas
- JWT
- bcrypt / bcryptjs
- Express Validator
- Joi
- Multer
- Socket.IO
- Nodemailer / SMTP
- Morgan
- CORS

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



### Teacher Approval Flow

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

### Frontend Responsibilities

* User interface
* Angular routing
* Forms
* Client-side validation
* API integration
* Authentication state
* Displaying system data
* Role-based dashboards

### Backend Responsibilities

* REST API
* Authentication
* Authorization
* Business logic
* Request validation
* Database operations
* Security
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
