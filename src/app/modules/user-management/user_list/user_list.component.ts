import { Component, OnInit, ViewChild } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { MatDialog } from '@angular/material';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { DeleteUserCompanyAdminComponent } from '../delete-user-company-admin/delete-user-company-admin.component';
import { CompanyService } from '../../../services/company.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user_list',
  templateUrl: './user_list.component.html',
  styleUrls: ['./user_list.component.css'],
  providers: [UsersService, CompanyService]

})
export class UserListComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  public user_list: any[];
  // public buForm: any;
  // public bu;
  filter;

  public user;
  p = 1; // set current page to 1
  // dtTrigger: Subject<any> = new Subject();
  loader = false;
  userData;
  totalUserCount: number;
  company: any;

  constructor(public _user_listService: UsersService, public dialog: MatDialog,public _addCompanyService: CompanyService,private _router: Router) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    if (this.user.user_role == 'SUPPORT') {
      this.getUserData();
    } else if (this.user.user_role == 'COMPANY_ADMIN') {
      this.getCompanyUserData()
    }
    this.user_list = [];
  }

  ngOnInit() {
    this.loader = true;
  }

  getUserData() {
    this.loader = true
    let obj = { status: "ACTIVE" }
    this._user_listService.getUserData(obj).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      if (data['code'] == 2000) {
        this.user_list = data['data']['users'];
        this.loader = false
      }
    }, error => {
      this.loader = false
    });
  }

  getCompanyUserData() {
    this.loader = true
    let obj = { status: "ACTIVE" }
    this._user_listService.getCompanyUserData(obj).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      this.user_list = data['data']['users'];
      this.totalUserCount = this.user_list.length;
      this.addUserRoles();
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }
  addUserRoles() {
    this.user_list.forEach(element => {
      element["roles"] = [];
      if (element.userTypes && element.userTypes.length != 0) {
        element.userTypes.forEach(type => {
          if (type.user_subtype) {
            element.roles.push(this.titleCase(type.user_subtype + " " + type.user_type));
          } else {
            element.roles.push(this.titleCase(type.user_type));
          }
        });
      } else {
        element["roles"] = ["Company Admin"];
      }
    })
  }

  titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
  }

  deactivateUser(item) {
    let obj = {};
    obj['status'] = 'INACTIVE';
    obj['user_id'] = item.user_id ? item.user_id : undefined;
    obj['company_id'] = item.company_id ? item.company_id : undefined;
    obj['user_role'] = this.user.user_role;
    this.alert.deleted('').then(() => {
      this.loader = true
      this._user_listService.updateUser(obj).subscribe(data => {
        if (this.user.user_role == 'SUPPORT') {
          this.loader = false
          this.getUserData();
        } else if (this.user.user_role == 'COMPANY_ADMIN') {
          this.loader = false
          this.getCompanyUserData()
        }
      }, error => {
        this.loader = false
      });
    }).catch(e => {

    })
  }

  getDeleteUser(item) {
    let path = window.location.pathname;
    let obj = {
      "user_id": item.user_id
    }
    this.alert.deleteUserCompanyAdmin("").then(() => {
      this.loader = true;
      this._user_listService.getDeleteUser(obj).subscribe(resp => {
        console.log("Hello Log", resp)
        if (resp['data'] == null) {
          this.userData = [];
          this.loader = false;
          return;
        }
        if (resp && resp['data'] && resp['data']['userBidData']) {
          this.userData = resp['data'];
          this.userData['path'] = path;
          this.userData['userList'] = this.user_list;
          this.loader = false;
          // console.log("Hello UserLs", this.userData)
          const dialogRef = this.dialog.open(DeleteUserCompanyAdminComponent, {
            height: '407px',
            width: '1090px',
            data: this.userData,
          });
          dialogRef.afterClosed().subscribe(result => {
            if (!result || result.length == 0) {
              this.loader = false;
              return
            }
            if (result == 'userDataRefresh') {
              this.getCompanyUserData()
              return;
            }
          }, error => {
            this.loader = false;
            return;
          });
        }
        if (resp['code'] == 2000 && resp['data'] == "User deleted successfully") {
          this.alert.sweetSuccess("User deleted successfully ")
          this.getCompanyUserData()
          this.loader = false;
          return
        }
      }, error => {
        this.loader = false;
      });
    }, error => {
      return;
    });
  }

  getName(id) {
    if (!this.user_list || !id || this.user_list.length == 0) {
      return false;
    }
    if (this.user_list.find(a => a._id == id)) {
      return this.user_list.find(a => a._id == id).name;
    }
    return 'N/F';
  }

  validateUserCount() {
    this._addCompanyService.getCompanyById(this.user.company_id).subscribe(data => {
      this.company = data['data']['company'];
      if (this.totalUserCount == this.company.no_of_registered_users) {
        this.alert.sweetError("You have exhausted your user limit");
        return;
      } else {
        this._router.navigateByUrl('user/create');
        return;
      }
    }, error => {
    })
  }

}