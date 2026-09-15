import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { InterestedRegistrationComponent } from './interested-registration.component';

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
		path: '**',
		redirectTo: ''
	}
];
