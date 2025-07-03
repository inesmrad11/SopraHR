package com.soprahr.avancesalairebackend.model.dto;

import com.soprahr.avancesalairebackend.model.enums.RequestStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SalaryAdvanceRequestDTO {
    private Long id;
    private BigDecimal requestedAmount;
    private String reason;
    private RequestStatus status;
    private LocalDate requestDate;
    private LocalDate neededDate;
    private LocalDate approvedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String employeeFullName;
    private String approvedByFullName;
}
