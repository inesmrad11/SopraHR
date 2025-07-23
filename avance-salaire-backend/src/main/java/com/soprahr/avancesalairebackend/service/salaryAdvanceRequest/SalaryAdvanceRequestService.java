package com.soprahr.avancesalairebackend.service.salaryAdvanceRequest;

import com.soprahr.avancesalairebackend.model.dto.CreateSalaryAdvanceRequestDTO;
import com.soprahr.avancesalairebackend.model.dto.SalaryAdvanceRequestDTO;
import com.soprahr.avancesalairebackend.model.dto.RequestHistoryDTO;
import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import com.soprahr.avancesalairebackend.model.entity.RequestHistory;
import com.soprahr.avancesalairebackend.model.entity.User;
import com.soprahr.avancesalairebackend.model.entity.RepaymentSchedule;
import com.soprahr.avancesalairebackend.model.enums.RequestStatus;
import com.soprahr.avancesalairebackend.repository.SalaryAdvanceRepository;
import com.soprahr.avancesalairebackend.repository.SalaryAdvanceRequestRepository;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import com.soprahr.avancesalairebackend.repository.RequestHistoryRepository;
import com.soprahr.avancesalairebackend.repository.RepaymentScheduleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import com.soprahr.avancesalairebackend.model.dto.AnalyticsDTO;
import java.time.YearMonth;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import com.soprahr.avancesalairebackend.model.dto.RequestHistoryItemDTO;
import org.apache.poi.ss.usermodel.Row;

@Service
@Transactional
@RequiredArgsConstructor
public class SalaryAdvanceRequestService implements ISalaryAdvanceRequestService {

    private final SalaryAdvanceRequestRepository salaryAdvanceRequestRepository;
    private final UserRepository userRepository;
    private final RequestHistoryRepository requestHistoryRepository;
    @org.springframework.beans.factory.annotation.Autowired
    private com.soprahr.avancesalairebackend.repository.RepaymentScheduleRepository repaymentScheduleRepository;

