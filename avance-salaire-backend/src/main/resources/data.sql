-- Development Data Initialization
-- This script will be executed when using H2 in-memory database

-- Insert test users
INSERT INTO users (employeeId, name, lastName, firstName, jobTitle, email, password, role, enabled, createdAt, updatedAt) VALUES
('EMP001', 'Admin User', 'Admin', 'User', 'System Administrator', 'admin@soprahr.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP002', 'HR Manager', 'HR', 'Manager', 'HR Manager', 'hr@soprahr.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HR_MANAGER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP003', 'Test Employee', 'Test', 'Employé', 'Software Developer', 'employee@soprahr.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLOYEE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Note: The password hash above corresponds to 'password' when encoded with BCrypt 