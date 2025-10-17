# Smart Healthcare System

A comprehensive healthcare management system built with the MERN stack (MongoDB, Express, React, Node.js), featuring patient registration, appointment booking, medical records management, payment processing, and secure QR code-based health card verification.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [User Roles & Capabilities](#-user-roles--capabilities)
- [Key Workflows](#-key-workflows)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

### Core Functionality

#### 1. **User Management & Authentication**
- Role-based access control (Admin, Staff, Patient)
- JWT-based authentication
- Secure password encryption with bcrypt
- Auto-generated credentials for new patients

#### 2. **Patient Registration & Digital Health Cards**
- Comprehensive patient registration with NIC validation
- Digital health card generation with QR codes
- Card number generation and tracking
- Email notification with login credentials
- Print-ready health card format

#### 3. **QR Code Verification System**
- Secure JWT-based QR tokens (30-day validity)
- Password-protected health card access
- Session management (30-minute timeout)
- Audit trail for all access attempts
- Real-time session validation

#### 4. **Appointment Management**
- Interactive appointment booking system
- Doctor selection and availability checking
- Date and time slot selection
- Appointment rescheduling and cancellation
- Email and notification alerts
- Real-time availability updates

#### 5. **Payment Processing**
- Multiple payment methods (Card, Insurance)
- Secure card encryption (AES-256)
- Save card for future use
- Payment history tracking
- Automatic navigation after successful payment
- Receipt generation and email delivery

#### 6. **Medical Records Management**
- Comprehensive medical records tracking
- Patient summary dashboard
- Vital signs monitoring
- Medication tracking
- Lab results management
- Visit history
- Immunization records
- Complete audit trail for all changes

#### 7. **Admin & Staff Management**
- Staff account creation and management
- Position management system
- Patient overview dashboard
- Statistics and analytics
- System-wide patient access

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18.3.1
- **Routing**: React Router DOM 7.1.1
- **Styling**: Tailwind CSS 3.4.17
- **Animations**: Framer Motion 11.15.0
- **HTTP Client**: Axios 1.7.9
- **Icons**: Heroicons (React)
- **Alerts**: SweetAlert2 11.15.3
- **PDF Generation**: jsPDF 2.5.2
- **Build Tool**: Vite 6.0.3

### Backend
- **Runtime**: Node.js (>=14.0.0)
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB with Mongoose 8.9.3
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcrypt 5.1.1
- **Email**: Nodemailer 6.9.16
- **QR Codes**: qrcode 1.5.4
- **Encryption**: crypto-js 4.2.0
- **Validation**: express-validator 7.2.1
- **Security**: Helmet, CORS

### Testing
- **Framework**: Jest 29.7.0
- **API Testing**: Supertest 7.0.0
- **Coverage**: >80% for critical paths

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  - Patient Portal  - Staff Dashboard  - Admin Panel         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/HTTPS (REST API)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  API Layer (Express.js)                      │
│  - Authentication Middleware                                 │
│  - Role-Based Access Control (RBAC)                         │
│  - Request Validation                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│               Business Logic Layer                           │
│  - Controllers (Admin, Staff, Patient, Appointment, etc.)   │
│  - Services (Email, QR, Notification, Pricing)              │
│  - Utilities (Validators, Generators, Encryption)           │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  Data Layer (MongoDB)                        │
│  - User Models  - Patient Models  - Appointment Models      │
│  - Payment Models  - Audit Logs  - Medical Records          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher) or **yarn**
- **MongoDB** (v4.4 or higher)
- **Git**

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Smart-Healthcare-System.git
cd Smart-Healthcare-System
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file from template
cp env.template .env

# Configure your .env file with appropriate values
# (See Environment Variables section below)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file (if needed)
# Configure API base URL if different from http://localhost:5000
```

### 4. Database Setup

```bash
# Ensure MongoDB is running
# Default connection: mongodb://localhost:27017/healthcare

# Create default admin account (from backend directory)
cd ../backend
node src/seeds/createAdmin.js

# Create default positions
node src/seeds/createDefaultPositions.js
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 📁 Project Structure

```
Smart-Healthcare-System/
│
├── backend/
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── adminController.js
│   │   │   ├── staffController.js
│   │   │   ├── patientController.js
│   │   │   ├── authController.js
│   │   │   ├── appointment/
│   │   │   ├── medicalRecords/
│   │   │   ├── payment/
│   │   │   └── qrVerificationController.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── userModel.js
│   │   │   ├── Patient.js
│   │   │   ├── Staff.js
│   │   │   ├── appointment/
│   │   │   ├── payment/
│   │   │   └── AuditLog.js
│   │   ├── routes/             # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── staffRoutes.js
│   │   │   ├── patientRoutes.js
│   │   │   ├── appointment/
│   │   │   ├── payment/
│   │   │   └── qrVerificationRoutes.js
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── rbac.js
│   │   ├── services/           # Business logic
│   │   │   ├── emailService.js
│   │   │   ├── qrService.js
│   │   │   ├── notificationService.js
│   │   │   └── appointment/
│   │   ├── utils/              # Helper functions
│   │   │   ├── nicValidator.js
│   │   │   ├── passwordGenerator.js
│   │   │   ├── cardNumberGenerator.js
│   │   │   └── payment/
│   │   ├── seeds/              # Database seeders
│   │   ├── tests/              # Unit tests
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry point
│   ├── package.json
│   ├── jest.config.js
│   └── env.template
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── common/         # Shared components
│   │   │   ├── admin/
│   │   │   ├── staff/
│   │   │   ├── patient/
│   │   │   ├── dashboard/
│   │   │   └── records/
│   │   ├── pages/              # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── admin/
│   │   │   ├── staff/
│   │   │   ├── patient/
│   │   │   ├── appointment/
│   │   │   ├── payment/
│   │   │   ├── QRVerification.jsx
│   │   │   └── HealthCardView.jsx
│   │   ├── context/            # React context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── services/           # API services
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   └── appointment/
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── docs/                       # Documentation
│   ├── APPLICATION_FLOW_GUIDE.md
│   ├── QR_CODE_SYSTEM_GUIDE.md
│   ├── TOAST_USAGE_GUIDE.md
│   ├── ERROR_HANDLING_GUIDE.md
│   └── ANIMATIONS_GUIDE.md
│
└── README.md                   # This file
```

---

## 👥 User Roles & Capabilities

### 🔐 Admin
- Manage staff accounts (create, edit, deactivate)
- Manage positions
- View all patients
- Access system-wide analytics
- Configure system settings

### 👨‍⚕️ Staff
- Register new patients
- Issue digital health cards
- View and manage all patients
- Update medical records
- Access patient history
- Process payments
- Manage appointments

### 🧑‍💼 Patient
- View personal dashboard
- Book appointments
- View appointment history
- Make payments
- View payment history
- Download digital health card
- Access medical records
- Update profile information

---

## 🔄 Key Workflows

### Patient Registration Flow
```
Staff Login → Register Patient → Fill Form → Submit
  → System Generates Card & QR Code
  → Send Email with Credentials
  → Display Success Modal with Card
  → Print/Download Option
```

### Appointment Booking Flow
```
Patient Login → Book Appointment → Select Doctor
  → Choose Date & Time → Review Details → Confirm
  → Proceed to Payment → Select Payment Method
  → Complete Payment → Navigate to Appointments List
```

### QR Code Verification Flow
```
Scan QR Code → Open Verification Page → Enter Password
  → Verify Credentials → Generate Session Token
  → Display Health Card (30-min session)
  → Auto-logout or Manual Logout
```

### Payment Processing Flow
```
Select Appointment → Proceed to Payment
  → Choose Method (Card/Insurance)
  → Enter Payment Details → Submit
  → Backend Validates & Processes
  → Success Modal → Navigate to Appointments
```

---

## 🧪 Testing

### Run Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test staffController.test.js

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage
- **staffController**: 100% coverage
- **appointmentController**: 100% coverage
- **detailedRecordsController**: 95% coverage
- **Overall Target**: >80% coverage for critical paths

### Test Types Covered
- ✅ Positive test cases
- ✅ Negative test cases
- ✅ Edge cases
- ✅ Error handling scenarios
- ✅ Validation tests
- ✅ Authentication tests

---

## 📚 Documentation

Comprehensive guides are available in the project:

| Document | Description |
|----------|-------------|
| [APPLICATION_FLOW_GUIDE.md](./APPLICATION_FLOW_GUIDE.md) | Complete application flow and user journeys |
| [QR_CODE_SYSTEM_GUIDE.md](./QR_CODE_SYSTEM_GUIDE.md) | QR code generation and verification system |
| [TOAST_USAGE_GUIDE.md](./TOAST_USAGE_GUIDE.md) | Toast notification implementation |
| [ERROR_HANDLING_GUIDE.md](./ERROR_HANDLING_GUIDE.md) | Error handling patterns |
| [ANIMATIONS_GUIDE.md](./ANIMATIONS_GUIDE.md) | Framer Motion animation usage |
| [QUICK_START.md](./QUICK_START.md) | Quick start guide |
| [USER_MANAGEMENT_README.md](./USER_MANAGEMENT_README.md) | User management documentation |

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/healthcare

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Frontend URL (for CORS and QR codes)
FRONTEND_URL=http://localhost:5173

# Session Configuration
SESSION_SECRET=your-session-secret-key
QR_TOKEN_EXPIRY=30d
SESSION_TIMEOUT=30m
```

### Frontend (.env) - Optional

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🔑 Default Credentials

After running the seed scripts, use these credentials to log in:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Test Staff Account (if created)
- **Username**: Staff email or provided username
- **Password**: As generated and sent via email

### Test Patient Account (if created)
- **Username**: Patient phone number
- **Password**: As generated and sent via email

⚠️ **Important**: Change default admin password immediately in production!

---

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion for all transitions
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Non-intrusive feedback
- **Modal Dialogs**: SweetAlert2 for important actions
- **Active Navigation**: Highlighted current page
- **Form Validation**: Real-time client-side validation
- **Empty States**: Helpful messages when no data exists

---

## 🔒 Security Features

- ✅ JWT-based authentication with expiry
- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ Role-based access control (RBAC)
- ✅ Card number encryption (AES-256)
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (Mongoose)
- ✅ XSS protection
- ✅ Session timeout management
- ✅ Audit trail for all critical actions
- ✅ Password-protected QR code access

---

## 🚧 Known Issues & Limitations

1. **Payment Gateway**: Currently using simulated payments (90% success rate)
   - Integration with real payment gateway pending

2. **Email Service**: Requires valid SMTP configuration
   - Use Gmail app passwords or professional SMTP service

3. **QR Code Physical Cards**: Print functionality generates PDF
   - Professional printing service integration recommended

4. **Mobile App**: Web-based only
   - Native mobile app development pending

---

## 🛣 Roadmap

### Phase 1 (Current)
- ✅ User management and authentication
- ✅ Patient registration with health cards
- ✅ Appointment booking system
- ✅ Payment processing
- ✅ Medical records management
- ✅ QR code verification

### Phase 2 (Planned)
- ⏳ Real payment gateway integration
- ⏳ SMS notifications
- ⏳ Video consultation feature
- ⏳ Prescription management
- ⏳ Pharmacy integration
- ⏳ Lab test ordering

### Phase 3 (Future)
- 📅 Mobile application (iOS/Android)
- 📅 Wearable device integration
- 📅 AI-powered diagnostics
- 📅 Telemedicine platform
- 📅 Multi-language support
- 📅 Advanced analytics dashboard

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write/update tests**
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

### Coding Standards
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Development Team** - Initial work and maintenance

---

## 🙏 Acknowledgments

- React and Vite communities
- Express.js contributors
- MongoDB team
- All open-source libraries used in this project
- Healthcare professionals who provided domain knowledge

---

## 📞 Support

For support, please:
- Open an issue on GitHub
- Contact: support@hospital.co
- Check documentation in `/docs` folder

---

## 📊 Project Statistics

- **Total Lines of Code**: ~50,000+
- **Test Coverage**: >80%
- **API Endpoints**: 50+
- **React Components**: 100+
- **Database Collections**: 15+

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ for better healthcare management**