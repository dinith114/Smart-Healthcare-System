# Smart Healthcare System - Application Flow Guide

## Overview
Complete flow documentation for the Smart Healthcare System, covering all user roles and features.

---

## 1. User Authentication Flow

### Login Process
```
User Opens Application (/)
    ↓
Redirected to Login Page (/login)
    ↓
Enter Credentials (Username/Email + Password)
    ↓
Backend Validates Credentials
    ↓
JWT Token Generated & Stored
    ↓
Redirect Based on Role:
    - Admin → /admin
    - Staff → /staff
    - Patient → /patient
```

**Key Features:**
- Role-based authentication (Admin, Staff, Patient)
- JWT token-based session management
- Secure password encryption with bcrypt
- Automatic role-based routing

---

## 2. Admin Dashboard Flow

### Admin Main Functions

#### A. Staff Management
```
Admin Logs In → Admin Dashboard
    ↓
Navigate to "Staff Management"
    ↓
View All Staff Members (Table View)
    ↓
Options:
    - Add New Staff (Modal Form)
    - Edit Staff Details
    - View Staff Profile
    - Deactivate/Activate Staff
```

**Add New Staff Flow:**
```
Click "Add Staff" Button
    ↓
Fill Form:
    - Name, Email, NIC
    - Position (Select from predefined)
    - Contact Details
    ↓
System Generates:
    - Username (from email)
    - Auto-generated Password
    ↓
Credentials Sent via Email
    ↓
Staff Account Created
```

#### B. Position Management
```
Navigate to "Position Management"
    ↓
View All Positions with Staff Count
    ↓
Options:
    - Create New Position
    - Edit Position Details
    - Delete Position (if no staff assigned)
```

#### C. Patient Overview
```
Navigate to "Patient Overview"
    ↓
View All Registered Patients
    ↓
Features:
    - Search by Name, NIC, Email
    - Pagination
    - View Patient Details
    - Access Medical Records
```

---

## 3. Staff Dashboard Flow

### Staff Main Functions

#### A. Patient Registration & Health Card Issuance

**Complete Registration Flow:**
```
Staff Logs In → Staff Dashboard
    ↓
Click "Register Patient"
    ↓
Fill Patient Registration Form:
    - Full Name
    - NIC Number (Validated)
    - Email Address
    - Phone Number
    - Date of Birth
    - Gender
    - Address
    ↓
Submit Form
    ↓
Backend Processes:
    1. Validate NIC Format
    2. Check for Duplicates (NIC, Email, Phone)
    3. Create Patient Account
    4. Generate Random Password
    5. Create User Account (username = phone)
    6. Generate Digital Health Card
    7. Create QR Code with JWT Token
    8. Send Credentials via Email
    ↓
Success Modal Displays:
    - Patient Name
    - Digital Health Card
    - QR Code
    - Login Credentials (Username & Password)
    - Card Number
    ↓
Options:
    - Download Digital Card (Print)
    - Request Physical Card (Print)
    - Close Modal
```

**Health Card Contents:**
- Patient Name
- Card Number (Unique)
- Date of Birth
- Blood Type
- Issue Date
- Expiry Date (5 years)
- QR Code (JWT Token for Verification)

#### B. Patient List Management
```
Navigate to "Patient List"
    ↓
View All Patients (Not just registered by current staff)
    ↓
Features:
    - Search Patients
    - Pagination (10 per page)
    - View Patient Details
    - Access Medical Records
```

#### C. Medical Records Management
```
Click on Patient
    ↓
Navigate to Medical Records View
    ↓
View/Update:
    - Patient Summary
    - Vital Signs
    - Medications
    - Lab Results
    - Visit History
    - Immunizations
    ↓
All Changes Logged in Audit Trail
```

---

## 4. Patient Portal Flow

### Patient Account Access

**First-Time Login:**
```
Patient Receives Email with:
    - Username (Mobile Number)
    - Auto-generated Password
    ↓
Go to Login Page
    ↓
Enter Username & Password
    ↓
Redirected to Patient Portal (/patient)
```

### Patient Portal Features

#### A. Home - Patient Portal Dashboard
```
Patient Logs In
    ↓
Patient Portal Landing Page
    ↓
View Sections:
    1. Personal Information Card
        - Name, NIC, DOB, Gender
        - Email, Phone, Address
        - Edit Profile Button
    
    2. Quick Actions
        - View Dashboard
        - Book Appointment
        - View Medical Records
        - Make Payment
    
    3. Digital Health Card Display
        - Card Number
        - QR Code
        - Issue/Expiry Dates
        - Download Option
```

