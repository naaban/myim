import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ElementDefinition, FormElementData, FormElementType, FormInputType, FormModel } from 'src/app/models/form.model';

@Component({
  selector: 'myim-add-party',
  templateUrl: './add-party.component.html',
  styleUrls: ['./add-party.component.scss']
})
export class AddPartyComponent implements OnInit {
  
  createPartyForm!: FormModel;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {


    const basicDetails: ElementDefinition[] = [
      { formControlName: "partyName", elementType: FormElementType.INPUT, type: FormInputType.TEXT, label: "Party Name" },
      { formControlName: "mobileNumber", elementType: FormElementType.INPUT, type: FormInputType.TEXT, label: "Mobile Number" },
      { formControlName: "email", elementType: FormElementType.INPUT, type: FormInputType.TEXT, label: "Email" },
      { formControlName: "openingBalance", elementType: FormElementType.CUSTOM, template: this.openingBalanceTemplate, label: "Opening Balance" },
      { formControlName: "gstin", elementType: FormElementType.INPUT, type: FormInputType.TEXT, label: "GSTIN" },
      { formControlName: "getGstButton", elementType: FormElementType.BUTTON, action: this.getGstDetailsAction },
      { formControlName: "panNumber", elementType: FormElementType.INPUT, type: FormInputType.TEXT, label: "PAN Number" },
      { formControlName: "partyType", elementType: FormElementType.SELECT, elementData: this.getPartyTypes(), label: "Party Type" },
      { formControlName: "partyCategory", elementType: FormElementType.SELECT, elementData: this.getPartyCategories(), label: "Party Category" },
    ];

    const addressDetails: ElementDefinition[] = [
      { formControlName: "billingAddress", elementType: FormElementType.CUSTOM, template: this.addressTemplate, label: "Billing Address" },
      { formControlName: "shippingAddress", elementType: FormElementType.CUSTOM, template: this.addressTemplate, label: "Shipping Address" },
      { formControlName: "creditPeriod", elementType: FormElementType.INPUT, type: FormInputType.NUMBER, label: "Credit Period" },
      { formControlName: "creditLimit", elementType: FormElementType.INPUT, type: FormInputType.NUMBER, label: "Credit Limit" },
    ];


    const submit: ElementDefinition[] = [
      { formControlName: "submit", elementType: FormElementType.BUTTON, action: this.getGstDetailsAction },

      { formControlName: "reset", elementType: FormElementType.BUTTON, type: FormInputType.RESET, action: this.getGstDetailsAction },

    ];
    const builder = [...basicDetails, ...addressDetails].reduce<{ [key: string]: any }>((prev, current): any => {
      prev[current.formControlName!.toString()] = [
        '',
        Validators.required
      ]
      return prev;
    }, {})

    this.createPartyForm = {
      formGroup: this.fb.group(builder),
      elements: [...basicDetails, ...addressDetails],
      elementsPerRow: 3
    };
  }

  getPartyTypes(): FormElementData[] {
    // Sample data, replace with your actual data
    return [
      { id: "1", value: "Type A" },
      { id: "2", value: "Type B" },
      { id: "3", value: "Type C" },
    ];
  }

  getPartyCategories(): FormElementData[] {
    // Sample data, replace with your actual data
    return [
      { id: "1", value: "Category X" },
      { id: "2", value: "Category Y" },
      { id: "3", value: "Category Z" },
    ];
  }

  // Template for openingBalance field
  openingBalanceTemplate(): any {
    // Replace with your actual template logic
    return null;
  }

  // Template for getGstButton field
  getGstButtonTemplate(): any {
    // Replace with your actual template logic
    return null;
  }

  // Template for address field
  addressTemplate(): any {
    // Replace with your actual template logic
    return null;
  }

  getGstDetailsAction(d: any) {
    console.log(d)
  }

}
