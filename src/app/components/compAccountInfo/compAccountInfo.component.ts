import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { BidService } from '../../services/bid.service';
import * as validatorCtrl from '../../libraries/validation';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-compAccountInfo',
  templateUrl: './compAccountInfo.component.html',
  styleUrls: ['./compAccountInfo.component.css'],
  providers: [BidService]
})
export class CompAccountInfoComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  competsubmitted = false;
  competitor_name;
  competitor_website;
  competitor_contact;
  description;
  user;
  compCreate;
  searchDataArray = [];

  constructor(private _bidService: BidService, public dialogRef: MatDialogRef<CompAccountInfoComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    dialogRef.disableClose = true;
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    // this.competitorRead();
    this.compCreate = {
      "company_id": this.user.company_id,
      "competitor_name": "",
      "competitor_website": "",
      "competitor_contact": "",
      "description": ""
    }

  }
  // competit;
  // competitorRead() {
  //   let obj = {
  //     "company_id": this.user.company_id,
  //     "pageNo": 1
  //   }
  //   this._bidService.competitorRead(obj).subscribe(resp => {
  //     this.competit = resp['data']['competition_data'];
  //     // console.log(this.competit);
  //   }, error =>{
    // })
  // }

  validate() {
    let validate = true;
    for (var element in this.compCreate) {
      if (element && this.compCreate[element] === '' && element != 'description' && element != "company_id") {
        validate = false;
      }
    }
    return validate;
  }

  validateSingle(element) {
    let validate = true;
    if (element && this.compCreate[element] === '') {
      validate = false;
    }
    return validate
  }
  validateRegex(element) {
    let validate = true;
    this.compCreate[element + 'RegexValid'] = true;

    switch (element) {
      // case 'competitor_name': {
      //   if (this.compCreate[element] && !validatorCtrl.validateUsername(this.compCreate[element])) {
      //     this.compCreate[element + 'RegexValid'] = false;
      //     validate = false;
      //   }
      //   break;
      // }
      case 'competitor_contact': {
        if (this.compCreate[element] && !validatorCtrl.validatePhone(this.compCreate[element])) {
          this.compCreate[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'competitor_website': {
        if (this.compCreate[element] && !validatorCtrl.validateWebsite(this.compCreate[element])) {
          this.compCreate[element + 'RegexValid'] = false;
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
    for (var element in this.compCreate) {
      this.compCreate[element + 'RegexValid'] = true;
      switch (element) {

        // case 'competitor_name': {
        //   if (this.compCreate[element] && !validatorCtrl.validateUsername(this.compCreate[element])) {
        //     this.compCreate[element + 'RegexValid'] = false;
        //     validate = false;
        //   }
        //   break;
        // }
        case 'competitor_contact': {
          if (this.compCreate[element] && !validatorCtrl.validatePhone(this.compCreate[element])) {
            this.compCreate[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'competitor_website': {
          if (this.compCreate[element] && !validatorCtrl.validateWebsite(this.compCreate[element])) {
            this.compCreate[element + 'RegexValid'] = false;
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
  competCreate() {
    this.competsubmitted = true;
    if (!this.validate() || !this.validateRegexAll()) {
      this.alert.sweetError("Please enter mandatory fields");
      return false
    }
    this._bidService.competitorCreate(this.compCreate).subscribe(resp => {
      this.dialogRef.close(this.compCreate);
      this.alert.sweetSuccess("Competition Details created successfully");
    }, error => {
      this.alert.sweetError(error.error.msg);
    })
  }
  resetCompetit() {
    this.compCreate = {
      "company_id": this.user.company_id,
      "competitor_name": "",
      "competitor_website": "",
      "competitor_contact": "",
      "description": ""
    }
  }
  close() {
    this.dialogRef.close();
  }
  ngOnInit() {

  }
}
