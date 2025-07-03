package com.soprahr.avancesalairebackend.repository;

import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import com.soprahr.avancesalairebackend.model.entity.User;
import com.soprahr.avancesalairebackend.model.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalaryAdvanceRepository extends JpaRepository<SalaryAdvanceRequest, Long> {
    List<SalaryAdvanceRequest> findByEmployee(User employee);
    List<SalaryAdvanceRequest> findByStatus(RequestStatus status);
    List<SalaryAdvanceRequest> findByRequestDateBetween(LocalDate start, LocalDate end);
}
