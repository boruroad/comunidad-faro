import { Routes } from '@angular/router';
import { HomeComponent } from './pages/public/home/home.component';
import { InterestedRegistrationComponent } from './pages/public/interested-registration/interested-registration.component';
import { PrivacyPolicyComponent } from './pages/public/privacy-policy/privacy-policy.component';
import { LoginComponent } from './pages/public/login/login.component';
import { DashboardComponent } from './pages/private/dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { SiteConfigAdminComponent } from './pages/private/site-config-admin/site-config-admin.component';

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
		path: 'privacidad',
		component: PrivacyPolicyComponent
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
		path: 'dashboard/configuracion',
		component: SiteConfigAdminComponent,
		canActivate: [authGuard, adminGuard]
	},
	{
		path: '**',
		redirectTo: ''
	}
];
