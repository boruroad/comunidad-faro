import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { InterestedRegistrationComponent } from './interested-registration.component';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'home',
		redirectTo: ''
	},
	{
		path: 'interesado',
		component: InterestedRegistrationComponent
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [authGuard]
	},
	{
		path: '**',
		redirectTo: ''
	}
];
