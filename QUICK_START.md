# Quick Start Guide - User Management Module

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or remote)
- Gmail account (for email notifications) or other SMTP server

## 🚀 Quick Setup (5 minutes)

### 1. Configure Backend Environment

Create `backend/.env` file:

```env
# Database
MONGO_URI=mongodb://localhost:27017/smart-healthcare

# Server
PORT=5000

# JWT
JWT_SECRET=super-secret-key-change-in-production
JWT_EXPIRES=24h

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=Smart Healthcare <noreply@healthcare.com>

# QR Encryption
QR_SECRET=qr-secret-key-change-in-production

# Admin Account
ADMIN_USERNAME=admin@hospital.com
ADMIN_PASSWORD=Admin@123

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 2. Start MongoDB

```bash
# If using local MongoDB
mongod
```

### 3. Install & Start Backend

```bash
cd backend
npm install
npm run seed:admin  # Create admin account
npm run dev         # Start server on port 5000
```

### 4. Install & Start Frontend

```bash
cd frontend
npm install
npm run dev         # Start on port 5173
```

### 5. Access the System

Open browser: **http://localhost:5173**

## 🎯 Test the Complete Flow

### Test 1: Admin Creates Staff

1. Login as Admin:
   - Username: `admin@hospital.com`
   - Password: `Admin@123`

2. Go to "Staff Management" tab

3. Click "Add Staff":
   - Full Name: `John Smith`
   - Email: `john@hospital.com`
   - Contact: `0771234567`
   - Position: `Nurse`
   - Username: `john.smith`

4. **Important:** Copy the temporary password shown

### Test 2: Staff Registers Patient

1. Logout and login as Staff:
   - Username: `john.smith`
   - Password: [temporary password from step 1.4]

2. Click "Register New Patient"

3. Fill patient form:
   - Name: `Jane Doe`
   - NIC: `199512345678` (12 digits) or `955123456V` (9 digits + V)
   - Email: `jane@example.com`
   - Phone: `0771234568`
   - DOB: Select date
   - Gender: Female
   - Address: `123 Main St, Colombo`

4. Submit and view:
   - Generated credentials
   - Health card with QR code
   - Email sent confirmation

### Test 3: Patient Views Health Card

1. Check email (`jane@example.com`) for credentials

2. Logout and login as Patient:
   - Username: `0771234568` (phone number)
   - Password: [from email]

3. View:
   - Personal profile
   - Digital health card
   - Download/print card

## 📧 Gmail Setup (Important!)

### Why is this needed?
Patients receive their login credentials via email.

### Setup Steps:

1. **Enable 2-Factor Authentication:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Name it "Smart Healthcare"
   - Copy the 16-character password

3. **Add to `.env`:**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # App password (remove spaces)
   ```

## 🔧 Troubleshooting

### Cannot login?
- Check username is correct (mobile for patients, username for staff/admin)
- Verify password (case-sensitive)
- Ensure MongoDB is running

### Email not received?
- Check spam folder
- Verify Gmail app password
- Check backend console for email errors
- Try with different email provider

### NIC validation error?
- Old format: 9 digits + V (e.g., `955123456V`)
- New format: 12 digits (e.g., `199512345678`)

### QR code not showing?
- Check if `qrcode` package is installed: `npm install qrcode`
- Verify `QR_SECRET` is set in backend `.env`

### Port already in use?
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

## 📁 Project Structure Overview

```
Smart-Healthcare-System/
├── backend/
│   ├── src/
│   │   ├── models/          # User, Patient, Staff, HealthCard
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Email, QR code
│   │   ├── utils/           # Validators, generators
│   │   └── seeds/           # Admin creation
│   ├── .env                 # ← CREATE THIS
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Admin, Staff, Patient portals
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context
│   │   └── services/        # API client
│   └── package.json
│
└── USER_MANAGEMENT_README.md  # Full documentation
```

## 🎨 Default Credentials

### Admin
- Username: `admin@hospital.com`
- Password: `Admin@123`

### Staff (after creation by admin)
- Username: [set by admin]
- Password: [auto-generated, shown once]

### Patient (after registration by staff)
- Username: [their mobile number]
- Password: [auto-generated, sent via email]

## 🔐 Security Notes

- Change default admin password after first login
- Use strong passwords in production
- Never commit `.env` file to git
- Keep QR_SECRET and JWT_SECRET secure
- Use HTTPS in production

## 📱 Features Overview

### Admin Can:
- ✅ Create staff accounts
- ✅ View all staff and patients
- ✅ Edit/deactivate staff
- ✅ See system statistics

### Staff Can:
- ✅ Register new patients
- ✅ View registered patients
- ✅ Generate health cards
- ✅ Print/download cards

### Patient Can:
- ✅ View personal profile
- ✅ See health card with QR
- ✅ Download/print card
- ✅ Update email/address/password

## 🆘 Need Help?

1. Check `USER_MANAGEMENT_README.md` for detailed documentation
2. Review backend console logs
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Ensure MongoDB is running and accessible

## 🎉 Success Checklist

- [ ] MongoDB running
- [ ] Backend `.env` configured
- [ ] Admin account created (`npm run seed:admin`)
- [ ] Backend server running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] Gmail app password set up
- [ ] Logged in as admin successfully
- [ ] Created a staff member
- [ ] Logged in as staff
- [ ] Registered a patient
- [ ] Patient received email
- [ ] Logged in as patient
- [ ] Viewed health card with QR code

---

**Time to complete:** ~5 minutes  
**Questions?** Check the detailed README or contact developer.

