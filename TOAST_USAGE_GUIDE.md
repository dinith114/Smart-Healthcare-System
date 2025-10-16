# Material UI Toast/Alert System - Usage Guide

## Overview

The application now uses **Material UI's Snackbar and Alert** components for displaying notifications. The toast system is globally available throughout the application via the `ToastContext`.

## Features

✅ **Material UI Design** - Professional, modern alerts  
✅ **6-Second Auto-Dismiss** - Longer display time (configurable)  
✅ **4 Severity Levels** - Error, Warning, Info, Success  
✅ **Smooth Animations** - Slide-in from right  
✅ **Manual Close** - X button to dismiss  
✅ **Global Access** - Use anywhere in the app  
✅ **Responsive** - Works on all screen sizes

## Severity Types

| Severity | Color | Icon | Use Case |
|----------|-------|------|----------|
| `error` | Red | ❌ | Failed operations, validation errors, login failures |
| `warning` | Orange | ⚠️ | Cautions, warnings before actions |
| `info` | Blue | ℹ️ | General information, tips |
| `success` | Green | ✅ | Successful operations, confirmations |

## Basic Usage

### 1. Import the Hook

```jsx
import { useToastContext } from "../context/ToastContext";
```

### 2. Use in Your Component

```jsx
function MyComponent() {
  const { showToast } = useToastContext();

  const handleAction = async () => {
    try {
      // Your code here
      await someAsyncOperation();
      
      // Show success toast
      showToast("Operation completed successfully!", "success");
    } catch (error) {
      // Show error toast
      showToast(error.message || "Operation failed", "error");
    }
  };

  return <button onClick={handleAction}>Click Me</button>;
}
```

## Examples

### Error Messages (Login, Validation)

```jsx
// Invalid credentials
showToast("Invalid username or password", "error");

// Account deactivated
showToast("Your account has been deactivated. Contact admin.", "error");

// Form validation
showToast("Please fill in all required fields", "error");

// Network error
showToast("Network error. Please check your connection.", "error");
```

### Success Messages

```jsx
// Patient registered
showToast("Patient registered successfully!", "success");

// Profile updated
showToast("Profile updated successfully", "success");

// Password changed
showToast("Password changed successfully", "success");

// Staff added
showToast("Staff member added successfully", "success");
```

### Warning Messages

```jsx
// Before deletion
showToast("This action cannot be undone", "warning");

// Session expiring
showToast("Your session will expire in 5 minutes", "warning");

// Unsaved changes
showToast("You have unsaved changes", "warning");
```

### Info Messages

```jsx
// General info
showToast("Email sent to patient", "info");

// Feature info
showToast("This feature is currently in beta", "info");

// Reminder
showToast("Remember to save your changes", "info");
```

## Real-World Implementation Examples

### Patient Registration Form

```jsx
function PatientRegistration() {
  const { showToast } = useToastContext();
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/staff/patients", formData);
      showToast("Patient registered successfully! Credentials sent via email.", "success");
      // Redirect or clear form
    } catch (error) {
      showToast(error.response?.data?.message || "Registration failed", "error");
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Profile Password Change

```jsx
function ChangePassword() {
  const { showToast } = useToastContext();

  const handlePasswordChange = async (currentPassword, newPassword) => {
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }

    try {
      await api.put("/profile/password", { currentPassword, newPassword });
      showToast("Password changed successfully", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to change password", "error");
    }
  };

  return <div>{/* password form */}</div>;
}
```

### Patient Status Change (Admin)

```jsx
function PatientStatusToggle({ patient }) {
  const { showToast } = useToastContext();

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/admin/patients/${patient.id}/status`, { status: newStatus });
      
      if (newStatus === "INACTIVE") {
        showToast("Patient deactivated. They can no longer log in.", "success");
      } else {
        showToast("Patient activated. They can now log in.", "success");
      }
    } catch (error) {
      showToast("Failed to update patient status", "error");
    }
  };

  return <button onClick={() => handleStatusChange("INACTIVE")}>Deactivate</button>;
}
```

### Delete Confirmation

```jsx
function DeleteStaff({ staffId }) {
  const { showToast } = useToastContext();

  const handleDelete = async () => {
    showToast("Are you sure? This will deactivate the staff account.", "warning");
    
    // After user confirms
    try {
      await api.delete(`/admin/staff/${staffId}`);
      showToast("Staff member deactivated", "success");
    } catch (error) {
      showToast("Failed to deactivate staff", "error");
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## Configuration

### Change Auto-Hide Duration

Edit `frontend/src/components/common/Toast.jsx`:

```jsx
<Snackbar
  autoHideDuration={6000}  // Change this value (milliseconds)
  // 3000 = 3 seconds
  // 6000 = 6 seconds (current)
  // 10000 = 10 seconds
/>
```

### Change Position

Edit `frontend/src/components/common/Toast.jsx`:

```jsx
<Snackbar
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}  // Change position
  // Options: 'top' | 'bottom', 'left' | 'center' | 'right'
/>
```

### Disable Auto-Hide

```jsx
<Snackbar
  autoHideDuration={null}  // Must manually close
/>
```

## Best Practices

1. **Use Appropriate Severity**
   - ✅ `error` for failures
   - ✅ `success` for completed actions
   - ✅ `warning` before destructive actions
   - ✅ `info` for general messages

2. **Keep Messages Short**
   - ✅ "Password changed successfully"
   - ❌ "Your password has been successfully changed and you can now use it to log in to your account"

3. **Be Specific**
   - ✅ "Invalid email format"
   - ❌ "Error occurred"

4. **Use in Try-Catch**
   ```jsx
   try {
     await action();
     showToast("Success!", "success");
   } catch (error) {
     showToast(error.message, "error");
   }
   ```

5. **Don't Spam Toasts**
   - Show one toast per action
   - Don't show multiple toasts simultaneously

## Material UI Customization

The Alert component supports additional props:

```jsx
// In Toast.jsx, you can customize:
<Alert
  severity="error"
  variant="filled"           // 'filled' | 'outlined' | 'standard'
  icon={<CustomIcon />}      // Custom icon
  action={<Button>UNDO</Button>}  // Custom action button
  sx={{ /* custom styles */ }}
/>
```

## Troubleshooting

### Toast Not Showing

1. Ensure you're using `useToastContext()` not `useToast()`
2. Verify `ToastProvider` is wrapping your component in `App.jsx`
3. Check browser console for errors

### Toast Shows But No Message

```jsx
// ❌ Wrong
showToast();

// ✅ Correct
showToast("Your message here", "error");
```

### Multiple Toasts Overlapping

The system shows one toast at a time. If you need to show multiple messages, consider:
- Combining messages
- Using a different notification system
- Showing toasts sequentially

## Migration from Old Toast System

**Old Code:**
```jsx
const { toast, showToast, hideToast } = useToast();
showToast("Message", "error", 4000);

{toast && <Toast {...toast} onClose={hideToast} />}
```

**New Code:**
```jsx
const { showToast } = useToastContext();
showToast("Message", "error");

// No need to render Toast component - it's global!
```

## Support

For issues or questions about the toast system:
1. Check this guide
2. Review Material UI Snackbar docs: https://mui.com/material-ui/react-snackbar/
3. Check `frontend/src/context/ToastContext.jsx` implementation

