// form.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ElementDefinition, FormElementData, FormModel } from 'src/app/models/form.model';

@Component({
  selector: 'myim-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Input()
  form!: FormModel;


  constructor(private fb: FormBuilder) {
    if (!this.form) {
      this.form = {
        formGroup: fb.group({}),
        elements: [],
        elementsPerRow: 3, // by default 3
      }
    }
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {

  }

  isInvalid(formControlName: string | null): boolean {
    if (formControlName) {
      const control = this.form.formGroup.get(formControlName);
      return control ? control.invalid && (control.touched || control.dirty) : false;
    }
    return false;
  }

  getValidationMessage(element: ElementDefinition): string {
    if (element.formControlName) {
      const control = this.form.formGroup.get(element.formControlName);
      if (control) {
        const errors: any = control.errors;
        if (errors) {
          if (errors.required) {
            return `${element.label} is required`;
          }
          // Add more error messages as needed
        }
      }
    }
    return '';
  }
 
}
