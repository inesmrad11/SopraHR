package com.soprahr.avancesalairebackend.service.notification;

import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import com.soprahr.avancesalairebackend.model.entity.User;
import com.soprahr.avancesalairebackend.model.enums.RequestStatus;
import com.soprahr.avancesalairebackend.model.enums.NotificationType;
import com.soprahr.avancesalairebackend.repository.SalaryAdvanceRequestRepository;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationSchedulerService {
    private final SalaryAdvanceRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Rappel RH : demandes bloquées depuis plus de 48h
    @Scheduled(cron = "0 0 * * * *") // chaque heure
    public void notifyBlockedRequests() {
        LocalDateTime now = LocalDateTime.now();
        List<SalaryAdvanceRequest> blocked = requestRepository.findAll().stream()
                .filter(r -> r.getStatus() == RequestStatus.PENDING)
                .filter(r -> ChronoUnit.HOURS.between(r.getRequestDate().atStartOfDay(), now) > 48)
                .toList();
        for (SalaryAdvanceRequest req : blocked) {
            User rh = req.getApprovedBy(); // ou logique pour trouver le RH responsable
            if (rh != null) {
                notificationService.sendBlockedRequestReminderToRh(rh, req);
            }
        }
    }

    // Rappel employé : échéance de remboursement dans 3 jours
    @Scheduled(cron = "0 30 8 * * *") // tous les jours à 8h30
    public void notifyUpcomingInstallments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in3days = now.plusDays(3);
        List<SalaryAdvanceRequest> requests = requestRepository.findAll();
        for (SalaryAdvanceRequest req : requests) {
            req.getRepaymentSchedules().stream()
                .filter(ech -> !ech.isPaid() && ech.getDueDate().atStartOfDay().isEqual(in3days.toLocalDate().atStartOfDay()))
                .forEach(ech -> {
                    User emp = req.getEmployee();
                    notificationService.sendUpcomingInstallmentReminder(emp, req, ech.getDueDate().atStartOfDay());
                });
        }
    }

    // Surcharge RH : plus de 5 demandes en attente
    @Scheduled(cron = "0 0 9 * * *") // tous les jours à 9h
    public void notifyRhWorkload() {
        List<User> rhs = userRepository.findAll().stream().filter(u -> u.getRole().name().contains("HR")).toList();
        for (User rh : rhs) {
            long pending = requestRepository.findAll().stream().filter(r -> r.getStatus() == RequestStatus.PENDING && r.getApprovedBy() != null && r.getApprovedBy().getId().equals(rh.getId())).count();
            if (pending > 5) {
                notificationService.createAndSendNotification(rh, "Surcharge de demandes", "Vous avez " + pending + " demandes en attente de traitement. Priorisez les plus anciennes.", NotificationType.WORKLOAD_ALERT, null);
            }
        }
    }

    // Performance équipe RH : délai moyen > 2 jours
    @Scheduled(cron = "0 0 10 * * 1") // chaque lundi à 10h
    public void notifyTeamPerformance() {
        List<User> rhs = userRepository.findAll().stream().filter(u -> u.getRole().name().contains("HR")).toList();
        List<SalaryAdvanceRequest> approved = requestRepository.findAll().stream().filter(r -> r.getStatus() == RequestStatus.APPROVED).toList();
        double avgDelay = approved.stream().mapToLong(r -> ChronoUnit.DAYS.between(r.getRequestDate(), r.getApprovedAt())).average().orElse(0);
        if (avgDelay > 2) {
            for (User rh : rhs) {
                notificationService.createAndSendNotification(rh, "Performance équipe", "Le délai moyen de traitement des demandes ce mois-ci est de " + String.format("%.1f", avgDelay) + " jours. Objectif : 2 jours.", NotificationType.TEAM_PERFORMANCE, null);
            }
        }
    }

    // Demande inhabituelle : montant > 80% salaire
    @Scheduled(cron = "0 0 11 * * *") // tous les jours à 11h
    public void notifyUnusualRequests() {
        List<SalaryAdvanceRequest> unusual = requestRepository.findAll().stream()
            .filter(r -> r.getRequestedAmount().doubleValue() > 0.8 * r.getEmployee().getSalary().doubleValue())
            .toList();
        for (SalaryAdvanceRequest req : unusual) {
            User rh = req.getApprovedBy();
            if (rh != null) {
                notificationService.createAndSendNotification(rh, "Demande inhabituelle", "Une demande d'avance supérieure à 80% du salaire net a été soumise.", NotificationType.UNUSUAL_REQUEST, req);
            }
        }
    }

    // Rappel feedback post-rejet
    @Scheduled(cron = "0 0 12 * * *") // tous les jours à midi
    public void notifyFeedbackReminder() {
        List<SalaryAdvanceRequest> rejected = requestRepository.findAll().stream()
            .filter(r -> r.getStatus() == RequestStatus.REJECTED && r.getRejectionReason() == null)
            .toList();
        for (SalaryAdvanceRequest req : rejected) {
            User rh = req.getApprovedBy();
            if (rh != null) {
                notificationService.createAndSendNotification(rh, "Feedback à fournir", "Vous avez refusé une demande sans fournir de feedback. Pensez à informer l'employé.", NotificationType.FEEDBACK_REMINDER, req);
            }
        }
    }

    // Pic d'activité : hausse > 50% sur 7 jours
    @Scheduled(cron = "0 0 13 * * *") // tous les jours à 13h
    public void notifyActivityPeak() {
        LocalDateTime now = LocalDateTime.now();
        long last7 = requestRepository.findAll().stream().filter(r -> r.getRequestDate().isAfter(now.minusDays(7).toLocalDate())).count();
        long prev7 = requestRepository.findAll().stream().filter(r -> r.getRequestDate().isAfter(now.minusDays(14).toLocalDate()) && r.getRequestDate().isBefore(now.minusDays(7).toLocalDate())).count();
        if (prev7 > 0 && last7 > 1.5 * prev7) {
            List<User> rhs = userRepository.findAll().stream().filter(u -> u.getRole().name().contains("HR")).toList();
            for (User rh : rhs) {
                notificationService.createAndSendNotification(rh, "Pic d'activité", "Le nombre de demandes a augmenté de plus de 50% cette semaine.", NotificationType.ACTIVITY_PEAK, null);
            }
        }
    }

    // Suggestion personnalisée : employé choisit toujours 1 mois de remboursement
    @Scheduled(cron = "0 0 14 * * *") // tous les jours à 14h
    public void notifySuggestion() {
        List<User> employees = userRepository.findAll().stream().filter(u -> u.getRole().name().equals("EMPLOYEE")).toList();
        for (User emp : employees) {
            long oneMonth = requestRepository.findAll().stream().filter(r -> r.getEmployee().getId().equals(emp.getId()) && r.getRepaymentSchedules().size() == 1).count();
            long total = requestRepository.findAll().stream().filter(r -> r.getEmployee().getId().equals(emp.getId())).count();
            if (total > 2 && oneMonth == total) {
                notificationService.createAndSendNotification(emp, "Suggestion", "Vous avez toujours choisi 1 mois de remboursement. Essayez 2 mois pour une meilleure répartition.", NotificationType.SUGGESTION, null);
            }
        }
    }

    // Statistiques collectives RH : % d'employés ayant fait une demande
    @Scheduled(cron = "0 0 15 * * 1") // chaque lundi à 15h
    public void notifyStatisticsAlert() {
        long totalEmp = userRepository.findAll().stream().filter(u -> u.getRole().name().equals("EMPLOYEE")).count();
        long demandeurs = requestRepository.findAll().stream().map(r -> r.getEmployee().getId()).distinct().count();
        double percent = totalEmp > 0 ? 100.0 * demandeurs / totalEmp : 0;
        List<User> rhs = userRepository.findAll().stream().filter(u -> u.getRole().name().contains("HR")).toList();
        for (User rh : rhs) {
            notificationService.createAndSendNotification(rh, "Statistiques", String.format("Ce mois-ci, %.1f%% des employés ont fait une demande d'avance.", percent), NotificationType.STATISTICS_ALERT, null);
        }
    }

    // Maintenance/app update (notification globale, simulée)
    @Scheduled(cron = "0 0 16 * * 5") // chaque vendredi à 16h
    public void notifyMaintenance() {
        List<User> all = userRepository.findAll();
        for (User user : all) {
            notificationService.createAndSendNotification(user, "Maintenance prévue", "Le service sera indisponible pour maintenance ce vendredi de 18h à 20h.", NotificationType.MAINTENANCE, null);
        }
    }

    // --- New advanced notification schedulers ---

    // Inactivity reminder: every day at 8am
    @Scheduled(cron = "0 0 8 * * *")
    public void notifyInactivity() {
        LocalDateTime now = LocalDateTime.now();
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            if (user.getLastLogin() != null && ChronoUnit.DAYS.between(user.getLastLogin(), now) >= 30) {
                notificationService.sendInactivityReminder(user, "Vous n’êtes pas connecté depuis 30 jours. Reconnectez-vous pour suivre vos remboursements ou faire une demande.");
            }
        }
    }

    // Progressive reminders for RH: every day at 9am
    @Scheduled(cron = "0 0 9 * * *")
    public void notifyProgressiveReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<SalaryAdvanceRequest> pending = requestRepository.findAll().stream()
            .filter(r -> r.getStatus() == RequestStatus.PENDING)
            .toList();
        for (SalaryAdvanceRequest req : pending) {
            User rh = req.getApprovedBy();
            if (rh != null) {
                long days = ChronoUnit.DAYS.between(req.getRequestDate().atStartOfDay(), now.toLocalDate().atStartOfDay());
                if (days == 1) {
                    notificationService.sendProgressiveReminder(rh, req, 1);
                } else if (days == 3) {
                    notificationService.sendProgressiveReminder(rh, req, 3);
                } else if (days == 5) {
                    notificationService.sendProgressiveReminder(rh, req, 5);
                }
            }
        }
    }

    // Anticipation alert for employees: every day at 7am
    @Scheduled(cron = "0 0 7 * * *")
    public void notifyAnticipationAlerts() {
        LocalDateTime now = LocalDateTime.now();
        List<SalaryAdvanceRequest> requests = requestRepository.findAll();
        for (SalaryAdvanceRequest req : requests) {
            if (req.getRepaymentSchedules() != null && !req.getRepaymentSchedules().isEmpty()) {
                var last = req.getRepaymentSchedules().get(req.getRepaymentSchedules().size() - 1);
                long days = ChronoUnit.DAYS.between(now.toLocalDate(), last.getDueDate());
                if (days == 5) {
                    notificationService.sendAnticipationAlert(req.getEmployee(), req, last.getDueDate().toString());
                }
            }
        }
    }

    // Positive feedback for employees: every Monday at 8am
    @Scheduled(cron = "0 0 8 * * 1")
    public void notifyPositiveFeedback() {
        List<User> employees = userRepository.findAll().stream().filter(u -> u.getRole().name().equals("EMPLOYEE")).toList();
        for (User emp : employees) {
            boolean allRepaid = requestRepository.findAll().stream()
                .filter(r -> r.getEmployee().getId().equals(emp.getId()))
                .allMatch(r -> r.getRepaymentSchedules() == null || r.getRepaymentSchedules().stream().allMatch(s -> s.isPaid()));
            if (allRepaid) {
                notificationService.sendPositiveFeedback(emp, "👏 Bravo ! Vous avez terminé le remboursement de votre avance en temps et en heure.");
            }
        }
    }

    // Preventive alert for employees: every day at 10am
    @Scheduled(cron = "0 0 10 * * *")
    public void notifyPreventiveAlerts() {
        List<SalaryAdvanceRequest> requests = requestRepository.findAll();
        for (SalaryAdvanceRequest req : requests) {
            double plafond = req.getEmployee().getSalary().doubleValue() * 2;
            double total = requests.stream().filter(r -> r.getEmployee().getId().equals(req.getEmployee().getId()) && r.getStatus() == RequestStatus.APPROVED)
                .mapToDouble(r -> r.getRequestedAmount().doubleValue()).sum();
            if (req.getRequestedAmount().doubleValue() / plafond > 0.9) {
                notificationService.sendPreventiveAlert(req.getEmployee(), "Attention : le montant demandé couvre plus de 90% de votre plafond autorisé.", req);
            }
        }
    }

    // Rule change notification: every Sunday at 18h (simulate)
    @Scheduled(cron = "0 0 18 * * 0")
    public void notifyRuleChange() {
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            notificationService.sendRuleChange(user, "⚠️ Nouvelle règle : vous pouvez désormais rembourser sur 3 à 8 mois (au lieu de 6).");
        }
    }

    // Collective stats for RH: every 1st of month at 9am
    @Scheduled(cron = "0 0 9 1 * *")
    public void notifyCollectiveStats() {
        long totalEmp = userRepository.findAll().stream().filter(u -> u.getRole().name().equals("EMPLOYEE")).count();
        long demandeurs = requestRepository.findAll().stream().map(r -> r.getEmployee().getId()).distinct().count();
        double percent = totalEmp > 0 ? 100.0 * demandeurs / totalEmp : 0;
        List<User> rhs = userRepository.findAll().stream().filter(u -> u.getRole().name().contains("HR")).toList();
        for (User rh : rhs) {
            notificationService.sendCollectiveStats(rh, String.format("Ce mois-ci, %.1f%% des employés ont fait une demande d'avance.", percent));
        }
    }

    // Pattern detection for RH: every Monday at 11am
    @Scheduled(cron = "0 0 11 * * 1")
    public void notifyPatternDetection() {
        // Example: 3+ employees from same department (simulate by jobTitle)
        List<User> employees = userRepository.findAll().stream().filter(u -> u.getRole().name().equals("EMPLOYEE")).toList();
        var byJob = employees.stream().collect(java.util.stream.Collectors.groupingBy(User::getJobTitle));
        for (var entry : byJob.entrySet()) {
            if (entry.getValue().size() >= 3) {
                List<User> rhs = userRepository.findAll().stream().filter(u -> u.getRole().name().contains("HR")).toList();
                for (User rh : rhs) {
                    notificationService.sendPatternDetection(rh, "Trois employés de l’équipe " + entry.getKey() + " ont fait une demande d’avance ce mois-ci. Voulez-vous analyser les causes ?");
                }
            }
        }
    }

    // Calendar reminder for RH: every Monday at 8am
    @Scheduled(cron = "0 0 8 * * 1")
    public void notifyCalendarReminders() {
        List<SalaryAdvanceRequest> requests = requestRepository.findAll().stream()
            .filter(r -> r.getStatus() == RequestStatus.PENDING)
            .toList();
        for (SalaryAdvanceRequest req : requests) {
            User rh = req.getApprovedBy();
            if (rh != null) {
                notificationService.sendCalendarReminder(rh, "Ajoutez cette demande à votre calendrier pour un meilleur suivi.", req);
            }
        }
    }
} 