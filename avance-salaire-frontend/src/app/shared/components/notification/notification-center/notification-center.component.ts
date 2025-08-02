import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule
import { NotificationService } from 'src/app/core/services/notification.service';
import { Notification } from 'src/app/core/models/notification.model';
import { NOTIFICATION_ICONS, NotificationType } from 'src/app/core/models/notification-type.enum'; // Import NOTIFICATION_ICONS
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { RoleTranslatePipe } from 'src/app/core/pipes/role-translate.pipe';
import { 
  CheckOutline, 
  DeleteOutline, 
  CloseOutline, 
  LeftOutline, 
  RightOutline, 
  CiCircleOutline, 
  ClockCircleOutline, 
  HeartOutline,
  SearchOutline,
  BellOutline,
  UserOutline,
  InfoCircleOutline,
  StarOutline,
  EyeOutline,
  EditOutline,
  DownloadOutline,
  ToolOutline,
  CalendarOutline,
  WarningOutline,
  SyncOutline,
  PieChartOutline,
  BarChartOutline,
  FileTextOutline,
  MessageOutline,
  ArrowRightOutline,
  ArrowLeftOutline,
  PlusOutline,
  MinusOutline,
  SettingOutline,
  FilterOutline,
  TagOutline,
  DollarOutline,
  SafetyOutline,
  SaveOutline,
  ReloadOutline,
  FileOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  ExclamationCircleOutline,
  QuestionCircleOutline,
  SendOutline,
  FlagOutline,
  TrophyOutline,
  LikeOutline,
  DislikeOutline,
  SmileOutline,
  FrownOutline,
  MehOutline,
  FireOutline,
  ThunderboltOutline,
  RocketOutline,
  GiftOutline,
  CrownOutline,
  BulbOutline,
  ExperimentOutline,
  BugOutline,
  CompassOutline,
  EnvironmentOutline,
  GlobalOutline,
  HomeOutline,
  TeamOutline,
  UsergroupAddOutline,
  UsergroupDeleteOutline,
  UserAddOutline,
  UserDeleteOutline,
  UserSwitchOutline,
  LockOutline,
  UnlockOutline,
  KeyOutline,
  SafetyCertificateOutline,
  SecurityScanOutline,
  ScanOutline,
  QrcodeOutline,
  CameraOutline,
  VideoCameraOutline,
  AudioOutline,
  SoundOutline,
  MutedOutline,
  PlaySquareOutline,
  PauseCircleOutline,
  StopOutline,
  LoadingOutline,
  Loading3QuartersOutline,
  RotateLeftOutline,
  RotateRightOutline,
  RedoOutline,
  UndoOutline,
  ZoomInOutline,
  ZoomOutOutline,
  FullscreenOutline,
  FullscreenExitOutline,
  ShrinkOutline,
  ArrowsAltOutline,
  CompressOutline,
  ExpandOutline,
  FallOutline,
  RiseOutline,
  StockOutline,
  FundOutline,
  AccountBookOutline,
  AlertOutline,
  ApiOutline,
  AppstoreOutline,
  AppstoreAddOutline,
  AuditOutline,
  BankOutline,
  BarcodeOutline,
  BarsOutline,
  BlockOutline,
  BookOutline,
  BorderOutline,
  BranchesOutline,
  BuildOutline,
  CalculatorOutline,
  CarOutline,
  CarryOutOutline,
  ClearOutline,
  CloudOutline,
  CloudDownloadOutline,
  CloudUploadOutline,
  CloudSyncOutline,
  ClusterOutline,
  CodeOutline,
  CoffeeOutline,
  CommentOutline,
  ConsoleSqlOutline,
  ContactsOutline,
  ContainerOutline,
  ControlOutline,
  CopyrightOutline,
  CreditCardOutline,
  CustomerServiceOutline,
  DashboardOutline,
  DatabaseOutline,
  DeleteColumnOutline,
  DeleteRowOutline,
  DeliveredProcedureOutline,
  DeploymentUnitOutline,
  DesktopOutline,
  DisconnectOutline,
  EllipsisOutline,
  ExceptionOutline,
  ExpandAltOutline,
  ExportOutline,
  EyeInvisibleOutline,
  FieldBinaryOutline,
  FieldNumberOutline,
  FieldStringOutline,
  FieldTimeOutline,
  FileAddOutline,
  FileDoneOutline,
  FileExcelOutline,
  FileExclamationOutline,
  FileGifOutline,
  FileImageOutline,
  FileJpgOutline,
  FileMarkdownOutline,
  FilePdfOutline,
  FilePptOutline,
  FileProtectOutline,
  FileSearchOutline,
  FileSyncOutline,
  FileUnknownOutline,
  FileWordOutline,
  FileZipOutline,
  FolderAddOutline,
  FolderOpenOutline,
  FolderViewOutline,
  ForkOutline,
  FormatPainterOutline,
  FunctionOutline,
  FundProjectionScreenOutline,
  FundViewOutline,
  FunnelPlotOutline,
  GatewayOutline,
  GroupOutline,
  HddOutline,
  HistoryOutline,
  HolderOutline,
  HourglassOutline,
  IdcardOutline,
  ImportOutline,
  InboxOutline,
  InsertRowAboveOutline,
  InsertRowBelowOutline,
  InsertRowLeftOutline,
  InsertRowRightOutline,
  InsuranceOutline,
  InteractionOutline,
  LaptopOutline,
  LayoutOutline,
  LineOutline,
  LinkOutline,
  MacCommandOutline,
  MailOutline,
  ManOutline,
  MedicineBoxOutline,
  MenuOutline,
  MergeCellsOutline,
  MergeOutline,
  MobileOutline,
  MoneyCollectOutline,
  MonitorOutline,
  MoonOutline,
  MoreOutline,
  NodeCollapseOutline,
  NodeExpandOutline,
  NodeIndexOutline,
  NotificationOutline,
  NumberOutline,
  OneToOneOutline,
  PaperClipOutline,
  PartitionOutline,
  PayCircleOutline,
  PercentageOutline,
  PhoneOutline,
  PictureOutline,
  PoundCircleOutline,
  PoundOutline,
  PoweroffOutline,
  PrinterOutline,
  ProductOutline,
  ProfileOutline,
  ProjectOutline,
  PropertySafetyOutline,
  PullRequestOutline,
  PushpinOutline,
  ReadOutline,
  ReconciliationOutline,
  RedEnvelopeOutline,
  RestOutline,
  RobotOutline,
  SubnodeOutline,
  SunOutline,
  SwitcherOutline,
  TabletOutline,
  TagsOutline,
  ToTopOutline,
  TrademarkCircleOutline,
  TrademarkOutline,
  TransactionOutline,
  TranslationOutline,
  TruckOutline,
  UngroupOutline,
  UploadOutline,
  UsbOutline,
  VerifiedOutline,
  VideoCameraAddOutline,
  WalletOutline,
  WifiOutline,
  WomanOutline
} from '@ant-design/icons-angular/icons';

