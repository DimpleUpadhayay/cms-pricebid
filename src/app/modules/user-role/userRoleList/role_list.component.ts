import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';

@Component({
  selector: 'app-role_list',
  templateUrl: './role_list.component.html',
  styleUrls: ['./role_list.component.css'],
  providers: [UsersService]
})

export class RoleListComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  public role_list: any[];
  public user;
  filter;
  p = 1; // set current page to 1
  loader = false;

  constructor(public _role_listService: UsersService, public router: Router) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.role_list = [];
    this.getUserRole();
  }

  ngOnInit() {
    this.loader = true;
  }

  // get user roles
  getUserRole() {
    this.loader = true
    this._role_listService.getUserRoles({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      if (data['code'] == 2000) {
        this.role_list = data['data']['roles'];
        this.loader = false
      }
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  /* getCompanyUserData() {
    this._role_listService.getCompanyUserData({}).subscribe(data => {
    })
  } */

  getRoleName(name) {
    let format = /_/;
    let check = format.test(name)
    if (check) {
      let roleName = name.split("_");
      return roleName[0] + " " + roleName[1];
    }
    return name;
  }

  /* changeDate(date) {
    return new Date(date).getDate() + '/' + (new Date(date).getMonth() + 1) + '/' + new Date(date).getFullYear();
  } */

  // delete user role
  delete(id) {
    let obj = {};
    this.alert.deleted('').then(a => {
      this.loader = true
      obj['role_id'] = id;
      obj['user_role'] = this.user.user_role;
      obj['user_id'] = this.user.user_id;
      obj['company_id'] = this.user.company_id
      obj['status'] = 'INACTIVE';

      this._role_listService.updateRole(obj).subscribe((data: any) => {
        if (data['data'] == null || data['data'] == 'null') {
          this.loader = false;
          this.getUserRole();
          return;
        }
        this.getUserRole();
        if (data.code === 2000) {
        } else if (data.code === 3005) {
          // this.errorMsg = "Ohh! It seems you are not connected with us yet";
        } else if (data.code === 3012) {
          // this.errorMsg = "Your Email is Not Verified , kindly verify your email";
        } else if (data.code === 3006) {
          // this.errorMsg = "Ohh! Invalid User.";
        }
        setTimeout(() => {
          // this.errorMsg = "";
          this.loader = false
        }, 500);
      }, (err) => {
        this.loader = false
      })
    }).catch(e => {
    })
  }

  /* getName(id) {
    if (!this.role_list || !id || this.role_list.length == 0) {
      return false;
    }
    if (this.role_list.find(a => a._id == id)) {
      return this.role_list.find(a => a._id == id).name;
    }
    return 'N/F';
  } */

}
