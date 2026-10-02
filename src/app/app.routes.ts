import { Routes } from '@angular/router';
import { HomeComponent } from './pages/public/home/home.component';
import { InterestedRegistrationComponent } from './pages/public/interested-registration/interested-registration.component';
import { PrivacyPolicyComponent } from './pages/public/privacy-policy/privacy-policy.component';
import { LoginComponent } from './pages/public/login/login.component';
import { RegisterComponent } from './pages/public/register/register.component';
import { ForgotPasswordComponent } from './pages/public/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/public/reset-password/reset-password.component';
import { DashboardComponent } from './pages/private/dashboard/dashboard.component';
import { DashboardHomeComponent } from './pages/private/dashboard-home/dashboard-home.component';
import { UsuariosComponent } from './pages/private/usuarios/usuarios.component';
import { PersonasComponent } from './pages/private/personas/personas.component';
import { ComunidadesComponent } from './pages/private/comunidades/comunidades.component';
import { CasasComponent } from './pages/private/casas/casas.component';
import { AreasComponent } from './pages/private/areas/areas.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { SiteConfigAdminComponent } from './pages/private/site-config-admin/site-config-admin.component';

export const routes: Routes = [
	{
		path: '',
		component: HomeComponent
		//component: InterestedRegistrationComponent
	},
	{
		path: 'home',
		redirectTo: ''
	},
	{
		path: 'ser-parte',
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
		path: 'crear-cuenta',
		component: RegisterComponent
	},
	{
		path: 'recuperar-password',
		component: ForgotPasswordComponent
	},
	{
		path: 'restablecer-password',
		component: ResetPasswordComponent
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [authGuard],
		children: [
			{
				path: '',
				component: DashboardHomeComponent
			},
			{
				path: 'usuarios',
				component: UsuariosComponent
			},
			{
				path: 'personas',
				component: PersonasComponent
			},
			{
				path: 'comunidades',
				component: ComunidadesComponent,
				canActivate: [adminGuard]
			},
			{
				path: 'casas',
				component: CasasComponent,
				canActivate: [adminGuard]
			},
			{
				path: 'areas',
				component: AreasComponent,
				canActivate: [adminGuard]
			},
			{
				path: 'configuracion',
				component: SiteConfigAdminComponent,
				canActivate: [adminGuard]
			}
		]
	},
	{
		path: '**',
		redirectTo: ''
	}
];
