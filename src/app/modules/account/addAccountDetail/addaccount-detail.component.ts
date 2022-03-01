import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { BidService } from '../../../services/bid.service';
import * as validatorCtrl from '../../../libraries/validation';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-addaccount-detail',
  templateUrl: './addaccount-detail.component.html',
  styleUrls: ['./addaccount-detail.component.css'],
  providers: [BidService]
})

export class AddaccountDetailComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  user;
  accountSubmitted = false;
  accountCreate;
  loader = false;

  constructor(public _bidService: BidService, public router: Router, public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    // this.readData();
    this.accountCreate = {
      "company_id": this.user.company_id,
      "account_contact": "",
      "account_website": "",
      "account_name": "",
      "description": "",
      "AccountID": ""
    }
    let id = _route.snapshot.params["id"];
    if (id) {
      this.getAccountByID(id);
    }
  }
  // Read call for Account
  account;
  readData() {
    this.loader = true
    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE'
    }
    this._bidService.readAccountInfo(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false
        return;
      }
      this.account = resp['data']['account_data'];
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  getAccountByID(id) {
    this.loader = true
    this._bidService.getAccountById({ "id": id }).subscribe(resp => {
      this.accountCreate = resp['data'];
      this.accountCreate.account_websiteRegexValid = true;
      this.accountCreate.account_contactRegexValid = true;
      this.loader = false
    }, error => {
      this.loader = false
    })

  }
  validate() {
    let validate = true;
    for (var element in this.accountCreate) {
      if (element && this.accountCreate[element] === '' && element != 'description') {
        validate = false;
      }
    }
    return validate;
  }

  validateSingle(element) {
    let validate = true;
    if (element && this.accountCreate[element] === '') {
      validate = false;
    }
    return validate
  }
  validateRegex(element) {
    let validate = true;
    this.accountCreate[element + 'RegexValid'] = true;

    switch (element) {

      /* case 'account_name': {
        if (this.accountCreate[element] && !validatorCtrl.validateUsername(this.accountCreate[element])) {
          this.accountCreate[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      } */

      case 'account_contact': {
        if (this.accountCreate[element] && !validatorCtrl.validatePhone(this.accountCreate[element])) {
          this.accountCreate[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'account_website': {
        if (this.accountCreate[element] && !validatorCtrl.validateWebsite(this.accountCreate[element])) {
          this.accountCreate[element + 'RegexValid'] = false;
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
  // Regex validation for checking proper website and contact number
  validateRegexAll() {
    let validate = true;
    for (var element in this.accountCreate) {
      this.accountCreate[element + 'RegexValid'] = true;
      switch (element) {

        /* case 'account_name': {
          if (this.accountCreate[element] && !validatorCtrl.validateUsername(this.accountCreate[element])) {
            this.accountCreate[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        } */
        case 'account_contact': {
          if (this.accountCreate[element] && !validatorCtrl.validatePhone(this.accountCreate[element])) {
            this.accountCreate[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'account_website': {
          if (this.accountCreate[element] && !validatorCtrl.validateWebsite(this.accountCreate[element])) {
            this.accountCreate[element + 'RegexValid'] = false;
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
  // Update an Account
  updateAccountInfo() {
    this.accountSubmitted = true;
    if (!this.validate() || !this.validateRegexAll()) {
      this.alert.sweetError("Please enter mandatory fields");
      return;
    }
    this.loader = true
    this.accountCreate['id'] = this.accountCreate._id;
    this._bidService.updateAccountInfo(this.accountCreate).subscribe(result => {
      this.loader = false
      this.alert.sweetSuccess("Account Updated successfully");
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['account', 'list']);
      }, 2000);
    }, error => {
      this.loader = false
      this.alert.sweetError(error.error.msg);
    })
  }
  // Create an Account
  saveAccountInfo() {
    this.accountSubmitted = true;
    if (!this.validate() || !this.validateRegexAll()) {
      this.alert.sweetError("Please enter mandatory fields");
      return;
    }
    this.loader = true
    this._bidService.createAccountInfo(this.accountCreate).subscribe(resp => {
      this.loader = false
      this.alert.sweetSuccess("Account created successfully");
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['account', 'list']);
      }, 2000);
    }, error => {
      this.loader = false
      this.alert.sweetError(error.error.msg);
    })
  }
  // For Reset account name on Keyboard
  onResetAccountInfo() {
    this.accountCreate = {
      "company_id": this.user.company_id,
      "account_contact": "",
      "account_website": "",
      "account_name": "",
      "description": "",
      "AccountID": ""
    }
  }

  ngOnInit() {
  }
}