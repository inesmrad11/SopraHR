package com.soprahr.avancesalairebackend.service.user;

import com.soprahr.avancesalairebackend.model.dto.UserDTO;

import java.util.List;

public interface IUserService {
    UserDTO saveUser(UserDTO userDTO);
    UserDTO getUserById(Long id);
    UserDTO getUserByEmail(String email);
    List<UserDTO> getAllUsers();
    void deleteUser(Long id);

    UserDTO updateUser(Long id, UserDTO userDTO);
    void changePassword(Long id, String currentPassword, String newPassword);

    // Advanced: search/filter
    List<UserDTO> searchUsers(String keyword);
}
