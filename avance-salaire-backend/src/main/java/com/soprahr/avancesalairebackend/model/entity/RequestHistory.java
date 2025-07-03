package com.soprahr.avancesalairebackend.model.entity;

import com.soprahr.avancesalairebackend.model.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id")
    private SalaryAdvanceRequest request;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(length = 500)
    private String comment;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    // Convenience method for status change description
    @Transient
    public String getStatusChange() {
        return previousStatus + " -> " + newStatus;
    }

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
