import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { AlertComponent } from '../../libraries/alert/alert.component';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  errorMsg: any = "";

  constructor(public activatedRoute: ActivatedRoute, public router: Router, public _LoginService: LoginService,
    public _formBuilder: FormBuilder) {
  }

  resetPasswordForm = this._formBuilder.group({
    Password: ['', Validators.required],
    ConfirmPassword: ['', Validators.required]
  }, {
      validator: this.passwordMatchValidator
    });

  ngOnInit() {
  }

  // password and confirm password validation
  passwordMatchValidator(g: FormGroup) {
    return g.get('Password').value === g.get('ConfirmPassword').value
      ? null : g.get('ConfirmPassword').setErrors({ 'mismatch': true });
  }

  // reset password
  resetPassword(resetPasswordForm) {
    this.activatedRoute.params.subscribe(params => {
      this._LoginService.resetPassword({ token: params.id, password: resetPasswordForm.value.Password }).subscribe((data) => {
        this._alert.success("Password has been changed successfully")
        setTimeout(() => {
          this.router.navigate(["/login"]);
        }, 2000);
      }, (error) => {
        this._alert.error(error.error.message);
        this.errorMsg = (error.error.message) ? error.error.message : 'Something went wrong.Please try again';
        setTimeout(() => {
          this.errorMsg = "";
        }, 4000);
      });
    });
  }
}