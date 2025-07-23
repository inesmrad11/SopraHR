package com.soprahr.avancesalairebackend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestHistoryItemDTO {
    private Long id;
    private String employeeFullName;
    private BigDecimal requestedAmount;
    private Integer repaymentMonths;
    private String status;
    private LocalDate requestDate;
    private String approvedByFullName;
} 