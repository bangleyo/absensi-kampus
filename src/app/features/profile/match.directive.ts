import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';
import {Directive, Input} from '@angular/core';

@Directive({
  selector: '[match]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchDirective, multi: true }]
})
export class MatchDirective implements Validator {
  @Input('match') matchValue: string = '';

  validate(control: AbstractControl): ValidationErrors | null {
    return control.value === this.matchValue ? null : { matching: true };
  }
}
