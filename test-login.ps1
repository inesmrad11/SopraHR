# Test Login Script for SopraHR Application (PowerShell)
# This script tests the login functionality of the backend API

Write-Host "🧪 Testing SopraHR Login Functionality" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Configuration
$API_URL = "http://localhost:9009/api"
$TEST_EMAIL = "admin@soprahr.com"
$TEST_PASSWORD = "password"

# Function to print colored output
function Write-Status {
    param(
        [bool]$Success,
        [string]$Message
    )
    
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

# Check if backend is running
Write-Host "`n1. Checking if backend is running..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:9009/actuator/health" -Method Get -TimeoutSec 5
    Write-Status -Success $true -Message "Backend is running"
} catch {
    Write-Status -Success $false -Message "Backend is not running. Please start the backend first."
    exit 1
}

# Test login endpoint
Write-Host "`n2. Testing login endpoint..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Status -Success $true -Message "Login successful"
        Write-Host "Response: $($loginResponse | ConvertTo-Json)" -ForegroundColor Gray
        
        $token = $loginResponse.token
        
        # Test authenticated endpoint
        Write-Host "`n3. Testing authenticated endpoint..." -ForegroundColor Yellow
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
            }
            
            $authResponse = Invoke-RestMethod -Uri "$API_URL/users/me" -Method Get -Headers $headers
            Write-Status -Success $true -Message "Authentication successful"
            Write-Host "User info: $($authResponse | ConvertTo-Json)" -ForegroundColor Gray
        } catch {
            Write-Status -Success $false -Message "Authentication failed"
            Write-Host "Response: $($_.Exception.Message)" -ForegroundColor Gray
        }
    } else {
        Write-Status -Success $false -Message "Login failed - no token received"
        Write-Host "Response: $($loginResponse | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    Write-Status -Success $false -Message "Login failed"
    Write-Host "Response: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test invalid credentials
Write-Host "`n4. Testing invalid credentials..." -ForegroundColor Yellow
try {
    $invalidBody = @{
        email = "invalid@test.com"
        password = "wrongpassword"
    } | ConvertTo-Json

    $invalidResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $invalidBody -ContentType "application/json"
    Write-Status -Success $false -Message "Invalid credentials not properly handled"
    Write-Host "Response: $($invalidResponse | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Status -Success $true -Message "Invalid credentials properly rejected"
    } else {
        Write-Status -Success $false -Message "Unexpected error with invalid credentials"
        Write-Host "Response: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Login testing completed!" -ForegroundColor Green 