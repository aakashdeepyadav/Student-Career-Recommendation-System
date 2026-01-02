# Login Credentials

## Default Test User

For quick testing, you can use the default test user:

**Email**: `test@scrs.com`  
**Password**: `test123`

### Creating the Test User

Run this command once to create the test user:

```bash
cd api-server
node scripts/create_test_user.js
```

**Note**: Make sure MongoDB is running before creating the test user.

## Registering New Users

You can also register new users through the web interface:

1. Go to `http://localhost:5173`
2. Click "Register"
3. Enter:
   - Username
   - Email
   - Password
4. Click "Register"
5. You'll be automatically logged in

## Important Notes

- The test user is only created if you run the script
- If the test user already exists, the script will just display the credentials
- For production, always use strong passwords and proper authentication
- The test user can be deleted from MongoDB if needed

## MongoDB Connection

Make sure MongoDB is running before:
- Starting the API server
- Creating test users
- Logging in

To start MongoDB (if installed locally):
```bash
mongod
```

Or use MongoDB Atlas (cloud) and update the `MONGODB_URI` in `api-server/.env`

