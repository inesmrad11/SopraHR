package com.soprahr.avancesalairebackend.service.repaymentSchedule;

import com.soprahr.avancesalairebackend.model.dto.RepaymentScheduleDTO;
import java.util.List;

public interface IRepaymentScheduleService {
    RepaymentScheduleDTO createRepaymentSchedule(RepaymentScheduleDTO dto);
    List<RepaymentScheduleDTO> getRepaymentSchedulesByRequestId(Long salaryAdvanceRequestId);
    RepaymentScheduleDTO getRepaymentSchedule(Long id);
    RepaymentScheduleDTO updateRepaymentSchedule(Long id, RepaymentScheduleDTO dto);
    void deleteRepaymentSchedule(Long id);
    // Calcul du montant total remboursé pour une demande
    java.math.BigDecimal getTotalRepaidAmount(Long salaryAdvanceRequestId);
} 