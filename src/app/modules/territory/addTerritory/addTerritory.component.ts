import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TerritoryService } from '../../../services/territories.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { TerritoryModel } from '../../../models/territoryModel.model';



@Component({
  selector: 'app-addTerritory',
  templateUrl: './addTerritory.component.html',
  styleUrls: ['./addTerritory.component.css'],
  providers: [TerritoryService]
})

export class addTerritoryComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  public territoryForm: any;
  public territory;
  public user;
  public mainTerritories;
  territory_id;
  // Boolean Value
  formSubmitted: boolean = false;
  disableBtn = false;
  loader = false;

  constructor(public _territoryService: TerritoryService,  public router: Router,
    public _formBuilder: FormBuilder, public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.territory = new TerritoryModel();
    this.territory_id = this._route.snapshot.params['id'];
    if (this.territory_id)
      this.getTerritoryById();

    this.territoryForm = _formBuilder.group({
      name: ["", Validators.compose([Validators.required])],
      parent_id: [""],
      status: "ACTIVE",
      description: ["", Validators.compose([Validators.required])],
      territory_number: [""],
      RegionID: [""]
    });
    this.getTerritory()
  }

  ngOnInit() {
    this.loader = true
    this.defaultValid();
  }

  // get list of territories
  getTerritory() {
    this.loader = true
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false
        return;
      }
      if (data['code'] == '2000') {
        this.mainTerritories = data['data'];
        this.mainTerritories = [{ territory_id: 'ROOT', name: 'ROOT' }, ...this.mainTerritories]
        this.loader = false
      }
    }, error => {
      this.loader = false
    })
  }

  // get particular territory details to edit
  getTerritoryById() {
    this.loader = true
    this._territoryService.getTerritoryById(this.territory_id).subscribe(data => {
      this.territory = data['data'];
      this.defaultValid();
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  validate() {
    let validate = true;
    for (var element in this.territory) {
      if (this.territory[element] === '') {
        validate = false;
      }
    }
    return validate;
  }

  validateSingle(element) {
    let validate = true;
    this.territory[element + 'Valid'] = true;
    if (this.territory[element] === '') {
      validate = false;
    }
    return validate
  }

  defaultValid() {
    for (var element in this.territory) {
    }
    this.loader = false
  }

  // Edit territory
  updateTerritory() {
    this.formSubmitted = true;
    this.disableBtn = true;
    if (!this.validate() || this.territoryForm.value['parent_id'] == null) {
      this.alert.sweetError("Please enter mandatory fields");
      this.disableBtn = false;
      return false;
    }
    this.loader = true
    this.territoryForm.value['user_id'] = this.user.user_id;
    this.territoryForm.value['company_id'] = this.user.company_id;
    this.territoryForm.value['territory_id'] = this.territory_id;
    this.territoryForm.value['user_role'] = this.user.user_role;
    this._territoryService.updateTerritory(this.territoryForm.value).subscribe((data: any) => {
      if (data.code === 2000) {
        this.loader = false
        this.alert.sweetSuccess("Territory updated successfully")
        setTimeout(() => {
          this.loader = false
          this.router.navigate(['territory/list']);
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
        //this.errorMsg = "";
      }, 500);
    }, (err) => {
      this.loader = false
      this.alert.sweetError(err.error.msg);
      this.formSubmitted = false;
      this.disableBtn = false;
    })
  }

  // create territory
  createTerritory() {
    this.formSubmitted = true;
    this.disableBtn = true;
    if (!this.validate() || this.territoryForm.value['parent_id'] == null) {
      this.alert.sweetError("Please enter mandatory fields");
      this.disableBtn = false;
      return false;
    }
    this.loader = true
    this.territoryForm.value['user_id'] = this.user.user_id;
    this.territoryForm.value['company_id'] = this.user.company_id;
    this.territoryForm.value['is_child'] = true;
    this.territoryForm.value['user_role'] = this.user.user_role;
    this._territoryService.createTerritory(this.territoryForm.value).subscribe((data: any) => {
      if (data.code === 2000) {
        this.loader = false
        this.alert.sweetSuccess("Territory created successfully")
        setTimeout(() => {
          this.loader = false
          this.router.navigate(['territory/list']);
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
        //this.errorMsg = "";
        this.loader = false
      }, 500);
    }, (err) => {
      this.loader = false
      this.alert.sweetError(err.error.msg);
      this.formSubmitted = false;
      this.disableBtn = false;
    })
  }

}
