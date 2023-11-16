import { FormGroup } from "@angular/forms";

export interface FormModel {
    formGroup: FormGroup
    data: FormData
}

export interface FormData {
    formControlName?: string,
    element: FormElement
    elementData?: FormElementData[] | FormElementData
    type?: FormElementType
}

export interface FormElementData {

}

export enum FormElement {
    INPUT = "input",
    SELECT = "select",
    DROPDOWN = "dropdown",
    BUTTON = "button"

}
export enum FormElementType {
    NUMBER = "number",
    PASSWORD = "password",
    TEXT = "text",

}