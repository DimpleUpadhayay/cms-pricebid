import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import _ = require('lodash');
import { AlertComponent } from '../../../libraries/alert/alert.component';

@Component({
  selector: 'app-delete-sales-manager',
  templateUrl: './delete-sales-manager.component.html',
  styleUrls: ['./delete-sales-manager.component.css'],
  providers: [BidService, UsersService]
})
export class DeleteSalesManagerComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;

  bid_id;
  bidManagerId;
  newBidManagerId;
  bidData: any;
  user: any;
  salesManagerList: any;
  oldBidManagerName;
  salesArray = [{
    "newSalesUserId": ""
  }]
  loader = false;
  constructor(public dialogRef: MatDialogRef<DeleteSalesManagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public _bidService: BidService,
    public _userService: UsersService) {
    this.bid_id = data.bid_id;
    this.oldBidManagerName = data.bidManagerName;
    this.bidData = JSON.parse(localStorage.getItem('bidData'));
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.openSalesManagerList();
    // console.log("Hello Data", data)
  }

  ngOnInit() {

  }

  openSalesManagerList() {
    let BidManager = [];
    BidManager = this.bidData.contributor;
    BidManager.push(this.user.user_id);
    if (this.bidData.user_id) {
      BidManager.push(this.bidData.user_id);
    }
    BidManager = _.concat(BidManager,
      this.bidData.reviewer,
      this.bidData.coOwner);
    BidManager = _.uniq(BidManager);
    let obj = {
      "selectedUserIds": BidManager,
      "user_type": "BID_OWNER",
      "user_subtype": "Sales",
      "bid_id": this.bid_id,
      "bu_ids": this.bidData.bu_ids,
      "territory_ids": this.bidData.territory_ids
    }
    this._userService.getCompanyUserData(obj).subscribe(data => {
      if (data['data'] == null) {
        this.salesManagerList = [];
        return;
      }
      this.salesManagerList = [];
      let arr = data['data']['users'];
      arr.forEach(element => {
        let con = element.userTypes.filter(a => { return a.user_type == "BID_OWNER" && a.user_subtype == "Sales" });
        con.forEach(item => {
          let obj = {
            "username": element.username + " - " + item.user_subtype,
            "user_id": element.user_id,
            "user_type": item.user_type,
            "user_subtype": item.user_subtype
          }
          this.salesManagerList.push(obj);
        });
      });
      // console.log("contributorList >>>>", this.contributorList);
    });
  }

  onClose() {
    this.dialogRef.close('NoData');
    this.loader = false;
  }

  salesPersonId;
  onReassign() {
    let flag = false;
    this.salesArray.filter(element => {
      this.salesPersonId = element.newSalesUserId;
      if (element.newSalesUserId == "") {
        flag = true
      }
    })
    if (flag) {
      this._alert.sweetError("Please Select Sales Manager")
      return
    }
    let obj = {
      "bid_id": this.data.bid_id,
      "user_id": this.data.BidManagerId,
      "new_user_id": this.salesPersonId
    }
    this.loader = true
    this._alert.submitPS("").then(success => {
      this._bidService.deleteSalesManager(obj).subscribe(result => {
        this.loader = false;
        this.dialogRef.close('SalesManager');
        this._alert.sweetSuccess("Bid Manager re-assign sucessfully")
      }, error => {
        this.loader = false;
      })
    }, cancel => {
      this.loader = false;
      return;
    });
  }
} 
