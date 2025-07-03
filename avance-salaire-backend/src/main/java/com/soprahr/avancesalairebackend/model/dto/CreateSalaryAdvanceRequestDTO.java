package com.soprahr.avancesalairebackend.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateSalaryAdvanceRequestDTO {
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal requestedAmount;

    @NotBlank
    private String reason;

    @NotNull
    private LocalDate neededDate;
}
