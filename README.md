# Funeral Home Management System (FHMS)

The Funeral Home Management System is a comprehensive web application designed to streamline and manage funeral home operations. It provides a centralized platform for funeral homes to manage services, bookings, documents, payments, and client communications.

## Table of Contents
1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
   - [Technologies](#backend-technologies)
   - [API Routes](#api-routes)
   - [Database Schema](#database-schema)
3. [Frontend Architecture](#frontend-architecture)
   - [Technologies](#frontend-technologies)
   - [User Interfaces](#user-interfaces)
   - [Components](#components)
4. [Features and Functionality](#features-and-functionality)
5. [Integration Between Frontend and Backend](#integration-between-frontend-and-backend)
6. [Installation and Setup](#installation-and-setup)
7. [Usage](#usage)
8. [Security](#security)
9. [Deployment](#deployment)

## Overview

### Project Description

The Funeral Home Management System (FHMS) is a comprehensive digital solution designed to address the unique challenges faced by funeral homes in managing their operations, services, and client interactions. In an industry where compassion, efficiency, and attention to detail are paramount, traditional paper-based processes and disconnected systems often lead to inefficiencies, communication gaps, and administrative burden during an already sensitive time for clients.

FHMS aims to solve these critical challenges by:

1. **Streamlining Administrative Workflows**: Reducing the paperwork burden by digitizing document management, including death certificates, burial permits, and contractual agreements, allowing staff to focus more on client care and less on administrative tasks.

2. **Improving Client Experience**: Providing families with a transparent, accessible platform to arrange services, track progress, submit required information, and make payments—all from the comfort of their homes during a difficult time.

3. **Enhancing Operational Efficiency**: Coordinating the complex logistics between different departments (morgue, transport, ceremony planning) through digital task management and real-time status updates.

4. **Ensuring Regulatory Compliance**: Maintaining proper documentation and audit trails to meet strict regulatory requirements in the funeral industry.

5. **Providing Data-Driven Insights**: Offering analytics and reporting tools to help funeral home management make informed decisions about service offerings, resource allocation, and financial planning.

The system serves as a bridge between the sensitive, human-focused nature of funeral services and the need for efficient, accurate business operations in modern funeral homes of all sizes.

### Role-Based Functionality

The Funeral Home Management System (FHMS) provides different user experiences and capabilities based on role:

- **Admin Users**: Complete system management including user management, service offerings, document review, and financial reports
- **Client Users**: Book services, upload and access documents, make payments, and communicate with funeral home staff
- **Morgue Attendants**: Manage deceased records, body preparation tasks, and transport logistics

The system automates workflows, enhances communication, and provides transparent service management for all stakeholders involved in the funeral process.

## Backend Architecture

### Backend Technologies

- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **SQLite3**: Database storage
- **Multer**: File upload handling
- **JSON Web Tokens (JWT)**: Authentication
- **bcrypt**: Password hashing
- **Express Validator**: Request validation
- **PDFKit**: PDF generation for reports and documents
- **ExcelJS**: Excel report generation

### API Routes

#### Authentication Routes (`/auth`)
- `POST /auth/register`: Register a new client user
- `POST /auth/login`: Authenticate and receive JWT token
- `GET /auth/me`: Get current user information
- `POST /auth/staff`: Create staff user (Admin only)

#### User Routes (`/users`)
- `GET /users`: Get all users (Admin only)
- `GET /users/:id`: Get specific user by ID
- `PATCH /users/:id`: Update user information
- `DELETE /users/:id`: Delete user (Admin only)
- `PATCH /users/:id/role`: Change user role (Admin only)

#### Document Routes (`/documents`)
- `GET /documents`: Get documents with filtering and pagination
- `GET /documents/my`: Get current user's documents
- `GET /documents/:id`: Get specific document details
- `GET /documents/:id/download`: Download a document
- `POST /documents`: Upload a new document
- `PATCH /documents/:id/status`: Update document status (Admin only)
- `DELETE /documents/:id`: Delete a document

#### Booking Routes (`/bookings`)
- `GET /bookings`: Get all bookings with filtering
- `GET /bookings/my`: Get current user's bookings
- `GET /bookings/:id`: Get specific booking details
- `POST /bookings`: Create a new booking
- `PATCH /bookings/:id`: Update booking information
- `PATCH /bookings/:id/status`: Update booking status
- `DELETE /bookings/:id`: Cancel a booking

#### Service Routes (`/services`)
- `GET /services`: Get all available services
- `GET /services/:id`: Get specific service details
- `POST /services`: Add new service (Admin only)
- `PUT /services/:id`: Update service (Admin only)
- `DELETE /services/:id`: Delete service (Admin only)

#### Payment Routes (`/payments`)
- `GET /payments`: Get all payments with filtering
- `GET /payments/my`: Get current user's payments
- `GET /payments/:id`: Get payment details
- `POST /payments`: Create a payment record
- `GET /payments/report`: Generate financial reports (Admin only)

#### Deceased Routes (`/deceased`)
- `GET /deceased`: Get all deceased records
- `GET /deceased/:id`: Get specific deceased record
- `POST /deceased`: Add new deceased record
- `PATCH /deceased/:id`: Update deceased information
- `DELETE /deceased/:id`: Delete deceased record

#### Feedback Routes (`/feedback`)
- `GET /feedback`: Get all feedback (Admin only)
- `POST /feedback`: Submit feedback
- `GET /feedback/public`: Get public testimonials

### Database Schema

The system uses SQLite with the following key tables:

1. **users**: User accounts with authentication details and role management
2. **services**: Available funeral services with descriptions and pricing
3. **bookings**: Service bookings linking clients to services
4. **booking_services**: Services included in each booking
5. **deceased**: Information about deceased individuals
6. **documents**: Document management with file paths and metadata
7. **payments**: Payment records for bookings
8. **feedback**: Client feedback and testimonials
9. **activity_logs**: System activity tracking

## Frontend Architecture

### Frontend Technologies

- **React**: UI library
- **React Router**: Routing and navigation
- **Redux**: State management
- **Tailwind CSS**: Styling framework
- **Lucide React**: Icon library
- **Sonner**: Toast notifications
- **Axios**: HTTP client for API communication

### User Interfaces

#### Public Pages
- **Landing Page**: Introduction to funeral home services
- **Login/Register**: User authentication forms

#### Client Dashboard
- **Dashboard Overview**: Summary of bookings and documents
- **Book Service**: Service selection and booking
- **My Bookings**: View and manage bookings
- **Booking Details**: Detailed view of specific booking
- **Documents**: Upload and manage personal documents
- **Payments**: View and make payments
- **Messages**: Communication with staff

#### Admin Dashboard
- **Dashboard Overview**: System statistics and activity
- **User Management**: Add, edit, and manage user accounts
- **Services Management**: Configure service offerings
- **Documents**: Review and approve uploaded documents
- **Financial Management**: Track payments and generate reports
- **Settings**: System configuration
  - General Settings
  - Notification Settings
  - Security Settings
  - Data Retention Settings

#### Morgue Attendant Dashboard
- **Dashboard Overview**: Tasks and assignments
- **Body Management**: Track and manage deceased records
- **Preparation Tasks**: Workflow for body preparation
- **Transport**: Transport logistics management
- **Documents**: Access to relevant documents

### Components

The system features reusable components such as:

- **DashboardHeader**: Consistent header across dashboard pages
- **Sidebar**: Role-based navigation menu
- **DocumentManager**: Document upload and management
- **ServiceBooking**: Service selection and booking workflow
- **BodyPreparationTracker**: Workflow tracker for morgue tasks

## Features and Functionality

### Document Management
- Upload and categorize documents (death certificates, burial permits, etc.)
- Document review workflow with approval statuses
- Document access control based on user permissions
- Download functionality for easy access

### Service Booking
- Browse available services with descriptions and pricing
- Create and customize service bookings
- Track booking status and updates
- Manage deceased information linked to bookings

### Financial Management
- Process and track payments
- Generate invoices and receipts
- Financial reporting with customizable parameters
- Export financial data to Excel format

### User Management
- Role-based access control
- User registration and authentication
- Password security policies
- Staff account management

### Communication
- Internal messaging system
- Notification system (email, SMS)
- Configurable alert preferences

### System Configuration
- Facility information management
- Date/time format settings
- Security settings (password policies, session management)
- Data retention policies
- Backup management

### Reporting
- Document status reports
- Financial reports
- Service utilization analytics
- Activity logging and audit trails

## Integration Between Frontend and Backend

The FHMS employs a modern client-server architecture:

1. **API Communication**: The frontend communicates with the backend via RESTful API endpoints using Axios HTTP client
2. **Authentication Flow**: 
   - Users authenticate via the login form
   - The backend validates credentials and issues a JWT token
   - Token is stored in localStorage/sessionStorage
   - Subsequent API requests include the token in Authorization header

3. **Data Flow**:
   - Frontend components make API calls to fetch or modify data
   - Backend validates requests and performs database operations
   - Responses are processed and rendered in the UI

4. **File Handling**:
   - Documents are uploaded via multipart/form-data requests
   - Backend stores files in the uploads directory and metadata in the database
   - Download links are generated for secure file access

5. **Error Handling**:
   - Backend returns appropriate HTTP status codes and error messages
   - Frontend displays user-friendly error notifications using Sonner toast
   - Form validation occurs on both client and server sides

6. **Real-time Updates**:
   - Polling or webhook mechanisms for notification updates
   - Status changes reflect immediately in the UI

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- PNPM package manager

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Create .env file with required variables:
   ```
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

4. Initialize the database:
   ```
   node src/db/database.js
   ```

5. Create admin user:
   ```
   node scripts/create-admins.js
   ```

6. Start the server:
   ```
   pnpm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Configure API base URL (if needed) in `src/api/config.js`

4. Start the development server:
   ```
   pnpm run dev
   ```

## Usage

### Admin Access
1. Log in using admin credentials
2. Navigate through the admin dashboard to manage:
   - Users
   - Services
   - Documents
   - Reports
   - System settings

### Client Usage
1. Register for a new account or log in
2. Browse available services
3. Create bookings for funeral services
4. Upload required documents
5. Make payments
6. Track service status

### Morgue Attendant Usage
1. Log in with morgue attendant credentials
2. View assigned tasks
3. Update body preparation status
4. Manage document requirements
5. Coordinate with transport

## Security

The FHMS implements several security measures:

- **Authentication**: JWT-based authentication with expiry
- **Password Security**: bcrypt hashing with configurable policies
- **Authorization**: Role-based access control for all routes
- **Input Validation**: Comprehensive validation using Express Validator
- **File Security**: File type validation and size limits
- **Session Management**: Configurable timeouts and security policies
- **Audit Logging**: Activity tracking for security monitoring

## Deployment

### Production Deployment Considerations
1. Use a production-grade database (PostgreSQL or MySQL)
2. Configure proper HTTPS with a valid certificate
3. Implement rate limiting for API endpoints
4. Set up automated backups for database and uploaded files
5. Use environment-specific configuration
6. Implement monitoring and logging solutions
7. Consider containerization with Docker for consistent deployment
