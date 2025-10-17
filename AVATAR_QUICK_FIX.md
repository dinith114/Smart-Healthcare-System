# Avatar Display Fix - Quick Guide

## The Problem

Profile pictures were not showing after page reload.

## The Solution

Updated the frontend to construct full URLs from relative database paths.

---

## What You Need to Do

### 1. Set Environment Variable

Create `frontend/.env` file with:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 2. Restart Frontend

```bash
cd frontend
npm run dev
```

That's it! ✅

---

## How to Test

### Test 1: Upload

1. Login → Go to Patient Dashboard
2. Click "Edit Picture"
3. Select an image
4. ✅ Should display immediately

### Test 2: Persistence

1. Refresh the page (F5)
2. ✅ Image should still be there

### Test 3: Navigation

1. Navigate away to another page
2. Come back to dashboard
3. ✅ Image should still be there

---

## If It Still Doesn't Work

### Check 1: Environment Variable

```bash
cd frontend
cat .env
```

Should show:

```
VITE_API_BASE_URL=http://localhost:5000
```

### Check 2: Backend is Running

Visit: http://localhost:5000/api/health

Should return: `{"ok":true}`

### Check 3: Backend Serves Images

1. Upload an image
2. Check browser console (F12)
3. Look for the image URL (something like: `http://localhost:5000/uploads/avatars/avatar-123.jpg`)
4. Copy that URL
5. Paste in browser address bar
6. Should display the image

### Check 4: File Exists

```bash
cd backend/uploads/avatars
ls
```

Should show uploaded image files.

---

## What Was Changed

### Frontend File:

`frontend/src/components/dashboard/PatientInfoCard.jsx`

**Added:** Helper function to construct full URLs

```javascript
const getFullAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseUrl}${url}`;
};
```

**Updated:** Image display to use full URL

```javascript
<img src={preview || getFullAvatarUrl(avatarUrl)} />
```

---

## Summary

✅ **What was fixed:**

- Images now persist after page reload
- Full URLs constructed from database paths
- Works for both patient and staff views

✅ **What you need:**

- Frontend .env file with VITE_API_BASE_URL
- Restart frontend server

✅ **Result:**

- Profile pictures save correctly ✅
- Display on first upload ✅
- Persist after reload ✅
- Visible to all users ✅

🎉 **Done!**
