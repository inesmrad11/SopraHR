package com.soprahr.avancesalairebackend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RepaymentScheduleDTO {
    private Long id;
    private LocalDate dueDate;
    private BigDecimal amount;
    private boolean paid;
    private Long salaryAdvanceRequestId;
    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }
    public Long getSalaryAdvanceRequestId() { return salaryAdvanceRequestId; }
    public void setSalaryAdvanceRequestId(Long salaryAdvanceRequestId) { this.salaryAdvanceRequestId = salaryAdvanceRequestId; }
}