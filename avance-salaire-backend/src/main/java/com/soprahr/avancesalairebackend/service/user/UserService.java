package com.soprahr.avancesalairebackend.service.user;

import com.soprahr.avancesalairebackend.model.dto.UserDTO;
import com.soprahr.avancesalairebackend.model.entity.User;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;

    private UserDTO toDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setLastName(user.getLastName());
        dto.setFirstName(user.getFirstName());
        dto.setJobTitle(user.getJobTitle());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.isStatus());
        dto.setRole(user.getRole());
        dto.setCompany(user.getCompany());
        dto.setSalary(Optional.ofNullable(user.getSalary()).orElse(BigDecimal.ZERO));
        dto.setProfilePicture(user.getProfilePicture());
        return dto;
    }

    private void updateEntityFromDTO(User user, UserDTO dto) {
        user.setName(dto.getName());
        user.setLastName(dto.getLastName());
        user.setFirstName(dto.getFirstName());
        user.setJobTitle(dto.getJobTitle());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setStatus(dto.isStatus());
        user.setRole(dto.getRole());
        user.setCompany(dto.getCompany());
        user.setSalary(dto.getSalary() != null ? dto.getSalary() : BigDecimal.ZERO);
        user.setProfilePicture(dto.getProfilePicture());
    }

    @Override
    public UserDTO saveUser(UserDTO userDTO) {
        User user = new User();
        updateEntityFromDTO(user, userDTO);
        // Set password if needed (for registration)
        // user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        return toDTO(userRepository.save(user));
    }

    @Override
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toDTO).orElse(null);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        updateEntityFromDTO(user, userDTO);
        return toDTO(userRepository.save(user));
    }

    @Override
    public void changePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from the current password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public List<UserDTO> searchUsers(String keyword) {
        return userRepository.findAll().stream()
                .filter(user -> user.getName().toLowerCase().contains(keyword.toLowerCase())
                        || user.getEmail().toLowerCase().contains(keyword.toLowerCase())
                        || user.getFirstName().toLowerCase().contains(keyword.toLowerCase())
                        || user.getLastName().toLowerCase().contains(keyword.toLowerCase()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
