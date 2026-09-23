import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CurrentUserService } from '../../../auth/current-user.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent {
  readonly currentUser = inject(CurrentUserService);
}
