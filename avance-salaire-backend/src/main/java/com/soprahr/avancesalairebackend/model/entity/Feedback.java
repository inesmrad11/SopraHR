package com.soprahr.avancesalairebackend.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
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
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ User who gave the feedback
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ✅ Associated salary advance request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private SalaryAdvanceRequest request;

    // ✅ Rating between 1 and 5
    @Min(1)
    @Max(5)
    private int rating;

    @Size(max = 500, message = "Comment can't exceed 500 characters")
    private String comment;

    private LocalDateTime submittedAt;

    @PrePersist
    protected void onSubmit() {
        submittedAt = LocalDateTime.now();
    }
}
