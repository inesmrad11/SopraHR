package com.soprahr.avancesalairebackend.model.dto;

import com.soprahr.avancesalairebackend.model.enums.RequestStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RequestHistoryDTO {
    private Long id;
    private Long requestId;
    private RequestStatus previousStatus;
    private RequestStatus newStatus;
    private String changedBy; // full name
    private String comment;
    private LocalDateTime changedAt;
}