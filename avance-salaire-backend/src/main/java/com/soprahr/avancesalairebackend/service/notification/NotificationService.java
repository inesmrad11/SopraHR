package com.soprahr.avancesalairebackend.service.notification;

import com.soprahr.avancesalairebackend.model.dto.NotificationDTO;
import com.soprahr.avancesalairebackend.model.entity.Notification;
import com.soprahr.avancesalairebackend.model.entity.User;
import com.soprahr.avancesalairebackend.repository.NotificationRepository;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.soprahr.avancesalairebackend.model.enums.NotificationType;
import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import java.time.LocalDateTime;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<NotificationDTO> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);

        return notifications.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void markAsRead(Long notificationId) {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));
        notif.setRead(true);
        notificationRepository.save(notif);
    }

    // Méthode générique pour créer, persister et envoyer une notification en temps réel
    public Notification createAndSendNotification(User recipient, String title, String message, NotificationType type, SalaryAdvanceRequest relatedRequest) {
        Notification notif = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .createdAt(LocalDateTime.now())
                .recipient(recipient)
                .relatedRequest(relatedRequest)
                .build();
        notificationRepository.save(notif);
        // Push temps réel via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications/" + recipient.getId(), mapToDto(notif));
        return notif;
    }

    // Overload createAndSendNotification to allow direct sender assignment
    public Notification createAndSendNotification(User recipient, String title, String message, NotificationType type, SalaryAdvanceRequest relatedRequest, User sender) {
        Notification notif = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .createdAt(LocalDateTime.now())
                .recipient(recipient)
                .relatedRequest(relatedRequest)
                .build();
        notificationRepository.save(notif);
        messagingTemplate.convertAndSend("/topic/notifications/" + recipient.getId(), mapToDto(notif, sender));
        return notif;
    }

    // Exemples de méthodes pour chaque type de notification intelligente
    public void sendBlockedRequestReminderToRh(User rh, SalaryAdvanceRequest request) {
        String title = "Demande bloquée";
        String message = "La demande de " + request.getEmployee().getName() + " est bloquée depuis plus de 48h. Action requise !";
        createAndSendNotification(rh, title, message, NotificationType.ACTION_REMINDER, request);
    }

    public void sendMissingDocumentReminderToEmployee(User employee, SalaryAdvanceRequest request) {
        String title = "Document manquant";
        String message = "Votre demande d'avance est en attente car il manque un justificatif. Cliquez ici pour l'ajouter.";
        createAndSendNotification(employee, title, message, NotificationType.DOCUMENT_MISSING, request);
    }

    public void sendCongratsNoLateRepayment(User employee) {
        String title = "Félicitations !";
        String message = "Vous avez remboursé toutes vos avances sans retard ce semestre. Continuez ainsi !";
        createAndSendNotification(employee, title, message, NotificationType.CONGRATS_NO_LATE_REPAYMENT, null);
    }

    public void sendFinancialAdvice(User employee, String advice) {
        String title = "Conseil financier";
        String message = advice;
        createAndSendNotification(employee, title, message, NotificationType.FINANCIAL_ADVICE, null);
    }

    public void sendPolicyUpdate(User user) {
        String title = "Changement de politique";
        String message = "Les conditions d'octroi d'avances ont changé. Consultez les nouvelles règles ici.";
        createAndSendNotification(user, title, message, NotificationType.POLICY_UPDATE, null);
    }

    public void sendUpcomingInstallmentReminder(User employee, SalaryAdvanceRequest request, LocalDateTime dueDate) {
        String title = "Échéance de remboursement";
        String message = "Votre prochaine mensualité sera prélevée le " + dueDate.toLocalDate() + ". Assurez-vous d'avoir le solde suffisant.";
        createAndSendNotification(employee, title, message, NotificationType.UPCOMING_INSTALLMENT, request);
    }

    // --- New advanced notification methods ---
    public void sendInactivityReminder(User user, String message) {
        String title = "Rappel d'inactivité";
        createAndSendNotification(user, title, message, NotificationType.INACTIVITY_REMINDER, null);
    }

    public void sendPositiveFeedback(User user, String message) {
        String title = "Bravo !";
        createAndSendNotification(user, title, message, NotificationType.POSITIVE_FEEDBACK, null);
    }

    public void sendAnticipationAlert(User user, SalaryAdvanceRequest request, String dateStr) {
        String title = "Fin de remboursement prochaine";
        String message = "Votre dernière mensualité de remboursement est prévue pour le " + dateStr + ". Préparez-vous à la clôture de l'avance.";
        createAndSendNotification(user, title, message, NotificationType.ANTICIPATION_ALERT, request);
    }

    public void sendProfileSuggestion(User user, String suggestion) {
        String title = "Suggestion personnalisée";
        createAndSendNotification(user, title, suggestion, NotificationType.PROFILE_SUGGESTION, null);
    }

    public void sendPreventiveAlert(User user, String message, SalaryAdvanceRequest request) {
        String title = "Alerte préventive";
        createAndSendNotification(user, title, message, NotificationType.PREVENTIVE_ALERT, request);
    }

    public void sendRuleChange(User user, String message) {
        String title = "Changement de règle";
        createAndSendNotification(user, title, message, NotificationType.RULE_CHANGE, null);
    }

    public void sendProgressiveReminder(User user, SalaryAdvanceRequest request, int days) {
        String title = "Rappel de traitement";
        String message = "La demande de " + (request.getEmployee() != null ? request.getEmployee().getName() : "") + " est toujours en attente depuis " + days + " jours.";
        NotificationType type = NotificationType.PROGRESSIVE_REMINDER_24H;
        if (days >= 5) type = NotificationType.PROGRESSIVE_REMINDER_5D;
        else if (days >= 3) type = NotificationType.PROGRESSIVE_REMINDER_3D;
        createAndSendNotification(user, title, message, type, request);
    }

    public void sendCollectiveStats(User user, String message) {
        String title = "Statistiques collectives";
        createAndSendNotification(user, title, message, NotificationType.COLLECTIVE_STATS, null);
    }

    public void sendPatternDetection(User user, String message) {
        String title = "Détection de pattern";
        createAndSendNotification(user, title, message, NotificationType.PATTERN_DETECTION, null);
    }

    public void sendCalendarReminder(User user, String message, SalaryAdvanceRequest request) {
        String title = "Rappel calendrier";
        createAndSendNotification(user, title, message, NotificationType.CALENDAR_REMINDER, request);
    }

    // ... autres méthodes pour chaque type de notification intelligente ...

    private NotificationDTO mapToDto(Notification n) {
        return mapToDto(n, null);
    }

    private NotificationDTO mapToDto(Notification n, User explicitSender) {
        String senderName = null;
        String senderProfilePicture = null;
        com.soprahr.avancesalairebackend.model.enums.SenderType senderType = com.soprahr.avancesalairebackend.model.enums.SenderType.SYSTEM;
        Long senderId = null;
        String senderRole = null;
        if (explicitSender != null) {
            senderName = explicitSender.getFirstName() + " " + explicitSender.getLastName();
            senderProfilePicture = explicitSender.getProfilePicture();
            senderId = explicitSender.getId();
            senderRole = explicitSender.getRole().name();
            if (explicitSender.getRole().name().contains("HR")) senderType = com.soprahr.avancesalairebackend.model.enums.SenderType.RH;
            else if (explicitSender.getRole().name().equals("EMPLOYEE")) senderType = com.soprahr.avancesalairebackend.model.enums.SenderType.EMPLOYEE;
            else senderType = com.soprahr.avancesalairebackend.model.enums.SenderType.SYSTEM;
        } else if (n.getRelatedRequest() != null) {
            if (n.getRelatedRequest().getApprovedBy() != null) {
                senderName = n.getRelatedRequest().getApprovedBy().getFirstName() + " " + n.getRelatedRequest().getApprovedBy().getLastName();
                senderProfilePicture = n.getRelatedRequest().getApprovedBy().getProfilePicture();
                senderId = n.getRelatedRequest().getApprovedBy().getId();
                senderRole = n.getRelatedRequest().getApprovedBy().getRole().name();
                senderType = com.soprahr.avancesalairebackend.model.enums.SenderType.RH;
            } else if (n.getRelatedRequest().getEmployee() != null) {
                senderName = n.getRelatedRequest().getEmployee().getFirstName() + " " + n.getRelatedRequest().getEmployee().getLastName();
                senderProfilePicture = n.getRelatedRequest().getEmployee().getProfilePicture();
                senderId = n.getRelatedRequest().getEmployee().getId();
                senderRole = n.getRelatedRequest().getEmployee().getRole().name();
                senderType = com.soprahr.avancesalairebackend.model.enums.SenderType.EMPLOYEE;
            }
        }
        return NotificationDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .relatedRequestId(n.getRelatedRequest() != null ? n.getRelatedRequest().getId() : null)
                .recipientId(n.getRecipient() != null ? n.getRecipient().getId() : null)
                .senderName(senderName)
                .senderProfilePicture(senderProfilePicture)
                .senderType(senderType)
                .senderId(senderId)
                .senderRole(senderRole)
                .build();
    }
}
