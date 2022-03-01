import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';


@Component({
  selector: 'app-login',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  providers: [LoginService]
})
export class SignUpComponent implements OnInit {

  constructor(public router: Router, public _LoginService: LoginService,
    public _formBuilder: FormBuilder) {
  }
  errorMsg: any = "";
  signupForm = this._formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    agree: ['', Validators.required],
    user_type: ['PUBLISHER', Validators.required],
    email: ['', Validators.required],

  }, {
      validator: this.passwordMatchValidator
    }
  );
  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null : g.get('confirmPassword').setErrors({ 'mismatch': true });
  }
  categories: any = ["PUBLISHER"];
  ngOnInit() {

  }

  doSignUp(data) {
    // this.msg.success("Invalid Username or Password");
    this._LoginService.doSignUp(data.value).subscribe((data: any) => {
      if (data.code === 2000) {
        this.router.navigate(["/login"]);
      } else if (data.code === 3008) {
        this.errorMsg = data.msg;
      } else if (data.code === 3006) {
        this.errorMsg = "Ohh! Invalid User.";
      }

      setTimeout(() => {
        this.errorMsg = "";
      }, 4000);
    }, (err) => {
    })
    //this.router.navigate(['dashboard']);
  }

}