interface GroupedNotification {
  label: string;
  notifications: Notification[];
}

@Component({
  selector: 'app-notification-center',
  standalone: true, // Add standalone: true
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
  imports: [CommonModule, DatePipe, IconDirective, RoleTranslatePipe] // Add IconDirective for antIcon support
})
export class NotificationCenterComponent implements OnInit {
  private iconService = inject(IconService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  // Remove groupedNotifications and use flat notifications list
  notifications: Notification[] = [];
  showPanel = false;
  icons = NOTIFICATION_ICONS;

  constructor(@Inject(ToastrService) private toastr: ToastrService) {
    // Register all required icons
    this.iconService.addIcon(
      CheckOutline,
      DeleteOutline,
      CloseOutline,
      LeftOutline,
      RightOutline,
      CiCircleOutline,
      ClockCircleOutline,
      HeartOutline,
      SearchOutline,
      BellOutline,
      UserOutline,
      InfoCircleOutline,
      StarOutline,
      EyeOutline,
      EditOutline,
      DownloadOutline,
      ToolOutline,
      CalendarOutline,
      WarningOutline,
      SyncOutline,
      PieChartOutline,
      BarChartOutline,
      FileTextOutline,
      MessageOutline,
      ArrowRightOutline,
      ArrowLeftOutline,
      PlusOutline,
      MinusOutline,
      SettingOutline,
      FilterOutline,
      TagOutline,
      DollarOutline,
      SafetyOutline,
      SaveOutline,
      ReloadOutline,
      FileOutline,
      CheckCircleOutline,
      CloseCircleOutline,
      ExclamationCircleOutline,
      QuestionCircleOutline,
      SendOutline,
      FlagOutline,
      TrophyOutline,
      LikeOutline,
      DislikeOutline,
      SmileOutline,
      FrownOutline,
      MehOutline,
      FireOutline,
      ThunderboltOutline,
      RocketOutline,
      GiftOutline,
      CrownOutline,
      BulbOutline,
      ExperimentOutline,
      BugOutline,
      CompassOutline,
      EnvironmentOutline,
      GlobalOutline,
      HomeOutline,
      TeamOutline,
      UsergroupAddOutline,
      UsergroupDeleteOutline,
      UserAddOutline,
      UserDeleteOutline,
      UserSwitchOutline,
      LockOutline,
      UnlockOutline,
      KeyOutline,
      SafetyCertificateOutline,
      SecurityScanOutline,
      ScanOutline,
      QrcodeOutline,
      CameraOutline,
      VideoCameraOutline,
      AudioOutline,
      SoundOutline,
      MutedOutline,
      PlaySquareOutline,
      PauseCircleOutline,
      StopOutline,
      LoadingOutline,
      Loading3QuartersOutline,
      RotateLeftOutline,
      RotateRightOutline,
      RedoOutline,
      UndoOutline,
      ZoomInOutline,
      ZoomOutOutline,
      FullscreenOutline,
      FullscreenExitOutline,
      ShrinkOutline,
      ArrowsAltOutline,
      CompressOutline,
      ExpandOutline,
      FallOutline,
      RiseOutline,
      StockOutline,
      FundOutline,
      AccountBookOutline,
      AlertOutline,
      ApiOutline,
      AppstoreOutline,
      AppstoreAddOutline,
      AuditOutline,
      BankOutline,
      BarcodeOutline,
      BarsOutline,
      BlockOutline,
      BookOutline,
      BorderOutline,
      BranchesOutline,
      BuildOutline,
      CalculatorOutline,
      CarOutline,
      CarryOutOutline,
      ClearOutline,
      CloudOutline,
      CloudDownloadOutline,
      CloudUploadOutline,
      CloudSyncOutline,
      ClusterOutline,
      CodeOutline,
      CoffeeOutline,
      CommentOutline,
      ConsoleSqlOutline,
      ContactsOutline,
      ContainerOutline,
      ControlOutline,
      CopyrightOutline,
      CreditCardOutline,
      CustomerServiceOutline,
      DashboardOutline,
      DatabaseOutline,
      DeleteColumnOutline,
      DeleteRowOutline,
      DeliveredProcedureOutline,
      DeploymentUnitOutline,
      DesktopOutline,
      DisconnectOutline,
      EllipsisOutline,
      ExceptionOutline,
      ExpandAltOutline,
      ExportOutline,
      EyeInvisibleOutline,
      FieldBinaryOutline,
      FieldNumberOutline,
      FieldStringOutline,
      FieldTimeOutline,
      FileAddOutline,
      FileDoneOutline,
      FileExcelOutline,
      FileExclamationOutline,
      FileGifOutline,
      FileImageOutline,
      FileJpgOutline,
      FileMarkdownOutline,
      FilePdfOutline,
      FilePptOutline,
      FileProtectOutline,
      FileSearchOutline,
      FileSyncOutline,
      FileUnknownOutline,
      FileWordOutline,
      FileZipOutline,
      FolderAddOutline,
      FolderOpenOutline,
      FolderViewOutline,
      ForkOutline,
      FormatPainterOutline,
      FunctionOutline,
      FundProjectionScreenOutline,
      FundViewOutline,
      FunnelPlotOutline,
      GatewayOutline,
      GroupOutline,
      HddOutline,
      HistoryOutline,
      HolderOutline,
      HourglassOutline,
      IdcardOutline,
      ImportOutline,
      InboxOutline,
      InsertRowAboveOutline,
      InsertRowBelowOutline,
      InsertRowLeftOutline,
      InsertRowRightOutline,
      InsuranceOutline,
      InteractionOutline,
      LaptopOutline,
      LayoutOutline,
      LineOutline,
      LinkOutline,
      MacCommandOutline,
      MailOutline,
      ManOutline,
      MedicineBoxOutline,
      MenuOutline,
      MergeCellsOutline,
      MergeOutline,
      MobileOutline,
      MoneyCollectOutline,
      MonitorOutline,
      MoonOutline,
      MoreOutline,
      NodeCollapseOutline,
      NodeExpandOutline,
      NodeIndexOutline,
      NotificationOutline,
      NumberOutline,
      OneToOneOutline,
      PaperClipOutline,
      PartitionOutline,
      PayCircleOutline,
      PercentageOutline,
      PhoneOutline,
      PictureOutline,
      PoundCircleOutline,
      PoundOutline,
      PoweroffOutline,
      PrinterOutline,
      ProductOutline,
      ProfileOutline,
      ProjectOutline,
      PropertySafetyOutline,
      PullRequestOutline,
      PushpinOutline,
      ReadOutline,
      ReconciliationOutline,
      RedEnvelopeOutline,
      RestOutline,
      RobotOutline,
      SubnodeOutline,
      SunOutline,
      SwitcherOutline,
      TabletOutline,
      TagsOutline,
      ToTopOutline,
      TrademarkCircleOutline,
      TrademarkOutline,
      TransactionOutline,
      TranslationOutline,
      TruckOutline,
      UngroupOutline,
      UploadOutline,
      UsbOutline,
      VerifiedOutline,
      VideoCameraAddOutline,
      WalletOutline,
      WifiOutline,
      WomanOutline
    );
  }

  ngOnInit(): void {
    this.notificationService.loadNotifications();
    this.notificationService.notifications.subscribe(notifs => {
      this.notifications = notifs;
    });
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  togglePanel() {
    this.showPanel = !this.showPanel;
  }

  markAsRead(notification: Notification, event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id);
  }

  markAllAsRead(event: MouseEvent) {
    event.stopPropagation();
    const unreadIds = this.notifications.filter(n => !n.read).map(n => n.id);
    // This assumes a backend endpoint exists to mark multiple as read
    // If not, we would loop and call markAsRead for each
    unreadIds.forEach(id => this.notificationService.markAsRead(id));
  }

  viewRequest(requestId: number, event: MouseEvent) {
    event.stopPropagation();
    const user = this.authService.getCurrentUser();
    if (!user) return;
    let route = '';
    if (user.role && user.role.toUpperCase().includes('HR')) {
      route = `/hr/request-details/${requestId}`;
    } else {
      route = `/employee/advance-request-details/${requestId}`;
    }
    this.router.navigate([route]);
    this.showPanel = false;
  }

  sendReminder(requestId: number, event: MouseEvent) {
    event.stopPropagation();
    this.http.post(`${environment.apiUrl}/notifications/send-reminder`, { requestId }).subscribe({
      next: () => this.toastr.success('Rappel envoyé à l’employé.'),
      error: () => this.toastr.error('Erreur lors de l’envoi du rappel.')
    });
  }

  addToCalendar(notification: Notification, event: MouseEvent) {
    event.stopPropagation();
    const title = encodeURIComponent(notification.title);
    const details = encodeURIComponent(notification.message);
    const a = document.createElement('a');
    a.href = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    a.target = '_blank';
    a.click();
    this.toastr.info('Événement de calendrier ouvert dans un nouvel onglet.');
  }

  goToNotifications(event: MouseEvent) {
    event.preventDefault();
    this.showPanel = false;
    this.router.navigate(['notifications'], { relativeTo: this.route });
  }

  getIcon(type: NotificationType): string {
    // Map notification types to Ant Design icon names
    switch (type) {
      case 'INFO': return 'info-circle';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'close-circle';
      case 'REQUEST_APPROVAL': return 'check-circle';
      case 'REQUEST_REJECTION': return 'close-circle';
      case 'REQUEST_CANCELLATION': return 'rollback';
      case 'REQUEST_COMPLETION': return 'check-circle';
      case 'REQUEST_PENDING': return 'clock';
      case 'REQUEST_IN_PROGRESS': return 'sync';
      case 'DOCUMENT_MISSING': return 'paper-clip';
      case 'CONGRATS_NO_LATE_REPAYMENT': return 'star';
      case 'FINANCIAL_ADVICE': return 'rise';
      case 'POLICY_UPDATE': return 'file-text';
      case 'UPCOMING_INSTALLMENT': return 'calendar';
      case 'WORKLOAD_ALERT': return 'exclamation-circle';
      case 'TEAM_PERFORMANCE': return 'bar-chart';
      case 'UNUSUAL_REQUEST': return 'warning';
      case 'FEEDBACK_REMINDER': return 'message';
      case 'ACTIVITY_PEAK': return 'line-chart';
      case 'MAINTENANCE': return 'tool';
      case 'APP_UPDATE': return 'download';
      case 'ACTION_REMINDER': return 'bell';
      case 'SUGGESTION': return 'bulb';
      case 'STATISTICS_ALERT': return 'bar-chart';
      case 'CALENDAR_REMINDER': return 'calendar';
      case 'INACTIVITY_REMINDER': return 'user';
      case 'POSITIVE_FEEDBACK': return 'smile';
      case 'ANTICIPATION_ALERT': return 'clock';
      case 'PROFILE_SUGGESTION': return 'user';
      case 'PREVENTIVE_ALERT': return 'warning';
      case 'RULE_CHANGE': return 'setting';
      case 'PROGRESSIVE_REMINDER_24H': return 'clock';
      case 'PROGRESSIVE_REMINDER_3D': return 'clock';
      case 'PROGRESSIVE_REMINDER_5D': return 'clock';
      case 'COLLECTIVE_STATS': return 'bar-chart';
      case 'PATTERN_DETECTION': return 'eye';
      default: return 'bell';
    }
  }

  getEmoji(type: NotificationType): string {
    switch (type) {
      case 'INFO': return 'ℹ️';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '❌';
      case 'POSITIVE_FEEDBACK': return '🎉';
      case 'ACTION_REMINDER': return '⏰';
      case 'CONGRATS_NO_LATE_REPAYMENT': return '🏅';
      case 'CALENDAR_REMINDER': return '📅';
      case 'DOCUMENT_MISSING': return '📄';
      case 'REQUEST_APPROVAL': return '✅';
      case 'REQUEST_REJECTION': return '🚫';
      case 'UPCOMING_INSTALLMENT': return '💸';
      case 'PATTERN_DETECTION': return '🔎';
      case 'TEAM_PERFORMANCE': return '💪';
      case 'UNUSUAL_REQUEST': return '❗';
      case 'SUGGESTION': return '💡';
      case 'STATISTICS_ALERT': return '📊';
      case 'MAINTENANCE': return '🛠️';
      case 'APP_UPDATE': return '⬆️';
      default: return '🔔';
    }
  }

  getColor(type: NotificationType): string {
    switch (type) {
      case 'INFO': return '#3498db';
      case 'WARNING': return '#f39c12';
      case 'ERROR': return '#e74c3c';
      case 'POSITIVE_FEEDBACK': return '#2ecc71';
      case 'ACTION_REMINDER': return '#faad14';
      case 'CONGRATS_NO_LATE_REPAYMENT': return '#52c41a';
      case 'CALENDAR_REMINDER': return '#8e44ad';
      case 'DOCUMENT_MISSING': return '#b37feb';
      case 'REQUEST_APPROVAL': return '#52c41a';
      case 'REQUEST_REJECTION': return '#e74c3c';
      case 'UPCOMING_INSTALLMENT': return '#13c2c2';
      case 'PATTERN_DETECTION': return '#1677ff';
      case 'TEAM_PERFORMANCE': return '#fa541c';
      case 'UNUSUAL_REQUEST': return '#faad14';
      case 'SUGGESTION': return '#faad14';
      case 'STATISTICS_ALERT': return '#3498db';
      case 'MAINTENANCE': return '#8e44ad';
      case 'APP_UPDATE': return '#1677ff';
      default: return '#888';
    }
  }

  getSubtext(notif: Notification): string {
    // Example: return '2 min ago', '5 August', or custom subtext
    const now = new Date();
    const created = new Date(notif.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} hours ago`;
    if (now.getFullYear() === created.getFullYear()) {
      return created.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
    }
    return created.toLocaleDateString();
  }
} 