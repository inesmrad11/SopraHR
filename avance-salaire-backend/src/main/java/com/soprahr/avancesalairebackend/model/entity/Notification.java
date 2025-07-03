package com.soprahr.avancesalairebackend.model.entity;

import com.soprahr.avancesalairebackend.model.enums.NotificationType;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "is_read")
    private boolean read;

    private LocalDateTime createdAt;

    // ✅ Link to the user who receives the notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    // ✅ Optional link to a related request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private SalaryAdvanceRequest relatedRequest;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
