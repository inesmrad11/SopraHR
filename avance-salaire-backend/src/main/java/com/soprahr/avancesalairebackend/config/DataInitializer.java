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
import java.util.List;

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
                // Créer des notifications pour tous les utilisateurs
                List<User> allUsers = userRepository.findAll();
                for (User user : allUsers) {
                    // 3 notifications de base pour tous les utilisateurs
                    notificationRepository.save(Notification.builder()
                        .title("Bienvenue sur Sopra HR !")
                        .message("Bonjour " + user.getFirstName() + ", nous sommes ravis de vous accueillir sur la plateforme Sopra HR. Explorez vos fonctionnalités dès maintenant !")
                        .type(NotificationType.INFO)
                        .recipient(user)
                        .read(false)
                        .build());
                    notificationRepository.save(Notification.builder()
                        .title("Astuce : Gérer vos demandes")
                        .message("Vous pouvez suivre l'état de vos demandes d'avance et recevoir des notifications en temps réel.")
                        .type(NotificationType.SUGGESTION)
                        .recipient(user)
                        .read(false)
                        .build());
                    notificationRepository.save(Notification.builder()
                        .title("Nouveau : Notifications intelligentes")
                        .message("Recevez des rappels, des conseils et des alertes personnalisées pour optimiser votre expérience sur Sopra HR.")
                        .type(NotificationType.POLICY_UPDATE)
                        .recipient(user)
                        .read(false)
                        .build());
                    
                    // Notifications spécifiques selon le rôle
                    if (user.getRole() == UserRole.EMPLOYEE) {
                        notificationRepository.save(Notification.builder()
                            .title("Rappel : échéance de remboursement")
                            .message("Votre prochaine échéance de remboursement est prévue pour le 5 août.")
                            .type(NotificationType.UPCOMING_INSTALLMENT)
                            .recipient(user)
                            .read(false)
                            .build());
                        notificationRepository.save(Notification.builder()
                            .title("Bravo !")
                            .message("Vous avez terminé le remboursement de votre avance en temps et en heure.")
                            .type(NotificationType.POSITIVE_FEEDBACK)
                            .recipient(user)
                            .read(false)
                            .build());
                        notificationRepository.save(Notification.builder()
                            .title("Rappel d'inactivité")
                            .message("Vous ne vous êtes pas connecté depuis 30 jours.")
                            .type(NotificationType.INACTIVITY_REMINDER)
                            .recipient(user)
                            .read(false)
                            .build());
                    } else if (user.getRole() == UserRole.HR_EXPERT) {
                        notificationRepository.save(Notification.builder()
                            .title("Statistiques RH du mois")
                            .message("Ce mois-ci, 85% des demandes ont été traitées en moins de 2 jours.")
                            .type(NotificationType.STATISTICS_ALERT)
                            .recipient(user)
                            .read(false)
                            .build());
                        notificationRepository.save(Notification.builder()
                            .title("Maintenance prévue")
                            .message("Une maintenance technique aura lieu vendredi de 18h à 20h. Merci de votre compréhension.")
                            .type(NotificationType.MAINTENANCE)
                            .recipient(user)
                            .read(false)
                            .build());
                        notificationRepository.save(Notification.builder()
                            .title("Détection de pattern")
                            .message("3+ employés du département " + emp1.getJobTitle() + " ont fait une demande ce mois-ci.")
                            .type(NotificationType.PATTERN_DETECTION)
                            .recipient(user)
                            .build());
                    }
                }

                // --- Fin de l'initialisation des données ---
                System.out.println("✅ Données initialisées avec succès !");
                System.out.println("👥 Utilisateurs créés : " + userRepository.count());
                System.out.println("📋 Demandes créées : " + salaryAdvanceRequestRepository.count());
                System.out.println("🔔 Notifications créées : " + notificationRepository.count());
            }
        };
    }
}