package com.soprahr.avancesalairebackend.repository;

import com.soprahr.avancesalairebackend.model.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByRequestIdOrderByCreatedAtAsc(Long requestId);
} 