package com.soprahr.avancesalairebackend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.soprahr.avancesalairebackend.model.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Data
@Builder(builderMethodName = "userBuilder")
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"password"})
@EqualsAndHashCode(exclude = {"requests", "notifications", "feedbacks", "actions", "company"})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Employee ID is mandatory")
    @Column(unique = true)
    private String employeeId;

    @NotBlank(message = "Name is mandatory")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Last name is mandatory")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "First name is mandatory")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Job title is mandatory")
    @Size(max = 100)
    private String jobTitle;

    @NotBlank(message = "Email is mandatory")
    @Email
    @Size(max = 150)
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 8)
    @JsonIgnore
    private String password;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "last_login_ip")
    private String lastLoginIp;

    @Column(name = "failed_attempts")
    private int failedAttempts;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid phone number")
    private String phone;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Size(max = 255)
    private String verificationToken;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean status = true;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Role is mandatory")
    private UserRole role;

    // ✅ Company relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    // ✅ Security methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        if (lockTime == null) {
            return true;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime unlockTime = lockTime.plusHours(1); // Lock for 1 hour
        return now.isAfter(unlockTime);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Transient
    public boolean hasRole(UserRole role) {
        return this.role == role;
    }
}
