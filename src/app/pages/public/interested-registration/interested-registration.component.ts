import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { InterestedRegistrationService } from './interested-registration.service';

@Component({
  selector: 'app-interested-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './interested-registration.component.html'
})
export class InterestedRegistrationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly registrationService = inject(InterestedRegistrationService);

  @ViewChild('successDialog') private readonly successDialog?: ElementRef<HTMLDialogElement>;

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly attemptedSubmit = signal(false);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.maxLength(150)]],
    whatsapp: ['', [Validators.required, Validators.pattern(/^[0-9+()\s-]{7,30}$/)]],
    email: ['', [Validators.email]],
    comoSeEntero: ['', [Validators.required, Validators.maxLength(150)]],
    medioContactoPreferido: ['WHATSAPP', [Validators.required]],
    comentario: ['', [Validators.maxLength(2000)]],
    aceptoPrivacidad: [false, [Validators.requiredTrue]]
  });

  submit(): void {
    this.errorMessage.set('');
    this.attemptedSubmit.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const value = this.form.getRawValue();

    this.registrationService
      .register({
        nombre: (value.nombre || '').trim(),
        apellidos: (value.apellidos || '').trim(),
        whatsapp: (value.whatsapp || '').trim(),
        email: (value.email || '').trim(),
        comoSeEntero: (value.comoSeEntero || '').trim(),
        medioContactoPreferido: value.medioContactoPreferido as 'WHATSAPP' | 'LLAMADA' | 'EMAIL',
        comentario: (value.comentario || '').trim(),
        aceptoPrivacidad: !!value.aceptoPrivacidad
      })
      .subscribe({
        next: () => {
          this.form.reset({
            nombre: '',
            apellidos: '',
            whatsapp: '',
            email: '',
            comoSeEntero: '',
            medioContactoPreferido: 'WHATSAPP',
            comentario: '',
            aceptoPrivacidad: false
          });
          this.loading.set(false);
          this.attemptedSubmit.set(false);
          this.successDialog?.nativeElement.showModal();
        },
        error: (err: HttpErrorResponse) => {
          const backendMessage = typeof err.error?.message === 'string' ? err.error.message : '';
          this.errorMessage.set(
            backendMessage || 'No pudimos registrar tu informacion. Intenta de nuevo en unos minutos.'
          );
          this.loading.set(false);
        }
      });
  }

  fieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }

    return control.invalid && (control.touched || this.attemptedSubmit());
  }

  acceptSuccessModal(): void {
    this.successDialog?.nativeElement.close();
    this.router.navigateByUrl('/');
  }
}
