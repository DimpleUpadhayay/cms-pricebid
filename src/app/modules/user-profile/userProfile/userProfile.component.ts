import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { TerritoryService } from '../../../services/territories.service';
import { BusinessUnitService } from '../../../services/businessUnit.service';
import { SharedService } from '../../../services/shared.service';
import { LoginService } from '../../../services/login.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { ChatService } from '../../../services/chat.service';
declare var $: any;
@Component({
  selector: 'app-userProfile',
  templateUrl: './userProfile.component.html',
  styleUrls: ['./userProfile.component.css'],
  providers: [BidService, UsersService, TerritoryService, BusinessUnitService, ChatService, LoginService]
})


export class UserProfileComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  user;
  userNewData;
  territorys = [];
  business_units = [];
  user_id;
  company_name;
  bUnits = [];
  buHead = []
  territories = [];
  territoryHead = [];
  loader = false;

  constructor(public router: Router, public _bidservice: BidService,
    public _UsersService: UsersService,
    public _loginService: LoginService,
    public _businessUnitService: BusinessUnitService,
    public _sharedService: SharedService,
    public _chatService: ChatService,
    public loginService: LoginService,
    public _territoryService: TerritoryService,
    public route: ActivatedRoute) {
    this.userNewData = {
      currentPassword: '',
      confirmPassword: '',
      newPassword: ''
    };
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user']
    this.getUserById();
    this.getBusinessUnits();
    this.getTerritories();
    this.getCompanyDetails();

  }

  ngOnInit() {
  }

  userRole;
  userDetails;
  // get user details
  getUserById() {
    this.loader = true
    this._UsersService.getUserById(this.user.user_id).subscribe(data => {
      this.userDetails = data['data']['user'];
      this.userRole = data['data']['user']['userTypes']
      this.getBuHead()
      this.getTerritoryHead()
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // get company details
  getCompanyDetails() {
    this.loader = true
    this._UsersService.getCompanyDetails({ user_id: this.user.user_id }).subscribe(data => {
      this.company_name = data['data']['user']['company'][0].company_name;
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // get BUs

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
          this.user.bu_ids.forEach(element => {
            if (item.bu_id == element) {
              this.bUnits.push(item.name);
            }
          });
        })
      }
      this.loader = false
    }, error => {
      this.loader = false
    });
  }

  getBuHead() {
    if (this.userDetails.buHeadArray && this.userDetails.buHeadArray.length) {
      this.userDetails.buHeadArray.forEach(element => {
        this.business_units.forEach(item => {
          if (element == item.bu_id) {
            this.buHead.push(item.name)
          }
        })
      })
    }
  }


  changePasswordModal() {
    $("#changePassword").modal("show");
  }

  enableOtp() {
    this._UsersService.updateUser({ attempts: true, user_id: this.user.user_id }).subscribe(data => {
      console.log(data);
    })
  }


  message;
  userFormSubmitted;
  changePassword(data) {
    this.userFormSubmitted = true;
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      this.alert.sweetError("Fields can not be empty");
      return
    }

    if (data.newPassword != data.confirmPassword) {
      this.alert.sweetError("New Password does not match, please check again!");
      return
    }
    let obj = {
      user_id: this.user.user_id,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    }

    this._loginService.changePassword(obj).subscribe(data => {
      // this.message = "Password changed successfully";
      if (data['code'] == 2000) {
        if (data['data']['isSuccess'] === false) {
          this.alert.sweetError(data['data']['message']);
          return
        }
        this.alert.sweetSuccess(data['data']['message']);
        $("#changePassword").modal("hide");
        setTimeout(() => {
          this._chatService.logoutSoket().subscribe(data => {
          });
          this.loginService.doLogout();
        }, 2000);
      }
    }, error => {

    })
  }
  // get territories
  getTerritories() {
    this.loader = true
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
      if (territories['code'] === 2000) {
        this.loader = false
        this.territorys = territories['data'];
      }
      this.territorys.forEach(i => {
        this.user.territory_ids.forEach(element => {
          if (i.territory_id == element) {
            this.territories.push(i.name);
          }
        });
      });
      this.loader = false
    }, error => {

    });
  }

  getTerritoryHead() {
    if (this.userDetails.territoryHeadArray &&
      this.userDetails.territoryHeadArray.length) {
      this.userDetails.territoryHeadArray.forEach(element => {
        this.territorys.forEach(item => {
          if (element == item.territory_id) {
            this.territoryHead.push(item.name);
          }
        });
      });
    }
  }
}
