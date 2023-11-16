import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MyFormBuilders } from 'src/app/form.builder';

@Component({
  selector: 'myim-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

 

  public isOtpSent: boolean = false

  public loginRegisterForm: FormGroup;

  public submitted: boolean = false;

  constructor(private formBuilder: FormBuilder, private router: Router, private ngZone: NgZone) {
    this.loginRegisterForm = MyFormBuilders.getLoginRegisterForm(this.formBuilder)
  }
  ngAfterViewInit(): void {

  }

  @Input() title: string = '';
  @Input() body: string = '';
  @Output() closeMeEvent = new EventEmitter();
  @Output() confirmEvent = new EventEmitter();
  ngOnInit(): void {
    this.loginRegisterForm = MyFormBuilders.getLoginRegisterForm(this.formBuilder)
  }

  close() {
    this.closeMeEvent.emit();
  }
  confirm() {
    this.confirmEvent.emit();
  }

  ngOnDestroy(): void {
    console.log(' Modal destroyed');
  }


  resendOtp() {
    console.log("resendOtp::clicked")
  }

  sendOtp() {
  }

  loginRegisterProcess() {
    console.log("getOtp::clicked")
    this.submitted = true;
    if (!this.f["mobileNumber"].errors) {
      this.isOtpSent = true
      this.submitted = false
      this.sendOtp()
    }
    else {
      console.log(this.loginRegisterForm.controls)
      console.log("getOtp::loginRegisterForm::mobileNumber::invalid")
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginRegisterForm.controls; }




}