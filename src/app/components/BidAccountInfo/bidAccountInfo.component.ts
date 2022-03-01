import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { BidService } from '../../services/bid.service';
import * as validatorCtrl from '../../libraries/validation';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-bidAccountInfo',
  templateUrl: './bidAccountInfo.component.html',
  styleUrls: ['./bidAccountInfo.component.css'],
  providers: [BidService]
})
export class BidAccountInfoComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  user;
  accountSubmitted = false;
  accountCreate;

  constructor(public _bidService: BidService, public dialogRef: MatDialogRef<BidAccountInfoComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    dialogRef.disableClose = true;
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    // this.readData();
    this.accountCreate = {
      "company_id": this.user.company_id,
      "account_contact": "",
      "account_website": "",
      "account_name": "",
      "description": ""
    }
    if (data != null) {
      this.accountCreate.company_id = data.company_id;
      this.accountCreate.account_contact = data.account_contact;
      this.accountCreate.account_website = data.account_website;
      this.accountCreate.account_name = data.account_name;
      this.accountCreate.description = data.description;
      this.accountCreate['_id'] = data._id;
      this.accountCreate.account_websiteRegexValid = true;
      this.accountCreate.account_contactRegexValid = true;
    }


  }
  // account;
  // readData() {
  //   let obj = {
  //     "company_id": this.user.company_id,
  //     "pageNo": 1
  //   }
  //   this._bidService.readAccountInfo(obj).subscribe(resp => {
  //     this.account = resp['data']['account_data'];
  //     // console.log(this.account)
  //   }, error =>{
    // })
  // }
  validate() {
    let validate = true;
    // console.log(this.accountCreate)
    for (var element in this.accountCreate) {
      if (element && this.accountCreate[element] === '' && element != 'description') {
        validate = false;
      }
    }
    // console.log(validate)
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
  updateAccountInfo() {
    this.accountSubmitted = true;
    if (!this.validate() || !this.validateRegexAll()) {
      this.alert.sweetError("Please enter mandatory fields");
      return;
    }
    this.accountCreate['id'] = this.accountCreate._id;
    this._bidService.updateAccountInfo(this.accountCreate).subscribe(result => {
      this.dialogRef.close(this.accountCreate);
      this.alert.sweetSuccess("Account Updated successfully");
    }, error => {
      this.alert.sweetError(error.error.msg);
      this.accountSubmitted = false;
    })
  }
  saveAccountInfo() {
    this.accountSubmitted = true;
    if (!this.validate() || !this.validateRegexAll()) {
      this.alert.sweetError("Please enter mandatory fields");
      return;
    }
    /* let obj = {
      "company_id": this.user.company_id,
      "account_contact": this.accountCreate['account_contact'],
      "account_website": this.accountCreate['account_website'],
      "account_name": this.accountCreate['account_name'],
      "description": this.accountCreate['description']
    } */
    this._bidService.createAccountInfo(this.accountCreate).subscribe(resp => {
      // console.log(resp);
      this.dialogRef.close(this.accountCreate);
      this.alert.sweetSuccess("Account created successfully");
    }, error => {
      this.alert.sweetError(error.error.msg);
    })
  }
  onResetAccountInfo() {
    this.accountCreate = {
      "company_id": this.user.company_id,
      "account_contact": "",
      "account_website": "",
      "account_name": "",
      "description": ""
    }
  }

  ngOnInit() {

  }
  close() {
    this.dialogRef.close();
  }
}
