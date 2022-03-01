import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AlertComponent } from '../../libraries/alert/alert.component';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  errorMsg: any = "";

  constructor(public router: Router, vcr: ViewContainerRef,
    public _formBuilder: FormBuilder, public _LoginService: LoginService, ) {

  }

  forgotPasswordForm = this._formBuilder.group({
    value: ['', Validators.required]
  });

  ngOnInit() {
  }

  validateRegex(email) {
    if (!email) {
      email = this.forgotPasswordForm.value['value'];
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(String(email).toLowerCase())) {
      this.errorMsg = "Please enter valid email"
      return false;
    }
    this.errorMsg = ''
    return true;
  }

  // Forgot password (send email to user)
  forgotPassword(forgotpassword) {
    if (!this.validateRegex(forgotpassword.value['value'])) {
      return;
    }
    this.errorMsg = '';
    this._LoginService.forgotPassword(forgotpassword.value).subscribe((data: any) => {
      // console.log(data)
      this._alert.success("Email sent successfully");
      setTimeout(() => {
        this.router.navigate(["/login"]);
      }, 2000);
    }, (error) => {
      let errorMsg = (error.error.message) ? error.error.message : 'Something went wrong. Please try again';
      this._alert.error(errorMsg)
    });
  }

}
