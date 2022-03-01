import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-delete-user-company-admin',
  templateUrl: './delete-user-company-admin.component.html',
  styleUrls: ['./delete-user-company-admin.component.css'],
  providers: [UsersService]
})
export class DeleteUserCompanyAdminComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;

  userInfo;
  email;
  fullname;
  path;
  userStatus;
  userDeleted;
  user_id;
  submitButton = false;
  loader = false;

  constructor(public dialogRef: MatDialogRef<DeleteUserCompanyAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public _user_listService: UsersService) {
    dialogRef.disableClose = true;
    this.email = data.email;
    this.fullname = data.fullname;
    this.path = data.path
    this.userStatus = data.userList;
    this.user_id = data.user_id;
    // console.log("Data User_id", data)
  }

  ngOnInit() {
    this.userInfo = this.data['userBidData'];
    if (this.path == "/user/list") {
      this.userStatus.forEach(item => {
        if (item.user_id == this.user_id) {
          this.userDeleted = item.deleteStatus;
          if (this.userDeleted == undefined ) {
            this.submitButton = false;
          }
          else {
            this.submitButton = true;
          }
        }
      })
    }
    // console.log("Hello Userstatus",this.userDeleted )
  }

  onClose() {
    this.dialogRef.close();
  }

  deleteUser(){
    this._alert.deleteUser("").then(success => {
      this.loader = true;
      this._user_listService.deleteUserNotification(this.data).subscribe(resp => {
        this.loader = false;
        if (resp['code'] == 2000) {
          this.dialogRef.close('userDataRefresh');
        }
      }, error => {
        this.loader = false;
        this._alert.sweetError(error.error.msg);
      })
    }, cancel => {
      return;
    });
  }

  onSubmit() {
    if (this.path == "/user/list") {
      this._alert.submitPS("").then(success => {
        this.loader = true;
        this._user_listService.deleteUserNotification(this.data).subscribe(resp => {
          this.loader = false;
          if (resp['code'] == 2000) {
            this.dialogRef.close('userDataRefresh');
            this._alert.sweetSuccess("Notification has send sucessfully to Co-Ownwer/Sales Manager")
          }
        }, error => {
          this.loader = false;
          this._alert.sweetError(error.error.msg);
        })
      }, cancel => {
        return;
      });
    }
    else if (this.path == "approvalChain") {
      this._alert.deleteUserCompanyAdmin("").then(() => {
        this.dialogRef.close('removeApprover');
        this._alert.sweetSuccess("User removed successfully ")
      }, cancel => {
        return;
      });
    }
  }
}
