package com.soprahr.avancesalairebackend.controller;

import com.soprahr.avancesalairebackend.model.dto.CreateSalaryAdvanceRequestDTO;
import com.soprahr.avancesalairebackend.model.dto.SalaryAdvanceRequestDTO;
import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import com.soprahr.avancesalairebackend.service.salaryAdvanceRequest.SalaryAdvanceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import com.soprahr.avancesalairebackend.model.dto.RequestHistoryDTO;
import com.soprahr.avancesalairebackend.model.dto.AnalyticsDTO;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.ByteArrayResource;
import com.soprahr.avancesalairebackend.model.dto.RequestHistoryItemDTO;
import java.util.Map;
import com.soprahr.avancesalairebackend.model.dto.CommentDTO;
import com.soprahr.avancesalairebackend.model.entity.Comment;
import com.soprahr.avancesalairebackend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.soprahr.avancesalairebackend.repository.SalaryAdvanceRequestRepository;
import com.soprahr.avancesalairebackend.model.entity.User;
import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/advance-requests")
@RequiredArgsConstructor
public class SalaryAdvanceRequestController {

    private final SalaryAdvanceRequestService salaryAdvanceRequestService;
    private final UserRepository userRepository;
    private final SalaryAdvanceRequestRepository salaryAdvanceRequestRepository;
    @Autowired
    private CommentRepository commentRepository;

    @PostMapping
    public ResponseEntity<SalaryAdvanceRequestDTO> createRequest(@RequestBody CreateSalaryAdvanceRequestDTO dto) {
        return ResponseEntity.ok(salaryAdvanceRequestService.createRequest(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalaryAdvanceRequestDTO> getRequest(@PathVariable Long id) {
        return ResponseEntity.ok(salaryAdvanceRequestService.getRequestById(id));
    }

    @GetMapping
    public ResponseEntity<List<SalaryAdvanceRequestDTO>> listRequests(
            @RequestParam Optional<String> status,
            @RequestParam Optional<Long> employeeId,
            @RequestParam Optional<LocalDate> from,
            @RequestParam Optional<LocalDate> to
    ) {
        return ResponseEntity.ok(salaryAdvanceRequestService.listRequests(status, employeeId, from, to));
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("API is working!");
    }

    @GetMapping("/me")
    public List<SalaryAdvanceRequestDTO> getMyRequests(Authentication authentication) {
        String email = authentication.getName();
        com.soprahr.avancesalairebackend.model.entity.User user = userRepository.findByEmail(email).orElseThrow();
        return salaryAdvanceRequestService.listRequestsForUser(user.getId());
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<RequestHistoryDTO>> getRequestHistory(@PathVariable Long id) {
        return ResponseEntity.ok(salaryAdvanceRequestService.getRequestHistory(id));
    }

    @GetMapping("/historique")
    public ResponseEntity<List<RequestHistoryItemDTO>> getRequestHistory(
        @RequestParam Optional<String> status,
        @RequestParam Optional<String> employee,
        @RequestParam Optional<LocalDate> from,
        @RequestParam Optional<LocalDate> to
    ) {
        return ResponseEntity.ok(salaryAdvanceRequestService.getRequestHistoryFiltered(status, employee, from, to));
    }

    @GetMapping("/historique/export/excel")
    public ResponseEntity<ByteArrayResource> exportRequestHistoryExcel(
        @RequestParam Optional<String> status,
        @RequestParam Optional<String> employee,
        @RequestParam Optional<LocalDate> from,
        @RequestParam Optional<LocalDate> to
    ) {
        byte[] data = salaryAdvanceRequestService.exportRequestHistoryExcel(status, employee, from, to);
        ByteArrayResource resource = new ByteArrayResource(data);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=historique.xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .contentLength(data.length)
            .body(resource);
    }

    @GetMapping("/historique/export/pdf")
    public ResponseEntity<ByteArrayResource> exportRequestHistoryPdf(
        @RequestParam Optional<String> status,
        @RequestParam Optional<String> employee,
        @RequestParam Optional<LocalDate> from,
        @RequestParam Optional<LocalDate> to
    ) {
        byte[] data = salaryAdvanceRequestService.exportRequestHistoryPdf(status, employee, from, to);
        ByteArrayResource resource = new ByteArrayResource(data);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=historique.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(data.length)
            .body(resource);
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(salaryAdvanceRequestService.getAnalytics());
    }

    @GetMapping("/analytics/export/excel")
    public ResponseEntity<ByteArrayResource> exportAnalyticsExcel() {
        byte[] data = salaryAdvanceRequestService.exportAnalyticsExcel();
        ByteArrayResource resource = new ByteArrayResource(data);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analytics.xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .contentLength(data.length)
            .body(resource);
    }

    @GetMapping("/analytics/export/pdf")
    public ResponseEntity<ByteArrayResource> exportAnalyticsPdf() {
        byte[] data = salaryAdvanceRequestService.exportAnalyticsPdf();
        ByteArrayResource resource = new ByteArrayResource(data);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analytics.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(data.length)
            .body(resource);
    }

    @GetMapping("/{id}/steps")
    public ResponseEntity<List<com.soprahr.avancesalairebackend.model.dto.RequestStepDTO>> getRequestSteps(@PathVariable Long id) {
        return ResponseEntity.ok(salaryAdvanceRequestService.getRequestSteps(id));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long id) {
        List<Comment> comments = commentRepository.findByRequestIdOrderByCreatedAtAsc(id);
        List<CommentDTO> dtos = comments.stream().map(c -> {
            CommentDTO dto = new CommentDTO();
            dto.setId(c.getId());
            dto.setAuthorName(c.getAuthor().getFirstName() + " " + c.getAuthor().getLastName());
            dto.setAuthorRole(c.getAuthor().getRole().name());
            dto.setType(c.getType());
            dto.setMessage(c.getMessage());
            dto.setCreatedAt(c.getCreatedAt());
            return dto;
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long id, @RequestBody CommentDTO dto, Authentication authentication) {
        SalaryAdvanceRequest request = salaryAdvanceRequestRepository.findById(id).orElseThrow();
        // Récupérer l'utilisateur authentifié
        String email = authentication.getName();
        User author = userRepository.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé : " + email));
        
        Comment comment = new Comment();
        comment.setRequest(request);
        comment.setAuthor(author);
        comment.setType(dto.getType());
        comment.setMessage(dto.getMessage());
        commentRepository.save(comment);
        dto.setId(comment.getId());
        dto.setAuthorName(author.getFirstName() + " " + author.getLastName());
        dto.setAuthorRole(author.getRole().name());
        dto.setCreatedAt(comment.getCreatedAt());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        salaryAdvanceRequestService.approveRequest(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestBody String reason) {
        salaryAdvanceRequestService.rejectRequest(id, reason);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRequest(@PathVariable Long id) {
        salaryAdvanceRequestService.cancelRequest(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/changer-statut")
    public ResponseEntity<?> changeRequestStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        salaryAdvanceRequestService.changeRequestStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        salaryAdvanceRequestService.deleteRequest(id);
        return ResponseEntity.ok().build();
    }
}
