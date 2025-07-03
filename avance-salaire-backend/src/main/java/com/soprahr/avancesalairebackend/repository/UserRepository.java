package com.soprahr.avancesalairebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.soprahr.avancesalairebackend.model.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByVerificationToken(String token);
    Optional<User> findByEmployeeId(String employeeId);
    Optional<User> findByIdAndStatus(Long id, boolean status);
    Optional<User> findByEmailAndStatus(String email, boolean status);


}
