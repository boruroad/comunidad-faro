import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CurrentUserService } from '../../../auth/current-user.service';
import { strongPasswordValidator } from '../../../auth/password.validators';
import { Comunidad, ComunidadesService } from '../comunidades/comunidades.service';
import { Persona, PersonasService } from '../personas/personas.service';
import { Rol, RolesService } from './roles.service';
import { Usuario, UsuarioCreatePayload, UsuariosService } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly rolesService = inject(RolesService);
  private readonly comunidadesService = inject(ComunidadesService);
  private readonly personasService = inject(PersonasService);
  readonly currentUser = inject(CurrentUserService);

  @ViewChild(MatSort) private readonly sort?: MatSort;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly updatingId = signal<number | null>(null);
  readonly selectedId = signal<number | null>(null);
  readonly creating = signal(false);
  readonly showPassword = signal(false);
  readonly roles = signal<Rol[]>([]);
  readonly comunidades = signal<Comunidad[]>([]);
  readonly personas = signal<Persona[]>([]);

  readonly displayedColumns = ['email', 'comunidadNombre', 'personaNombre', 'rolNombre', 'activo', 'ultimoAcceso', 'acciones'];
  readonly dataSource = new MatTableDataSource<Usuario>([]);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    rolId: [0, [Validators.required, Validators.min(1)]],
    comunidadId: [null as number | null],
    personaId: [null as number | null],
    activo: [true],
    password: ['', [strongPasswordValidator()]]
  });

  ngOnInit(): void {
    this.rolesService.list().subscribe(roles => this.roles.set(roles));
    this.comunidadesService.list().subscribe(comunidades => this.comunidades.set(comunidades));
    this.personasService.list({}).subscribe(personas => this.personas.set(personas));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.usuariosService.list().subscribe({
      next: usuarios => {
        this.dataSource.data = usuarios;
        this.dataSource.sort = this.sort ?? null;
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar la lista de usuarios.');
        this.loading.set(false);
      }
    });
  }

  toggleActivo(usuario: Usuario): void {
    this.updatingId.set(usuario.id);
    this.errorMessage.set('');

    const request = usuario.activo
      ? this.usuariosService.deactivate(usuario.id)
      : this.usuariosService.activate(usuario.id);

    request.subscribe({
      next: updated => {
        const rows = this.dataSource.data.map(row => (row.id === updated.id ? updated : row));
        this.dataSource.data = rows;
        this.updatingId.set(null);
      },
      error: () => {
        this.errorMessage.set('No pudimos actualizar el estado de ese usuario.');
        this.updatingId.set(null);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  edit(usuario: Usuario): void {
    this.selectedId.set(usuario.id);
    this.creating.set(false);
    this.form.reset({
      email: usuario.email,
      rolId: usuario.rolId,
      comunidadId: usuario.comunidadId,
      personaId: usuario.personaId,
      activo: usuario.activo,
      password: ''
    });
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  startCreate(): void {
    this.selectedId.set(null);
    this.creating.set(true);
    this.form.reset({ email: '', rolId: 0, comunidadId: null, personaId: null, activo: true, password: '' });
    this.showPassword.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  cancelEdit(): void {
    this.selectedId.set(null);
    this.creating.set(false);
    this.form.reset({ email: '', rolId: 0, comunidadId: null, personaId: null, activo: true, password: '' });
    this.showPassword.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  save(): void {
    if (this.creating()) {
      this.saveCreate();
      return;
    }

    const selectedId = this.selectedId();
    if (!selectedId) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const value = this.form.getRawValue();
    const payload: {
      email: string;
      rolId: number;
      comunidadId: number | null;
      personaId: number | null;
      activo: boolean;
      password?: string;
    } = {
      email: (value.email || '').trim().toLowerCase(),
      rolId: Number(value.rolId),
      comunidadId: value.comunidadId ? Number(value.comunidadId) : null,
      personaId: value.personaId ? Number(value.personaId) : null,
      activo: !!value.activo
    };

    if (value.password) {
      payload.password = value.password;
    }

    this.usuariosService.update(selectedId, payload).subscribe({
      next: updated => {
        const rows = this.dataSource.data.map(row => (row.id === updated.id ? updated : row));
        this.dataSource.data = rows;
        this.successMessage.set('Usuario actualizado correctamente.');
        this.cancelEdit();
        this.saving.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo actualizar el usuario. Verifica el correo y la contraseña.');
        this.saving.set(false);
      }
    });
  }

  private saveCreate(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const comunidadId = value.comunidadId ? Number(value.comunidadId) : 0;

    if (!value.password) {
      this.errorMessage.set('La contraseña es obligatoria para crear un usuario.');
      return;
    }

    if (comunidadId <= 0) {
      this.errorMessage.set('Selecciona una comunidad para el nuevo usuario.');
      return;
    }

    this.saving.set(true);

    const payload: UsuarioCreatePayload = {
      email: (value.email || '').trim().toLowerCase(),
      password: value.password,
      rolId: Number(value.rolId),
      comunidadId,
      personaId: value.personaId ? Number(value.personaId) : null
    };

    this.usuariosService.create(payload).subscribe({
      next: created => {
        this.dataSource.data = [created, ...this.dataSource.data];
        this.successMessage.set('Usuario creado correctamente.');
        this.cancelEdit();
        this.saving.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo crear el usuario. Verifica el correo, la comunidad y la contraseña.');
        this.saving.set(false);
      }
    });
  }

  nombreCompletoPersona(persona: Persona): string {
    return [persona.nombre, persona.apellidoPaterno, persona.apellidoMaterno]
      .filter(part => !!part)
      .join(' ');
  }
}

