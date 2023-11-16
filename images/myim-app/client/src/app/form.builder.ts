import { FormBuilder, Validators } from "@angular/forms";
import { MyFormValidators } from "./form.validator";

export class MyFormBuilders {
    static getLoginRegisterForm(formBuilder: FormBuilder) {
        return formBuilder.group({
            mobileNumber: ['', Validators.compose([Validators.required, Validators.maxLength(10), Validators.minLength(10)])],
            otp: ['', Validators.compose([Validators.required, MyFormValidators.otpValidator, Validators.minLength(6), Validators.maxLength(6)])]
        })
    }
}