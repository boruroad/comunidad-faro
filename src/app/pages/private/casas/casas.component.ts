import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Comunidad, ComunidadesService } from '../comunidades/comunidades.service';
import { Casa, CasasService } from './casas.service';

@Component({
  selector: 'app-casas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './casas.component.html'
})
export class CasasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly casasService = inject(CasasService);
  private readonly comunidadesService = inject(ComunidadesService);

  @ViewChild(MatSort) private readonly sort?: MatSort;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly editingId = signal<number | null>(null);
  readonly creatingNew = signal(false);
  readonly comunidades = signal<Comunidad[]>([]);

  readonly displayedColumns = ['nombre', 'comunidad', 'direccion', 'coordenadas', 'acciones'];
  readonly dataSource = new MatTableDataSource<Casa>([]);

  // FormGroup compartido para editar y crear: la fila de footer solo existe
  // en el DOM mientras creatingNew() es true (vease el template), asi que
  // nunca coexiste con una fila en edicion sobre el mismo FormGroup.
  readonly editForm = this.fb.group({
    comunidadId: [0, [Validators.required, Validators.min(1)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    direccion: ['', [Validators.required, Validators.maxLength(255)]],
    latitud: [null as number | null],
    longitud: [null as number | null]
  });

  ngOnInit(): void {
    this.comunidadesService.list().subscribe(comunidades => this.comunidades.set(comunidades));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.casasService.list().subscribe({
      next: casas => {
        this.dataSource.data = casas;
        this.dataSource.sort = this.sort ?? null;
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar la lista de casas.');
        this.loading.set(false);
      }
    });
  }

  comunidadNombre(comunidadId: number): string {
    return this.comunidades().find(c => c.id === comunidadId)?.nombre || '—';
  }

  startCreate(): void {
    this.editingId.set(null);
    this.creatingNew.set(true);
    this.editForm.reset({ comunidadId: 0, nombre: '', direccion: '', latitud: null, longitud: null });
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  cancelCreate(): void {
    this.creatingNew.set(false);
  }

  saveCreate(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.casasService.create(this.buildPayload()).subscribe({
      next: () => {
        this.successMessage.set('Casa creada correctamente.');
        this.creatingNew.set(false);
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo crear la casa.');
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      }
    });
  }

  startEdit(casa: Casa): void {
    this.creatingNew.set(false);
    this.editingId.set(casa.id);
    this.editForm.reset({
      comunidadId: casa.comunidadId,
      nombre: casa.nombre,
      direccion: casa.direccion,
      latitud: casa.latitud,
      longitud: casa.longitud
    });
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(casa: Casa): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.casasService.update(casa.id, this.buildPayload()).subscribe({
      next: () => {
        this.successMessage.set('Casa actualizada correctamente.');
        this.editingId.set(null);
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo guardar la casa.');
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      }
    });
  }

  private buildPayload() {
    const value = this.editForm.getRawValue();

    return {
      comunidadId: Number(value.comunidadId),
      nombre: value.nombre || '',
      direccion: value.direccion || '',
      latitud: value.latitud !== null && value.latitud !== undefined ? Number(value.latitud) : null,
      longitud: value.longitud !== null && value.longitud !== undefined ? Number(value.longitud) : null
    };
  }

  remove(casa: Casa): void {
    if (!confirm(`¿Eliminar la casa "${casa.nombre}"? Esta accion no se puede deshacer.`)) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.casasService.delete(casa.id).subscribe({
      next: () => {
        this.successMessage.set('Casa eliminada correctamente.');
        if (this.editingId() === casa.id) {
          this.editingId.set(null);
        }
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo eliminar la casa (puede tener personas asignadas).');
      }
    });
  }
}
