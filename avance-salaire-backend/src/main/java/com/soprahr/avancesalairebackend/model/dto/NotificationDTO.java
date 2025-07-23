package com.soprahr.avancesalairebackend.model.dto;

import com.soprahr.avancesalairebackend.model.enums.NotificationType;
import com.soprahr.avancesalairebackend.model.enums.SenderType;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private LocalDateTime createdAt;
    private Long recipientId;
    private Long relatedRequestId;
    private String senderProfilePicture;
    private String senderName;
    private SenderType senderType; // SYSTEM, RH, EMPLOYEE
    private Long senderId;
    private String senderRole;
}
