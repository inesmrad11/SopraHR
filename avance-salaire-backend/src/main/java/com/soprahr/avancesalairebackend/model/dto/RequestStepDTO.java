package com.soprahr.avancesalairebackend.model.dto;

import java.time.LocalDateTime;

public class RequestStepDTO {
    private String type; // SUBMISSION, COMMENT, VALIDATION, PAYMENT, CLOSURE
    private String status; // En attente, Validée, Payée, Clôturée, etc.
    private String actor;
    private String actorRole;
    private LocalDateTime timestamp;
    private String comment;
    private String details;

    // Getters et setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
} 