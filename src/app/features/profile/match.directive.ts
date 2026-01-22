import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[match]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchDirective, multi: true }]
})
export class MatchDirective implements Validator {
  @Input('match') matchValue: string = '';

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    return control.value === this.matchValue ? null : { matching: true };
  }
}
