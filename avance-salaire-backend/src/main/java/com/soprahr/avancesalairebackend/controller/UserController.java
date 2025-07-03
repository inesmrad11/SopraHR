package com.soprahr.avancesalairebackend.controller;

import com.soprahr.avancesalairebackend.model.dto.UserDTO;
import com.soprahr.avancesalairebackend.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(404).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        UserDTO createdUser = userService.saveUser(userDTO);
        return ResponseEntity.status(201).body(createdUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    @PutMapping("/change-password/{id}")
    public ResponseEntity<String> changePassword(@PathVariable Long id, @RequestParam String currentPassword,
                                                 @RequestParam String newPassword) {
        try {
            userService.changePassword(id, currentPassword, newPassword);
            return ResponseEntity.ok("Password changed successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public List<UserDTO> searchUsers(@RequestParam String keyword) {
        return userService.searchUsers(keyword);
    }
}