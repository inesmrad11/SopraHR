package com.soprahr.avancesalairebackend.controller;

import com.soprahr.avancesalairebackend.model.dto.RepaymentScheduleDTO;
import com.soprahr.avancesalairebackend.service.repaymentSchedule.IRepaymentScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/repayment-schedules")
@RequiredArgsConstructor
public class RepaymentScheduleController {
    private final IRepaymentScheduleService service;

    @PostMapping
    public ResponseEntity<RepaymentScheduleDTO> create(@RequestBody RepaymentScheduleDTO dto) {
        return ResponseEntity.ok(service.createRepaymentSchedule(dto));
    }

    @GetMapping("/by-request/{requestId}")
    public ResponseEntity<List<RepaymentScheduleDTO>> getByRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(service.getRepaymentSchedulesByRequestId(requestId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepaymentScheduleDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRepaymentSchedule(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RepaymentScheduleDTO> update(@PathVariable Long id, @RequestBody RepaymentScheduleDTO dto) {
        return ResponseEntity.ok(service.updateRepaymentSchedule(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteRepaymentSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total-repaid/{requestId}")
    public ResponseEntity<java.math.BigDecimal> getTotalRepaid(@PathVariable Long requestId) {
        return ResponseEntity.ok(service.getTotalRepaidAmount(requestId));
    }
} 