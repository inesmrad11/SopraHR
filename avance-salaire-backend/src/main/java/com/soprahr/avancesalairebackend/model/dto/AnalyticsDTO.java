package com.soprahr.avancesalairebackend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private int totalRequests;
    private int approvedRequests;
    private int rejectedRequests;
    private int pendingRequests;
    private BigDecimal totalRequestedAmount;
    private BigDecimal totalApprovedAmount;
    private BigDecimal averageRequestedAmount;
    private BigDecimal averageApprovedAmount;
    private BigDecimal outstandingAdvances;
    private double approvalRate;
    private List<Integer> trends; // e.g., monthly totals
    private List<Integer> statusDistribution; // [approved, rejected, pending]
} 