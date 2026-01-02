# Database Configuration

## Database Name: `scrs`

The SCRS system uses MongoDB with the database name **`scrs`** (Student Career Recommendation System).

---

## Configuration Files

### 1. API Server (`api-server/server.js`)

Default connection string:
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scrs';
```

### 2. Utility Scripts

**`api-server/scripts/create_test_user.js`:**
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scrs';
```

**`api-server/scripts/fix_recommendations.js`:**
```javascript
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scrs');
```

---

## Environment Variables

Create a `.env` file in `api-server/` directory:

```env
# MongoDB Connection
# Local: mongodb://localhost:27017/scrs
# Atlas: mongodb+srv://username:password@cluster.mongodb.net/scrs?retryWrites=true&w=majority
MONGODB_URI=mongodb://localhost:27017/scrs

# Other variables
JWT_SECRET=your-secret-key
PORT=3000
FRONTEND_URL=http://localhost:5173
ML_ENGINE_URL=http://localhost:8001
```

---

## Database Creation

The database `scrs` is created automatically when:
1. The API server connects to MongoDB for the first time
2. The first document is inserted into a collection

**No manual database creation is required.**

---

## Collections

The `scrs` database contains:
- **`users`**: User profiles, authentication, recommendations, cluster assignments

---

## Verification

### Check Connection

Start the API server and look for:
```
Connected to MongoDB
API Server running on port 3000
```

### Verify Database

Using MongoDB Shell:
```bash
mongosh
> use scrs
> show collections
> db.users.find().count()
```

---

## Migration

If migrating from an old database name:

1. **Update `.env` file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/scrs
   ```

2. **Or export/import data:**
   ```bash
   # Export
   mongoexport --db=old-db --collection=users --out=users.json
   
   # Import
   mongoimport --db=scrs --collection=users --file=users.json
   ```

---

**Status**: ✅ All configuration files use `scrs` as database name


