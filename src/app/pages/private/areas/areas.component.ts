import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Area, AreasService } from './areas.service';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './areas.component.html'
})
export class AreasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly areasService = inject(AreasService);

  @ViewChild(MatSort) private readonly sort?: MatSort;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly editingId = signal<number | null>(null);
  readonly creatingNew = signal(false);

  readonly displayedColumns = ['nombre', 'descripcion', 'acciones'];
  readonly dataSource = new MatTableDataSource<Area>([]);

  // Un solo FormGroup compartido para editar y crear: la fila de footer solo
  // existe en el DOM mientras creatingNew() es true (vease el template), asi
  // que nunca coexiste con una fila en edicion sobre el mismo FormGroup.
  readonly editForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(255)]]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.areasService.list().subscribe({
      next: areas => {
        this.dataSource.data = areas;
        this.dataSource.sort = this.sort ?? null;
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar la lista de areas.');
        this.loading.set(false);
      }
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.creatingNew.set(true);
    this.editForm.reset({ nombre: '', descripcion: '' });
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

    const payload = this.editForm.getRawValue() as { nombre: string; descripcion: string };

    this.areasService.create(payload).subscribe({
      next: () => {
        this.successMessage.set('Area creada correctamente.');
        this.creatingNew.set(false);
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo crear el area. Verifica que el nombre no este repetido.');
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      }
    });
  }

  startEdit(area: Area): void {
    this.creatingNew.set(false);
    this.editingId.set(area.id);
    this.editForm.reset({
      nombre: area.nombre,
      descripcion: area.descripcion || ''
    });
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(area: Area): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload = this.editForm.getRawValue() as { nombre: string; descripcion: string };

    this.areasService.update(area.id, payload).subscribe({
      next: () => {
        this.successMessage.set('Area actualizada correctamente.');
        this.editingId.set(null);
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo guardar el area. Verifica que el nombre no este repetido.');
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      }
    });
  }

  remove(area: Area): void {
    if (!confirm(`¿Eliminar el area "${area.nombre}"? Esta accion no se puede deshacer.`)) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.areasService.delete(area.id).subscribe({
      next: () => {
        this.successMessage.set('Area eliminada correctamente.');
        if (this.editingId() === area.id) {
          this.editingId.set(null);
        }
        this.load();
      },
      error: () => {
        this.errorMessage.set('No se pudo eliminar el area (puede tener personas asignadas).');
      }
    });
  }
}
