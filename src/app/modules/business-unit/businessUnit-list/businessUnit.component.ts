import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BusinessUnitService } from '../../../services/businessUnit.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';

@Component({
  selector: 'app-businessUnit',
  templateUrl: './businessUnit.component.html',
  styleUrls: ['./businessUnit.component.css'],
  providers: [BusinessUnitService]
})

export class businessUnitComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  filter;
  public user;
  fiter;
  p = 1; // set current page to 1
  loader = false;
  public businessUnits: any[];

  constructor(public _businessUnitService: BusinessUnitService, public router: Router) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.businessUnits = [];
    this.getBusinessUnits();
  }

  ngOnInit() {
    this.loader = true;
  }

  // get BUs
  getBusinessUnits() {
    this.loader = true
    this._businessUnitService.getBusinessUnits([]).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      if (data['code'] == 2000) {
        this.businessUnits = data['data'];
        this.loader = false;
      }
    }, error => {
      this.loader = false;
    });
  }

  // date created
  changeDate(date) {
    return new Date(date).getDate() + '/' + (new Date(date).getMonth() + 1) + '/' + new Date(date).getFullYear();
  }

  // delete BU
  deactivate(id) {
    this.alert.deleted('').then(() => {
      this.loader = true
      let item = { status: "INACTIVE", bu_id: id, user_role: this.user.user_role, user_id: this.user.user_id, company_id: this.user.company_id }
      this._businessUnitService.updateBusinessUnit(item).subscribe(data => {
        this.loader = false
        this.getBusinessUnits();
      }, error => {
        this.loader = false
        this.alert.sweetError(error.error.msg)
      })
    }).catch(e => {
    })
  }

  // fetch name of BU
  getName(id) {
    if (id != 'ROOT' || !id) {
      if (!this.businessUnits || this.businessUnits.length == 0) {
        return 'ROOT';
      }
      if (this.businessUnits.find(a => a.parent_id == id)) {
        return this.businessUnits.find(a => a.bu_id == id).name;
      }
    } else {
      return 'ROOT'
    }
  }

}
