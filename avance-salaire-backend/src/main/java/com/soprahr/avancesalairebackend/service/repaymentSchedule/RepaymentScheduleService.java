package com.soprahr.avancesalairebackend.service.repaymentSchedule;

import com.soprahr.avancesalairebackend.model.dto.RepaymentScheduleDTO;
import com.soprahr.avancesalairebackend.model.entity.RepaymentSchedule;
import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import com.soprahr.avancesalairebackend.repository.RepaymentScheduleRepository;
import com.soprahr.avancesalairebackend.repository.SalaryAdvanceRequestRepository;
import com.soprahr.avancesalairebackend.repository.NotificationRepository;
import com.soprahr.avancesalairebackend.model.entity.Notification;
import com.soprahr.avancesalairebackend.model.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class RepaymentScheduleService implements IRepaymentScheduleService {
    private final RepaymentScheduleRepository repository;
    private final SalaryAdvanceRequestRepository salaryAdvanceRequestRepository;
    private final NotificationRepository notificationRepository;
    private static final Logger log = LoggerFactory.getLogger(RepaymentScheduleService.class);

    @Override
    public RepaymentScheduleDTO createRepaymentSchedule(RepaymentScheduleDTO dto) {
        RepaymentSchedule entity = new RepaymentSchedule();
        entity.setDueDate(dto.getDueDate());
        entity.setAmount(dto.getAmount());
        entity.setPaid(dto.isPaid());
        SalaryAdvanceRequest request = salaryAdvanceRequestRepository.findById(dto.getSalaryAdvanceRequestId()).orElseThrow();
        entity.setSalaryAdvanceRequest(request);
        entity = repository.save(entity);
        return toDTO(entity);
    }

    @Override
    public List<RepaymentScheduleDTO> getRepaymentSchedulesByRequestId(Long salaryAdvanceRequestId) {
        return repository.findBySalaryAdvanceRequestId(salaryAdvanceRequestId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public RepaymentScheduleDTO getRepaymentSchedule(Long id) {
        return repository.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public RepaymentScheduleDTO updateRepaymentSchedule(Long id, RepaymentScheduleDTO dto) {
        RepaymentSchedule entity = repository.findById(id).orElseThrow();
        entity.setDueDate(dto.getDueDate());
        entity.setAmount(dto.getAmount());
        entity.setPaid(dto.isPaid());
        entity = repository.save(entity);
        return toDTO(entity);
    }

    @Override
    public void deleteRepaymentSchedule(Long id) {
        repository.deleteById(id);
    }

    @Override
    public BigDecimal getTotalRepaidAmount(Long salaryAdvanceRequestId) {
        return repository.findBySalaryAdvanceRequestId(salaryAdvanceRequestId)
                .stream()
                .filter(RepaymentSchedule::isPaid)
                .map(RepaymentSchedule::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Tâche planifiée : chaque 23 du mois à 1h du matin, marque comme payées toutes les échéances dues.
     */
    @Scheduled(cron = "0 0 1 23 * ?") // chaque 23 du mois à 1h
    @Transactional
    public void processMonthlyPayroll() {
        LocalDate today = LocalDate.now();
        List<RepaymentSchedule> toPay = repository.findAll().stream()
            .filter(s -> !s.isPaid() && !s.getDueDate().isAfter(today))
            .collect(Collectors.toList());
        for (RepaymentSchedule sched : toPay) {
            sched.setPaid(true);
            repository.save(sched);
            // Notification à l'employé
            SalaryAdvanceRequest req = sched.getSalaryAdvanceRequest();
            if (req != null && req.getEmployee() != null) {
                Notification notif = Notification.builder()
                    .title("Remboursement effectué")
                    .message("Votre échéance de remboursement du " + sched.getDueDate() + " a été prélevée automatiquement (montant : " + sched.getAmount() + " TND).")
                    .type(NotificationType.INFO)
                    .read(false)
                    .recipient(req.getEmployee())
                    .relatedRequest(req)
                    .build();
                notificationRepository.save(notif);
                log.info("Notification de remboursement envoyée à {} pour l'échéance du {} ({} TND)", req.getEmployee().getEmail(), sched.getDueDate(), sched.getAmount());
            }
        }
    }

    private RepaymentScheduleDTO toDTO(RepaymentSchedule entity) {
        RepaymentScheduleDTO dto = new RepaymentScheduleDTO();
        dto.setId(entity.getId());
        dto.setDueDate(entity.getDueDate());
        dto.setAmount(entity.getAmount());
        dto.setPaid(entity.isPaid());
        dto.setSalaryAdvanceRequestId(entity.getSalaryAdvanceRequest() != null ? entity.getSalaryAdvanceRequest().getId() : null);
        return dto;
    }
} 