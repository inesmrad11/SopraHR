// angular import
import { Component, inject, input, output } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

// project import
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user.model';
import { NotificationCenterComponent } from 'src/app/shared/components/notification/notification-center/notification-center.component';
import { RoleTranslatePipe } from 'src/app/core/pipes/role-translate.pipe';

// icon
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline,
  AppstoreOutline,
  LayoutOutline,
  MailOutline,
  FullscreenOutline,
  // Notification icons
  InfoCircleOutline,
  WarningOutline,
  CloseCircleOutline,
  RollbackOutline,
  SyncOutline,
  PaperClipOutline,
  TrophyOutline,
  RiseOutline,
  FileTextOutline,
  CalendarOutline,
  ExclamationCircleOutline,
  BarChartOutline,
  AlertOutline,
  LineChartOutline,
  ToolOutline,
  DownloadOutline,
  BulbOutline,
  UserDeleteOutline,
  SmileOutline,
  EyeOutline,
  ClockCircleOutline
} from '@ant-design/icons-angular/icons';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-nav-right',
  imports: [IconDirective, RouterModule, NgScrollbarModule, NgbNavModule, NgbDropdownModule, NotificationCenterComponent, RoleTranslatePipe],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {
  private iconService = inject(IconService);
  private authService = inject(AuthService);

  styleSelectorToggle = input<boolean>();
  Customize = output();
  windowWidth: number;
  screenFull: boolean = true;

  user: User | null = null;

  constructor(private router: Router) {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        CheckCircleOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        LogoutOutline,
        UserOutline,
        EditOutline,
        ProfileOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline,
        BellOutline,
        GithubOutline,
        WalletOutline,
        AppstoreOutline,
        LayoutOutline,
        MailOutline,
        FullscreenOutline,
        // Notification icons
        InfoCircleOutline,
        WarningOutline,
        CloseCircleOutline,
        RollbackOutline,
        SyncOutline,
        PaperClipOutline,
        TrophyOutline,
        RiseOutline,
        FileTextOutline,
        CalendarOutline,
        ExclamationCircleOutline,
        BarChartOutline,
        AlertOutline,
        LineChartOutline,
        ToolOutline,
        DownloadOutline,
        BulbOutline,
        UserDeleteOutline,
        SmileOutline,
        EyeOutline,
        ClockCircleOutline
      ]
    );
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  animateIcon(icon: string) {
    const el = document.querySelector('.pc-head-link i[anticon][type="' + icon + '"]');
    if (el) {
      el.classList.add('icon-animate');
      setTimeout(() => el.classList.remove('icon-animate'), 600);
    }
  }

  onLogoutClick(event: Event) {
    event.preventDefault();
    this.authService.logout();
    (inject(Router)).navigate(['/login']);
  }

  goToHRMessages() {
    this.animateIcon('mail');
    this.router.navigate(['/hr/messages']);
  }

  onBellClick() {
    this.animateIcon('bell');
    // Ouvre le panneau de notifications si besoin
  }

  profile = [
    {
      icon: 'edit',
      title: 'Modifier le profil'
    },
    {
      icon: 'user',
      title: 'Voir le profil'
    },
    {
      icon: 'profile',
      title: 'Profil social'
    },
    {
      icon: 'wallet',
      title: 'Facturation'
    },
    {
      icon: 'logout',
      title: 'Se déconnecter'
    }
  ];

  setting = [
    {
      icon: 'question-circle',
      title: 'Support'
    },
    {
      icon: 'user',
      title: 'Paramètres du compte'
    },
    {
      icon: 'lock',
      title: 'Centre de confidentialité'
    },
    {
      icon: 'comment',
      title: 'Retour'
    },
    {
      icon: 'unordered-list',
      title: 'Historique'
    }
  ];
}
