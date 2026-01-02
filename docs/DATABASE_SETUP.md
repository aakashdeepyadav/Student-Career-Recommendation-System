# 🗄️ Database Setup Guide

## Database Name: `scrs`

The Student Career Recommendation System (SCRS) uses MongoDB with the database name **`scrs`**.

---

## 📋 Quick Setup

### 1. Local MongoDB Setup

If you're running MongoDB locally:

```bash
# Start MongoDB (if not already running)
# Windows: net start MongoDB
# Linux/Mac: sudo systemctl start mongod

# The database will be created automatically when you first connect
```

**Connection String:**
```
mongodb://localhost:27017/scrs
```

### 2. MongoDB Atlas Setup (Cloud)

If you're using MongoDB Atlas:

1. Create a new cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP address
4. Get your connection string
5. Update the connection string to use database name `scrs`:

```
mongodb+srv://username:password@cluster.mongodb.net/scrs?retryWrites=true&w=majority
```

**Note:** The database name `scrs` is specified in the connection string after the cluster URL.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `api-server/` directory:

```env
MONGODB_URI=mongodb://localhost:27017/scrs
JWT_SECRET=your-secret-key
PORT=3000
FRONTEND_URL=http://localhost:5173
ML_ENGINE_URL=http://localhost:8001
```

Or for MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scrs?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
PORT=3000
FRONTEND_URL=http://localhost:5173
ML_ENGINE_URL=http://localhost:8001
```

### Default Configuration

If `MONGODB_URI` is not set in `.env`, the system defaults to:
```
mongodb://localhost:27017/scrs
```

---

## 📊 Database Collections

The `scrs` database contains the following collections:

### `users` Collection

Stores all user data including:
- User authentication (username, email, password hash)
- Profile information (RIASEC scores, skills, subject preferences)
- Cluster assignments
- Career recommendations
- Visualization data
- Profile images

**Schema:** See `api-server/models/User.js`

---

## 🔧 Verification

### Check Database Connection

1. Start the API server:
   ```bash
   cd api-server
   npm start
   ```

2. Look for this message:
   ```
   Connected to MongoDB
   API Server running on port 3000
   ```

### Verify Database Creation

**Using MongoDB Shell:**
```bash
mongosh
> use scrs
> show collections
> db.users.find().count()
```

**Using MongoDB Compass:**
1. Connect to your MongoDB instance
2. Look for database named `scrs`
3. Check the `users` collection

---

## 🛠️ Utility Scripts

### Create Test User

```bash
cd api-server
node scripts/create_test_user.js
```

This creates a test user in the `scrs` database:
- Email: `test@scrs.com`
- Password: `test123`

### Fix Recommendations

```bash
cd api-server
node scripts/fix_recommendations.js
```

This script checks for missing data in recommendations in the `scrs` database.

---

## 🔄 Migration from Old Database

If you have data in an old database (e.g., `acip` or `student-profiling`):

### Option 1: Update Connection String

Simply update your `.env` file to point to the new database:
```env
MONGODB_URI=mongodb://localhost:27017/scrs
```

The database will be created automatically on first connection.

### Option 2: Migrate Data

If you need to migrate existing data:

```bash
# Export from old database
mongoexport --db=old-db-name --collection=users --out=users.json

# Import to new database
mongoimport --db=scrs --collection=users --file=users.json
```

---

## 📝 Important Notes

1. **Database Name**: Always use `scrs` as the database name
2. **Auto-Creation**: MongoDB creates the database automatically on first connection
3. **Collections**: Collections are created automatically when first document is inserted
4. **Backup**: Regularly backup your `scrs` database in production

---

## 🚨 Troubleshooting

### Database Not Found

**Error:** `MongoServerError: database not found`

**Solution:** The database is created automatically. Make sure:
- MongoDB is running
- Connection string is correct
- Database name is `scrs` in the connection string

### Connection Refused

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Check if MongoDB is running: `mongosh` or `mongo`
- Verify connection string
- Check firewall settings
- For Atlas: Verify IP whitelist

### Authentication Failed

**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Verify username and password in connection string
- Check database user permissions
- For Atlas: Verify database user has read/write access

---

## 📚 Related Documentation

- **Setup Guide**: See `docs/SETUP.md`
- **Quick Start**: See `docs/QUICKSTART.md`
- **Deployment**: See `docs/DEPLOYMENT.md`

---

**Database Name**: `scrs`  
**Default Port**: `27017` (local)  
**Status**: ✅ Ready for use


