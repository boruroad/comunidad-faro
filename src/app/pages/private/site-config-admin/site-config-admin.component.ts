import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SiteConfigAdminService, SiteConfigVersion } from './site-config-admin.service';
import { FARO_CONFIG } from '../../../faro-config';
import { CONFIG_SCHEMA } from './config-schema';
import { DynamicConfigEditorComponent } from './dynamic-config-editor/dynamic-config-editor.component';

@Component({
  selector: 'app-site-config-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    DynamicConfigEditorComponent
  ],
  templateUrl: './site-config-admin.component.html'
})
export class SiteConfigAdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(SiteConfigAdminService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly versions = signal<SiteConfigVersion[]>([]);
  readonly selectedId = signal<number | null>(null);

  // Estado estructurado de la configuracion (reemplaza al textarea con JSON crudo).
  readonly configSchema = CONFIG_SCHEMA;
  readonly configValue = signal<Record<string, unknown>>(
    FARO_CONFIG as unknown as Record<string, unknown>
  );

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(180)]],
    descripcion: ['', [Validators.maxLength(255)]],
    activateOnSave: [false]
  });

  // El adminGuard de la ruta ya garantiza el rol; aqui solo cargamos datos.
  ngOnInit(): void {
    this.loadVersions();
  }

  onConfigChange(nextValue: Record<string, unknown>): void {
    this.configValue.set(nextValue);
  }

  createFromCurrentEditor(): void {
    this.selectedId.set(null);
    this.form.patchValue({
      nombre: '',
      descripcion: '',
      activateOnSave: false
    });

    this.successMessage.set('');
    this.errorMessage.set('');
  }

  edit(version: SiteConfigVersion): void {
    this.selectedId.set(version.id);
    this.configValue.set(version.config);
    this.form.patchValue({
      nombre: version.nombre,
      descripcion: version.descripcion,
      activateOnSave: version.activo
    });

    this.successMessage.set('');
    this.errorMessage.set('');
  }

  activate(versionId: number): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminService.activate(versionId).subscribe({
      next: () => {
        this.successMessage.set('Configuracion activada correctamente.');
        this.loadVersions();
      },
      error: () => {
        this.errorMessage.set('No se pudo activar la configuracion.');
      }
    });
  }

  deactivate(versionId: number): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminService.deactivate(versionId).subscribe({
      next: () => {
        this.successMessage.set('Configuracion desactivada correctamente.');
        this.loadVersions();
      },
      error: () => {
        this.errorMessage.set('No se pudo desactivar la configuracion.');
      }
    });
  }

  save(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nombre = (this.form.value.nombre || '').trim();
    const descripcion = (this.form.value.descripcion || '').trim();
    const activateOnSave = Boolean(this.form.value.activateOnSave);
    const config = this.configValue();

    this.saving.set(true);

    const selectedId = this.selectedId();

    if (selectedId) {
      this.adminService
        .update(selectedId, {
          nombre,
          descripcion,
          config
        })
        .subscribe({
          next: () => {
            if (activateOnSave) {
              this.activate(selectedId);
            } else {
              this.successMessage.set('Configuracion actualizada correctamente.');
              this.loadVersions();
            }
          },
          error: () => {
            this.errorMessage.set('No se pudo actualizar la configuracion.');
            this.saving.set(false);
          },
          complete: () => {
            this.saving.set(false);
          }
        });

      return;
    }

    this.adminService
      .create({
        nombre,
        descripcion,
        config,
        activate: activateOnSave
      })
      .subscribe({
        next: created => {
          this.selectedId.set(created.id);
          this.successMessage.set('Nueva version guardada correctamente.');
          this.loadVersions();
        },
        error: () => {
          this.errorMessage.set('No se pudo guardar la configuracion.');
          this.saving.set(false);
        },
        complete: () => {
          this.saving.set(false);
        }
      });
  }

  trackByVersionId(_: number, item: SiteConfigVersion): number {
    return item.id;
  }

  private loadVersions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.adminService.list().subscribe({
      next: items => {
        this.versions.set(items);

        const active = items.find(item => item.activo) || null;

        if (!this.selectedId()) {
          const seedConfig = active?.config ?? (FARO_CONFIG as unknown as Record<string, unknown>);
          this.configValue.set(seedConfig);
          this.form.patchValue({
            nombre: active?.nombre ?? 'Configuracion inicial',
            descripcion: active?.descripcion ?? '',
            activateOnSave: true
          });

          if (active) {
            this.selectedId.set(active.id);
          }
        }

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el historial de configuraciones.');
        this.loading.set(false);
      }
    });
  }
}
