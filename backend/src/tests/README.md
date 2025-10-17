# Backend Unit Tests

## Overview
Comprehensive unit tests for the Smart Healthcare System backend with >80% coverage target.

## Test Coverage

### Appointment Controller Tests (`appointmentController.test.js`)
Tests cover all four main functions with 100% coverage (53 test cases):

#### 1. **createAppointment** (16 test cases)
- **Positive cases:**
  - Create appointment with all required fields
  - Create appointment without optional notes
  - Handle empty notes string
  
- **Negative cases:**
  - Missing required fields (patientId, doctorId, date)
  - Slot not available (409 conflict)
  
- **Edge cases:**
  - Empty string values
  - Null values
  - Notification service failures
  - Reminder queue failures
  - Audit log creation failures
  
- **Error cases:**
  - Database creation error
  - Slot availability check failure
  - Date normalization error

#### 2. **rescheduleAppointment** (11 test cases)
- **Positive cases:**
  - Successfully reschedule appointment
  - Handle MongoDB ObjectId conversion
  
- **Negative cases:**
  - Appointment not found (404)
  - New slot not available (409)
  - Missing new date
  
- **Edge cases:**
  - Invalid appointment ID format
  - Save operation failure
  - Notification failure
  - Audit log failure
  
- **Error cases:**
  - Database query error
  - Slot availability check error

#### 3. **cancelAppointment** (11 test cases)
- **Positive cases:**
  - Cancel confirmed appointment
  - Cancel rescheduled appointment
  - Handle ObjectId fields
  
- **Negative cases:**
  - Appointment not found (404)
  - Non-existent appointment ID
  
- **Edge cases:**
  - Already cancelled appointment
  - Save failure
  - Notification failure
  - Audit log failure
  - Invalid appointment ID format
  
- **Error cases:**
  - Database error
  - Unexpected error during cancellation

#### 4. **getAppointments** (15 test cases)
- **Positive cases:**
  - Get appointments for patient role
  - Get appointments for doctor role
  - Return empty array when no appointments
  - Populate doctor and patient information
  
- **Negative cases:**
  - Default to patient query for non-doctor roles
  - Handle undefined role
  - Handle missing user object
  
- **Edge cases:**
  - Null user
  - Empty user ID
  - Case-sensitive role check
  - Large number of appointments
  
- **Error cases:**
  - Database query error
  - Populate error
  - Network timeout error

### Staff Controller Tests (`staffController.test.js`)
Tests cover all four main functions with positive, negative, edge, and error cases:

#### 1. **registerPatient** (28 test cases)
- **Positive cases:**
  - Successfully register patient with valid data
  - Normalize email to lowercase
  - Normalize NIC to uppercase and trim whitespace
  - Send credentials email after registration
  
- **Negative cases:**
  - Missing required fields (name, email, phone, nic, dob, gender)
  - Invalid NIC format
  - Duplicate NIC
  - Duplicate email
  - Duplicate phone
  - Staff record not found
  
- **Edge cases:**
  - Special characters in name
  - Long address (500 chars)
  - Gender as 'Other'
  - New 12-digit NIC format
  
- **Error cases:**
  - Database save fails
  - QR code generation fails
  - Email sending fails

#### 2. **getPatients** (9 test cases)
- **Positive cases:**
  - Return all patients (no filter by registeredBy)
  - Filter patients by search query
  - Handle pagination correctly
  
- **Negative cases:**
  - Staff record not found
  
- **Edge cases:**
  - Empty patient list
  - Page beyond available pages
  - Special characters in search
  
- **Error cases:**
  - Database query fails

#### 3. **getPatientDetails** (4 test cases)
- **Positive cases:**
  - Return patient with health card
  - Return patient without health card
  
- **Negative cases:**
  - Patient not found
  
- **Error cases:**
  - Database query fails

#### 4. **updatePatient** (7 test cases)
- **Positive cases:**
  - Successfully update patient information
  - Update username when phone changes
  
- **Negative cases:**
  - Patient not found
  - Email already in use
  - Phone already in use
  
- **Error cases:**
  - Save operation fails

## Running Tests

### Run all tests:
```bash
cd backend
npm test
```

### Run with coverage:
```bash
npm test -- --coverage
```

### Run specific test file:
```bash
npm test -- staffController.test.js
npm test -- appointmentController.test.js
```

### Run tests in watch mode:
```bash
npm test -- --watch
```

## Coverage Threshold
The project is configured to maintain >80% coverage across:
- Branches
- Functions
- Lines
- Statements

Coverage configuration is in `jest.config.js`.

## Test Structure
Each test suite follows the pattern:
1. **Positive cases** - Expected successful operations
2. **Negative cases** - Invalid input/business rule violations
3. **Edge cases** - Boundary conditions and special scenarios
4. **Error cases** - System failures and exception handling

## Mocking Strategy
All external dependencies are mocked:
- Database models (User, Patient, Staff, HealthCard, Appointment, AuditLog)
- Utility functions (validation, password generation, card number, slot utils)
- External services (QR generation, email sending, notifications, reminder queue)

This ensures tests are:
- Fast and isolated
- Don't require database connection
- Don't send real emails
- Repeatable and deterministic

## Key Features Tested

### Security
- Password generation and handling
- NIC validation and normalization
- Duplicate detection (NIC, email, phone)

### Data Integrity
- Required field validation
- Email/phone/NIC uniqueness
- Proper data normalization (uppercase NIC, lowercase email)

### Business Logic
- Staff can view ALL patients (not just ones they registered)
- Health card generation with QR code
- Credentials delivery via email
- Pagination and search functionality
- Appointment scheduling with slot availability checks
- Appointment rescheduling and cancellation
- Role-based appointment filtering (patient vs doctor views)
- Audit trail for appointment actions
- Notification system for appointment events

### Error Handling
- Database errors
- Service failures
- Missing records
- Validation failures

## Adding New Tests
When adding tests:
1. Follow the existing structure (Positive/Negative/Edge/Error)
2. Mock all external dependencies
3. Test both success and failure paths
4. Include meaningful test descriptions
5. Aim for >80% coverage

## Dependencies
- **jest**: Testing framework
- **supertest**: HTTP assertions (for integration tests)
- **cross-env**: Environment variable management

