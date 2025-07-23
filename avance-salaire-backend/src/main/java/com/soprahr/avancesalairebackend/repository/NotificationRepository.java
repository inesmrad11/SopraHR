package com.soprahr.avancesalairebackend.repository;

import com.soprahr.avancesalairebackend.model.entity.Notification;
import com.soprahr.avancesalairebackend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientAndReadFalseOrderByCreatedAtDesc(User recipient);
}
