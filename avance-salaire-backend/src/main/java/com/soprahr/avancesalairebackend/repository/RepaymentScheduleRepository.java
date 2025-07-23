package com.soprahr.avancesalairebackend.repository;

import com.soprahr.avancesalairebackend.model.entity.RepaymentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepaymentScheduleRepository extends JpaRepository<RepaymentSchedule, Long> {
    List<RepaymentSchedule> findBySalaryAdvanceRequestId(Long salaryAdvanceRequestId);
    void deleteBySalaryAdvanceRequest(com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest request);
}