    @Override
    public SalaryAdvanceRequestDTO createRequest(CreateSalaryAdvanceRequestDTO dto) {
        // Récupérer l'utilisateur courant via le SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User employee = userRepository.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé : " + email));

        // Récupérer toutes les demandes de l'employé
        List<SalaryAdvanceRequest> demandes = salaryAdvanceRequestRepository.findByEmployeeId(employee.getId());

        // 1. Interdire une nouvelle demande si une demande PENDING existe déjà
        boolean hasPending = demandes.stream().anyMatch(d -> d.getStatus() == RequestStatus.PENDING);
        if (hasPending) {
            throw new IllegalArgumentException("Vous avez déjà une demande d'avance en attente de traitement. Veuillez attendre la décision avant d'en soumettre une nouvelle.");
        }

        // 2. Calcul du plafond disponible (ne prendre en compte que les demandes APPROUVÉES et non totalement remboursées)
        BigDecimal plafond = employee.getSalary().multiply(BigDecimal.valueOf(2));
        BigDecimal totalNonRembourse = BigDecimal.ZERO;
        for (SalaryAdvanceRequest demande : demandes) {
            if (demande.getStatus() == RequestStatus.APPROVED
                && demande.getRepaymentSchedules() != null && !demande.getRepaymentSchedules().isEmpty()) {
                BigDecimal reste = demande.getRepaymentSchedules().stream()
                        .filter(s -> !s.isPaid())
                        .map(RepaymentSchedule::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                totalNonRembourse = totalNonRembourse.add(reste);
            }
        }
        if (totalNonRembourse.compareTo(BigDecimal.ZERO) < 0) totalNonRembourse = BigDecimal.ZERO;
        BigDecimal plafondDisponible = plafond.subtract(totalNonRembourse);
        if (plafondDisponible.compareTo(BigDecimal.ZERO) < 0) plafondDisponible = BigDecimal.ZERO;

        // 1. Interdire toute avance qui dépasse le plafond disponible
        if (dto.getRequestedAmount().compareTo(plafondDisponible) > 0) {
            throw new IllegalArgumentException("Le montant demandé dépasse le plafond autorisé (" + plafondDisponible + " TND restants)." );
        }

        // 2. Durée max 6 mois
        if (dto.getRepaymentMonths() > 6) {
            throw new IllegalArgumentException("La durée de remboursement ne peut pas dépasser 6 mois.");
        }

        // 3. Si montant > (salaire - mensualité), min 2 mois
        BigDecimal monthly = dto.getRequestedAmount().divide(BigDecimal.valueOf(dto.getRepaymentMonths()), 2, RoundingMode.HALF_UP);
        BigDecimal resteSalaire = employee.getSalary().subtract(monthly);
        if (resteSalaire.compareTo(BigDecimal.ZERO) < 0 && dto.getRepaymentMonths() < 2) {
            throw new IllegalArgumentException("Si le montant demandé dépasse votre salaire mensuel, vous devez rembourser sur au moins 2 mois.");
        }

        // 4. Toutes les avances doivent être remboursées avant le 31 décembre
        LocalDate now = LocalDate.now();
        LocalDate lastRepayment = now.plusMonths(dto.getRepaymentMonths());
        LocalDate endOfYear = LocalDate.of(now.getYear(), 12, 31);
        if (lastRepayment.isAfter(endOfYear)) {
            throw new IllegalArgumentException("Toutes les avances doivent être remboursées avant le 31 décembre de l'année en cours.");
        }

        SalaryAdvanceRequest entity = new SalaryAdvanceRequest();
        entity.setRequestedAmount(dto.getRequestedAmount());
        entity.setReason(dto.getReason());
        entity.setNeededDate(dto.getNeededDate());
        entity.setRequestDate(LocalDate.now());
        entity.setEmployee(employee);
        entity.setStatus(RequestStatus.PENDING);
        int months = dto.getRepaymentMonths();
        entity.setRepaymentSchedules(generateRepaymentSchedules(entity, months));
        entity = salaryAdvanceRequestRepository.save(entity);
        return toDTO(entity);
    }

    private List<RepaymentSchedule> generateRepaymentSchedules(SalaryAdvanceRequest request, int months) {
        List<RepaymentSchedule> schedules = new ArrayList<>();
        BigDecimal monthlyAmount = request.getRequestedAmount().divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
        LocalDate startDate = request.getRequestDate().plusMonths(1); // Première échéance = mois suivant la demande
        for (int i = 0; i < months; i++) {
            LocalDate dueDate = startDate.plusMonths(i);
            if (dueDate.isBefore(request.getRequestDate())) {
                throw new IllegalArgumentException("La date d'échéance ne peut pas être antérieure à la date de la demande.");
            }
            schedules.add(RepaymentSchedule.builder()
                .salaryAdvanceRequest(request)
                .dueDate(dueDate)
                .amount(monthlyAmount)
                .paid(false)
                .build());
        }
        return schedules;
    }

    @Override
    public SalaryAdvanceRequestDTO getRequestById(Long id) {
        SalaryAdvanceRequest entity = salaryAdvanceRequestRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Request not found"));
        return toDTO(entity);
    }

    @Override
    public List<SalaryAdvanceRequestDTO> listRequests(Optional<String> status, Optional<Long> employeeId, Optional<LocalDate> from, Optional<LocalDate> to) {
        List<SalaryAdvanceRequest> entities = salaryAdvanceRequestRepository.findAll(); // à adapter pour filtrer
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Ne pas mettre @Override ici car ce n'est pas dans l'interface
    public List<SalaryAdvanceRequestDTO> listRequestsForUser(Long userId) {
        return salaryAdvanceRequestRepository.findByEmployeeId(userId)
            .stream().map(this::toDTO).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void approveRequest(Long id) {
        SalaryAdvanceRequest request = salaryAdvanceRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Demande non trouvée"));
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Seules les demandes en attente peuvent être validées.");
        }
        User employee = request.getEmployee();
        BigDecimal plafond = employee.getSalary().multiply(BigDecimal.valueOf(2));
        BigDecimal totalNonRembourse = BigDecimal.ZERO;
        if (employee.getRequests() != null) {
            for (SalaryAdvanceRequest demande : employee.getRequests()) {
                if (demande.getStatus() == RequestStatus.APPROVED
                    && demande.getRepaymentSchedules() != null && !demande.getRepaymentSchedules().isEmpty()) {
                    BigDecimal reste = demande.getRepaymentSchedules().stream()
                            .filter(s -> !s.isPaid())
                            .map(RepaymentSchedule::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    totalNonRembourse = totalNonRembourse.add(reste);
                }
            }
        }
        if (totalNonRembourse.compareTo(BigDecimal.ZERO) < 0) totalNonRembourse = BigDecimal.ZERO;
        BigDecimal plafondDisponible = plafond.subtract(totalNonRembourse);
        if (plafondDisponible.compareTo(BigDecimal.ZERO) < 0) plafondDisponible = BigDecimal.ZERO;
        if (request.getRequestedAmount().compareTo(plafondDisponible) > 0) {
            // Dépassement du plafond
            request.setStatus(RequestStatus.REJECTED);
            request.setRejectionReason("Le montant demandé dépasse le plafond autorisé (" + plafondDisponible + " TND restants).");
            salaryAdvanceRequestRepository.save(request);
            // Historique
            saveHistory(request, RequestStatus.PENDING, RequestStatus.REJECTED, "Rejet automatique : plafond dépassé");
            throw new IllegalArgumentException("Le montant demandé dépasse le plafond autorisé (" + plafondDisponible + " TND restants).");
        }
        // Validation
        request.setStatus(RequestStatus.APPROVED);
        request.setApprovedAt(LocalDate.now());
        // RH validateur
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User rh = userRepository.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("RH non trouvé : " + email));
        request.setApprovedBy(rh);
        // Générer les échéances de remboursement
        int months = request.getRepaymentSchedules() != null ? request.getRepaymentSchedules().size() : 1;
        // Supprimer explicitement chaque échéance de la collection (orphanRemoval)
        if (request.getRepaymentSchedules() != null) {
            java.util.Iterator<RepaymentSchedule> it = request.getRepaymentSchedules().iterator();
            while (it.hasNext()) {
                it.next();
                it.remove();
            }
        }
        // Supprimer en base (sécurité)
        repaymentScheduleRepository.deleteBySalaryAdvanceRequest(request);
        // Ajouter les nouvelles échéances une à une
        java.util.List<RepaymentSchedule> newSchedules = generateRepaymentSchedules(request, months);
        for (RepaymentSchedule sched : newSchedules) {
            request.getRepaymentSchedules().add(sched);
        }
        salaryAdvanceRequestRepository.save(request);
        // Historique
        saveHistory(request, RequestStatus.PENDING, RequestStatus.APPROVED, "Validation RH");
    }

    @Override
    public void rejectRequest(Long id, String reason) {
        SalaryAdvanceRequest request = salaryAdvanceRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Demande non trouvée"));
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Seules les demandes en attente peuvent être rejetées.");
        }
        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionReason(reason);
        // RH validateur
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User rh = userRepository.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("RH non trouvé : " + email));
        request.setApprovedBy(rh);
        // Supprimer toutes les échéances de remboursement (pour ne plus compter dans le cumul)
        if (request.getRepaymentSchedules() != null) {
            request.getRepaymentSchedules().clear();
            repaymentScheduleRepository.deleteBySalaryAdvanceRequest(request);
        }
        salaryAdvanceRequestRepository.save(request);
        // Historique
        saveHistory(request, RequestStatus.PENDING, RequestStatus.REJECTED, reason);
    }

