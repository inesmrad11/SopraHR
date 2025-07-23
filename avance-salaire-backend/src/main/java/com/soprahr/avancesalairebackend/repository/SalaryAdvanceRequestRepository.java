package com.soprahr.avancesalairebackend.repository;

import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalaryAdvanceRequestRepository extends JpaRepository<SalaryAdvanceRequest, Long> {
    java.util.List<SalaryAdvanceRequest> findByEmployeeId(Long employeeId);
} 