package com.soprahr.avancesalairebackend.model.dto;

import com.soprahr.avancesalairebackend.model.enums.UserRole;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String lastName;
    private String firstName;
    private String jobTitle;
    private String email;
    private String phone;
    private boolean status;
    private UserRole role;
    private String company;
    private BigDecimal salary;
    private String profilePicture;
    // Add other fields as needed, but NOT password!
}