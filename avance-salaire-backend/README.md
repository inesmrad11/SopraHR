# Environment Variables

The following environment variables are required for running the backend in production and local development:

| Variable              | Description                        | Example Value                        | Required |
|-----------------------|------------------------------------|--------------------------------------|----------|
| `RECAPTCHA_SECRET`    | Google reCAPTCHA secret key        | `your-recaptcha-secret`              | Yes      |
| `CAPTCHA_SECRET`      | Custom CAPTCHA secret (if used)    | `your-captcha-secret`                | Yes      |
| `JWT_SECRET`          | JWT signing secret (base64, 32+ bytes) | `your-jwt-secret-base64`         | Yes      |
| `JWT_EXPIRATION`      | JWT expiration in ms               | `86400000`                           | No (default: 86400000) |
| `DB_URL`              | JDBC URL for database              | `jdbc:mysql://localhost:3306/db`     | Yes      |
| `DB_USERNAME`         | Database username                  | `root`                               | Yes      |
| `DB_PASSWORD`         | Database password                  | `password`                           | Yes      |
| `CORS_ALLOWED_ORIGINS`| Allowed origins for CORS           | `http://localhost:4200`              | Yes      |

## Example `.env` file for local development

```
RECAPTCHA_SECRET=dummy
CAPTCHA_SECRET=dummy
JWT_SECRET=your-jwt-secret-base64
DB_URL=jdbc:mysql://localhost:3306/yourdb
DB_USERNAME=root
DB_PASSWORD=password
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

> **Note:** For production, use secure values and inject them via your deployment environment (Kubernetes, Docker secrets, CI/CD, etc.).

---

## Local Development: Loading .env automatically

Spring Boot does **not** load `.env` files by default. For local development, you can use the [dotenv-java](https://github.com/cdimascio/dotenv-java) library to load `.env` files automatically.

### To enable .env loading:

1. Add the dependency to your `pom.xml`:

```xml
<dependency>
  <groupId>io.github.cdimascio</groupId>
  <artifactId>dotenv-java</artifactId>
  <version>3.0.0</version>
  <scope>runtime</scope>
</dependency>
```

2. Add the following to your `AvanceSalaireBackendApplication.java` main method:

```java
import io.github.cdimascio.dotenv.Dotenv;

public static void main(String[] args) {
    // Load .env file for local development
    Dotenv.configure().ignoreIfMissing().load();
    SpringApplication.run(AvanceSalaireBackendApplication.class, args);
}
```

This will load variables from `.env` into the environment for Spring Boot to use.

---

## Startup Checks (Optional)

You can add checks in your `EnvLogger` or main application to fail fast if critical variables are missing. 