import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class MyFormValidators {
   static otpValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value

            const mobileNumber = control.get("mobileNumber")?.value

            if (mobileNumber && !value) {
                return {
                    otpRequired: true
                }
            }
            const otpValid = value.length > 0 && value.length < 7

            return otpValid ? null : { otpInvalid: true }

        }
    }
}