#### B. Navigation Flow
```
Patient Portal Header Navigation:
    - Home (Patient Portal)
    - Appointments
    - About
    - Contact
    - Logout
```

**Navigation Behavior:**
- Uses React Router Links (not button clicks)
- Pages reload data on navigation
- Active page highlighted in nav bar
- Smooth transitions with Framer Motion

---

## 5. Appointments Flow

### Book Appointment Journey

```
Patient Clicks "Book Appointment"
    ↓
Redirected to /appointments/new
    ↓
Step 1: Select Doctor
    - View List of Available Doctors
    - Filter by Specialty
    ↓
Step 2: Select Date
    - Calendar View
    - Only Future Dates Allowed
    ↓
Step 3: Select Time Slot
    - View Available Slots for Selected Date
    - Real-time Availability Check
    - 30-minute slots
    ↓
Step 4: Add Notes (Optional)
    ↓
Review Appointment Details
    ↓
Navigate to Confirmation Page (/appointments/confirm)
    ↓
Review:
    - Doctor Name & Specialty
    - Appointment Date & Time
    - Appointment Type
    - Billing Amount
    ↓
Confirm Appointment
    ↓
Backend Creates:
    - Appointment Record
    - Notification Sent to Patient
    - Email Confirmation
    - Audit Log Entry
    ↓
Success Message
    ↓
Option to:
    - Proceed to Payment
    - View Appointments
```

### View Appointments
```
Navigate to /appointments
    ↓
View All Appointments:
    - Upcoming Appointments (Highlighted)
    - Past Appointments
    - Cancelled Appointments
    ↓
Features:
    - Search by Doctor Name
    - Sort by Date/Doctor
    - Filter by Status
    ↓
Actions per Appointment:
    - View Details
    - Reschedule (if upcoming)
    - Cancel (if upcoming)
```

---

## 6. Payment Flow

### Payment Process

**Initiate Payment:**
```
After Booking Appointment OR From Appointments List
    ↓
Click "Proceed to Payment" / "Make Payment"
    ↓
Redirected to Payment Page (/payment or /staff/payment)
    ↓
Payment Information Displayed:
    - Appointment ID
    - Doctor Name & Specialty
    - Appointment Date & Time
    - Amount Due
    - Currency (LKR)
```

**Payment Options:**

#### Option 1: Card Payment
```
Select "Card Payment" Tab
    ↓
Options:
    A. Use Saved Card (if available)
        - Select from List
        - Decrypt & Auto-fill
    
    B. New Card Entry
        - Card Number (16 digits)
        - Card Owner Name
        - Expiry Date (MM/YY)
        - CVC (3 digits)
        - Checkbox: Save Card for Future
    ↓
Click "Make Payment"
    ↓
Backend Processes:
    1. Validate Card Details
    2. Check Expiry Date
    3. Encrypt Card Number (AES-256)
    4. Simulate Payment (90% success rate)
    5. Store Payment Record
    6. If Save Card: Store Encrypted Card
    7. Send Receipt Email
    8. Create Audit Log
    ↓
Payment Result:
    - Success: Show Success Modal
    - Failed: Show Error & Retry Option
    ↓
On Success Modal Click "OK"
    ↓
Navigate to /appointments
```

#### Option 2: Insurance Payment
```
Select "Insurance Payment" Tab
    ↓
Fill Insurance Form:
    - Policy Number
    - Insurance Provider
    - Insured Name
    ↓
Submit Insurance Claim
    ↓
Backend Processes:
    1. Validate Policy
    2. Submit to Insurance API
    3. Store Insurance Payment Record
    4. Send Confirmation Email
    ↓
Success: Navigate to /appointments
```

**Payment Receipt:**
- Transaction ID
- Payment Date & Time
- Amount Paid
- Payment Method
- Card Last 4 Digits (if card)
- Download PDF Receipt Option

---

## 7. QR Code Verification Flow

### Secure Health Card Access

**QR Code Generation (During Patient Registration):**
```
Patient Registered
    ↓
System Generates:
    - JWT Token (30-day expiry)
    - Token Contains: patientId, cardNumber, type
    - Verification URL: /verify-health-card/{token}
    ↓
QR Code Created with Verification URL
    ↓
QR Code Embedded in Health Card
```