    @Override
    public void cancelRequest(Long id) {
        // Changer le statut à CANCELED
    }

    @Override
    public void deleteRequest(Long id) {
        salaryAdvanceRequestRepository.deleteById(id);
    }

    public void changeRequestStatus(Long id, String status) {
        SalaryAdvanceRequest req = salaryAdvanceRequestRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Request not found"));
        try {
            com.soprahr.avancesalairebackend.model.enums.RequestStatus newStatus = com.soprahr.avancesalairebackend.model.enums.RequestStatus.valueOf(status);
            req.setStatus(newStatus);
            salaryAdvanceRequestRepository.save(req);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide: " + status);
        }
    }

    public List<RequestHistoryDTO> getRequestHistory(Long requestId) {
        List<RequestHistory> historyList = requestHistoryRepository.findByRequest_IdOrderByChangedAtAsc(requestId);
        return historyList.stream().map(this::toHistoryDTO).collect(Collectors.toList());
    }

    private SalaryAdvanceRequestDTO toDTO(SalaryAdvanceRequest entity) {
        SalaryAdvanceRequestDTO dto = new SalaryAdvanceRequestDTO();
        dto.setId(entity.getId());
        dto.setRequestedAmount(entity.getRequestedAmount());
        dto.setReason(entity.getReason());
        dto.setStatus(entity.getStatus());
        dto.setRequestDate(entity.getRequestDate());
        dto.setNeededDate(entity.getNeededDate());
        dto.setApprovedAt(entity.getApprovedAt());
        dto.setRejectionReason(entity.getRejectionReason());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        if (entity.getEmployee() != null) {
            dto.setEmployeeFullName(entity.getEmployee().getFirstName() + " " + entity.getEmployee().getLastName());
            dto.setEmployeeSalaryNet(entity.getEmployee().getSalary());
            // Calcul du plafond global (pour l'affichage dashboard)
            java.math.BigDecimal plafond = entity.getEmployee().getSalary().multiply(java.math.BigDecimal.valueOf(2));
            java.math.BigDecimal totalNonRembourse = java.math.BigDecimal.ZERO;
            if (entity.getEmployee().getRequests() != null) {
                for (SalaryAdvanceRequest demande : entity.getEmployee().getRequests()) {
                    if (demande.getStatus() == RequestStatus.APPROVED
                        && demande.getRepaymentSchedules() != null && !demande.getRepaymentSchedules().isEmpty()) {
                        java.math.BigDecimal reste = demande.getRepaymentSchedules().stream()
                                .filter(s -> !s.isPaid())
                                .map(com.soprahr.avancesalairebackend.model.entity.RepaymentSchedule::getAmount)
                                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                        totalNonRembourse = totalNonRembourse.add(reste);
                    }
                }
            }
            if (totalNonRembourse.compareTo(java.math.BigDecimal.ZERO) < 0) totalNonRembourse = java.math.BigDecimal.ZERO;
            java.math.BigDecimal plafondDisponible = plafond.subtract(totalNonRembourse);
            if (plafondDisponible.compareTo(java.math.BigDecimal.ZERO) < 0) plafondDisponible = java.math.BigDecimal.ZERO;
            dto.setPlafondDisponible(plafondDisponible);
        }
        if (entity.getRepaymentSchedules() != null && !entity.getRepaymentSchedules().isEmpty()) {
            java.math.BigDecimal reste = entity.getRepaymentSchedules().stream()
                .filter(s -> !s.isPaid())
                .map(com.soprahr.avancesalairebackend.model.entity.RepaymentSchedule::getAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            dto.setTotalAvancesNonRemboursees(reste);
        } else {
            dto.setTotalAvancesNonRemboursees(java.math.BigDecimal.ZERO);
        }
        if (entity.getApprovedBy() != null)
            dto.setApprovedByFullName(entity.getApprovedBy().getFirstName() + " " + entity.getApprovedBy().getLastName());
        // Ajout du calcul du pourcentage de remboursement
        dto.setRepaymentProgress(calculateRepaymentProgress(entity.getRepaymentSchedules()));
        return dto;
    }

    private int calculateRepaymentProgress(java.util.List<RepaymentSchedule> schedules) {
        if (schedules == null || schedules.isEmpty()) return 0;
        BigDecimal total = schedules.stream()
            .map(RepaymentSchedule::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        java.time.LocalDate today = java.time.LocalDate.now();
        // Total des montants payés jusqu'à aujourd'hui
        BigDecimal paid = schedules.stream()
            .filter(s -> !s.getDueDate().isAfter(today)) // échéance passée ou aujourd'hui
            .map(RepaymentSchedule::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (total.compareTo(BigDecimal.ZERO) == 0) return 0;
        return paid.multiply(BigDecimal.valueOf(100)).divide(total, 0, java.math.RoundingMode.DOWN).intValue();
    }

    /**
     * Convertit une entité RequestHistory en DTO.
     *
     * @param entity L'entité RequestHistory à convertir.
     * @return Le DTO RequestHistoryDTO correspondant.
     */

    private RequestHistoryDTO toHistoryDTO(RequestHistory entity) {
        RequestHistoryDTO dto = new RequestHistoryDTO();
        dto.setId(entity.getId());
        dto.setRequestId(entity.getRequest().getId());
        dto.setPreviousStatus(entity.getPreviousStatus());
        dto.setNewStatus(entity.getNewStatus());
        dto.setChangedBy(entity.getChangedBy() != null ? entity.getChangedBy().getFirstName() + " " + entity.getChangedBy().getLastName() : null);
        dto.setComment(entity.getComment());
        dto.setChangedAt(entity.getChangedAt());
        return dto;
    }

    private void saveHistory(SalaryAdvanceRequest request, RequestStatus prev, RequestStatus next, String comment) {
        RequestHistory history = RequestHistory.builder()
                .request(request)
                .previousStatus(prev)
                .newStatus(next)
                .changedBy(request.getApprovedBy())
                .comment(comment)
                .build();
        requestHistoryRepository.save(history);
    }

    public AnalyticsDTO getAnalytics() {
        List<SalaryAdvanceRequest> all = salaryAdvanceRequestRepository.findAll();
        int totalRequests = all.size();
        int approvedRequests = (int) all.stream().filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
        int rejectedRequests = (int) all.stream().filter(r -> r.getStatus() == RequestStatus.REJECTED).count();
        int pendingRequests = (int) all.stream().filter(r -> r.getStatus() == RequestStatus.PENDING).count();
        BigDecimal totalRequestedAmount = all.stream().map(SalaryAdvanceRequest::getRequestedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalApprovedAmount = all.stream().filter(r -> r.getStatus() == RequestStatus.APPROVED).map(SalaryAdvanceRequest::getRequestedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageRequestedAmount = totalRequests > 0 ? totalRequestedAmount.divide(BigDecimal.valueOf(totalRequests), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal averageApprovedAmount = approvedRequests > 0 ? totalApprovedAmount.divide(BigDecimal.valueOf(approvedRequests), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        // Outstanding advances: sum of all not fully repaid advances
        BigDecimal outstandingAdvances = all.stream()
            .filter(r -> r.getStatus() == RequestStatus.APPROVED || r.getStatus() == RequestStatus.PENDING)
            .flatMap(r -> r.getRepaymentSchedules() != null ? r.getRepaymentSchedules().stream() : java.util.stream.Stream.empty())
            .filter(s -> !s.isPaid())
            .map(RepaymentSchedule::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        double approvalRate = totalRequests > 0 ? (double) approvedRequests / totalRequests : 0.0;
        // Trends: number of requests per month for the last 6 months
        List<Integer> trends = new ArrayList<>();
        YearMonth now = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            int count = (int) all.stream().filter(r -> r.getRequestDate() != null && YearMonth.from(r.getRequestDate()).equals(ym)).count();
            trends.add(count);
        }
        // Status distribution: [approved, rejected, pending]
        List<Integer> statusDistribution = List.of(approvedRequests, rejectedRequests, pendingRequests);
        return new AnalyticsDTO(
            totalRequests,
            approvedRequests,
            rejectedRequests,
            pendingRequests,
            totalRequestedAmount,
            totalApprovedAmount,
            averageRequestedAmount,
            averageApprovedAmount,
            outstandingAdvances,
            approvalRate,
            trends,
            statusDistribution
        );
    }

    public byte[] exportAnalyticsExcel() {
        AnalyticsDTO analytics = getAnalytics();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Analytics");
            int rowIdx = 0;
            org.apache.poi.ss.usermodel.Row header = sheet.createRow(rowIdx++);
            header.createCell(0).setCellValue("Metric");
            header.createCell(1).setCellValue("Value");
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Total Requests");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getTotalRequests());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Approved Requests");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getApprovedRequests());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Rejected Requests");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getRejectedRequests());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Pending Requests");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getPendingRequests());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Total Requested Amount");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getTotalRequestedAmount().doubleValue());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Total Approved Amount");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getTotalApprovedAmount().doubleValue());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Average Requested Amount");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getAverageRequestedAmount().doubleValue());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Average Approved Amount");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getAverageApprovedAmount().doubleValue());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Outstanding Advances");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getOutstandingAdvances().doubleValue());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Approval Rate");
            sheet.getRow(rowIdx-1).createCell(1).setCellValue(analytics.getApprovalRate());
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export analytics to Excel", e);
        }
    }

    public byte[] exportAnalyticsPdf() {
        AnalyticsDTO analytics = getAnalytics();
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("HR Analytics Report"));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Total Requests: " + analytics.getTotalRequests()));
            document.add(new Paragraph("Approved Requests: " + analytics.getApprovedRequests()));
            document.add(new Paragraph("Rejected Requests: " + analytics.getRejectedRequests()));
            document.add(new Paragraph("Pending Requests: " + analytics.getPendingRequests()));
            document.add(new Paragraph("Total Requested Amount: " + analytics.getTotalRequestedAmount()));
            document.add(new Paragraph("Total Approved Amount: " + analytics.getTotalApprovedAmount()));
            document.add(new Paragraph("Average Requested Amount: " + analytics.getAverageRequestedAmount()));
            document.add(new Paragraph("Average Approved Amount: " + analytics.getAverageApprovedAmount()));
            document.add(new Paragraph("Outstanding Advances: " + analytics.getOutstandingAdvances()));
            document.add(new Paragraph("Approval Rate: " + analytics.getApprovalRate()));
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export analytics to PDF", e);
        }
    }

    public List<RequestHistoryItemDTO> getRequestHistoryFiltered(Optional<String> status, Optional<String> employee, Optional<LocalDate> from, Optional<LocalDate> to) {
        List<SalaryAdvanceRequest> all = salaryAdvanceRequestRepository.findAll();
        return all.stream()
            .filter(r -> status.isEmpty() || r.getStatus().name().equalsIgnoreCase(status.get()))
            .filter(r -> employee.isEmpty() || (r.getEmployee() != null && (r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName()).toLowerCase().contains(employee.get().toLowerCase())))
            .filter(r -> from.isEmpty() || (r.getRequestDate() != null && !r.getRequestDate().isBefore(from.get())))
            .filter(r -> to.isEmpty() || (r.getRequestDate() != null && !r.getRequestDate().isAfter(to.get())))
            .map(r -> new RequestHistoryItemDTO(
                r.getId(),
                r.getEmployee() != null ? r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName() : null,
                r.getRequestedAmount(),
                r.getRepaymentSchedules() != null ? r.getRepaymentSchedules().size() : null,
                r.getStatus().name(),
                r.getRequestDate(),
                r.getApprovedBy() != null ? r.getApprovedBy().getFirstName() + " " + r.getApprovedBy().getLastName() : null
            ))
            .toList();
    }

    public byte[] exportRequestHistoryExcel(Optional<String> status, Optional<String> employee, Optional<LocalDate> from, Optional<LocalDate> to) {
        List<RequestHistoryItemDTO> history = getRequestHistoryFiltered(status, employee, from, to);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Historique");
            int rowIdx = 0;
            Row header = sheet.createRow(rowIdx++);
            header.createCell(0).setCellValue("Employé");
            header.createCell(1).setCellValue("Montant");
            header.createCell(2).setCellValue("Durée (mois)");
            header.createCell(3).setCellValue("Statut");
            header.createCell(4).setCellValue("Date");
            header.createCell(5).setCellValue("Validé par");
            for (RequestHistoryItemDTO item : history) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getEmployeeFullName());
                row.createCell(1).setCellValue(item.getRequestedAmount() != null ? item.getRequestedAmount().doubleValue() : 0);
                row.createCell(2).setCellValue(item.getRepaymentMonths() != null ? item.getRepaymentMonths() : 0);
                row.createCell(3).setCellValue(item.getStatus());
                row.createCell(4).setCellValue(item.getRequestDate() != null ? item.getRequestDate().toString() : "");
                row.createCell(5).setCellValue(item.getApprovedByFullName());
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export history to Excel", e);
        }
    }

    public byte[] exportRequestHistoryPdf(Optional<String> status, Optional<String> employee, Optional<LocalDate> from, Optional<LocalDate> to) {
        List<RequestHistoryItemDTO> history = getRequestHistoryFiltered(status, employee, from, to);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("Historique des demandes traitées"));
            document.add(new Paragraph(" "));
            for (RequestHistoryItemDTO item : history) {
                document.add(new Paragraph(
                    String.format("Employé: %s | Montant: %.2f TND | Durée: %d mois | Statut: %s | Date: %s | Validé par: %s",
                        item.getEmployeeFullName(),
                        item.getRequestedAmount() != null ? item.getRequestedAmount().doubleValue() : 0,
                        item.getRepaymentMonths() != null ? item.getRepaymentMonths() : 0,
                        item.getStatus(),
                        item.getRequestDate() != null ? item.getRequestDate().toString() : "",
                        item.getApprovedByFullName()
                    )));
            }
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export history to PDF", e);
        }
    }
}
