# Mauli Car World - Car Parts & Service Management System

## Overview
Mauli Car World is a comprehensive full-stack web application for auto repair shops. It efficiently manages car parts inventory, customer relationships, service workflows, employee management, and sales tracking. The system supports multiple user roles (administrators, inventory managers, sales executives, HR managers, and service staff) with tailored views and permissions, providing a professional dashboard for all automotive service business operations. The business vision is to streamline operations for auto repair shops, enhancing efficiency and customer satisfaction, with market potential in small to medium-sized repair businesses.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React (18+)** and **Vite**, utilizing **TypeScript** for type safety and **Wouter** for client-side routing. **TanStack Query** manages server state. The UI uses **Shadcn/ui** components based on **Radix UI primitives** and styled with **Tailwind CSS**, following a dark-mode-first, information-dense design. It includes a custom theme provider, custom hooks, and maintains a consistent aesthetic with thick orange borders and gradient backgrounds for cards and vehicle images. Features include WhatsApp-style image cropping for employee photos and enhanced customer details displays.

### Backend Architecture
The backend is an **Express.js** RESTful API server, written in **TypeScript**. It features a middleware-based request processing system for logging, error handling, and JSON parsing. API endpoints follow resource-based patterns for CRUD operations. An inactivity timeout system automatically logs out non-admin users after 30 minutes.

### Database Layer
The application exclusively uses **MongoDB** with **Mongoose ODM**. A singleton pattern manages the connection. Schema designs incorporate validation, hooks, virtual fields, and reference-based relationships.

### Data Models & Schemas
Core entities include Product (with multi-image support, variants, barcode, compatibility, warranty, and detailed inventory tracking), RegistrationCustomer (with referral source tracking and auto-generated IDs), RegistrationVehicle (linked to customers, with **auto-generated unique Vehicle IDs** in format VEH001, VEH002, etc., plus variant (Top/Base), color, and dynamic fields like selected parts and chassis numbers), Employee (with auto-generated IDs, photo upload, status management, and performance logs), ServiceVisit (with before/after image support), Order, InventoryTransaction, ProductReturn, Supplier, PurchaseOrder, Attendance, Leave, Task, CommunicationLog, Feedback, **Invoice** (with auto-numbering INV/2025/0001, discount/coupon support, tax calculation, approval workflow, and multi-payment tracking), **Coupon** (with discount codes, usage limits, and expiry dates), and **Warranty** (auto-linked to invoices for products with warranty). **Zod** is used for validation schemas for `RegistrationCustomer` and `RegistrationVehicle`. The `isNew` field was renamed to `isNewVehicle` to resolve Mongoose warnings.

**Vehicle ID System**: Each vehicle receives a unique, auto-generated Vehicle ID (VEH001, VEH002, etc.) using a Counter-based sequence. This ID serves as the primary reference for all service records, invoices, and warranty tracking. Vehicle records also include variant (Top/Base) and color fields for comprehensive vehicle tracking.

### Authentication & Authorization
The system uses **session-based authentication** with Express sessions and secure HTTP-only cookies. Password hashing is handled by **bcryptjs**. **Role-Based Access Control (RBAC)** defines five distinct roles: Admin, Inventory Manager, Sales Executive, HR Manager, and Service Staff, each with granular permissions. Two-step OTP verification is implemented for login.

### UI/UX Decisions
Global card styling features `border-2 border-orange-300 dark:border-orange-700`. Vehicle images use `border-2 border-orange-300 dark:border-orange-700`, `object-contain`, and gradient backgrounds. Responsive layouts are used for dashboards. Forms feature conditional fields and dynamic dropdowns. Image uploads have live previews, base64 encoding, and validation. Employee photo sizes are increased, and documents are viewed in a dedicated viewer.

### Multi-Vehicle Customer Registration
The customer registration flow supports adding multiple vehicles per customer. After entering customer information and OTP verification, users can add vehicles one at a time. The form displays the count of registered vehicles and provides options to either "Add Another Vehicle" or "Complete Registration" (shown after at least one vehicle is added). The customer dashboard displays a "+X more" badge on customer cards when they have multiple vehicles, showing additional vehicles beyond the primary one.

