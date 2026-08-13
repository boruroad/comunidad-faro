import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import {
  provideHttpClient,
  withJsonpSupport
} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    // Permite consultar FARO Web API desde el navegador mediante JSONP.
    provideHttpClient(
      withJsonpSupport()
    ),

    provideRouter(routes)
  ]
};
