# User Management + Patient Registration + Digital Health Card Module

**Developer:** S.M.D.M. Bandara (IT22141842)  
**System:** Smart Healthcare System for Urban Hospitals

## Overview

This module provides complete user management with role-based access control (Admin/Staff/Patient), patient registration by staff, and automated digital health card generation with QR codes.

## Features

### ✅ Implemented Features

1. **Multi-Role Authentication System**
   - Common login page for all user types
   - JWT-based authentication
   - Role-based route protection
   - Auto-redirect to appropriate dashboards

2. **Admin Portal** (`/admin`)
   - Add/edit/deactivate staff members
   - View all staff with search functionality
   - View all registered patients (read-only)
   - System statistics dashboard
   - Generate temporary passwords for staff

3. **Staff Portal** (`/staff`)
   - Register new patients with full details
   - Auto-generate patient credentials (mobile as username)
   - Automatic health card generation with QR code
   - View patients registered by staff member
   - Search and filter patient records
   - View/print patient health cards

4. **Patient Portal** (`/patient`)
   - View personal profile information
   - Display digital health card with QR code
   - Download/print health card
   - Edit profile (email, address, password)
   - Secure access to own data only

5. **Digital Health Card System**
   - Unique card number generation (HC-YYYY-NNNN format)
   - QR code with encrypted patient data
   - Card verification endpoint
   - Print and download capabilities

6. **Security Features**
   - Password hashing with bcrypt
   - JWT token-based authentication
   - Role-based access control
   - Sri Lankan NIC validation
   - Unique constraint checks (email, phone, NIC)

7. **Email Notifications**
   - Automated credential delivery to patients
   - Professional HTML email templates
   - Password and login instructions included

## Project Structure

### Backend (`backend/src/`)

```
models/
├── userModel.js          # Updated with status field
├── Patient.js            # Updated with userId, nic, registeredBy
├── Staff.js              # New: Staff model
└── HealthCard.js         # New: Health card with QR

controllers/
├── adminController.js    # Admin operations
├── staffController.js    # Staff operations
├── patientController.js  # Patient operations
└── healthCardController.js # Card verification

routes/
├── adminRoutes.js        # Admin API routes
├── staffRoutes.js        # Staff API routes
├── patientRoutes.js      # Patient API routes
└── healthCardRoutes.js   # Card verification route

services/
├── emailService.js       # Email sending with nodemailer
└── qrService.js          # QR code generation & encryption

utils/
├── passwordGenerator.js  # Secure password generation
├── nicValidator.js       # Sri Lankan NIC validation
└── cardNumberGenerator.js # Unique card number generation

seeds/
└── createAdmin.js        # Admin account seed script
```

### Frontend (`frontend/src/`)

```
context/
└── AuthContext.jsx       # Authentication state management

pages/
├── Login.jsx             # Common login page
├── admin/
│   ├── AdminDashboard.jsx
│   ├── StaffManagement.jsx
│   └── PatientOverview.jsx
├── staff/
│   ├── StaffDashboard.jsx
│   ├── PatientRegistration.jsx
│   └── PatientList.jsx
└── patient/
    └── PatientPortal.jsx

components/
├── common/
│   └── ProtectedRoute.jsx  # Role-based route guard
├── admin/
│   ├── StatsCards.jsx
│   ├── StaffTable.jsx
│   └── AddStaffModal.jsx
├── staff/
│   ├── CredentialsModal.jsx
│   └── HealthCardPreviewModal.jsx
└── patient/
    ├── HealthCardDisplay.jsx
    └── EditProfileModal.jsx
```

## Installation & Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create .env file with the following:
```

**Required Environment Variables:**

```env
# Database
MONGO_URI=mongodb://localhost:27017/smart-healthcare

# Server
PORT=5000

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES=24h

# Email Service (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Smart Healthcare <noreply@healthcare.com>

# QR Code Encryption
QR_SECRET=your-qr-encryption-secret

