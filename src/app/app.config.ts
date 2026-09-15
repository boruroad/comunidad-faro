import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import {
  provideHttpClient,
  withJsonpSupport
} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { RuntimeConfigService } from './config/runtime-config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    // Permite consultar FARO Web API desde el navegador mediante JSONP.
    provideHttpClient(
      withJsonpSupport()
    ),

    provideRouter(routes),
    provideAppInitializer(() =>
      inject(RuntimeConfigService)
        .loadConfig()
    )
  ]
};
