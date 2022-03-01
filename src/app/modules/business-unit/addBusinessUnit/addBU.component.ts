import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BusinessUnitService } from '../../../services/businessUnit.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { BusinessUnit } from '../../../models/businessUnit.model';

import { error } from 'util';

@Component({
  selector: 'app-addBu',
  templateUrl: './addBU.component.html',
  styleUrls: ['./addBU.component.css'],
  providers: [BusinessUnitService]

})
export class addBusinessUnitComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  business_unit_id;
  public bu;
  public user;
  public buForm: any;
  // Boolean
  loader = false;
  disableBtn = false;
  formSubmitted: boolean = false;
  // Array
  public mainUnits = [];

  constructor(public _businessUnitService: BusinessUnitService, public router: Router,
    public _route: ActivatedRoute, public _formBuilder: FormBuilder) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.getBu();
    this.buForm = _formBuilder.group({
      name: ["", Validators.compose([Validators.required])],
      description: ["", Validators.compose([Validators.required])],
      parent_id: [""],
      status: "ACTIVE",
      business_unit_number: ["", Validators.compose([Validators.required])]
    });

    this.bu = new BusinessUnit();
    this.business_unit_id = this._route.snapshot.params['id'];
    if (this.business_unit_id)
      this.getBuById();
  }

  ngOnInit() {
    this.loader = true
    this.defaultValid()
  }

  // get particular BU to edit
  getBuById() {
    this.loader = true
    this._businessUnitService.getBusinessUnitById(this.business_unit_id).subscribe(data => {
      this.bu = data['data'];
      this.loader = false
      this.defaultValid();
    }, error => {
      this.loader = false
    })
  }

  defaultValid() {
    for (var element in this.bu) {
      this.bu[element + 'Valid'] = true;
    }
    this.loader = false
  }

  validate() {
    let validate = true;
    for (var element in this.bu) {
      if (this.bu[element] === '') {
        validate = false;
      }
    }
    return validate;
  }

  // create BU
  createBusinessUnit() {
    this.formSubmitted = true;
    this.disableBtn = true;
    if (!this.validate()) {
      this.alert.sweetError("Please enter mandatory fields");
      this.disableBtn = false;
      return false;
    }
    this.loader = true
    this.buForm.value['is_child'] = this.buForm.value['parent_id'] && this.buForm.value['parent_id'] != 'root' ? true : false;
    this.buForm.value['user_id'] = this.user.user_id;
    this.buForm.value['company_id'] = this.user.company_id;
    this.buForm.value['user_role'] = this.user.user_role;
    this.buForm.value['user_role'] = this.bu.parent_id == 'null';
    this._businessUnitService.createBusinessUnit(this.buForm.value).subscribe((data: any) => {
      if (data.code === 2000) {
        this.loader = false
        this.alert.sweetSuccess("Business Unit created successfully")
        setTimeout(() => {
          this.loader = false
          this.router.navigate(['businessUnit', 'list']);
        }, 2000);
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
        this.loader = false
        //this.errorMsg = "";
      }, 500);
    }, (err) => {
      this.loader = false
      this.alert.sweetError(err.error.msg);
      this.formSubmitted = false;
      this.disableBtn = false;
    })
  }

  // get list of BU
  getBu() {
    this.loader = true
    this._businessUnitService.getBusinessUnits([]).subscribe(data => {
      if (data['data'] == 'null') {
        return;
      }
      if (data['code'] === 2000) {
        if (data['data'] && data['data'].length > 0) {
          this.mainUnits = data['data'];
        }
        this.mainUnits = [{ bu_id: 'ROOT', name: 'ROOT' }, ...this.mainUnits]
      }
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  validateSingle(element) {
    let validate = true;
    if (this.bu[element] === '') {
      validate = false;
    }
    return validate
  }

  // update BU
  updateBusinessUnit() {
    this.formSubmitted = true;
    this.disableBtn = true;
    if (!this.validate()) {
      this.alert.sweetError("Please enter mandatory fields");
      this.disableBtn = false;
      return false;
    }
    this.loader = true
    this.buForm.value['user_id'] = this.user.user_id;
    this.buForm.value['company_id'] = this.user.company_id;
    this.buForm.value['user_role'] = this.user.user_role;
    this.buForm.value['business_unit_id'] = this.business_unit_id;
    this.buForm.value['bu_id'] = this.business_unit_id;
    this._businessUnitService.updateBusinessUnit(this.buForm.value).subscribe(data => {
      if (data['code'] === 2000) {
        this.loader = false
        this.alert.sweetSuccess("Business Unit updated successfully")
        setTimeout(() => {
          this.loader = false
          this.router.navigate(['businessUnit', 'list']);
        }, 2000);
      } else if (data['code'] === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (data['code'] === 401) {
        //this.users = [];
      } else if (data['code'] === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (data['code'] === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
      setTimeout(() => {
        //this.errorMsg = "";
        this.loader = false
      }, 500);
    }, error => {
      this.loader = false
      this.alert.sweetError(error.error.msg);
      this.formSubmitted = false;
      this.disableBtn = false;
    })
  }

}
