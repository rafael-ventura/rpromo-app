import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { PeopleRepository } from './core/data/people-repository';
import { SheetsPeopleRepository } from './core/data/sheets-people-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),

    // The one line to change when swapping the storage backend
    // (e.g. Firebase/SQL): point this at a different PeopleRepository.
    { provide: PeopleRepository, useClass: SheetsPeopleRepository },
  ],
};
