import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CurrentUserService } from '../../../auth/current-user.service';
import { Casa, CasasService } from '../casas/casas.service';
import { Area, AreasService } from '../areas/areas.service';
import { Persona, PersonaEditPayload, PersonaFilters, PersonasService } from './personas.service';

@Component({
  selector: 'app-personas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './personas.component.html'
})
export class PersonasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly personasService = inject(PersonasService);
  private readonly casasService = inject(CasasService);
  private readonly areasService = inject(AreasService);
  private readonly route = inject(ActivatedRoute);
  readonly currentUser = inject(CurrentUserService);

  @ViewChild(MatSort) private readonly sort?: MatSort;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly showFilters = signal(false);
  readonly casas = signal<Casa[]>([]);
  readonly areas = signal<Area[]>([]);
  readonly lideres = signal<Persona[]>([]);

  readonly expandedId = signal<number | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly creatingNew = signal(false);

  readonly displayedColumns = [
    'expand',
    'nombre',
    'whatsapp',
    'casaNombre',
    'liderNombre',
    'areaNombre',
    'estatus',
    'origen',
    'esLider',
    'esServidor'
  ];
  readonly dataSource = new MatTableDataSource<Persona>([]);

  // El default es INTERESADO: es el flujo publico que mas se necesita revisar hoy.
  // soloActivos arranca en true: deja fuera inactivos/baja/fallecido/descartado
  // a menos que se desmarque (vease PersonaController::index en el backend).
  readonly filtersForm = this.fb.group({
    busqueda: [''],
    nombre: [''],
    apellidoPaterno: [''],
    apellidoMaterno: [''],
    telefono: [''],
    whatsapp: [''],
    email: [''],
    comoSeEntero: [''],
    medioContactoPreferido: [''],
    estatus: [''],
    origen: ['INTERESADO'],
    liderId: [''],
    areaId: [''],
    conCasa: [''],
    conLider: [''],
    soloActivos: [true]
  });

  readonly editForm = this.fb.group({
    nombre: [''],
    apellidoPaterno: [''],
    apellidoMaterno: [''],
    telefono: [''],
    whatsapp: [''],
    email: [''],
    direccion: [''],
    barrio: [''],
    seccion: [''],
    numeroControl: [''],
    origen: ['INTERESADO'],
    estatus: [''],
    comoSeEntero: [''],
    medioContactoPreferido: [''],
    asisteReunionGeneral: [false],
    asisteCasa: [false],
    esLider: [false],
    esServidor: [false],
    observaciones: [''],
    casaId: [null as number | null],
    liderId: [null as number | null],
    areaId: [null as number | null]
  });

  ngOnInit(): void {
    this.casasService.list().subscribe(casas => this.casas.set(casas));
    this.areasService.list().subscribe(areas => this.areas.set(areas));
    this.personasService.listLideres().subscribe(lideres => this.lideres.set(lideres));

    // Los indicadores del dashboard enlazan aqui con query params (ej.
    // ?conLider=0) para reproducir exactamente el mismo subconjunto que
    // mostraba el indicador. Se suscribe (no solo snapshot) porque Angular
    // reutiliza esta instancia si ya estabamos en /dashboard/personas.
    this.route.queryParamMap.subscribe(params => {
      const conCasa = params.get('conCasa');
      const conLider = params.get('conLider');

      this.filtersForm.patchValue({
        origen: params.get('origen') ?? 'INTERESADO',
        estatus: params.get('estatus') ?? '',
        soloActivos: params.has('soloActivos') ? params.get('soloActivos') === 'true' : true,
        conCasa: conCasa ?? '',
        conLider: conLider ?? ''
      });

      if (conCasa !== null || conLider !== null || params.has('estatus')) {
        this.showFilters.set(true);
      }

      this.search();
    });
  }

  toggleFilters(): void {
    this.showFilters.update(value => !value);
  }

  search(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filters = this.filtersForm.getRawValue() as PersonaFilters;

    this.personasService.list(filters).subscribe({
      next: personas => {
        this.dataSource.data = personas;
        this.dataSource.sort = this.sort ?? null;
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar la lista de personas.');
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.filtersForm.reset({
      busqueda: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      telefono: '',
      whatsapp: '',
      email: '',
      comoSeEntero: '',
      medioContactoPreferido: '',
      estatus: '',
      origen: '',
      liderId: '',
      areaId: '',
      conCasa: '',
      conLider: '',
      soloActivos: true
    });
    this.search();
  }

  nombreCompleto(persona: Persona): string {
    return [persona.nombre, persona.apellidoPaterno, persona.apellidoMaterno]
      .filter(part => !!part)
      .join(' ');
  }

  // Candidatos a lider: solo personas marcadas como es_lider=1 (no ella misma).
  posiblesLideres(persona: Persona): Persona[] {
    return this.lideres().filter(candidato => candidato.id !== persona.id);
  }

  toggleExpand(persona: Persona): void {
    if (this.expandedId() === persona.id) {
      this.expandedId.set(null);
      this.editingId.set(null);
      return;
    }

    this.expandedId.set(persona.id);
    this.editingId.set(null);
  }

  startEdit(persona: Persona): void {
    this.editingId.set(persona.id);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.editForm.reset({
      nombre: persona.nombre,
      apellidoPaterno: persona.apellidoPaterno || '',
      apellidoMaterno: persona.apellidoMaterno || '',
      telefono: persona.telefono || '',
      whatsapp: persona.whatsapp || '',
      email: persona.email || '',
      direccion: persona.direccion || '',
      barrio: persona.barrio || '',
      seccion: persona.seccion || '',
      numeroControl: persona.numeroControl || '',
      origen: persona.origen,
      estatus: persona.estatus,
      comoSeEntero: persona.comoSeEntero || '',
      medioContactoPreferido: persona.medioContactoPreferido || '',
      asisteReunionGeneral: persona.asisteReunionGeneral,
      asisteCasa: persona.asisteCasa,
      esLider: persona.esLider,
      esServidor: persona.esServidor,
      observaciones: persona.observaciones || '',
      casaId: persona.casaId,
      liderId: persona.liderId,
      areaId: persona.areaId
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.creatingNew.set(false);
  }

  startCreate(): void {
    this.expandedId.set(null);
    this.editingId.set(null);
    this.creatingNew.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.editForm.reset({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      telefono: '',
      whatsapp: '',
      email: '',
      direccion: '',
      barrio: '',
      seccion: '',
      numeroControl: '',
      origen: 'INTERESADO',
      estatus: 'NUEVO',
      comoSeEntero: '',
      medioContactoPreferido: '',
      asisteReunionGeneral: false,
      asisteCasa: false,
      esLider: false,
      esServidor: false,
      observaciones: '',
      casaId: null,
      liderId: null,
      areaId: null
    });
  }

  saveEdit(persona: Persona): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.saving.set(true);

    const value = this.editForm.getRawValue();
    const payload: PersonaEditPayload = {
      nombre: value.nombre || '',
      apellidoPaterno: value.apellidoPaterno || '',
      apellidoMaterno: value.apellidoMaterno || '',
      telefono: value.telefono || '',
      whatsapp: value.whatsapp || '',
      email: value.email || '',
      direccion: value.direccion || '',
      barrio: value.barrio || '',
      seccion: value.seccion || '',
      numeroControl: value.numeroControl || '',
      origen: value.origen || '',
      estatus: value.estatus || '',
      comoSeEntero: value.comoSeEntero || '',
      medioContactoPreferido: value.medioContactoPreferido || '',
      asisteReunionGeneral: Boolean(value.asisteReunionGeneral),
      asisteCasa: Boolean(value.asisteCasa),
      esLider: Boolean(value.esLider),
      esServidor: Boolean(value.esServidor),
      observaciones: value.observaciones || '',
      casaId: value.casaId ? Number(value.casaId) : null,
      liderId: value.liderId ? Number(value.liderId) : null,
      areaId: value.areaId ? Number(value.areaId) : null
    };

    this.personasService.update(persona.id, payload).subscribe({
      next: updated => {
        this.dataSource.data = this.dataSource.data.map(row => (row.id === updated.id ? updated : row));
        this.personasService.listLideres().subscribe(lideres => this.lideres.set(lideres));
        this.successMessage.set('Persona actualizada correctamente.');
        this.editingId.set(null);
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const backendMessage = typeof err.error?.message === 'string' ? err.error.message : '';
        this.errorMessage.set(
          err.status === 403
            ? 'No tienes permisos para editar personas.'
            : backendMessage || 'No se pudo actualizar la persona.'
        );
        this.saving.set(false);
      }
    });
  }

  saveCreate(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const value = this.editForm.getRawValue();
    if (!value.nombre) {
      this.errorMessage.set('El nombre es obligatorio.');
      return;
    }

    this.saving.set(true);

    const payload: PersonaEditPayload = {
      nombre: value.nombre || '',
      apellidoPaterno: value.apellidoPaterno || '',
      apellidoMaterno: value.apellidoMaterno || '',
      telefono: value.telefono || '',
      whatsapp: value.whatsapp || '',
      email: value.email || '',
      direccion: value.direccion || '',
      barrio: value.barrio || '',
      seccion: value.seccion || '',
      numeroControl: value.numeroControl || '',
      origen: value.origen || '',
      estatus: value.estatus || '',
      comoSeEntero: value.comoSeEntero || '',
      medioContactoPreferido: value.medioContactoPreferido || '',
      asisteReunionGeneral: Boolean(value.asisteReunionGeneral),
      asisteCasa: Boolean(value.asisteCasa),
      esLider: Boolean(value.esLider),
      esServidor: Boolean(value.esServidor),
      observaciones: value.observaciones || '',
      casaId: value.casaId ? Number(value.casaId) : null,
      liderId: value.liderId ? Number(value.liderId) : null,
      areaId: value.areaId ? Number(value.areaId) : null
    };

    this.personasService.create(payload).subscribe({
      next: created => {
        this.dataSource.data = [created, ...this.dataSource.data];
        this.personasService.listLideres().subscribe(lideres => this.lideres.set(lideres));
        this.successMessage.set('Persona creada correctamente.');
        this.creatingNew.set(false);
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const backendMessage = typeof err.error?.message === 'string' ? err.error.message : '';
        this.errorMessage.set(
          err.status === 403
            ? 'No tienes permisos para crear personas.'
            : backendMessage || 'No se pudo crear la persona.'
        );
        this.saving.set(false);
      }
    });
  }
}

