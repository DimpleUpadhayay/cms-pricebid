import { Component, OnInit, Inject, OnDestroy, ViewChild, ɵConsole } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import _ = require('lodash');
import { BidService } from '../../../services/bid.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UsersService } from '../../../services/users.service';
import { Bid } from '../../../models/bid.model';
import { FormBuilder, Validators } from '@angular/forms';

var rootScope;

@Component({
  selector: 'app-delete-reviewer',
  templateUrl: './delete-reviewer.component.html',
  styleUrls: ['./delete-reviewer.component.css'],
  providers: [BidService, UsersService]
})

export class DeleteReviewerComponent implements OnInit {
  public bidForm;
  @ViewChild(AlertComponent) _alert: AlertComponent;
  bid_id;
  bidStatus = "";
  reviewerList: any;
  reviewer;
  bid;
  bu_ids;
  bids;
  territory_ids;
  reviewerToBeDeleted;
  bidResponseTypeWiseTasks = [];
  allReviewerPendingTasks = [];
  bidData: any;
  loader = false;
  user;
  constructor(public dialogRef: MatDialogRef<DeleteReviewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public _bidService: BidService, public _userService: UsersService,
    public _formBuilder: FormBuilder ){
    dialogRef.disableClose = true;
    rootScope = this;
    rootScope.bid = new Bid();
    rootScope.bidForm = _formBuilder.group({
      bu_ids: ["", Validators.compose([Validators.required])],
      territory_ids: ["", Validators.compose([Validators.required])],
    });
    this.reviewerToBeDeleted = {
      user_id: data.user_id,
      pendingTasks: data.pendingTasks,
      name: data.ReviewerUserName || "Deleted User",
      user_type: data.user_type,
      user_subtype: data.user_subtype
    }
    this.bid_id = data.bid_id;
    this.bidData = JSON.parse(localStorage.getItem('bidData'));
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];

    //divide pending tasks by bidResponseTypes
    let bidResponseTypes = ["solution_review", "proposal_review", "pre-pricing_review", "pricing_review", "legal_review"];
    bidResponseTypes.forEach(type => {
      let pendingTasks = data.pendingTasks[type];
      if (!(pendingTasks instanceof Array) || !pendingTasks.length) {
        return false;
      }
      pendingTasks.forEach(x => x.reviewer_id = "");
      this.bidResponseTypeWiseTasks.push({ type, pendingTasks });
    })
    //assign available contributors for that bid to given type
    // this.getAvailableReviewers();
    this.getReviewersReassignList();
  }

  ngOnInit() {

  }
  
  getReviewersReassignList(){
    this.reviewerList = [];
    let reviewer = [];
    reviewer = this.bidData.reviewer;
    reviewer.push(this.user.user_id);
    reviewer = _.concat(reviewer,
      this.bidData.contributor,
      this.bidData.coOwner);
    reviewer = _.uniq(reviewer);
    let obj = {
      "user_type": "REVIEWER",
      "bid_id": this.bid_id,
      "bu_ids": this.bidData.bu_ids,
      "territory_ids": this.bidData.territory_ids,
      "selectedUserIds": reviewer,
    }
    this._bidService.getReviewersReassignList(obj).subscribe(resp =>{
      if (resp['data'] == null)  {
        this.reviewerList = [];
        return;
      }
      let arr = [];
      arr = resp['data'];
      // Checking Type for Reviewers
      var typeReviewer;
      this.bidResponseTypeWiseTasks.map(typeData => {
        typeReviewer = typeData.type;
        if(typeReviewer == 'pre-pricing_review'){
          typeReviewer = 'delivery_reveiw';
        }
        if(typeReviewer == 'pricing_review'){
          typeReviewer = 'pricing_reveiw';
        }
      })
      this.reviewerList = resp['data'][typeReviewer]['data']
    }, error =>{

    })
  }

  onClose() {
    this.dialogRef.close('NoData');
  }

  validateSubmitData(submitData) {
    let valid = submitData.every(typeData => {
      let pendingTasks = typeData.pendingTasks;
      let unassignedTask = pendingTasks.find(x => !x.reviewer_id);
      if (unassignedTask) {
        return false;
      }
      return true;
    });
    return valid;
  }

  submitReassignmentData(reqObj) {
    this._alert.submitPS("").then(success => {
      this._bidService.submitReviewerReassignment(reqObj).subscribe(result => {
        this.dialogRef.close(reqObj);
        this._alert.sweetSuccess("Reviewer re-assignment done successfully")
      }, error => {

      }) 
    }, cancel => {
      return;
    });
  }

  prepareReqData() {
    let submitData = this.bidResponseTypeWiseTasks.map(typeData => {
      let pendingTasks = typeData.pendingTasks;
      let reviewers = this.reviewerList;
      pendingTasks.forEach(element => {
        element.draft = [element.draft[0]];
        element.draft[0].flag = true;
        reviewers.forEach(rev => {
          if (rev.user_id == element.reviewer_id) {
            element['user_type'] = rev.userTypes[0].user_type;
            element['user_subtype'] = rev.userTypes[0].user_subtype;
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
      this._alert.sweetError("Please select the Reviewer for all tasks")
      return;
    }
    let obj = { 
      "user_type": this.reviewerToBeDeleted.user_type,
      "user_subtype": this.reviewerToBeDeleted.user_subtype,
      submitData
    }
    this.submitReassignmentData(obj);
  }
}