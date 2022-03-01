import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import * as validatorCtrl from '../../../libraries/validation';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-addcompetitor-detail',
  templateUrl: './addcompetitor-detail.component.html',
  styleUrls: ['./addcompetitor-detail.component.css'],
  providers: [BidService]
})
export class AddcompetitorDetailComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  user;
  compCreate;
  id;
  competitorSubmitted = false;
  loader = false;

  constructor(private _bidService: BidService,  private router: Router, private _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.id = _route.snapshot.params['id'];
    this.compCreate = {
      "company_id": this.user.company_id,
      "competitor_name": "",
      "competitor_website": "",
      "competitor_contact": "",
      "description": ""
    }
    if (this.id) {
      this.getCompetitorById();
    }
  }

  ngOnInit() {
  }

  // get competitor details
  getCompetitorById() {
    this.loader = true
    this._bidService.getCompetitorById({ "id": this.id }).subscribe(success => {
      this.compCreate = success['data'];
      this.compCreate.competitor_contactRegexValid = true;
      this.compCreate.competitor_websiteRegexValid = true;
      this.loader = false
    }, error => {
      this.loader = false
      return;
    });
  }

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
      /*  case 'competitor_name': {
         if (this.compCreate[element] && !validatorCtrl.validateUsername(this.compCreate[element])) {
           this.compCreate[element + 'RegexValid'] = false;
           validate = false;
         }
         break;
       } */
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
        /* case 'competitor_name': {
          if (this.compCreate[element] && !validatorCtrl.validateUsername(this.compCreate[element])) {
            this.compCreate[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        } */
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

  // create competitor
  createCompetitor() {
    this.competitorSubmitted = true;
    if (!this.validate() || !this.validateRegexAll()) {
      this.alert.sweetError("Please enter mandatory fields");
      return false
    }
    this.loader = true
    this._bidService.competitorCreate(this.compCreate).subscribe(resp => {
      this.loader = false
      this.alert.sweetSuccess("Competitor created successfully");
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['competitor', 'list']);
      }, 2000);
    }, error => {
      this.loader = false
      this.alert.sweetError(error.error.msg);
    })
  }

  // update competitor
  updateCompetitor() {
    this.competitorSubmitted = true;
    if (!this.validate() || !this.validateRegexAll()) {
      this.alert.sweetError("Please enter mandatory fields");
      return false
    }
    this.loader = true
    this.compCreate['id'] = this.compCreate._id;
    this._bidService.competitorUpdate(this.compCreate).subscribe(resp => {
      this.loader = false
      this.alert.sweetSuccess("Competitor updated successfully");
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['competitor', 'list']);
      }, 2000);
    }, error => {
      this.loader = false
      this.alert.sweetError(error.error.msg);
    })
  }

  // reset competitor
  onResetCompetitorInfo() {
    this.compCreate = {
      "company_id": this.user.company_id,
      "competitor_name": "",
      "competitor_website": "",
      "competitor_contact": "",
      "description": ""
    }
  }

}
