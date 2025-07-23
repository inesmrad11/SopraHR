package com.soprahr.avancesalairebackend.service.salaryAdvanceRequest;

import com.soprahr.avancesalairebackend.model.dto.CreateSalaryAdvanceRequestDTO;
import com.soprahr.avancesalairebackend.model.dto.SalaryAdvanceRequestDTO;
import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface ISalaryAdvanceRequestService {
    SalaryAdvanceRequestDTO createRequest(CreateSalaryAdvanceRequestDTO dto);
    SalaryAdvanceRequestDTO getRequestById(Long id);
    List<SalaryAdvanceRequestDTO> listRequests(Optional<String> status, Optional<Long> employeeId, Optional<LocalDate> from, Optional<LocalDate> to);
    void approveRequest(Long id);
    void rejectRequest(Long id, String reason);
    void cancelRequest(Long id);
    void deleteRequest(Long id);
}
