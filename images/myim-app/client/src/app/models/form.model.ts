import { FormGroup } from "@angular/forms";

export interface FormModel {
    formGroup: FormGroup
    elementsPerRow: number
    elements: ElementDefinition[]
}

export interface ElementDefinition {
    formControlName: string | ''
    elementType?: FormElementType
    elementData?: FormElementData[] | FormElementData | any
    type?: FormInputType
    action?: Function
    template?: any,
    label?: string
}

export interface FormElementData {
    id?: string,
    value: string
}

export enum FormElementType {
    INPUT = "input",
    SELECT = "select",
    DROPDOWN = "dropdown",
    BUTTON = "button",
    CUSTOM = "custom"

}
export enum FormInputType {
    NUMBER = "number",
    RESET= "reset",
    PASSWORD = "password",
    TEXT = "text",
}