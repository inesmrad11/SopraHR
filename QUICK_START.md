# 🚀 Quick Start Guide - Testing Login Functionality

This guide will help you quickly test the login functionality of the SopraHR application.

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Maven 3.6+

## 🎯 Quick Test Steps

### 1. Start the Backend

```bash
cd avance-salaire-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Expected Output:**
```
Started AvanceSalaireBackendApplication in X.XXX seconds
```

### 2. Start the Frontend

```bash
cd avance-salaire-frontend
npm install
npm start
```

**Expected Output:**
```
Compiled successfully.
Local:            http://localhost:4200/
```

### 3. Test the Login

1. **Open your browser** and go to `http://localhost:4200`
2. **Use these test credentials:**

| Email | Password | Role |
|-------|----------|------|
| `admin@soprahr.com` | `password` | ADMIN |
| `hr@soprahr.com` | `password` | HR |
| `employee@soprahr.com` | `password` | EMPLOYEE |

3. **Expected behavior:**
   - Login form should appear
   - Enter credentials and click "Se connecter"
   - You should see "Connexion réussie ! Redirection en cours..."
   - You'll be redirected to the appropriate dashboard based on your role

### 4. API Testing (Optional)

If you want to test the API directly:

#### Using PowerShell (Windows):
```powershell
.\test-login.ps1
```

#### Using curl (Linux/Mac):
```bash
# Test login
curl -X POST http://localhost:9009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@soprahr.com","password":"password"}'

# Expected response:
# {"token":"eyJhbGciOiJIUzI1NiJ9...","message":"Authentication successful"}
```

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Backend won't start
**Solution:** 
- Check if port 9009 is available
- Ensure Java 17+ is installed
- Run: `java -version`

**Problem:** Database connection error
**Solution:**
- The dev profile uses H2 in-memory database
- No additional setup required
- Check logs for specific error messages

### Frontend Issues

**Problem:** Frontend won't start
**Solution:**
- Check if port 4200 is available
- Ensure Node.js 18+ is installed
- Run: `node --version`

**Problem:** Can't connect to backend
**Solution:**
- Ensure backend is running on port 9009
- Check browser console for CORS errors
- Verify API URL in `environment.ts`

### Login Issues

**Problem:** Login fails with "Invalid credentials"
**Solution:**
- Use exact test credentials: `admin@soprahr.com` / `password`
- Check backend logs for authentication errors
- Ensure database is initialized with test data

**Problem:** reCAPTCHA errors
**Solution:**
- In development mode, reCAPTCHA is disabled
- Check `application-dev.properties`: `app.security.require-captcha=false`

## 📊 Expected Test Results

### Successful Login Flow

1. **Form Validation:** ✅ Required fields validation
2. **API Call:** ✅ POST to `/api/auth/login`
3. **Authentication:** ✅ JWT token generation
4. **Token Storage:** ✅ Token stored in browser
5. **Redirect:** ✅ Role-based dashboard redirect
6. **Protected Routes:** ✅ Route guards working

### Security Features

- ✅ Password hashing (BCrypt)
- ✅ JWT token expiration
- ✅ Account lockout after failed attempts
- ✅ CORS configuration
- ✅ Input validation
- ✅ Role-based access control

## 🐳 Docker Alternative

If you prefer using Docker:

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

## 📝 Next Steps

After successful login testing:

1. **Create real user accounts** in the database
2. **Configure email settings** for notifications
3. **Set up production environment** variables
4. **Deploy to staging/production** environments
5. **Implement additional features** (salary advance requests, etc.)

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review backend logs for error details
- Check browser console for frontend errors
- Verify environment configurations

---

**Happy Testing! 🎉** 