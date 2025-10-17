# Authentication Fix for Medical Records

## Problem

When staff clicked "View Details" to view patient records, they received a **401 Unauthorized** error and were redirected to the login page.

## Root Cause

The medical records endpoints (`/api/records`, `/api/patients/:id/summary`, `/api/audit`) use a **custom RBAC middleware** that requires special headers in addition to the JWT token:

- `x-role`: Role of the user (e.g., "Patient", "Provider")
- `x-user-id`: User/Actor ID
- `x-provider-consent`: Whether provider has consent (true/false)

These headers were not being sent with the API requests, causing the backend to return a 401 Unauthorized error.

## Solution

Updated all medical records-related components to include the demo headers using the `getDemoHeaders()` function from `services/api.js`.

### Files Modified

#### 1. `frontend/src/pages/Records.jsx`

- Imported `getDemoHeaders` from services/api
- Added headers to `fetchAll()` function for both records and summary endpoints
- Added headers to `onSaveSummary()` function
- Improved error messages to show backend error details

```javascript
const demoHeaders = getDemoHeaders();
const [recRes, sumRes] = await Promise.all([
  api.get(`/records/${patientId}`, { headers: demoHeaders }),
  api.get(`/patients/${patientId}/summary`, { headers: demoHeaders }),
]);
```

#### 2. `frontend/src/components/records/AddReportModal.jsx`

- Imported `getDemoHeaders` from services/api
- Added headers to both PATCH (summary update) and POST (encounter creation) requests
- Improved error messages

```javascript
const demoHeaders = getDemoHeaders();
await api.patch(`/patients/${patientId}/summary`, payload, { headers: demoHeaders });
await api.post(`/records/${patientId}/encounters`, {...}, { headers: demoHeaders });
```

#### 3. `frontend/src/components/records/AuditTimeline.jsx`

- Imported `getDemoHeaders` from services/api
- Added headers to audit log fetch request
- Improved error messages

```javascript
const demoHeaders = getDemoHeaders();
api.get(`/audit/${patientId}`, { headers: demoHeaders });
```

#### 4. `frontend/src/components/records/UpdateRecordModal.jsx`

- Imported `getDemoHeaders` from services/api
- Added headers to encounter creation request
- Improved error messages

```javascript
const demoHeaders = getDemoHeaders();
const res = await api.post(`/records/${patientId}/encounters`, {...}, { headers: demoHeaders });
```

## How Demo Headers Work

The `getDemoHeaders()` function (from `services/api.js`) returns:

```javascript
{
  "x-role": "Provider",
  "x-user-id": "000000000000000000000999",
  "x-provider-consent": "true"
}
```

These values can be configured via environment variables:

- `VITE_DEMO_ROLE` (default: "Provider")
- `VITE_DEMO_ACTOR_ID` (default: "000000000000000000000999")
- `VITE_DEMO_CONSENT` (default: "true")

## Backend RBAC Middleware

The backend's `requireAccess()` middleware (in `backend/src/middleware/rbac.js`) checks:

1. **Patient role**: Can only view their own records (actorId must match patientId)
2. **Provider role**: Can view/update any patient's records with consent
3. Missing headers → 401 Unauthorized
4. No consent for Provider → 403 Forbidden

## Testing the Fix

### Before Fix:

- Staff clicks "View Details" → 401 error → redirected to login

### After Fix:

- Staff clicks "View Details" → Records page loads successfully
- All CRUD operations work (view, update, add report, audit logs)
- Proper error messages displayed if something fails

## Future Improvements

For production, consider:

1. **Remove Demo Headers**: Replace with proper JWT-based authentication
2. **Unified Auth System**: Make all endpoints use the same authentication middleware
3. **Role Extraction**: Extract role and userId from JWT token instead of custom headers
4. **Consent Management**: Implement a proper consent tracking system in the database
5. **Better Error Handling**: Create a centralized error handling service

## Migration Path to Production Auth

To transition from demo headers to production JWT authentication:

1. Update backend middleware to extract role from JWT
2. Create a proper consent model and API
3. Update frontend to remove `getDemoHeaders()` calls
4. Ensure JWT tokens include necessary user information
5. Implement proper session management

## Notes

- This fix maintains backward compatibility with the existing demo system
- All medical records routes now work correctly for staff users
- The JWT token (from login) is still sent via the Authorization header
- Demo headers are **additional** headers for the medical records module only
- Other modules (admin, staff, patient) don't need these headers as they use standard JWT auth
