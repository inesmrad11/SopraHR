package com.soprahr.avancesalairebackend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.soprahr.avancesalairebackend.model.enums.RequestStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryAdvanceRequest implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Requested amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal requestedAmount;

    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason can't exceed 500 characters")
    private String reason;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @NotNull
    private LocalDate requestDate;

    @NotNull
    private LocalDate neededDate;

    private LocalDate approvedAt;

    private String rejectionReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonIgnore
    private User employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @JsonIgnore
    private User approvedBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = RequestStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

