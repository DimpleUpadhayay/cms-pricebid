import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { Bid } from '../../../models/bid.model';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import _ = require('lodash');

var rootScope;

@Component({
  selector: 'app-reassign-cowner-create-bid',
  templateUrl: './reassign-cowner-create-bid.component.html',
  styleUrls: ['./reassign-cowner-create-bid.component.css'],
  providers: [BidService, UsersService]
})
export class ReassignCownerCreateBidComponent implements OnInit {
  public bidForm;
  @ViewChild(AlertComponent) _alert: AlertComponent;
  bid_id;
  coOwnerToBeDeleted;
  bidResponseTypeWiseTasks = [];
  bidData: any;
  coOwnerList: any;
  bid;
  user;

  constructor(public dialogRef: MatDialogRef<ReassignCownerCreateBidComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public _bidService: BidService,public _formBuilder: FormBuilder,public _userService: UsersService) {
    dialogRef.disableClose = true;
    rootScope = this;
    rootScope.bid = new Bid();
    rootScope.bidForm = _formBuilder.group({
      bu_ids: ["", Validators.compose([Validators.required])],
      territory_ids: ["", Validators.compose([Validators.required])],
    });


    this.coOwnerToBeDeleted = {
      user_id: data.user_id,
      pendingTasks: data.pendingTasks,
      name : data.coOwnerUserName || "Deleted User",
      user_type : data.user_type,
      user_subtype : data.user_subtype
    }
    this.bid_id = data.bid_id;
    this.bidData = JSON.parse(localStorage.getItem('bidData'));
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];

    //divide pending tasks by bidResponseTypes
    let bidResponseTypes = ["solution", "proposal", "pricing", "docrequired"];
    bidResponseTypes.forEach(type => {
      let pendingTasks = data.pendingTasks[type];
      if (!(pendingTasks instanceof Array) || !pendingTasks.length) {
        return false;
      }
      pendingTasks.forEach(x => x.contributor = "");
      this.bidResponseTypeWiseTasks.push({ type, pendingTasks });
    })

    //assign available contributors for that bid to given type
    this.getAvailableCoOwner();
  }

  ngOnInit() {

  }

  getAvailableCoOwner() {
    let selectedUserIds = [];
    selectedUserIds.push(this.user.user_id);
    selectedUserIds = _.concat(selectedUserIds,
      this.bidData.reviewer,
      this.bidData.contributor);
    if (this.bidData.coOwner != "") {
      selectedUserIds.push(this.bidData.coOwner);
    }
    selectedUserIds = _.uniq(selectedUserIds);
    let obj = {
      "user_type": "BID_OWNER",
      "user_subtype": "Presales",
      "bid_id": this.bid_id,
      "bu_ids": this.bidData.bu_ids,
      "territory_ids": this.bidData.territory_ids,
      "selectedUserIds": selectedUserIds,
      "CoownerList": "yes"
    }
    rootScope._userService.getCompanyUserData(obj).subscribe(data => {
      if (data['data'] == null) {
        this.coOwnerList = [];
        return;
      }
      /* this.contributorList = data['data']['users'];
      this.contributorList.forEach(element => {
        element.username = element.user_subtype != null ? element.username + " - " + element.user_subtype : element.username;
      }); */
      this.coOwnerList = [];
      let arr = data['data']['users'];
      arr.forEach(element => {
        let con = element.userTypes.filter(a => { return a.user_type == "BID_OWNER" && a.user_subtype == "Presales" });
        con.forEach(item => {
          let obj = {
            "username": element.username + " - " + item.user_subtype,
            "user_id": element.user_id,
            "user_subtype": item.user_subtype,
            "user_type": item.user_type
          }
          this.coOwnerList.push(obj);
          this.coOwnerList = this.coOwnerList.filter(x => x.user_id != this.coOwnerToBeDeleted.user_id)
          this.coOwnerList = this.coOwnerList.filter(x => x.user_subtype == this.data.userTypes.user_subtype)
        });
      });
      // console.log("contributorList >>>>", this.coOwnerList);
    });
  }

  onClose() {
    this.dialogRef.close('NoData');
  }

  onChange(result){
    this.bidResponseTypeWiseTasks.map(typeData => {
      let pendingTasks = typeData.pendingTasks;
      pendingTasks.forEach(element => {
          element.contributor = result;
      })
    })
  }

  validateSubmitData(submitData) {
    let valid = submitData.every(typeData => {
      let pendingTasks = typeData.pendingTasks;
      let unassignedTask = pendingTasks.find(x => !x.contributor);
      if (unassignedTask) {
        return false;
      }
      return true;
    });
    return valid;
  }

  submitReassignmentData(reqObj) {
    this._alert.submitPS("").then(success => {
      this._bidService.submitMultipleReassignment(reqObj).subscribe(result => {
        this.dialogRef.close(reqObj);
        this._alert.sweetSuccess("Co-owner re-assignment done successfully")
      }, error => {

      })
    }, cancel => {
      return;
    });
  }

  prepareReqData() {
    let submitData = this.bidResponseTypeWiseTasks.map(typeData => {
      let pendingTasks = typeData.pendingTasks;
      let coOwner = this.coOwnerList;
      pendingTasks.forEach(element => {
        element.draft = [element.draft[0]];
        element.draft[0].flag = true;
        coOwner.forEach(cow => {
          if (cow.user_id == element.contributor) {
            element['user_type'] = cow.user_type;
            element['user_subtype'] = cow.user_subtype;
          }
        });
      })
      return { type: typeData.type, pendingTasks };
    });
    return submitData;
  }

  onReassign() {
    let submitData = this.prepareReqData();
    // console.log("Hello submitData", submitData)
    if (!this.validateSubmitData(submitData)) {
      this._alert.sweetError("Please select the Co-Owner for all tasks")
      return;
    }
    let obj = { 
      "user_type": this.coOwnerToBeDeleted.user_type,
      "user_subtype": this.coOwnerToBeDeleted.user_subtype,
      submitData
    }
    this.submitReassignmentData(obj);
  }

 
}
