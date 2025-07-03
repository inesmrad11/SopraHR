package com.soprahr.avancesalairebackend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is mandatory")
    @Size(max = 150, message = "Name can't exceed 150 characters")
    private String name;

    @NotBlank(message = "Code is mandatory")
    @Size(max = 50, message = "Code can't exceed 50 characters")
    @Column(unique = true)
    private String code;

    @NotBlank(message = "Description is mandatory")
    @Size(max = 255, message = "Description can't exceed 255 characters")
    private String description;

    @Size(max = 255, message = "Address can't exceed 255 characters")
    private String address;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Transient
    public String getCompanyInfo() {
        return name + " (" + code + ")";
    }
}
