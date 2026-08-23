import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { PeopleRepository } from './core/data/people-repository';
import { ApiPeopleRepository } from './core/data/api-people-repository';
import { authInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),

    // The one line to change when swapping the storage backend:
    // point this at a different PeopleRepository.
    { provide: PeopleRepository, useClass: ApiPeopleRepository },
  ],
};
