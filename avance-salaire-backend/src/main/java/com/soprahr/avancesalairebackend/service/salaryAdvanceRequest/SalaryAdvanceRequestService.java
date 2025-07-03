package com.soprahr.avancesalairebackend.service.salaryAdvanceRequest;

import com.soprahr.avancesalairebackend.model.dto.SalaryAdvanceRequestDTO;
import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import com.soprahr.avancesalairebackend.model.entity.User;
import com.soprahr.avancesalairebackend.model.enums.RequestStatus;
import com.soprahr.avancesalairebackend.repository.SalaryAdvanceRepository;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryAdvanceRequestService implements ISalaryAdvanceRequestService{
}
