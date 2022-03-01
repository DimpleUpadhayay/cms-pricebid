import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UsersService } from '../../../services/users.service';


@Component({
  selector: 'app-approval-delete-user',
  templateUrl: './approval-delete-user.component.html',
  styleUrls: ['./approval-delete-user.component.css'],
  providers: [UsersService]
})


export class ApprovalDeleteUserComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;

  oldApproverId;
  approvalChainId;
  newBidManagerId;
  oldApproverlevel;
  bidData: any;
  user: any;
  approverList: any;
  oldApprovalName;
  loader = false;
  approverArray = [{
    "newApproverUserId": ""
  }]

  constructor(public dialogRef: MatDialogRef<ApprovalDeleteUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _userService: UsersService) { 
    this.oldApprovalName = data.approverName.fullname; 
    this.oldApproverId = data.approverName.user_id
    this.oldApproverlevel = data.approverName.level
    this.approvalChainId = data.ac_id;
    this.approverList = data.approvedUsers;
    console.log("hello", data)
   }

  ngOnInit() {
  }

  newApproverPersonId;
  newApproverFullname;
  onReassign() {
    let flag = false;
    this.approverArray.filter(element => {
      this.newApproverPersonId = element.newApproverUserId;
      if (element.newApproverUserId == "") {
        flag = true
      }
    })
    if (flag) {
      this._alert.sweetError("Please Select Approver")
      return
    }
    this.approverList.find(result =>{
      if(result.user_id == this.newApproverPersonId){
        this.newApproverFullname = result.fullname;
      }
    })
    let obj = {
      "ac_id": this.approvalChainId,
      "user_id": this.oldApproverId,
      "new_user_id": this.newApproverPersonId,
      'fullname': this.newApproverFullname,
      "level": this.oldApproverlevel,
      "oldFullName": this.oldApprovalName
    }
    this.loader = true
    this._alert.submitPS("").then(success => {
      this._userService.ReAssignApprovalTask(obj).subscribe(result => {
        this.loader = false;
        this.dialogRef.close(obj);
        this._alert.sweetSuccess("Approver re-assign sucessfully")
      }, error => {
        this.loader = false;
      })
    }, cancel => {
      this.loader = false;
      return;
    });
  }

  onClose() {
    this.dialogRef.close('NoData');
    this.loader = false;
  }

}
