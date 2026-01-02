# Profile Image Upload - Troubleshooting

## Issue
Getting 404 error when trying to upload profile image:
```
POST http://localhost:3000/api/profile/upload-image 404 (Not Found)
```

## Solution Steps

### 1. Restart the API Server
The route was just added, so you need to restart your server:

```bash
cd api-server
# Stop the current server (Ctrl+C)
npm start
# or if using nodemon:
npm run dev
```

### 2. Verify the Route is Loaded
Check the server console for any errors when starting. The route should be at:
- `POST /api/profile/upload-image`

### 3. Test the Route
You can test if the route is accessible:
```bash
# Test route (no auth needed)
curl http://localhost:3000/api/profile/test

# Should return: {"message":"Profile routes are working!"}
```

### 4. Verify Multer is Installed
```bash
cd api-server
npm list multer
```

If not installed:
```bash
npm install multer
```

### 5. Check Directory Structure
Make sure the uploads directory exists:
```
api-server/
├── uploads/
│   └── profile-images/
```

The middleware will create it automatically, but you can also create it manually.

### 6. Verify Environment Variables
Make sure your `.env` file has:
```
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/scrs
PORT=3000
```

### 7. Check Browser Console
Look for any CORS errors or other issues in the browser console.

## Route Details

The upload route is defined at:
- **Path**: `POST /api/profile/upload-image`
- **Auth**: Required (Bearer token)
- **Body**: FormData with field name `image`
- **File Size Limit**: 5MB
- **Allowed Types**: jpeg, jpg, png, gif, webp

## Expected Behavior

1. User selects image file
2. Frontend creates FormData and appends file with field name `image`
3. Request sent to `/api/profile/upload-image` with Authorization header
4. Server saves file to `api-server/uploads/profile-images/userId-timestamp.ext`
5. Server saves path to MongoDB: `/uploads/profile-images/userId-timestamp.ext`
6. Server returns: `{ message: "...", imageUrl: "/uploads/profile-images/..." }`
7. Frontend displays image using the returned URL

## Common Issues

### Issue: 404 Not Found
**Cause**: Server not restarted after adding route
**Fix**: Restart the API server

### Issue: 401 Unauthorized
**Cause**: Missing or invalid JWT token
**Fix**: Make sure user is logged in and token is in localStorage

### Issue: File too large
**Cause**: Image exceeds 5MB limit
**Fix**: Compress or resize the image

### Issue: Invalid file type
**Cause**: File is not an image (jpeg, jpg, png, gif, webp)
**Fix**: Use a valid image format

### Issue: CORS error
**Cause**: Frontend URL not in CORS whitelist
**Fix**: Check `FRONTEND_URL` in `.env` or CORS settings in `server.js`

