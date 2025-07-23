// angular import
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SpinnerComponent, HttpClientModule]
})
export class AppComponent implements OnInit {
  // public props
  title = 'mantis-free-version';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.notificationService.connect(user.id);
    }
  }
}
