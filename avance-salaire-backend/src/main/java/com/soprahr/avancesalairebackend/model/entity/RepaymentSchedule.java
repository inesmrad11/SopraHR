package com.soprahr.avancesalairebackend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepaymentSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_advance_request_id")
    private SalaryAdvanceRequest salaryAdvanceRequest;

    private LocalDate dueDate;
    private BigDecimal amount;
    private boolean paid;
}