import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Comunidad, ComunidadesService } from './comunidades.service';

@Component({
  selector: 'app-comunidades',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './comunidades.component.html'
})
export class ComunidadesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly comunidadesService = inject(ComunidadesService);

  @ViewChild(MatSort) private readonly sort?: MatSort;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly editingId = signal<number | null>(null);
  readonly creatingNew = signal(false);

  readonly displayedColumns = ['nombre', 'lugar', 'direccion', 'acciones'];
  readonly dataSource = new MatTableDataSource<Comunidad>([]);

  // FormGroup compartido para editar y crear: la fila de footer solo existe
  // en el DOM mientras creatingNew() es true (vease el template), asi que
  // nunca coexiste con una fila en edicion sobre el mismo FormGroup.
  readonly editForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    lugar: ['', [Validators.required, Validators.maxLength(150)]],
    direccion: ['', [Validators.required, Validators.maxLength(255)]]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.comunidadesService.list().subscribe({
      next: comunidades => {
        this.dataSource.data = comunidades;
        this.dataSource.sort = this.sort ?? null;
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar la lista de comunidades.');
        this.loading.set(false);
      }
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.creatingNew.set(true);
    this.editForm.reset({ nombre: '', lugar: '', direccion: '' });
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

    const payload = this.editForm.getRawValue() as { nombre: string; lugar: string; direccion: string };

    this.comunidadesService.create(payload).subscribe({
      next: () => {
        this.successMessage.set('Comunidad creada correctamente.');
        this.creatingNew.set(false);
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo crear la comunidad. Verifica que nombre + lugar no esten repetidos.');
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      }
    });
  }

  startEdit(comunidad: Comunidad): void {
    this.creatingNew.set(false);
    this.editingId.set(comunidad.id);
    this.editForm.reset({
      nombre: comunidad.nombre,
      lugar: comunidad.lugar,
      direccion: comunidad.direccion
    });
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(comunidad: Comunidad): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload = this.editForm.getRawValue() as { nombre: string; lugar: string; direccion: string };

    this.comunidadesService.update(comunidad.id, payload).subscribe({
      next: () => {
        this.successMessage.set('Comunidad actualizada correctamente.');
        this.editingId.set(null);
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo guardar la comunidad. Verifica que nombre + lugar no esten repetidos.');
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      }
    });
  }

  remove(comunidad: Comunidad): void {
    if (!confirm(`¿Eliminar la comunidad "${comunidad.nombre}"? Esta accion no se puede deshacer.`)) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.comunidadesService.delete(comunidad.id).subscribe({
      next: () => {
        this.successMessage.set('Comunidad eliminada correctamente.');
        if (this.editingId() === comunidad.id) {
          this.editingId.set(null);
        }
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo eliminar la comunidad (puede tener personas o usuarios asociados).');
      }
    });
  }
}