### Complete Activity Tracking System
A comprehensive activity logging system tracks all user actions (CRUD operations on Employees, Products, Orders, Service Visits, Suppliers, Purchase Orders, and user login/logout) with an `ActivityLog` model. An `ActivityFeed` component in the admin dashboard displays real-time activities with role-based badge colors, action-based indicators, resource icons, and "time ago" formatting. API endpoints for fetching and creating activity logs are provided.

### Invoicing & Billing Module
A comprehensive invoicing system with auto-generated invoice numbers (INV/2025/0001 format), multi-payment tracking (UPI, Cash, Card, Net Banking, Cheque), and approval workflows. **Features**: Invoice generation from service visits, discount/coupon application, tax calculation, admin approval/rejection, payment recording with transaction history, automatic warranty creation on approval, and notification stubs for WhatsApp/Email delivery. **PDF Generation**: Automatic professional PDF generation upon invoice approval, including customer details, vehicle information, itemized charges, tax breakdown, and payment details. PDFs are stored and accessible via download endpoint, with on-demand regeneration for legacy invoices. **Role-Based Access**: Admin has full control (create, approve, reject, manage coupons), Sales Executive can create invoices and record payments. **Razorpay Integration**: Stub implementation included for future payment gateway integration.

### API Logging & Monitoring
The application features a comprehensive dual-layer logging system for production debugging and monitoring:

**Server-Side Logging**:
- All API requests logged with method, path, status code, duration, and response data
- Enhanced error handling with detailed stack traces and context (development mode)
- Production error responses sanitized to prevent sensitive data exposure
- Automatic activity logging for all CRUD operations via ActivityLog model

**Browser Console Logging**:
- API responses logged to browser console via custom X-API-Log headers
- Color-coded by status (blue for requests, green for success, red for errors, purple for duration)
- Includes full request/response metadata for debugging
- Response payloads truncated to 500 chars and headers limited to 4KB to prevent size issues
- Automatic logging for all fetch requests via TanStack Query integration

**Error Handling**:
- Centralized error handler utility for consistent logging
- Production mode returns generic "An error occurred" messages
- Development mode exposes full error details including stack traces
- All errors logged server-side with user context and timestamps

### Deployment Configuration
The application is deployment-ready for both Replit and Vercel platforms:

**Replit Deployment** (Recommended):
- Uses built-in deployment tools with automatic build/run configuration
- In-memory session storage (MemoryStore) for development
- MongoDB connection via environment variable (MONGODB_URI)
- Session management with secure HTTP-only cookies
- Deployment config: `npm run build` → `npm run start`

**Vercel Deployment** (Serverless):
- Serverless architecture with Express functions
- PostgreSQL-backed session storage (connect-pg-simple) required for session persistence
- MongoDB connection caching for optimal serverless performance
- CORS headers configured for safe cross-origin requests
- API routes handled via `/api/index.ts` serverless function
- Static files served from `/dist/client` directory

**Environment Variables**:
- `MONGODB_URI`: MongoDB connection string (required)
- `SESSION_SECRET`: Secure session encryption key (required)
- `DATABASE_URL`: PostgreSQL connection string (Vercel only)
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 5000)

**Security Features**:
- Production error responses sanitized
- Session secrets environment-based
- MongoDB credentials secured via environment variables
- CORS properly configured for each deployment platform

## External Dependencies

-   **Database**: MongoDB (via Mongoose)
-   **UI Components**: Radix UI, Shadcn/ui, Tailwind CSS, Lucide React
-   **State & Data Management**: TanStack Query, React Hook Form, Zod
-   **Date & Time**: date-fns
-   **PDF Generation**: PDFKit
-   **Development Tools**: Vite, esbuild, TypeScript
-   **Deployment**: Vercel
-   **Security**: bcryptjs