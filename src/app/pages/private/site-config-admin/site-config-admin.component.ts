import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { SessionService } from '../../../auth/session.service';
import { SiteHeaderComponent } from '../../../components/site-header.component';
import { SiteConfigAdminService, SiteConfigVersion } from './site-config-admin.service';
import { FARO_CONFIG } from '../../../faro-config';

@Component({
  selector: 'app-site-config-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SiteHeaderComponent
  ],
  templateUrl: './site-config-admin.component.html'
})
export class SiteConfigAdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly adminService = inject(SiteConfigAdminService);

  readonly facebookUrl =
    FARO_CONFIG.meeting.facebookUrl ||
    FARO_CONFIG.socials['facebook'];

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly roleName = signal('');
  readonly versions = signal<SiteConfigVersion[]>([]);
  readonly selectedId = signal<number | null>(null);

  menuOpen = false;
  headerScrolled = true;

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(180)]],
    descripcion: ['', [Validators.maxLength(255)]],
    configJson: ['{}', [Validators.required]],
    activateOnSave: [false]
  });

  ngOnInit(): void {
    const token = this.session.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.session.validate(token).subscribe({
      next: payload => {
        const role = payload.role || {};
        const roleRaw = typeof role['nombre'] === 'string' ? role['nombre'] : '';
        const roleName = roleRaw.toUpperCase();
        this.roleName.set(roleName);

        if (roleName !== 'SUPERADMIN' && roleName !== 'ADMIN_COMUNIDAD') {
          this.errorMessage.set('No tienes permisos para administrar configuraciones.');
          this.loading.set(false);
          return;
        }

        this.loadVersions();
      },
      error: () => {
        this.session.clearToken();
        this.router.navigate(['/login']);
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
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
    this.form.patchValue({
      nombre: version.nombre,
      descripcion: version.descripcion,
      configJson: JSON.stringify(version.config, null, 2),
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

    const parsed = this.parseConfigJson(this.form.value.configJson || '');
    if (!parsed) {
      this.errorMessage.set('El campo JSON no es valido. Debe ser un objeto JSON.');
      return;
    }

    const nombre = (this.form.value.nombre || '').trim();
    const descripcion = (this.form.value.descripcion || '').trim();
    const activateOnSave = Boolean(this.form.value.activateOnSave);

    this.saving.set(true);

    const selectedId = this.selectedId();

    if (selectedId) {
      this.adminService
        .update(selectedId, {
          nombre,
          descripcion,
          config: parsed
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
        config: parsed,
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
          const seedConfig = active?.config ?? FARO_CONFIG;
          this.form.patchValue({
            nombre: active?.nombre ?? 'Configuracion inicial',
            descripcion: active?.descripcion ?? '',
            configJson: JSON.stringify(seedConfig, null, 2),
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

  private parseConfigJson(text: string): Record<string, unknown> | null {
    try {
      const decoded: unknown = JSON.parse(text);

      if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) {
        return null;
      }

      return decoded as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