**QR Code Scanning & Verification:**
```
Anyone Scans QR Code
    ↓
Opens URL: /verify-health-card/{token}
    ↓
System Validates Token:
    - Check Expiry
    - Verify Signature
    - Check Token Type
    ↓
If Valid: Show Verification Page
    - Display Patient Name (Non-sensitive)
    - Show Password Input Field
    - "View Health Card" Button
    ↓
User Enters Patient Password
    ↓
Backend Verifies:
    1. Decode JWT Token
    2. Find Patient Record
    3. Find User Account
    4. Compare Password (bcrypt)
    5. Log Access Attempt in Audit
    ↓
If Password Correct:
    - Generate Session Token (30-min expiry)
    - Store in SessionStorage
    - Navigate to /view-health-card
    ↓
Health Card View Page Displays:
    - Session Timer (30 minutes countdown)
    - Digital Health Card with QR
    - Full Patient Information
    - Personal Details Grid
    - Security Warnings
    ↓
Session Management:
    - Auto-expires after 30 minutes
    - Manual logout option
    - Validates session periodically
    - Clears data on browser close
```

**Security Features:**
- JWT tokens with expiration
- Password-protected access
- Session timeout
- Audit trail logging
- Failed attempts tracked

---

## 8. Medical Records Flow (Staff)

### Access & Update Records

```
Staff Selects Patient from List
    ↓
Navigate to Medical Records (/staff/records/{patientId})
    ↓
View Comprehensive Medical Data:
    1. Patient Summary
    2. Vital Signs
    3. Medications
    4. Lab Results
    5. Visit History
    6. Immunizations
    7. Audit Trail
    ↓
Update Any Section:
    - Click Edit on Section
    - Modify Data
    - Save Changes
    ↓
Backend Records:
    - Updated Data
    - Staff Member Who Made Change
    - Timestamp
    - Action Type
    - Audit Log Entry
    ↓
Changes Reflected Immediately
```

---

## 9. About & Contact Pages

### About Page Flow
```
Patient Clicks "About" in Navigation
    ↓
Navigate to /patient/about
    ↓
Page Displays:
    - System Overview
    - Animated Statistics:
        • Number of Patients
        • Total Appointments
        • Staff Members
        • Patient Satisfaction %
    - Feature Cards
    - Mission Statement
    - Call-to-Action
    ↓
Statistics Animate on Page Load
Counter animation from 0 to target values
```

### Contact Page Flow
```
Patient Clicks "Contact" in Navigation
    ↓
Navigate to /patient/contacts
    ↓
Page Displays:
    1. Hero Section (Gradient Background)
    
    2. Contact Methods Grid:
        - Phone
        - Email
        - Location
        - Emergency
    
    3. Contact Form:
        - Name
        - Email
        - Subject
        - Message
        ↓
        Submit Form (Simulated)
        ↓
        Success Animation
        ↓
        Form Resets After 3 Seconds
    
    4. Map Display (Placeholder)
    
    5. Office Hours & FAQ
    
    6. Social Media Links
    
    7. Newsletter Subscription
```

---

## 10. Payment History View

### Patient Dashboard - Payment History

```
Patient in Dashboard (/patient/dashboard)
    ↓
Click "Payment History" Button
    ↓
Modal Opens with Payment History
    ↓
Backend Fetches:
    GET /api/payments/history?patientId={id}
    ↓
Display Table:
    - Date
    - Payment Method
    - Amount (Rs.)
    - Status
    - Transaction ID
    ↓
Sort by Most Recent First
    ↓
If No Payments: Show Empty State
```

---

## 11. System Architecture Flow

### Request-Response Cycle

**Frontend → Backend:**
```
User Action (Click/Submit)
    ↓
React Component Event Handler
    ↓
API Call via Axios
    ↓
Request Includes:
    - JWT Token (Authorization Header)
    - Request Body/Params
    - CORS Headers
    ↓
Backend Receives Request
    ↓
Middleware Chain:
    1. CORS Handler
    2. Body Parser
    3. Authentication Middleware
    4. Role Authorization
    ↓
Controller Function
    ↓
Business Logic Processing
    ↓
Database Operations (MongoDB)
    ↓
Response Generation
    ↓
Send JSON Response
    ↓
Frontend Receives Response
    ↓
Update UI State
    ↓
Show Feedback to User
```

---

## 12. Data Flow Diagrams

### Patient Registration Complete Flow

```
Staff Interface
    ↓
Patient Registration Form
    ↓
Validation Layer
    ├── NIC Format Check
    ├── Duplicate Email Check
    ├── Duplicate Phone Check
    └── Required Fields Check
    ↓
Create Patient Record (MongoDB)
    ↓
Generate User Account
    ├── Username (Phone Number)
    └── Password (Auto-generated)
    ↓
Generate Health Card
    ├── Unique Card Number
    ├── Issue Date
    └── Expiry Date (5 years)
    ↓
Generate QR Code
    ├── JWT Token Creation
    ├── Verification URL
    └── QR Image Generation
    ↓
Send Email Notification
    ├── Welcome Message
    ├── Username
    ├── Password
    └── Portal Link
    ↓
Create Audit Log
    ↓
Return Success Response
    ↓
Display Credentials Modal
```

