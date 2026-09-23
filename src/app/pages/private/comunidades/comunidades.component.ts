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
  readonly selectedId = signal<number | null>(null);

  readonly displayedColumns = ['nombre', 'lugar', 'direccion', 'acciones'];
  readonly dataSource = new MatTableDataSource<Comunidad>([]);

  readonly form = this.fb.group({
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

  edit(comunidad: Comunidad): void {
    this.selectedId.set(comunidad.id);
    this.form.patchValue({
      nombre: comunidad.nombre,
      lugar: comunidad.lugar,
      direccion: comunidad.direccion
    });
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  cancelEdit(): void {
    this.selectedId.set(null);
    this.form.reset({ nombre: '', lugar: '', direccion: '' });
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  save(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload = this.form.getRawValue() as { nombre: string; lugar: string; direccion: string };
    const selectedId = this.selectedId();

    const request = selectedId
      ? this.comunidadesService.update(selectedId, payload)
      : this.comunidadesService.create(payload);

    request.subscribe({
      next: () => {
        this.successMessage.set(
          selectedId ? 'Comunidad actualizada correctamente.' : 'Comunidad creada correctamente.'
        );
        this.cancelEdit();
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
        if (this.selectedId() === comunidad.id) {
          this.cancelEdit();
        }
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo eliminar la comunidad (puede tener personas o usuarios asociados).');
      }
    });
  }
}
