import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CurrentUserService } from '../../../auth/current-user.service';
import { Usuario, UsuariosService } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  readonly currentUser = inject(CurrentUserService);

  @ViewChild(MatSort) private readonly sort?: MatSort;

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly updatingId = signal<number | null>(null);

  readonly displayedColumns = ['email', 'rolNombre', 'activo', 'ultimoAcceso', 'acciones'];
  readonly dataSource = new MatTableDataSource<Usuario>([]);

  ngOnInit(): void {
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
}
