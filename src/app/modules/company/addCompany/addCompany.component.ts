import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as validatorCtrl from '../../../libraries/validation';
import { CompanyService } from '../../../services/company.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { Company } from '../../../models/company.model';


@Component({
  selector: 'app-addCompany',
  templateUrl: './addCompany.component.html',
  styleUrls: ['./addCompany.component.css'],
  providers: [CompanyService]

})
export class addCompanyComponent implements OnInit {
  public companyForm: any;
  public company;
  public user;
  formSubmitted: boolean = false;
  public companies = [];
  company_id;
  show: boolean = false;
  formEmpty = false;
  loader = false;
  @ViewChild(AlertComponent) _alert: AlertComponent;

  constructor(public _addCompanyService: CompanyService,  public router: Router,
    public _formBuilder: FormBuilder, public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.company = new Company();

    this.company_id = this._route.snapshot.params['id'];
    if (this.company_id)
      this.getCompanyById();

    this.companyForm = _formBuilder.group({
      company_name: ["", Validators.compose([Validators.required])],
      company_address: ["", Validators.compose([Validators.required])],
      company_phone: ["", Validators.compose([Validators.required])],
      company_website: ["", Validators.compose([Validators.required])],
      no_of_registered_users: ["", Validators.compose([Validators.required])],
      contact_name_primary: ["", Validators.compose([Validators.required])],
      contact_email_primary: ["", Validators.compose([Validators.required])],
      contact_phone_primary: ["", Validators.compose([Validators.required])],
      product_type: ["", Validators.compose([Validators.required])],
      contact_phone_secondary: [""],
      contact_name_secondary: [""],
      contact_email_secondary: [""],
      status: "ACTIVE",
    });
  }

  ngOnInit() {
    this.loader = true
    this.defaultValid();

  }

  resetCompany() {
    this.company = new Company();
    this.formSubmitted = false;
    this.validate();
  }

  createCompany() {
    this.formSubmitted = true;
    if (!this.validate()) {
      this._alert.sweetError("Please enter mandatory fields");
      return
    }
    if (!this.validateRegexAll()) {
      return;
    }
    this.loader = true
    this.companyForm.value['company_id'] = this.user.addCompany_id;
    this.companyForm.value['user_id'] = this.user.user_id;
    this._addCompanyService.createCompany(this.companyForm.value).subscribe((data: any) => {
      if (data.code === 2000) {
        this.loader = false
        this._alert.sweetSuccess("Company created successfully");
        setTimeout(() => {
          this.loader = false
          this.router.navigate(['company', 'list'])
        }, 2000);
        //this.errorMsg = "";
        //this.users = data;
        // Calling the DT trigger to manually render the table
        //this.dtTrigger.next();
      } else if (data.code === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (data.code === 401) {
        //this.users = [];
      } else if (data.code === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (data.code === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
      setTimeout(() => {
        //this.errorMsg = "";
        this.loader = false
      }, 500);
    }, (err) => {
      this.loader = false
      this._alert.sweetError(err.error.msg);
    })
  }

  updateCompany() {
    this.formSubmitted = true;
    if (!this.validate()) {
      this._alert.sweetError("Please enter mandatory fields");
      return
    }
    if (!this.validateRegexAll()) {
      return
    }
    this.companyForm.value['company_id'] = this.company_id;
    this.companyForm.value['user_id'] = this.user.user_id;
    this.loader = true
    this._addCompanyService.updateCompany(this.companyForm.value).subscribe((data: any) => {
      if (data.code === 2000) {
        this.loader = false
        this._alert.sweetSuccess("Company updated successfully");
        setTimeout(() => {
          this.loader = false
          this.router.navigate(['company', 'list'])
        }, 2000);
        //this.errorMsg = "";
        //this.users = data;
        // Calling the DT trigger to manually render the table
        //this.dtTrigger.next();
      } else if (data.code === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (data.code === 401) {
        //this.users = [];
      } else if (data.code === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (data.code === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
      setTimeout(() => {
        //this.errorMsg = "";
        this.loader = false
      }, 500);
    }, (err) => {
      this.loader = false
    })
  }

  getCompanyById() {
    this.loader = true
    this._addCompanyService.getCompanyById(this.company_id).subscribe(data => {
      this.company = data['data']['company'];
      this.loader = false
      this.defaultValid();
    }, error => {
      this.loader = false
    })
  }

  validate() {
    let validate = true;
    for (var element in this.company) {
      if (element && this.company[element] == '' && element != 'participants') {
        validate = false;
      }
      if(this.company.no_of_registered_users == undefined || this.company.no_of_registered_users == null){
        validate = false;
      }
    }
    return validate;
  }

  validateSingle(element) {
    let validate = true;
    if (element && this.company[element] == '' && element != 'participants') {
      // validate = false;
    }
    return validate
  }

  validateRegex(element) {
    let validate = true;
    this.company[element + 'RegexValid'] = true;

    switch (element) {
      case 'contact_email_primary': {
        if (this.company[element] && !validatorCtrl.validateEmail(this.company[element])) {
          this.company[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'contact_email_secondary': {
        if (this.company[element] && !validatorCtrl.validateEmail(this.company[element])) {
          this.company[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'company_phone': {
        if (this.company[element] && !validatorCtrl.validatePhone(this.company[element])) {
          this.company[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'company_website': {
        if (this.company[element] && !validatorCtrl.validateWebsite(this.company[element])) {
          this.company[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'contact_phone_primary': {
        if (this.company[element] && !validatorCtrl.validatePhone(this.company[element])) {
          this.company[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'contact_phone_secondary': {
        if (this.company[element] && !validatorCtrl.validatePhone(this.company[element])) {
          this.company[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      default: {
        break;
      }
    }
    return validate;
  }

  validateRegexAll() {
    let validate = true;
    for (var element in this.company) {
      this.company[element + 'RegexValid'] = true;
      switch (element) {
        case 'contact_email_primary': {
          if (this.company[element] && !validatorCtrl.validateEmail(this.company[element])) {
            this.company[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'contact_email_secondary': {
          if (this.company[element] && !validatorCtrl.validateEmail(this.company[element])) {
            this.company[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'company_phone': {
          if (this.company[element] && !validatorCtrl.validatePhone(this.company[element])) {
            this.company[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'company_website': {
          if (this.company[element] && !validatorCtrl.validateWebsite(this.company[element])) {
            this.company[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'contact_phone_primary': {
          if (this.company[element] && !validatorCtrl.validatePhone(this.company[element])) {
            this.company[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'contact_phone_secondary': {
          if (this.company[element] && !validatorCtrl.validatePhone(this.company[element])) {
            this.company[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        default: {
          break;
        }
      }
    }
    return validate;
  }

  defaultValid() {
    for (var element in this.company) {
      this.company[element + 'RegexValid'] = true;
    }
    this.loader = false
  }

  deactivate() {

  }

}