### Appointment Booking Complete Flow

```
Patient Interface
    ↓
Select Doctor
    ↓
Choose Date
    ↓
Select Time Slot
    ↓
Check Slot Availability (Real-time)
    ↓
Add Notes
    ↓
Review Details
    ↓
Confirm Appointment
    ↓
Backend Creates:
    ├── Appointment Record
    ├── Notification Record
    └── Audit Log
    ↓
Send Notifications:
    ├── Email to Patient
    └── SMS (if configured)
    ↓
Calculate Billing Amount
    ↓
Generate Payment Link
    ↓
Return Success
    ↓
Show Confirmation
    ↓
Option: Proceed to Payment
```

---

## 13. Key Navigation Routes

### Public Routes
- `/` - Home (redirects to /login)
- `/login` - Login Page
- `/verify-health-card/:token` - QR Verification
- `/view-health-card` - Health Card View (Session-based)

### Admin Routes (Protected)
- `/admin` - Admin Dashboard
- `/admin/staff` - Staff Management
- `/admin/positions` - Position Management
- `/admin/patients` - Patient Overview

### Staff Routes (Protected)
- `/staff` - Staff Dashboard
- `/staff/register` - Patient Registration
- `/staff/list` - Patient List
- `/staff/records/:patientId` - Medical Records
- `/staff/payment` - Payment Page

### Patient Routes (Protected)
- `/patient` - Patient Portal (Home)
- `/patient/dashboard` - Patient Dashboard
- `/patient/about` - About Page
- `/patient/contacts` - Contact Page

### Appointment Routes
- `/appointments` - Appointments List
- `/appointments/new` - Book New Appointment
- `/appointments/:id` - Appointment Details
- `/appointments/confirm` - Confirm Appointment

### Payment Routes
- `/payment` - Payment Page

---

## 14. Error Handling Flow

### Common Error Scenarios

**Authentication Errors:**
```
Invalid Credentials
    ↓
Show Error Message
    ↓
Allow Retry
```

**Authorization Errors:**
```
Access Denied (Wrong Role)
    ↓
Redirect to Appropriate Dashboard
```

**Validation Errors:**
```
Form Validation Fails
    ↓
Highlight Invalid Fields
    ↓
Show Error Messages
    ↓
User Corrects Input
    ↓
Resubmit
```

**Network Errors:**
```
Request Timeout / Server Down
    ↓
Show Error Toast
    ↓
Provide Retry Option
```

**Session Expiry:**
```
JWT Token Expired
    ↓
Show Session Expired Message
    ↓
Redirect to Login
```

---

## 15. Success Feedback Patterns

### UI Feedback Mechanisms

1. **Toast Notifications** (useToast)
   - Quick feedback for actions
   - Auto-dismiss after 3-5 seconds
   - Position: Top-right

2. **SweetAlert Modals** (Swal.fire)
   - Important confirmations
   - Success/Error messages
   - User must acknowledge

3. **Loading States**
   - Spinners for data fetching
   - Skeleton loaders for content
   - Disabled buttons during processing

4. **Animations** (Framer Motion)
   - Page transitions
   - Component entry/exit
   - Hover effects

---

## Summary

The Smart Healthcare System provides a complete healthcare management solution with:

✅ **Role-Based Access**: Admin, Staff, Patient
✅ **Patient Registration**: With digital health cards
✅ **Appointment Management**: Booking, rescheduling, cancellation
✅ **Payment Processing**: Card & insurance payments
✅ **Medical Records**: Comprehensive tracking with audit trail
✅ **QR Code Verification**: Secure, password-protected access
✅ **Real-Time Updates**: Live data synchronization
✅ **Responsive Design**: Works on all devices
✅ **Security**: JWT tokens, encryption, audit logs

**User Experience Highlights:**
- Smooth navigation without page reloads
- Automatic redirection after actions
- Clear error messages
- Comprehensive feedback
- Modern, intuitive UI

**Technical Stack:**
- **Frontend**: React, React Router, Framer Motion, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Payment**: Custom implementation with card encryption
- **QR Codes**: qrcode library with JWT tokens
- **Email**: Nodemailer

---

## Flow Testing Checklist

### Test Each Flow:
- ✅ Login with each role
- ✅ Register new patient
- ✅ Book appointment end-to-end
- ✅ Make payment (card & insurance)
- ✅ Scan QR code and verify
- ✅ Update medical records
- ✅ Navigate all pages
- ✅ Test error scenarios
- ✅ Verify session timeout
- ✅ Check audit logs

---

*Last Updated: January 2025*

