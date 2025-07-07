package com.soprahr.avancesalairebackend.repository;

import com.soprahr.avancesalairebackend.model.entity.RequestHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestHistoryRepository extends JpaRepository<RequestHistory, Long> {
}
