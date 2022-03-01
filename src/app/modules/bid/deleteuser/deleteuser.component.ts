import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import _ = require('lodash');
import { BidService } from '../../../services/bid.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-deleteuser',
  templateUrl: './deleteuser.component.html',
  styleUrls: ['./deleteuser.component.css'],
  providers: [BidService, UsersService]
})
export class DeleteuserComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;

  bid_id;
  contributorToBeDeleted;
  bidResponseTypeWiseTasks = [];
  allContributorPendingTasks = [];
  bidData: any;
  user: any;

  constructor(public dialogRef: MatDialogRef<DeleteuserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public _bidService: BidService, public _userService: UsersService) {
    dialogRef.disableClose = true;

    this.contributorToBeDeleted = {
      user_id: data.user_id,
      pendingTasks: data.pendingTasks,
      name: data.contributorUserName || "Deleted User",
      user_type: data.user_type,
      user_subtype: data.user_subtype
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
    // this.getAvailableContributors();
    console.log("Hello Data 121212", this.bidResponseTypeWiseTasks)
    this.openContributorList();
  }

  ngOnInit() {

  }

  // getPendingTasks(contributors, cb) {

  //   let obj = {
  //     "bid_id": this.bid_id,
  //     "contributors": contributors
  //   }
  //   this._bidService.getPendingTask(obj).subscribe(result => {
  //     let pendingTasks = result['data'];
  //     if (!pendingTasks || !pendingTasks.length) {
  //       return cb([]);
  //     }
  //     return cb(pendingTasks); 
  //   })
  // }

  // assignPendingTasksCount() {
  //   let userPendingTasksMapping = {};
  //   this.allContributorPendingTasks.forEach(x => {
  //     if(!x.user_id || !(typeof(x.user_id) == "string")) {
  //       return false;
  //     }
  //     userPendingTasksMapping[x.user_id] = x.pendingTasks.count;
  //   });

  //   this.bidResponseTypeWiseTasks.forEach(typeObj => {
  //     typeObj.contributors.forEach(contributor => {
  //       let user_id = contributor["user_id"];
  //       contributor["count"] = userPendingTasksMapping[user_id] || 0;
  //     })
  //   });
  // }

  // getAllContributorPendingTasks() {
  //   let allContributorIds = [];
  //   this.bidResponseTypeWiseTasks.forEach(typeObj => {
  //     let contributors = typeObj.contributors.map(x => x.user_id);
  //     allContributorIds = allContributorIds.concat(contributors);
  //   });
  //   allContributorIds = _.uniq(allContributorIds);
  //   let self = this;
  //   this.getPendingTasks(allContributorIds, function (pendingTasks) {
  //     if (!pendingTasks.length) {
  //       return;
  //     }
  //     self.allContributorPendingTasks = pendingTasks;
  //     self.assignPendingTasksCount();
  //   });

  // }

  //  getAvailableContributors() {
  //   let obj = {
  //     "bid_id": this.bid_id
  //   }
  //   this._bidService.getBidResponseWiseContributors(obj).subscribe(result => {
  //     result = result["data"];
  //     if (!result) {
  //       // console.log("cannot find pending task contributors");
  //       this.dialogRef.close();
  //       return;
  //     }
  //     this.bidResponseTypeWiseTasks.forEach(typeObj => {
  //       let contributors = result[typeObj.type];
  //       //skip the contributorToBeDeleted from contributors list
  //       contributors = contributors.filter(x => x.user_id != this.contributorToBeDeleted.user_id);
  //       typeObj.contributors = contributors;
  //     })
  //     //assign pending tasks count to each available contribitor
  //     this.getAllContributorPendingTasks();
  //   })
  // }

  onClose() {
    this.dialogRef.close('NoData');
  }

  moduleType;
  contributorList
  openContributorList() {
    let contributor = [];
    contributor = this.bidData.contributor;
    contributor.push(this.user.user_id);
    if (this.bidData.user_id) {
      contributor.push(this.bidData.user_id);
    }
    contributor = _.concat(contributor,
      this.bidData.reviewer,
      this.bidData.coOwner);
    contributor = _.uniq(contributor);
    let obj = {
      "selectedUserIds": contributor,
      "user_type": "CONTRIBUTOR",
      "bid_id": this.bid_id,
      "bu_ids": this.bidData.bu_ids,
      "territory_ids": this.bidData.territory_ids
    }
    this._userService.getCompanyUserData(obj).subscribe(data => {
      if (data['data'] == null) {
        this.contributorList = [];
        return;
      }
      this.contributorList = [];
      let arr = data['data']['users'];
      arr.forEach(element => {
        let con = element.userTypes.filter(a => { return a.user_type == "CONTRIBUTOR" && a.user_subtype != 'Legal' });
        con.forEach(item => {
          let obj = {
            "username": element.username + " - " + item.user_subtype,
            "user_id": element.user_id,
            "user_type": item.user_type,
            "user_subtype": item.user_subtype 
          }
          this.contributorList.push(obj);
        });
      });
      // console.log("contributorList >>>>", this.contributorList);
    });
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
        this._alert.sweetSuccess("Contributor re-assignment done successfully")
      })
    }, cancel => {
      return;
    });
  }

  prepareReqData() {
    let submitData = this.bidResponseTypeWiseTasks.map(typeData => {
      let pendingTasks = typeData.pendingTasks;
      let contributors = this.contributorList

      pendingTasks.forEach(element => {
        element.draft = [element.draft[0]];
        element.draft[0].flag = true;
        contributors.forEach(con => {
          if (con.user_id == element.contributor) {
            element['user_type'] = con.user_type;
            element['user_subtype'] = con.user_subtype;
          }
        });
      })

      return { type: typeData.type, pendingTasks };
    });
    return submitData;
  }

  onReassign() {
    let submitData = this.prepareReqData();
    if (!this.validateSubmitData(submitData)) {
      this._alert.sweetError("Please select the Contributor for all tasks")
      return;
    }
    let obj = {
      "user_type": this.contributorToBeDeleted.user_type,
      "user_subtype": this.contributorToBeDeleted.user_subtype,
      submitData
    }
    this.submitReassignmentData(obj);
  }
}