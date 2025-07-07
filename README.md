# SopraHR - Avance Salaire Application

A comprehensive salary advance management system built with Angular frontend and Spring Boot backend.

## 🚀 Features

- **User Authentication**: Secure login with JWT tokens and role-based access
- **Role-Based Access Control**: Different dashboards for HR, Admin, and Employee users
- **Salary Advance Requests**: Submit and manage salary advance requests
- **Request Management**: HR can approve/reject requests with feedback
- **Analytics Dashboard**: Track and analyze request patterns
- **Email Notifications**: Automated email notifications for status updates
- **reCAPTCHA Integration**: Enhanced security with Google reCAPTCHA
- **CI/CD Ready**: Environment-specific configurations and Docker support

## 🏗️ Architecture

- **Frontend**: Angular 17 (Standalone Components)
- **Backend**: Spring Boot 3.x with Spring Security
- **Database**: H2 (Development) / MySQL (Production)
- **Authentication**: JWT with refresh tokens
- **Security**: reCAPTCHA, CORS, Rate limiting
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Docker & Docker Compose (optional)
- Maven 3.6+

## 🛠️ Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sopraHR
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:9009
   - H2 Console: http://localhost:9009/h2-console

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd avance-salaire-backend
   ```

2. **Run with Maven**
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd avance-salaire-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 🔐 Test Credentials

The following test users are available in development mode:

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@soprahr.com | password | ADMIN | Full access |
| hr@soprahr.com | password | HR | HR dashboard |
| employee@soprahr.com | password | EMPLOYEE | Employee dashboard |

## 🌍 Environment Configuration

### Frontend Environments

- **Development**: `src/app/environments/environment.ts`
- **Production**: `src/app/environments/environment.prod.ts`

### Backend Profiles

- **Development**: `application-dev.properties`
- **Production**: `application-prod.properties`

### Environment Variables

#### Backend (Production)
```bash
DB_URL=jdbc:mysql://localhost:3306/soprahr
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=https://yourdomain.com
RECAPTCHA_SECRET=your_recaptcha_secret
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_password
```

#### Frontend (Production)
Update `environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
  recaptchaSiteKey: 'your_recaptcha_site_key'
};
```

## 🔧 Development

### Project Structure

```
sopraHR/
├── avance-salaire-backend/          # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/soprahr/avancesalairebackend/
│   │       ├── controller/          # REST controllers
│   │       ├── service/             # Business logic
│   │       ├── model/               # Entities and DTOs
│   │       ├── repository/          # Data access layer
│   │       └── config/              # Configuration classes
│   └── src/main/resources/
│       ├── application.properties   # Main configuration
│       ├── application-dev.properties
│       └── application-prod.properties
├── avance-salaire-frontend/         # Angular frontend
│   ├── src/app/
│   │   ├── core/                    # Core services and guards
│   │   ├── features/                # Feature modules
│   │   ├── shared/                  # Shared components
│   │   └── environments/            # Environment configs
│   └── src/assets/                  # Static assets
└── docker-compose.yml               # Docker orchestration
```

### Key Components

#### Authentication Flow
1. User submits login credentials
2. Backend validates credentials and reCAPTCHA
3. JWT token generated and returned
4. Frontend stores token and redirects to appropriate dashboard
5. HTTP interceptor adds token to all subsequent requests
6. Token refresh handled automatically

#### Security Features
- JWT-based authentication
- Role-based access control
- reCAPTCHA integration
- Account lockout after failed attempts
- CORS configuration
- Rate limiting
- Input validation

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/send-otp` - Send OTP for 2FA
- `POST /api/auth/verify-otp` - Verify OTP

#### Salary Advance Requests
- `GET /api/requests` - Get all requests (HR/Admin)
- `POST /api/requests` - Create new request
- `PUT /api/requests/{id}` - Update request
- `DELETE /api/requests/{id}` - Delete request

## 🚀 Deployment

### Production Deployment

1. **Build the applications**
   ```bash
   # Backend
   cd avance-salaire-backend
   ./mvnw clean package -Pprod

   # Frontend
   cd avance-salaire-frontend
   npm run build --prod
   ```

2. **Set environment variables**
   ```bash
   export DB_URL=your_production_db_url
   export JWT_SECRET=your_production_jwt_secret
   # ... other environment variables
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### CI/CD Pipeline

The application is designed to work with CI/CD pipelines:

- **Environment-specific builds**: Different configurations for dev/staging/prod
- **Docker support**: Containerized deployment
- **Health checks**: Built-in health endpoints
- **Configuration management**: Externalized configuration

## 🧪 Testing

### Backend Tests
```bash
cd avance-salaire-backend
./mvnw test
```

### Frontend Tests
```bash
cd avance-salaire-frontend
npm test
```

### E2E Tests
```bash
cd avance-salaire-frontend
npm run e2e
```

## 📊 Monitoring

### Health Checks
- Backend: `GET /actuator/health`
- Frontend: `GET /health`

### Logging
- Backend logs: Check application logs
- Frontend logs: Browser console
- Docker logs: `docker-compose logs -f [service]`

## 🔒 Security Considerations

- All passwords are hashed using BCrypt
- JWT tokens have expiration times
- reCAPTCHA prevents automated attacks
- CORS is properly configured
- Input validation on all endpoints
- Rate limiting prevents abuse
- Account lockout after failed attempts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

To update the application:

1. Pull the latest changes
2. Update dependencies if needed
3. Run tests
4. Deploy using the deployment guide

---

**Note**: This is a development setup. For production deployment, ensure all security configurations are properly set and secrets are managed securely. 