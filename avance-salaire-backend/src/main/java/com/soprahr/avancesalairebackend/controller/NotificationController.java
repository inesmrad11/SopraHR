package com.soprahr.avancesalairebackend.controller;

import com.soprahr.avancesalairebackend.model.dto.NotificationDTO;
import com.soprahr.avancesalairebackend.model.enums.NotificationType;
import com.soprahr.avancesalairebackend.model.entity.User;
import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import com.soprahr.avancesalairebackend.repository.SalaryAdvanceRequestRepository;
import com.soprahr.avancesalairebackend.service.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import org.springframework.security.core.Authentication;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SalaryAdvanceRequestRepository requestRepository;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("")
    public List<NotificationDTO> getCurrentUserNotifications(Authentication authentication) {
        com.soprahr.avancesalairebackend.model.entity.User user = (com.soprahr.avancesalairebackend.model.entity.User) authentication.getPrincipal();
        return notificationService.getUserNotifications(user.getId());
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Notification API is working!");
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Backend is running!");
    }

    @GetMapping("/user/{userId}")
    public List<NotificationDTO> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getUserNotifications(userId);
    }

    @PostMapping("/{id}/mark-as-read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationSendRequest req) {
        User recipient = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur destinataire introuvable"));
        SalaryAdvanceRequest relatedRequest = null;
        if (req.getRelatedRequestId() != null) {
            relatedRequest = requestRepository.findById(req.getRelatedRequestId())
                    .orElse(null);
        }
        User sender = null;
        if (req.getSenderId() != null) {
            sender = userRepository.findById(req.getSenderId()).orElse(null);
        }
        notificationService.createAndSendNotification(
                recipient,
                req.getTitle(),
                req.getMessage(),
                req.getType(),
                relatedRequest,
                sender
        );
        return ResponseEntity.ok().build();
    }

    public static class NotificationSendRequest {
        private Long userId;
        private String title;
        private String message;
        private NotificationType type;
        private Long relatedRequestId;
        private Long senderId;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public NotificationType getType() { return type; }
        public void setType(NotificationType type) { this.type = type; }
        public Long getRelatedRequestId() { return relatedRequestId; }
        public void setRelatedRequestId(Long relatedRequestId) { this.relatedRequestId = relatedRequestId; }
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
    }

    @PostMapping("/send-reminder")
    public ResponseEntity<?> sendReminder(@RequestBody Map<String, Long> body) {
        Long requestId = body.get("requestId");
        SalaryAdvanceRequest req = requestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Demande introuvable"));
        notificationService.sendMissingDocumentReminderToEmployee(req.getEmployee(), req);
        return ResponseEntity.ok().build();
    }
}
