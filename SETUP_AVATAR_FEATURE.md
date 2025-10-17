# Avatar Feature Setup Guide

## ✅ Installation Complete!

The avatar upload feature has been successfully implemented. Here's what you need to do to get it running:

---

## 1. Install Dependencies

Multer has already been installed in the backend. If you need to reinstall:

```bash
cd backend
npm install
```

---

## 2. Create Uploads Directory

The `backend/uploads/avatars/` directory will be created automatically when the first image is uploaded. However, you can create it manually:

**Windows (PowerShell):**

```powershell
cd backend
New-Item -ItemType Directory -Force -Path uploads\avatars
```

**Linux/Mac:**

```bash
cd backend
mkdir -p uploads/avatars
```

---

## 3. Set Environment Variable (Frontend)

Create or update `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

This ensures avatar URLs are constructed correctly.

---

## 4. Restart Backend Server

Stop and restart your backend server to load the new routes:

```bash
cd backend
npm run dev
```

---

## 5. Test the Feature

### As a Patient:

1. Login as a patient
2. Click "Medical Report" button
3. Navigate to Patient Dashboard
4. Click "Edit Picture" button
5. Select an image from your device
6. Wait for upload confirmation
7. See the updated avatar immediately

### As Staff:

1. Login as staff
2. Navigate to a patient's records
3. Click "View Details" for a patient
4. Scroll to the Patient Information card
5. Click "Edit Picture" button
6. Upload an image
7. Avatar updates for both patient and staff views

---

## 6. Verify Installation

### Check Backend Files Exist:

```
backend/
├── src/
│   ├── controllers/
│   │   └── avatarController.js       ✓ NEW
│   ├── routes/
│   │   └── avatarRoutes.js           ✓ NEW
│   ├── models/
│   │   └── Patient.js                ✓ MODIFIED
│   └── app.js                        ✓ MODIFIED
├── uploads/                          ✓ NEW (auto-created)
│   └── avatars/                      ✓ NEW
└── package.json                      ✓ MODIFIED
```

### Check Frontend Files:

```
frontend/
└── src/
    └── components/
        └── dashboard/
            └── PatientInfoCard.jsx   ✓ MODIFIED
```

### Test API Endpoint:

Open browser or Postman and check if static files are served:

```
http://localhost:5000/uploads/avatars/
```

Should return 404 (directory listing disabled) or 403, which is normal.

---

## 7. Usage

### Patient Side:

```
Patient Portal → Medical Report → Patient Dashboard
                                        ↓
                            [Edit Picture Button]
                                        ↓
                            Select image → Upload
                                        ↓
                            Avatar displayed
```

### Staff Side:

```
Staff Dashboard → Patient List → View Details
                                        ↓
                            Patient Records Page
                                        ↓
                            [Edit Picture Button]
                                        ↓
                            Select image → Upload
                                        ↓
                            Avatar displayed
```

---

## 8. Features

✅ **Upload Images**

- Click "Edit Picture" button
- Select image (JPG, PNG, GIF, etc.)
- Max size: 5MB
- Automatic upload on selection

✅ **Database Storage**

- Avatar URL saved in Patient model
- Persists across sessions
- Accessible via API

✅ **File System Storage**

- Images saved in `backend/uploads/avatars/`
- Unique filenames prevent conflicts
- Old images auto-deleted on new upload

✅ **Synchronization**

- Patient sees their avatar
- Staff sees patient's avatar
- Updates reflect immediately for both

✅ **Security**

- JWT authentication required
- Only image files allowed
- File size validation
- Unique filenames

---

## 9. Troubleshooting

### Issue: "Failed to upload avatar"

**Solutions:**

1. Check backend server is running
2. Verify multer is installed: `npm list multer`
3. Check uploads/ directory permissions
4. Check console for detailed errors

### Issue: Image not displaying

**Solutions:**

1. Check VITE_API_BASE_URL in frontend/.env
2. Verify backend serves static files
3. Clear browser cache
4. Check network tab for 404 errors

### Issue: Old images not deleted

**Solutions:**

1. Check file permissions on uploads/avatars/
2. Restart backend server
3. Verify avatarController.js is loaded

---

## 10. Testing Checklist

- [ ] Backend server starts without errors
- [ ] uploads/avatars/ directory exists
- [ ] Edit Picture button visible on Dashboard
- [ ] File picker opens on click
- [ ] Upload shows loading/preview
- [ ] Success message displays
- [ ] Avatar displays after upload
- [ ] Avatar persists after page refresh
- [ ] Patient sees their avatar
- [ ] Staff sees patient's avatar
- [ ] Changing avatar updates for both sides

---

## 11. API Documentation

### Upload Avatar

```
POST /api/patients/:patientId/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  avatar: <image file>

Response:
{
  "message": "Avatar uploaded successfully",
  "url": "/uploads/avatars/avatar-123-456.jpg"
}
```

### Delete Avatar

```
DELETE /api/patients/:patientId/avatar
Authorization: Bearer <token>

Response:
{
  "message": "Avatar deleted successfully"
}
```

---

## 12. Next Steps (Optional)

### Enhance the Feature:

1. **Add Image Cropper**

   - Allow users to crop/rotate images
   - Install: `npm install react-image-crop`

2. **Add Progress Bar**

   - Show upload progress
   - Better UX for large files

3. **Optimize Images**

   - Resize to 400x400px
   - Compress to reduce size
   - Install: `npm install sharp`

4. **Cloud Storage**
   - Upload to AWS S3 or Cloudinary
   - Better scalability
   - CDN distribution

---

## Summary

🎉 **Avatar upload feature is ready to use!**

- ✅ Backend configured and running
- ✅ Frontend ready to upload
- ✅ Database storing URLs
- ✅ Files stored on server
- ✅ Synchronized across views

Just start your servers and test it out!

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Happy uploading! 📸
