import { Directive } from '@angular/core';
import { AsyncValidator, NG_ASYNC_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { debounceTime, map } from "rxjs/operators";

@Directive({
  selector: '[existingUserEmail]',
  standalone: true,
  providers: [
    // Tell Angular this is an async validator
    { provide: NG_ASYNC_VALIDATORS, useExisting: ExistingUserEmailValidator, multi: true },
  ],
})
export class ExistingUserEmailValidator implements AsyncValidator {

  constructor(private authService: AuthService) { }
  validate(control: AbstractControl): Observable<any> {
    return this.authService.checkIfEmailExistsInSystem(control.value).pipe(
      debounceTime(1000),
      map((email: string) => {
        return (email) ? { "emailExists": true } : null;
      })
    );
  }
}
