package com.soprahr.avancesalairebackend.config;

import com.soprahr.avancesalairebackend.model.entity.User;
import com.soprahr.avancesalairebackend.model.entity.SalaryAdvanceRequest;
import com.soprahr.avancesalairebackend.model.entity.RepaymentSchedule;
import com.soprahr.avancesalairebackend.model.entity.Notification;
import com.soprahr.avancesalairebackend.model.entity.RequestHistory;
import com.soprahr.avancesalairebackend.model.enums.UserRole;
import com.soprahr.avancesalairebackend.model.enums.NotificationType;
import com.soprahr.avancesalairebackend.model.enums.RequestStatus;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import com.soprahr.avancesalairebackend.repository.SalaryAdvanceRequestRepository;
import com.soprahr.avancesalairebackend.repository.RepaymentScheduleRepository;
import com.soprahr.avancesalairebackend.repository.NotificationRepository;
import com.soprahr.avancesalairebackend.repository.RequestHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initData(
            UserRepository userRepository,
            SalaryAdvanceRequestRepository salaryAdvanceRequestRepository,
            RepaymentScheduleRepository repaymentScheduleRepository,
            NotificationRepository notificationRepository,
            RequestHistoryRepository requestHistoryRepository
    ) {
        final String DEFAULT_PROFILE_PICTURE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
        return args -> {
            if (userRepository.findAll().isEmpty()) {
                // --- Utilisateurs ---
                User admin = User.userBuilder()
                        .firstName("Admin").lastName("Root").name("Admin Root")
                        .jobTitle("Administrator").email("admin@soprahr.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .phone("+21690000111").role(UserRole.ADMIN)
                        .salary(new BigDecimal("2500")).company("Sopra HR")
                        .profilePicture(DEFAULT_PROFILE_PICTURE)
                        .build();
                User hrExpert = User.userBuilder()
                        .firstName("Expert").lastName("RH").name("Expert RH")
                        .jobTitle("HR Expert").email("hr@soprahr.com")
                        .password(passwordEncoder.encode("Hr@123456"))
                        .phone("+21690000222").role(UserRole.HR_EXPERT)
                        .salary(new BigDecimal("2000")).company("Sopra HR")
                        .profilePicture(DEFAULT_PROFILE_PICTURE)
                        .build();
                User emp1 = User.userBuilder()
                        .firstName("John").lastName("Doe").name("John Doe")
                        .jobTitle("Software Engineer").email("john.doe@soprahr.com")
                        .password(passwordEncoder.encode("Emp@123456"))
                        .phone("+21690000333").role(UserRole.EMPLOYEE)
                        .salary(new BigDecimal("1500")).company("Sopra HR")
                        .profilePicture(DEFAULT_PROFILE_PICTURE)
                        .build();
                User emp2 = User.userBuilder()
                        .firstName("Jane").lastName("Smith").name("Jane Smith")
                        .jobTitle("QA Analyst").email("jane.smith@soprahr.com")
                        .password(passwordEncoder.encode("Emp@654321"))
                        .phone("+21690000444").role(UserRole.EMPLOYEE)
                        .salary(new BigDecimal("1600")).company("Sopra HR")
                        .profilePicture(DEFAULT_PROFILE_PICTURE)
                        .build();
                User emp3 = User.userBuilder()
                        .firstName("Ali").lastName("Ben Salah").name("Ali Ben Salah")
                        .jobTitle("Consultant").email("ali.bensalah@soprahr.com")
                        .password(passwordEncoder.encode("Emp@111222"))
                        .phone("+21690000555").role(UserRole.EMPLOYEE)
                        .salary(new BigDecimal("1700")).company("Sopra HR")
                        .profilePicture(DEFAULT_PROFILE_PICTURE)
                        .build();
                // New employee with no advance
                User empNoAdvance = User.userBuilder()
                        .firstName("NoAdvance").lastName("User").name("NoAdvance User")
                        .jobTitle("Intern").email("no.advance@soprahr.com")
                        .password(passwordEncoder.encode("Emp@NoAdvance1"))
                        .phone("+21690000666").role(UserRole.EMPLOYEE)
                        .salary(new BigDecimal("1200")).company("Sopra HR")
                        .profilePicture(DEFAULT_PROFILE_PICTURE)
                        .build();
                userRepository.save(admin);
                userRepository.save(hrExpert);
                userRepository.save(emp1);
                userRepository.save(emp2);
                userRepository.save(emp3);
                userRepository.save(empNoAdvance);

                // --- Demandes d'avance ---
                SalaryAdvanceRequest req1 = SalaryAdvanceRequest.builder()
                        .requestedAmount(new BigDecimal("500"))
                        .reason("Achat ordinateur")
                        .status(RequestStatus.PENDING)
                        .requestDate(java.time.LocalDate.now().minusDays(10))
                        .neededDate(java.time.LocalDate.now().plusDays(5))
                        .employee(emp1)
                        .build();
                SalaryAdvanceRequest req2 = SalaryAdvanceRequest.builder()
                        .requestedAmount(new BigDecimal("800"))
                        .reason("Frais médicaux")
                        .status(RequestStatus.APPROVED)
                        .requestDate(java.time.LocalDate.now().minusDays(20))
                        .neededDate(java.time.LocalDate.now().plusDays(2))
                        .employee(emp2)
                        .approvedBy(hrExpert)
                        .approvedAt(java.time.LocalDate.now().minusDays(15))
                        .build();
                SalaryAdvanceRequest req3 = SalaryAdvanceRequest.builder()
                        .requestedAmount(new BigDecimal("300"))
                        .reason("Voyage urgent")
                        .status(RequestStatus.REJECTED)
                        .requestDate(java.time.LocalDate.now().minusDays(5))
                        .neededDate(java.time.LocalDate.now().plusDays(10))
                        .employee(emp3)
                        .rejectionReason("Motif non valable")
                        .build();
                salaryAdvanceRequestRepository.save(req1);
                salaryAdvanceRequestRepository.save(req2);
                salaryAdvanceRequestRepository.save(req3);

                // --- Échéanciers de remboursement ---
                RepaymentSchedule ech1 = RepaymentSchedule.builder()
                        .salaryAdvanceRequest(req1)
                        .dueDate(java.time.LocalDate.now().plusMonths(1))
                        .amount(new BigDecimal("250"))
                        .paid(false)
                        .build();
                RepaymentSchedule ech2 = RepaymentSchedule.builder()
                        .salaryAdvanceRequest(req1)
                        .dueDate(java.time.LocalDate.now().plusMonths(2))
                        .amount(new BigDecimal("250"))
                        .paid(false)
                        .build();
                RepaymentSchedule ech3 = RepaymentSchedule.builder()
                        .salaryAdvanceRequest(req2)
                        .dueDate(java.time.LocalDate.now().plusMonths(1))
                        .amount(new BigDecimal("400"))
                        .paid(true)
                        .build();
                RepaymentSchedule ech4 = RepaymentSchedule.builder()
                        .salaryAdvanceRequest(req2)
                        .dueDate(java.time.LocalDate.now().plusMonths(2))
                        .amount(new BigDecimal("400"))
                        .paid(false)
                        .build();
                repaymentScheduleRepository.save(ech1);
                repaymentScheduleRepository.save(ech2);
                repaymentScheduleRepository.save(ech3);
                repaymentScheduleRepository.save(ech4);

                // --- Notifications ---
                Notification notif1 = Notification.builder()
                        .title("Nouvelle demande d'avance")
                        .message("Votre demande est en attente de validation.")
                        .type(NotificationType.REQUEST_PENDING)
                        .read(false)
                        .recipient(emp1)
                        .relatedRequest(req1)
                        .build();
                Notification notif2 = Notification.builder()
                        .title("Demande approuvée")
                        .message("Votre demande a été approuvée.")
                        .type(NotificationType.REQUEST_APPROVAL)
                        .read(false)
                        .recipient(emp2)
                        .relatedRequest(req2)
                        .build();
                Notification notif3 = Notification.builder()
                        .title("Demande rejetée")
                        .message("Votre demande a été rejetée.")
                        .type(NotificationType.REQUEST_REJECTION)
                        .read(false)
                        .recipient(emp3)
                        .relatedRequest(req3)
                        .build();
                notificationRepository.save(notif1);
                notificationRepository.save(notif2);
                notificationRepository.save(notif3);

                // --- Intelligent Notifications (for emp1) ---
                notificationRepository.save(Notification.builder()
                        .title("Rappel d'inactivité")
                        .message("Vous ne vous êtes pas connecté depuis 30 jours.")
                        .type(NotificationType.INACTIVITY_REMINDER)
                        .recipient(emp1)
                        .build());

                notificationRepository.save(Notification.builder()
                        .title("Bravo !")
                        .message("Vous avez terminé le remboursement de votre avance en temps et en heure.")
                        .type(NotificationType.POSITIVE_FEEDBACK)
                        .recipient(emp1)
                        .build());
                
                // --- Intelligent Notifications (for hr1) ---
                notificationRepository.save(Notification.builder()
                        .title("Rappel 3 jours")
                        .message("La demande de " + emp3.getFirstName() + " est en attente depuis 3 jours.")
                        .type(NotificationType.PROGRESSIVE_REMINDER_3D)
                        .recipient(hrExpert) // Assuming hrExpert is the HR user
                        .relatedRequest(req3)
                        .build());
                
                notificationRepository.save(Notification.builder()
                        .title("Détection de pattern")
                        .message("3+ employés du département " + emp1.getJobTitle() + " ont fait une demande ce mois-ci.")
                        .type(NotificationType.PATTERN_DETECTION)
                        .recipient(hrExpert) // Assuming hrExpert is the HR user
                        .build());

                notificationRepository.save(Notification.builder()
                        .title("Rappel Calendrier")
                        .message("N'oubliez pas de suivre la demande de " + emp2.getFirstName())
                        .type(NotificationType.CALENDAR_REMINDER)
                        .recipient(hrExpert) // Assuming hrExpert is the HR user
                        .relatedRequest(req2)
                        .build());

                // --- Historique des demandes ---
                RequestHistory hist1 = RequestHistory.builder()
                        .request(req1)
                        .previousStatus(RequestStatus.PENDING)
                        .newStatus(RequestStatus.PENDING)
                        .changedBy(admin)
                        .comment("Demande créée.")
                        .build();
                RequestHistory hist2 = RequestHistory.builder()
                        .request(req2)
                        .previousStatus(RequestStatus.PENDING)
                        .newStatus(RequestStatus.APPROVED)
                        .changedBy(hrExpert)
                        .comment("Demande validée par RH.")
                        .build();
                RequestHistory hist3 = RequestHistory.builder()
                        .request(req3)
                        .previousStatus(RequestStatus.PENDING)
                        .newStatus(RequestStatus.REJECTED)
                        .changedBy(hrExpert)
                        .comment("Demande rejetée par RH.")
                        .build();
                requestHistoryRepository.save(hist1);
                requestHistoryRepository.save(hist2);
                requestHistoryRepository.save(hist3);
            }
        };
    }
}