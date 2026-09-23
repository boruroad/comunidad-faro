import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Persona, PersonaFilters, PersonasService } from './personas.service';

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

  @ViewChild(MatSort) private readonly sort?: MatSort;

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly displayedColumns = [
    'nombre',
    'whatsapp',
    'email',
    'comoSeEntero',
    'medioContactoPreferido',
    'estatus',
    'origen'
  ];
  readonly dataSource = new MatTableDataSource<Persona>([]);

  // El default es INTERESADO: es el flujo publico que mas se necesita consultar hoy.
  readonly filtersForm = this.fb.group({
    nombre: [''],
    apellidoPaterno: [''],
    apellidoMaterno: [''],
    telefono: [''],
    whatsapp: [''],
    email: [''],
    comoSeEntero: [''],
    medioContactoPreferido: [''],
    estatus: [''],
    origen: ['INTERESADO']
  });

  ngOnInit(): void {
    this.search();
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
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      telefono: '',
      whatsapp: '',
      email: '',
      comoSeEntero: '',
      medioContactoPreferido: '',
      estatus: '',
      origen: ''
    });
    this.search();
  }

  nombreCompleto(persona: Persona): string {
    return [persona.nombre, persona.apellidoPaterno, persona.apellidoMaterno]
      .filter(part => !!part)
      .join(' ');
  }
}

