import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Debe reflejar exactamente la regla de AuthController::isStrongPassword en el backend.
const STRONG_PASSWORD_PATTERN = /^(?=\S+$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) {
      return null;
    }

    return STRONG_PASSWORD_PATTERN.test(value) ? null : { weakPassword: true };
  };
}

export function passwordsMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;

    if (!confirm) {
      return null;
    }

    return password === confirm ? null : { passwordsMismatch: true };
  };
}
