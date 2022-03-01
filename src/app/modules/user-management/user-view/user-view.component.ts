import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { TerritoryService } from '../../../services/territories.service';
import { BusinessUnitService } from '../../../services/businessUnit.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';


@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.css'],
  providers: [UsersService, TerritoryService, BusinessUnitService]
})
export class UserViewComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  territorys = [];
  business_units = [];
  errorMsg: any = "";
  userResponse;
  user;
  user_id;
  role;
  bUnits = [];
  territories = [];
  loader = false;

  constructor(public router: Router, public _UsersService: UsersService,
    public _businessUnitService: BusinessUnitService, public _territoryService: TerritoryService, public route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.user_id = this.route.snapshot.params['id'];
    if (this.user_id) {
      this.getUserById()
    } else {
      this.getBusinessUnits();
      this.getTerritories();
    }
  }
  ngOnInit() {
    this.loader = true;
  }
  // get user details
  userRole
  getUserById() {
    this.loader = true
    this._UsersService.getUserById(this.user_id).subscribe(data => {
      this.userResponse = data['data']['user'];
      // console.log(">>>>user", this.userResponse)
      this.userRole = data['data']['user']['userTypes']
      this.getBusinessUnits();
      this.getTerritories();
      this.loader = false
      // console.log(">>>>>user123", this.userRole)
    }, error => {
      this.loader = false
      this.getBusinessUnits();
      this.getTerritories();
    })
  }
  // get BUs
  buHead = []
  getBusinessUnits() {
    this.loader = true
    this._businessUnitService.getBusinessUnits([]).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false
        return;
      }
      if (data['code'] == 2000) {
        this.business_units = data['data'];
        this.business_units.forEach(item => {
          this.userResponse.bu_ids.forEach(element => {
            if (item.bu_id == element) {
              this.bUnits.push(item.name);
            }
          });
        })
      }
      if (this.userResponse.buHeadArray && this.userResponse.buHeadArray.length != 0) {
        this.business_units = data['data'];
        this.business_units.forEach(item => {
          this.userResponse.buHeadArray.forEach(element => {
            if (item.bu_id == element) {
              this.buHead.push(item.name);
            }
          })
        })
      }
      this.loader = false
    }, error => {
      this.loader = false
    });
  }

  // get territories
  territoryHead = [];
  getTerritories() {
    this.loader = true
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
      if (territories['data'] == null || territories['data'] == 'null') {
        this.loader = false
        return;
      }
      if (territories['code'] === 2000) {
        this.territorys = territories['data']     //this.errorMsg = "";
        this.territorys.forEach(i => {
          this.userResponse.territory_ids.forEach(element => {
            if (i.territory_id == element) {
              this.territories.push(i.name);
            }
          });
        });
      }
      if (this.userResponse.territoryHeadArray && this.userResponse.territoryHeadArray.length != 0) {
        this.territorys = territories['data']
        this.territorys.forEach(i => {
          this.userResponse.territoryHeadArray.forEach(element => {
            if (i.territory_id == element) {
              this.territoryHead.push(i.name);
            }
          });
        });
      } else if (territories['code'] === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (territories['code'] === 401) {
        //this.users = [];
      } else if (territories['code'] === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (territories['code'] === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
      this.loader = false
    }, error => {
      this.loader = false
    });
  }

  enableLogin(user_id) {
    this._UsersService.updateUser({ attempts: 1, user_id: user_id }).subscribe(data => {
      this.alert.sweetSuccess("User enabled successfully");
      setTimeout(() => {
        this.router.navigate(['user/list'])
      }, 2000);
    }, error => {
      this.alert.sweetError(error.error.msg);
    });
  }

}
