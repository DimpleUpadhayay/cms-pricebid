import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { LoginService } from '../../../services/login.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService]
})

export class LoginComponent implements OnInit {

  @ViewChild(AlertComponent) alert: AlertComponent;

  flag = false;
  stepOne = true;



  constructor(public router: Router, public _LoginService: LoginService,
    public _formBuilder: FormBuilder, private _sharedService: SharedService) {
  }

  errorMsg: any = "";
  loginForm = this._formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  otpForm = this._formBuilder.group({
    otp: ['', Validators.required]
  });


  ngOnInit() {

  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }


  // show and hide on eye icon
  showPassword() {
    this.flag = !this.flag;
    if (this.flag)
      document.getElementById("pwd").setAttribute('type', 'text');
    else
      document.getElementById("pwd").setAttribute('type', 'password');
  }

  validateRegex(email) {
    if (!email) {
      email = this.loginForm.value['username'];
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(String(email).toLowerCase())) {
      this.errorMsg = "Please enter valid email"
      return false;
    }
    this.errorMsg = ''
    return true;
  }

  // Login with credentials
  user;
  currentTime;
  otpTime;
  formSubmitted = false;
  doLogin(data) {
    this.formSubmitted = true;
    // if (!this.validateRegex(data.value['username'])) {
    //   return
    // }
    this._LoginService.doLogin(data.value).subscribe((data: any) => {
      if (data.code === 2000 && data['data']['isSuccess']) {
        this.user = data['data']['results'];
        // this.otpTime = this.user['otp'] && this.user['otp']['time'] ? this.user['otp']['time'] : '';
        this.errorMsg = "";

        if (this.user) {
          // console.log(this.user, "user");

          // this.stepOne = false;
          // this.otpForm.value['otp'] = ''
          this.verifyOtp({})
          return
        }

      } else if (data.code === 2000 && !data['data']['isSuccess']) {
        this.errorMsg = data['data'].message;
      } else if (data.code === 3005) {
        this.errorMsg = "Ohh! It seems you are not connected with us yet";
        // this.alert.sweetError(this.errorMsg);
      } else if (data.code === 3012) {
        this.errorMsg = "Your Email is Not Verified , kindly verify your email";
        // this.alert.sweetError(this.errorMsg);
      } else if (data.code === 3006) {
        this.errorMsg = "Ohh! Invalid User.";
        // this.alert.sweetError(this.errorMsg);
      }

      setTimeout(() => {
        this.errorMsg = "";
      }, 4000);
    }, (err) => {
      this.errorMsg = "Invalid Credentials, Please try again"
      // this.alert.sweetError("Invalid Credentials, Please try again");
      setTimeout(() => {
        this.errorMsg = "";
      }, 4000);
    })
  }

  goBackToLogin() {
    this.stepOne = true;
    this.otpForm.value['otp'] = ''
  }

  time;
  verifyOtp(data) {
    // this.currentTime = new Date().toString();
    // if (this.otpTime && this.currentTime > this.otpTime) {
    //   this.errorMsg = "Your otp is expired, please resend otp";

    //   setTimeout(() => {
    //     this.errorMsg = "";
    //   }, 4000);
    //   return
    // }



    this.otpForm.value['username'] = this.user.username;
    this.otpForm.value['otp'] = "111111";

    this._LoginService.verifyOtp(this.otpForm.value).subscribe((data: any) => {

      if (data.code === 2000) {
        let user = data['data']['user'];
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data));
        this._sharedService.headerEvent.emit({ userData: user });

        if (this.user.user_role == 'SUPPORT') {
          this.router.navigate(['company', 'list']);
        } else if (this.user.user_role == 'COMPANY_ADMIN') {
          this.router.navigate(['viewCompany']);
        } else if (this.user && this.user.userTypes[0].user_type == 'EMD_PBG_VIEWER') {
          this.router.navigateByUrl('/analysis/pbg-historyData');
        } else {
          this.router.navigate(['dashboard']);
        }
      }
      else if (data.code === 3002) {
        // console.log(data);
        this.errorMsg = "Wrong otp or limit exceed, please contact you company admin to solve this issue";
        // this.alert.sweetError(this.errorMsg);

      } else if (data.code === 3005) {
        this.errorMsg = "Ohh! It seems you are not connected with us yet";
        // this.alert.sweetError(this.errorMsg);
      } else if (data.code === 3012) {
        this.errorMsg = "Your Email is Not Verified , kindly verify your email";
        // this.alert.sweetError(this.errorMsg);
      } else if (data.code === 3006) {
        this.errorMsg = "Ohh! Invalid User.";
        // this.alert.sweetError(this.errorMsg);
      }


      setTimeout(() => {
        this.errorMsg = "";
      }, 4000);
    })
  }

  resendOtp(data) {
    this._LoginService.resendOtp(data).subscribe((data: any) => {
      if (data.code === 2000 && data['data']['isSuccess']) {
        this.errorMsg = data['data']['message'];
        // this.alert.success(data['data']['message']);
        if (3 - (data['data']['otp']['attempts'] + 1) === 0) {
          this.errorMsg = 'Your Resend otp limit expires, Please contact company admin for new login';
        } else {
          this.otpTime = this.user['otp'] ? this.user['otp']['time'] : '';

          this.errorMsg = "You have only " + (3 - (data['data']['otp']['attempts'] + 1)) + " Attempts pending!";
        }
      } else if (data.code === 2000 && !data['data']['isSuccess']) {

        this.errorMsg = data['data'].message;
      } else {
        this.errorMsg = "Error while sending otp, please check you internet";
      }
      setTimeout(() => {
        this.errorMsg = "";
      }, 4000);
    })
  }

}
