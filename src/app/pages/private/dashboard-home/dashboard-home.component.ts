import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CurrentUserService } from '../../../auth/current-user.service';
import { CasasService } from '../casas/casas.service';
import { Persona, PersonasService } from '../personas/personas.service';

interface DashboardStats {
  miembros: number;
  interesados: number;
  casas: number;
  enCasas: number;
  sinCasa: number;
  conLider: number;
  sinLider: number;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit {
  readonly currentUser = inject(CurrentUserService);
  private readonly personasService = inject(PersonasService);
  private readonly casasService = inject(CasasService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    forkJoin({
      personas: this.personasService.listAll({ soloActivos: true }),
      casas: this.casasService.listAll()
    }).subscribe({
      next: ({ personas, casas }) => {
        // El backend ya filtra "solo activos" (excluye inactivo/baja/fallecido/
        // descartado); aqui no se vuelve a filtrar por estatus.
        const conCasa = personas.filter(persona => persona.casaId !== null);
        const conLider = personas.filter(persona => persona.liderId !== null);

        this.stats.set({
          miembros: personas.filter(persona => persona.origen === 'MIEMBRO').length,
          interesados: personas.filter(persona => persona.origen === 'INTERESADO').length,
          casas: casas.length,
          enCasas: conCasa.length,
          sinCasa: personas.length - conCasa.length,
          conLider: conLider.length,
          sinLider: personas.length - conLider.length
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar los indicadores del dashboard.');
        this.loading.set(false);
      }
    });
  }
}
