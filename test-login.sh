#!/bin/bash

# Test Login Script for SopraHR Application
# This script tests the login functionality of the backend API

echo "🧪 Testing SopraHR Login Functionality"
echo "======================================"

# Configuration
API_URL="http://localhost:9009/api"
TEST_EMAIL="admin@soprahr.com"
TEST_PASSWORD="password"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check if backend is running
echo -e "\n${YELLOW}1. Checking if backend is running...${NC}"
if curl -s http://localhost:9009/actuator/health > /dev/null; then
    print_status 0 "Backend is running"
else
    print_status 1 "Backend is not running. Please start the backend first."
    exit 1
fi

# Test login endpoint
echo -e "\n${YELLOW}2. Testing login endpoint...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    "$API_URL/auth/login")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    print_status 0 "Login successful"
    echo "Response: $LOGIN_RESPONSE"
    
    # Extract token for further testing
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo -e "\n${YELLOW}3. Testing authenticated endpoint...${NC}"
        AUTH_RESPONSE=$(curl -s -X GET \
            -H "Authorization: Bearer $TOKEN" \
            "$API_URL/users/me")
        
        if echo "$AUTH_RESPONSE" | grep -q "email"; then
            print_status 0 "Authentication successful"
            echo "User info: $AUTH_RESPONSE"
        else
            print_status 1 "Authentication failed"
            echo "Response: $AUTH_RESPONSE"
        fi
    fi
else
    print_status 1 "Login failed"
    echo "Response: $LOGIN_RESPONSE"
fi

# Test invalid credentials
echo -e "\n${YELLOW}4. Testing invalid credentials...${NC}"
INVALID_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"invalid@test.com\",\"password\":\"wrongpassword\"}" \
    "$API_URL/auth/login")

if echo "$INVALID_RESPONSE" | grep -q "Invalid"; then
    print_status 0 "Invalid credentials properly rejected"
else
    print_status 1 "Invalid credentials not properly handled"
    echo "Response: $INVALID_RESPONSE"
fi

echo -e "\n${GREEN}🎉 Login testing completed!${NC}" 