# Admin Seed
ADMIN_USERNAME=admin@hospital.com
ADMIN_PASSWORD=Admin@123

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Gmail Setup for Emails:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASS`

### 2. Create Admin Account

```bash
npm run seed:admin
```

This creates the first admin account using credentials from `.env`.

### 3. Start Backend Server

```bash
npm run dev
```

Server runs on http://localhost:5000

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Frontend runs on http://localhost:5173

## Usage Guide

### Step 1: Admin Login

1. Navigate to http://localhost:5173
2. Login with admin credentials:
   - Username: `admin@hospital.com` (or your ADMIN_USERNAME)
   - Password: `Admin@123` (or your ADMIN_PASSWORD)

### Step 2: Add Staff (Admin)

1. Click on "Staff Management" tab
2. Click "Add Staff" button
3. Fill in staff details:
   - Full Name
   - Email
   - Contact Number
   - Position (e.g., Nurse, Receptionist)
   - Username (for login)
4. Submit - temporary password is generated automatically
5. **Important:** Save the displayed username and password to share with staff

### Step 3: Staff Login & Patient Registration

1. Staff logs in with provided credentials
2. Click "Register New Patient"
3. Fill patient information:
   - Full Name
   - NIC (format: 123456789V or 200012345678)
   - Email
   - Mobile Number (will be used as login username)
   - Date of Birth
   - Gender
   - Address
4. Submit - system will:
   - Create patient account
   - Generate random password
   - Create health card with QR code
   - Send credentials to patient's email

### Step 4: Patient Login

1. Patient receives email with credentials
2. Login with:
   - Username: Mobile number
   - Password: From email
3. View profile and digital health card
4. Download/print health card
5. Edit profile and change password

## API Endpoints

### Admin Routes (`/api/admin`)

```
GET    /admin/statistics              # Dashboard stats
POST   /admin/staff                   # Add staff
GET    /admin/staff                   # List staff
PUT    /admin/staff/:staffId          # Update staff
DELETE /admin/staff/:staffId          # Deactivate staff
GET    /admin/patients                # View all patients
```

### Staff Routes (`/api/staff`)

```
POST   /staff/patients                      # Register patient
GET    /staff/patients                      # List my patients
GET    /staff/patients/:patientId           # Patient details
PUT    /staff/patients/:patientId           # Update patient
GET    /staff/patients/:patientId/health-card # View health card
POST   /staff/patients/:patientId/regenerate-card # Regenerate card
```

### Patient Routes (`/api/patient`)

```
GET    /patient/profile                # Get my profile
PUT    /patient/profile                # Update profile
GET    /patient/health-card            # Get my health card
```

### Health Card Routes (`/api/health-card`)

```
POST   /health-card/verify             # Verify QR code (public)
```

## Database Models

### User Model
- username (unique)
- passwordHash
- role (admin/staff/patient)
- status (ACTIVE/INACTIVE)

### Staff Model
- userId (ref: User)
- fullName
- email (unique)
- contactNo
- position
- addedBy (ref: User)

### Patient Model
- userId (ref: User)
- name
- email (unique)
- phone
- dob
- gender
- address
- nic (unique, validated)
- registeredBy (ref: Staff)
- status

### HealthCard Model
- cardNumber (unique, format: HC-YYYY-NNNN)
- patientId (ref: Patient)
- qrCodeData (encrypted token)
- qrCodeImage (base64 image)
- issuedDate
- status (ACTIVE/REVOKED)
- lastScanned

## Security Considerations

1. **Password Security**
   - All passwords hashed with bcrypt (10 rounds)
   - Auto-generated passwords: 8 chars, alphanumeric + special
   - Passwords never stored in plain text

2. **NIC Validation**
   - Old format: 9 digits + V/X
   - New format: 12 digits
   - Unique constraint enforced

3. **JWT Authentication**
   - Tokens expire after 24 hours (configurable)
   - Stored in localStorage
   - Sent in Authorization header

4. **QR Code Security**
   - Data encrypted with AES-256-CBC
   - Contains: patientId, cardNumber, issuedDate, timestamp
   - Secret key from environment variable

5. **Role-Based Access**
   - Admin: Full staff management, patient view
   - Staff: Patient registration and management
   - Patient: Own data only

## Troubleshooting

### Email Not Sending

**Issue:** Patient not receiving credentials email

**Solutions:**
1. Check SMTP credentials in `.env`
2. For Gmail: Verify app password is correct
3. Check spam/junk folder
4. View server logs for email errors
5. Test with a different email provider

### NIC Validation Failing

**Issue:** Valid NIC rejected

**Formats Accepted:**
- Old: `123456789V` or `123456789X`
- New: `200012345678` (12 digits)

### Login Issues

**Issue:** Cannot login after registration

**Check:**
1. Using correct username (mobile number for patients)
2. Password is case-sensitive
3. Account status is ACTIVE
4. JWT_SECRET is set in backend .env

### QR Code Not Displaying

**Issue:** Health card QR code not showing

**Solutions:**
1. Check if `qrcode` package is installed
2. Verify QR_SECRET is set in .env
3. Check browser console for image loading errors

## Testing Flow

1. **Create Admin**
   ```bash
   npm run seed:admin
   ```

2. **Login as Admin**
   - URL: http://localhost:5173/login
   - Credentials from `.env`

3. **Add Staff Member**
   - Navigate to Staff Management
   - Add new staff
   - Note temporary password

4. **Login as Staff**
   - Logout from admin
   - Login with staff credentials

5. **Register Patient**
   - Fill registration form
   - Check email for credentials

6. **Login as Patient**
   - Logout from staff
   - Login with patient credentials from email
   - View health card
   - Test download/print

7. **Verify QR Code** (Optional)
   - Use QR scanner app
   - Send token to `/api/health-card/verify` endpoint

## Future Enhancements

- [ ] SMS notifications (Twilio integration)
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Audit log for admin actions
- [ ] Export patient data to CSV
- [ ] Advanced search with filters
- [ ] Patient photo upload
- [ ] Card renewal system
- [ ] Mobile app for card scanning

## Support

For issues or questions:
- Developer: S.M.D.M. Bandara (IT22141842)
- Email: [Your Email]
- GitHub: [Repository URL]

## License

This module is part of the Smart Healthcare System project.

---

**Last Updated:** October 2025  
**Version:** 1.0.0

