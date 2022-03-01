import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material';
import _ = require('lodash');

import { PocDashboardService } from '../../../services/poc.service';
import { BidService } from '../../../services/bid.service';
import { SharedService } from '../../../services/shared.service';
import { HttpService } from '../../../services/http.service';

import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { BidDetailsComponent } from '../../../components/bid-details/bid-details.component';

@Component({
  selector: 'app-proposal-review',
  templateUrl: './proposal-review.component.html',
  styleUrls: ['./proposal-review.component.css'],
  providers: [UploadfileComponent, DownloadComponent]
})
export class ProposalReviewComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  @ViewChild(BidDetailsComponent) _bidDetails: BidDetailsComponent;
  otherReferences = [{
    "proposal_cat": "Other",
    "proposal_id": "Other",
    "item_id": "Other",
    "reference": "NA",
    "contributor": ""
  }, {
    "proposal_cat": "Review completed",
    "proposal_id": "Review completed",
    "item_id": "Review completed",
    "reference": "NA",
    "contributor": ""
  }];
  // Arrays
  references = [];
  attachment_data = [];
  propsCats = [];
  propsData = [];
  itemArray = [];
  contributors = [];
  reviewers = [];
  reviewArray = [];
  selectedItem = [];
  selectedMain = [];

  productType = 'pricing';
  temp = 0;
  reviewButton;
  mainData;
  responseData;
  reqObj;
  bid_id;
  user;
  user_type;
  user_subtype;
  userID;
  bidData;
  refreshObj = {};
  mySubscription;
  versionData;
  downloadIndex;
  access;
  tempCount = 0;
  poc;
  bidStatus = "";

  // Boolean Varialbes
  selectedFile: File = null;
  count: boolean = false;
  review = true;
  disableFlag = false;
  pocSubmited: boolean = false;
  approveReviewFlag = true;
  loader = false;
  fileAttached = false;
  allContributorReviewer: any;

  constructor(private _bidService: BidService, private dialog: MatDialog, private _activeRoute: ActivatedRoute,
    private _pocService: PocDashboardService, private _sharedService: SharedService, private _httpService: HttpService) {
    //set variables data
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.bid_id = _activeRoute.snapshot.parent.params['id'];
    this.userID = this.user.user_id;
    this.productType = this.user.product_type ? this.user.product_type : 'pricing';
    this.accessControl();
    // set bid data
    _bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bidData = resp['data']['bid'];
      this.allContributorReviewer = resp['data']['usersList'];
      this.bidStatus = this.bidData.bidFinalStatus ? this.bidData.bidFinalStatus : "";
      this.allContributorReviewer = resp['data']['usersList'];
      if (this.allContributorReviewer) {
        this.contributors = this.allContributorReviewer.contributorList.filter(a => {
          return a.userTypes[0].user_type == 'CONTRIBUTOR' || a.userTypes[0].user_type == 'BID_OWNER';
        });
        this.reviewers = this.allContributorReviewer.reviewerList.filter(a => {
          return a.userTypes[0].user_type == 'REVIEWER'
        });
      } else {
        this.contributors = this.bidData.participants.filter(a => {
          return a.userTypes[0].user_type == 'CONTRIBUTOR' || a.userTypes[0].user_type == 'BID_OWNER';
        });
        this.reviewers = this.bidData.participants.filter(a => {
          return a.userTypes[0].user_type == 'REVIEWER'
        });
      }
    });
    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: undefined,
      sub_module: "PROPOSAL_REVIEW"
    }
    // refresh call
    this.mySubscription = this._sharedService.newData.subscribe(a => {
      if (a.data && a.data == "proposal-review" && this.checkAction(this.responseData)/*  || this.user_type != "REVIEWER" */) {
        this.propsDataRead();
        this.readDataRefresh();
        // this._sharedService.reviewType.emit({ type: 'proposal' });
      }
    });
    this.propsDataRead();
    this.getPoc();
  }

  ngOnInit() {
    this.loader = true;
    // this._sharedService.reviewType.emit({ type: 'proposal' });
  }

  ngOnDestroy() {
    this.mySubscription.unsubscribe();
    this.dialog.closeAll();
  }

  accessControl() {
    this._httpService.accessControl({
      "module": "proposal_review",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": this.pocSubmited
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
    }, error => {
      this.loader = false;
    });
  }

  getContributorList() {
    this.contributors = this.allContributorReviewer.contributorList.filter(a => {
      return a.userTypes[0].user_type == 'CONTRIBUTOR' || a.userTypes[0].user_type == 'BID_OWNER';
    });
  }

  getReviewerList() {
    this.reviewers = this.allContributorReviewer.reviewerList.filter(a => {
      return a.userTypes[0].user_type == 'REVIEWER'
    });
  }

  // to check whether bid is under approval or not
  getPoc() {
    this._pocService.getPocDashboards({ bid_id: this.bid_id }).subscribe(data => {
      if (data['data'] == null) {
        return;
      }
      this.poc = data['data']['poc_list'][0];
      if (!this.poc) {
        return;
      }
      if (this.poc.status == "ACTIVE") {
        this.pocSubmited = true;
      }
    })
  }

  onChange(event, index) {
    for (var i = 0; i < this.references.length; i++) {
      if (event == this.references[i].proposal_id) {
        this.temp = i;
      }
    }
    this.responseData[this.tempCount].proposalReview_add[index].item_name = ""
    this.responseData[this.tempCount].proposalReview_add[index].item_id = ""
    this.responseData[this.tempCount].proposalReview_add[index].action_required_by = "";
    this.checkReviewApproval();
    if (event == 'Review completed') {
      let BM = this.contributors.filter(a => a.userTypes[0].coOwner);
      this.responseData[this.tempCount].proposalReview_add[index].action_required_by = BM[0].user_id;
      this.responseData[this.tempCount].proposalReview_add[index].item_id = "Review completed";
    }
  }

  checkReviewApproval() {
    let arr = [];
    arr = this.responseData[this.tempCount].proposalReview_add.filter(a => {
      return a.reviewer_id == this.userID
    })
    if (arr.length == 1 && arr[0].proposal_id == "Review completed") {
      this.approveReviewFlag = false;
    } else if (arr.length > 1) {
      let ind = this.propsCats.findIndex(a => a.proposal_id == "Review completed");
      if (ind > 0)
        this.propsCats.pop();
    } else if (arr.length == 1 && (arr[0].proposal_id != "Review completed")) {
      this.approveReviewFlag = true;
      let ind = this.propsCats.findIndex(a => a.proposal_id == "Review completed");
      if (ind < 0)
        this.propsCats.push({ proposal_cat: "Review completed", proposal_id: "Review completed" });
    } else {
      this.approveReviewFlag = true;
    }
  }

  // check whether reviewer is working or not
  checkAction(data) {
    var validate = true;
    if (data.length != 0) {
      data[data.length - 1].proposalReview_add.forEach(element => {
        if (element.draft[0].user == this.user.user_id && element.draft[0].flag == true) {
          if (element.draft[0].user_type != "REVIEWER") {
          } else {
            validate = false;
          }
        }
      });
    }
    return validate;
  }

  // check flags on review buttons
  onReviewButton(item) {
    this.createReferences();
    this.disableFlag = false;
    this.reviewButton = item.proposalReview_cat;
    let data = this.responseData[this.tempCount].proposalReview_add.filter(element => {
      return element.reviewer_id == this.userID;
    });
    if (data.length != 0) {
      if (!data[0].draft[0].flag) {
        this.disableFlag = true;
      }

      // for (let element of data) {
      //   if (element && element.draft.length > 0 && element.draft[0].flag == true) {
      //     this.disableFlag = false; /// Not Submitted
      //     return
      //   }
      //   else {
      //     this.disableFlag = true; ///  submitted
      //   }
      // }

    }
  }

  // change reference list according to proposal category
  onReferenceChange(event, i) {
    this.references.forEach(element => {
      if (element.item_id == event) {
        this.contributors.forEach(item => {
          if (item.user_id == element.contributor) {
            this.responseData[this.tempCount].proposalReview_add[i].action_required_by = item.user_id;
          }
        })
      }
    });
  }

  getSignatures(firstName, lastName) {
    if (firstName != undefined || lastName != undefined) {
      let name = (firstName.trim())[0].toUpperCase() + (lastName.trim())[0].toUpperCase()
      return name
    } else {
      return "NA";
    }
  }
 
  createReferences() {
    this.references = [];
    for (var i = 0; i < this.propsData.length; i++) {
      let obj;
      this.propsCats.push({ proposal_cat: this.propsData[i].proposal_cat, proposal_id: this.propsData[i].proposal_id });
      for (var j = 0; j < this.propsData[i].proposal_add.length; j++) {
        if ((this.responseData && (this.tempCount != this.responseData.length - 1)) || (this.responseData && this.responseData.length == 1)) {
          if (this.propsData[i].proposal_add[j].draft.length == 2 && !this.propsData[i].proposal_add[j].draft[1].flag) {
            let con = "";
            if (this.propsData[i].proposal_add[j].subItem && this.propsData[i].proposal_add[j].subItem.length > 0) {
              con = this.propsData[i].proposal_add[j].subItem[this.propsData[i].proposal_add[j].subItem.length - 1].contributor;
            } else {
              con = this.propsData[i].proposal_add[j].contributor;
            }
            obj = {
              "proposal_cat": this.propsData[i].proposal_cat,
              "proposal_id": this.propsData[i].proposal_id,
              "item_id": this.propsData[i].proposal_add[j].item_id,
              "reference": this.propsData[i].proposal_add[j].item_name,
              "contributor": con
            }
            this.references.push(obj);
          }
        } else if (this.responseData && (this.tempCount == this.responseData.length - 1)) {
          let con = "";
          if (this.propsData[i].proposal_add[j].subItem && this.propsData[i].proposal_add[j].subItem.length > 0) {
            con = this.propsData[i].proposal_add[j].subItem[this.propsData[i].proposal_add[j].subItem.length - 1].contributor;
          } else {
            con = this.propsData[i].proposal_add[j].contributor;
          }
          if (!this.checkSubmission()) {
            if ((this.propsData[i].proposal_add[j].subItem == undefined && !this.propsData[i].proposal_add[j].draft[1].flag) ||
              (this.propsData[i].proposal_add[j].subItem && this.propsData[i].proposal_add[j].subItem[this.tempCount - 1] == undefined && !this.propsData[i].proposal_add[j].subItem[this.propsData[i].proposal_add[j].subItem.length - 1].draft[1].flag) ||
              (this.propsData[i].proposal_add[j].subItem && this.propsData[i].proposal_add[j].subItem.length != 0 && (this.propsData[i].proposal_add[j].subItem[this.tempCount - 1] && !this.propsData[i].proposal_add[j].subItem[this.tempCount - 1].draft[1].flag))) {
              obj = {
                "proposal_cat": this.propsData[i].proposal_cat,
                "proposal_id": this.propsData[i].proposal_id,
                "item_id": this.propsData[i].proposal_add[j].item_id,
                "reference": this.propsData[i].proposal_add[j].item_name,
                "contributor": con
              }
              this.references.push(obj);
            }
          } else {
            obj = {
              "proposal_cat": this.propsData[i].proposal_cat,
              "proposal_id": this.propsData[i].proposal_id,
              "item_id": this.propsData[i].proposal_add[j].item_id,
              "reference": this.propsData[i].proposal_add[j].item_name,
              "contributor": con
            }
            this.references.push(obj);
          }
        }
      }
    }
    if (this.mainData) {
      this.addMainReference();
    }
    this.references = this.references.concat(this.otherReferences);
    this.references = _.uniqBy(this.references, 'item_id');
    this.propsCats = _.unionBy(this.propsCats, 'proposal_id');
  }

  checkSubmission() {
    let validate = true;
    let arr = this.responseData[this.responseData.length - 1].proposalReview_add.filter(a => { return a.reviewer_id == this.userID });
    if (arr.length != 0 && arr[0].draft[0].flag) {
      validate = false
    }
    return validate;
  }

  // review data
  readData() {
    this.loader = true;
    this._sharedService.reviewType.emit({ type: 'proposal' });
    this._bidService.getProposalReviewData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this.responseData = [];
          this.loader = false;
          return;
        }
        this.responseData = [];
        this.itemArray = [];
        let reviewResponse = resp['data']['reviewtab_data'];
        this.loader = false;
        let obj = {
          // "participants": [],
          "ProposalReview_flag": false,
          "bid_id": "",
          "proposalReview_cat": "",
          "status": "",
          "created_by": "",
          "proposalReview_id": "",
          "date_created": "",
          "date_modified": "",
          "modified_by": "",
          "proposalReview_add": []
        };
        reviewResponse.forEach(element => {
          let respo_a = element.proposalReview_add.filter(a => {
            if (a.action_required_by == this.userID) {
              return a;
            }
          });
          let respo_b = element.proposalReview_add.filter(a => {
            if (a.action_required_by != this.userID) {
              return a;
            }
          });
          obj = {
            // "participants": element.participants,
            "ProposalReview_flag": element.ProposalReview_flag,
            "bid_id": element.bid_id,
            "proposalReview_cat": element.proposalReview_cat,
            "status": element.status,
            "created_by": element.created_by,
            "proposalReview_id": element.proposalReview_id,
            "date_created": element.date_created,
            "date_modified": element.date_modified,
            "modified_by": element.modified_by,
            "proposalReview_add": respo_a.concat(respo_b)
          };
          this.responseData.push(obj);
        });
        this.responseData.forEach(element => {
          if (element.proposalReview_add.length == 0) {
            let obj = {
              comment: "",
              solution_id: "",
              item_id: "",
              action_required_by: "",
              reviewer_id: this.userID,
              attachment_data: [],
              draft: [{
                user: this.userID,
                user_type: this.user_type,
                flag: true
              }],
              action: true
            }
            element.proposalReview_add.push(obj);
            this.itemArray.push(obj);
          }
        });
        this.tempCount = this.responseData.length - 1;
        this.onReviewButton(this.responseData[this.responseData.length - 1]);
        this.checkReviewApproval();
      }, error => {
        this.loader = false;
      });

  }

  readDataRefresh() {
    this._sharedService.reviewType.emit({ type: 'proposal' });
    this._bidService.getProposalReviewData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this.responseData = [];
          return;
        }
        this.responseData = [];
        this.itemArray = [];
        let reviewResponse = resp['data']['reviewtab_data'];
        this.loader = false;
        let obj = {
          // "participants": [],
          "ProposalReview_flag": false,
          "bid_id": "",
          "proposalReview_cat": "",
          "status": "",
          "created_by": "",
          "proposalReview_id": "",
          "date_created": "",
          "date_modified": "",
          "modified_by": "",
          "proposalReview_add": []
        };
        reviewResponse.forEach(element => {
          let respo_a = element.proposalReview_add.filter(a => {
            if (a.action_required_by == this.userID) {
              return a;
            }
          });
          let respo_b = element.proposalReview_add.filter(a => {
            if (a.action_required_by != this.userID) {
              return a;
            }
          });
          obj = {
            // "participants": element.participants,
            "ProposalReview_flag": element.ProposalReview_flag,
            "bid_id": element.bid_id,
            "proposalReview_cat": element.proposalReview_cat,
            "status": element.status,
            "created_by": element.created_by,
            "proposalReview_id": element.proposalReview_id,
            "date_created": element.date_created,
            "date_modified": element.date_modified,
            "modified_by": element.modified_by,
            "proposalReview_add": respo_a.concat(respo_b)
          };
          this.responseData.push(obj);
        });
        this.responseData.forEach(element => {
          if (element.proposalReview_add.length == 0) {
            let obj = {
              comment: "",
              solution_id: "",
              item_id: "",
              action_required_by: "",
              reviewer_id: this.userID,
              attachment_data: [],
              draft: [{
                user: this.userID,
                user_type: this.user_type,
                flag: true
              }],
              action: true
            }
            element.proposalReview_add.push(obj);
            this.itemArray.push(obj);
          }
        });
        this.tempCount = this.responseData.length - 1;
        this.onReviewButton(this.responseData[this.responseData.length - 1]);
      }, error => {
      });
  }

  // proposal data to create category and reference list
  propsDataRead() {
    this._bidService.getProposalData({ "bid_id": this.bid_id, "user": this.userID, "status": "ACTIVE" }).subscribe((resp) => {
      if (resp['data'] == null) {
        this.loader = false;
        this.mainDataRead();
      } else {
        this.propsCats = [];
        this.propsData = resp['data'] ? resp['data'] : [];
        this.createReferences();
        this.mainDataRead();
      }
    }, error => {
      this.propsCats = [];
      this.loader = false;
      this.mainDataRead();
    });
  }

  addMainReference() {
    for (var i = 0; i < this.mainData[0].main_add.length; i++) {
      let obj = {
        "proposal_cat": "Main",
        "proposal_id": this.mainData[0].maintab_id,
        "item_id": this.mainData[0].main_add[i].item_id,
        "reference": this.mainData[0].main_add[i].item_name,
        "contributor": this.mainData[0].created_by
      }
      this.references.push(obj);
      if (i == this.mainData.length - 1) {
        this.references.forEach(item => {
          if (this.references.length - 1 == this.references.indexOf(item)) {
            this.count = true;
          }
        })
      }
    }
  }

  // main data to create category and reference list
  mainDataRead() {
    let obj;
    this._bidService.getMainData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" }).subscribe(resp => {
      if (resp['data'] == null) {
        this.readData();
        this.loader = false;
        this.propsCats.push({ proposal_cat: "Other", proposal_id: "Other" });
        this.propsCats.push({ proposal_cat: "Review completed", proposal_id: "Review completed" });
      } else {
        this.mainData = resp['data']['maintab_data'];
        this.propsCats.push({ proposal_cat: "Main", proposal_id: this.mainData[0].maintab_id });
        this.propsCats.push({ proposal_cat: "Other", proposal_id: "Other" });
        this.propsCats.push({ proposal_cat: "Review completed", proposal_id: "Review completed" });
        this.addMainReference();
        this.readData();
      }
    }, error => {
      this.loader = false;
      this.readData();
      this.propsCats.push({ proposal_cat: "Main", proposal_id: this.mainData[0].maintab_id });
      this.propsCats.push({ proposal_cat: "Other", proposal_id: "Other" });
      this.propsCats.push({ proposal_cat: "Review completed", proposal_id: "Review completed" });
    });
  }

  addRow(tempCount) {
    let reqData = {
      comment: "",
      proposal_id: "",
      item_id: "",
      action_required_by: "",
      reviewer_id: this.userID,
      attachment_data: [],
      draft: [{
        user: this.userID,
        user_type: this.user_type,
        flag: true
      }],
      action: true
    }
    this.responseData[tempCount].proposalReview_add.push(reqData);
    this.itemArray.push(this.responseData[tempCount].proposalReview_add[this.responseData[tempCount].proposalReview_add.length - 1]);
    this.checkReviewApproval();
  }

  deleteRow(index) {
    let dataval = this.responseData[this.tempCount].proposalReview_add[index];
    if (this.user_type == "REVIEWER" && !dataval.draft[0].flag) {
      return false;
    }
    if (this.user_type != "REVIEWER" || dataval.reviewer_id != this.userID) {
      this._alert.sweetError("Sorry, You are not authorised to delete")
      return false;
    }
    if (this.tempCount != this.responseData.length - 1 || this.responseData[this.responseData.length - 1].proposalReview_add.length == 1) {
      return;
    }
    if (dataval.comment_id == undefined) {
      let ind = this.itemArray.findIndex(item => {
        return dataval.proposal_cat == item.proposal_cat && dataval.item_name == item.item_name && dataval.comment == item.comment && dataval.action_required_by == item.action_required_by;
      })
      this.responseData[this.responseData.length - 1].proposalReview_add.splice(index, 1);
      this.itemArray.splice(ind, 1);
      this.checkReviewApproval();
      return;
    }
    // delete row by API call if it is saved in database
    this._alert.deleted("").then(success => {
      this.loader = true
      let data = {
        "comment_id": this.responseData[this.responseData.length - 1].proposalReview_add[index].comment_id,
        "proposalReview_id": this.responseData[this.responseData.length - 1].proposalReview_id
      }
      this._bidService.removeItemProposalReview(data)
        .subscribe((resp) => {
          this.responseData[this.responseData.length - 1].proposalReview_add.splice(index, 1);
          this.checkReviewApproval();
          this.loader = false
        }, error => {
          this.loader = false
        });
    }, cancel => {
      return;
    });
  }

  checkUser() {
    let flag = true;
    if (this.access && this.access.writeAccess) {
      flag = false;
    }
    return flag;
  }

  onFileSelected(event) {
    this.selectedFile = <File>event.target.files[0];
  }

  onUpload(index) {
    let document = this.responseData[this.tempCount].proposalReview_add[index];
    if (this.user_type != "REVIEWER" || document.reviewer_id != this.userID) {
      this._alert.sweetError("Sorry, You are not authorised to upload documents")
      return false;
    }
    else if (this.responseData && this.responseData.length - 1 != this.tempCount || !document.draft[0].flag) {
      return false;
    } else {
      this.openDialog(index);
    }
  }

  openDialog(index): void {
    let obj = {
      "bid_id": this.bid_id,
      "type": 'proposal-review'
    }
    const dialogRef = this.dialog.open(UploadfileComponent, {
      height: '340px',
      width: '850px',
      data: this.versionData ? this.versionData : obj
    });
    dialogRef.afterClosed().subscribe(result => {
      this.versionData = undefined;
      if (!result || result.length == 0) {
        return
      }
      for (var i = 0; i < result.length; i++) {
        let obj;
        obj = {
          "attachment_id": result[i].attachment_id,
          "attachment_n": result[i].original_name,
          "attachment_path": result[i].filename,
          "description": result[i].description,
          "type": "BID_DEV_PROPOSAL_REVIEW",
          "doc_version": result[i].doc_version,
          "user_id": result[i].user_id,
          "revision": result[i].revision ? result[i].revision : false,
          "parent_id": result[i].parent_id ? result[i].parent_id : "",
          "flag": result[i].flag,
          "isPublic": result[i].isPublic,
          "level": result[i].level
        }
        this.attachment_data.push(obj)
      }
      if (this.responseData[this.tempCount].proposalReview_add[index].attachment_data) {
        this.attachment_data.forEach(item => {
          this.responseData[this.tempCount].proposalReview_add[index].attachment_data.push(item);
        });
      } else {
        this.responseData[this.tempCount].proposalReview_add[index].attachment_data = this.attachment_data;
      }
      this.attachment_data = [];
      if (result.length != 0) {
        this.fileAttached = true;
        this.onSaveAsDraft();
      }
    });
  }

  onDownloadDialog(index) {
    if (this.responseData[this.tempCount].proposalReview_add[index].attachment_data.length == 0) {
      this._alert.sweetNoAttachments();
      return;
    }
    this.downloadIndex = index;
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '365px',
      width: '850px',
      data: this.responseData[this.tempCount].proposalReview_add[index]
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      } else if (result == true) {
        this.fileAttached = true;
        this.onSaveAsDraft();
      } else {
        this.versionData = result;
        this.openDialog(this.downloadIndex);
      }
    });
  }

  // save as draft call after upload and delete attachment
  updateAttachments() {
    this._bidService.saveAsDraftProposalReview(this.reqObj).subscribe(resp => {
      this._alert.sweetSuccess("Saved as draft successfully");
      this.readDataRefresh();
    })
  }

  newValidate() {
    let validate = true;
    this.responseData[this.responseData.length - 1].proposalReview_add.forEach(element => {
      for (let item in element) {
        if (item == 'item_id' || item == 'proposal_id' || item == 'comment' || item == "action_required_by") {
          element[item] === '' ? validate = false : '';
        }
      }
    });
    return validate;
  }

  // reset review data
  onReset() {
    this.responseData[this.tempCount].proposalReview_add.forEach(resp => {
      if (resp.draft[0].flag == true || resp.draft.length == 0) {
        resp.proposal_id = "";
        resp.item_id = "";
        resp.comment = "";
        resp.action_required_by = "";
        resp.attachment_data = [];
      }
    });
  }

  // save as draft
  onSaveAsDraft() {
    this.loader = true
    this.reqObj = {
      "proposalReview_id": this.responseData[this.responseData.length - 1].proposalReview_id,
      "bid_id": this.bid_id,
      "proposalReview_add": [],
      'user_type': this.access.participants[0].userTypes[0].user_type,
      'user_subtype': this.access.participants[0].userTypes[0].user_subtype
    }
    let newData = this.responseData[this.responseData.length - 1].proposalReview_add.filter(a => {
      return a.comment_id == undefined;
    });
    for (var i = 0; i < newData.length; i++) {
      newData[i].proposal_id = this.itemArray[i].proposal_id;
      newData[i].item_id = this.itemArray[i].item_id;
      newData[i].reviewer_id = this.user.user_id;
    }
    let reviewerData = this.responseData[this.responseData.length - 1].proposalReview_add.filter(a => {
      return a.reviewer_id == this.userID;
    })
    this.reqObj.proposalReview_add = reviewerData;
    this._bidService.saveAsDraftProposalReview(this.reqObj).subscribe(resp => {
      if (!this.fileAttached) {
        this._alert.sweetSuccess("Saved as draft successfully");
      }
      this.fileAttached = false;
      this.loader = false
      this.readDataRefresh();
    }, error => {
      this.loader = false
    })
  }

  // submit
  onSubmit() {
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    this.reqObj = {
      "proposalReview_id": this.responseData[this.responseData.length - 1].proposalReview_id,
      "bid_id": this.bid_id,
      "proposalReview_add": [],
      'user_type': this.access.participants[0].userTypes[0].user_type,
      'user_subtype': this.access.participants[0].userTypes[0].user_subtype
    }
    let newData = this.responseData[this.responseData.length - 1].proposalReview_add.filter(a => {
      return a.comment_id == undefined;
    });
    for (var i = 0; i < newData.length; i++) {
      newData[i].proposal_id = this.itemArray[i].proposal_id;
      newData[i].item_id = this.itemArray[i].item_id;
      newData[i].reviewer_id = this.user.user_id;
    }
    let reviewerData = this.responseData[this.responseData.length - 1].proposalReview_add.filter(a => {
      return a.reviewer_id == this.userID;
    })
    this.reqObj.proposalReview_add = reviewerData;
    if (this.reqObj.proposalReview_add.length == 0) {
      this._alert.sweetError("Please enter inputs");
      return;
    }
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.submitProposalReview(this.reqObj).subscribe(resp => {
        this.responseData = [];
        this.loader = false
        this.readDataRefresh();
        // this._sharedService.reviewType.emit({ type: 'proposal' });
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        }, cancel => {
        });
      }, error => {
        this.loader = false
      });
    }, cancel => {
      this.selectedMain = [];
      this.selectedItem = [];
      return;
    });
  }

  // Approve
  onApprove() {
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    this.reqObj = {
      "proposalReview_id": this.responseData[this.responseData.length - 1].proposalReview_id,
      "bid_id": this.bid_id,
      "proposalReview_add": [],
      'user_type': this.access.participants[0].userTypes[0].user_type,
      'user_subtype': this.access.participants[0].userTypes[0].user_subtype
    }
    let newData = this.responseData[this.responseData.length - 1].proposalReview_add.filter(a => {
      return a.comment_id == undefined;
    });
    for (var i = 0; i < newData.length; i++) {
      newData[i].proposal_id = this.itemArray[i].proposal_id;
      newData[i].item_id = this.itemArray[i].item_id;
      newData[i].reviewer_id = this.user.user_id;
    }
    let reviewerData = this.responseData[this.responseData.length - 1].proposalReview_add.filter(a => {
      return a.reviewer_id == this.userID;
    })
    this.reqObj.proposalReview_add = reviewerData;
    if (this.reqObj.proposalReview_add.length == 0) {
      this._alert.sweetError("Please enter inputs");
      return;
    }
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.submitApprovalProposalReview(this.reqObj).subscribe(resp => {
        this.responseData = [];
        this.loader = false
        this.readDataRefresh();
        // this._sharedService.reviewType.emit({ type: 'proposal' });
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        }, cancel => {
        });
      }, error => {
        this.loader = false
      });
    }, cancel => {
      this.selectedMain = [];
      this.selectedItem = [];
      return;
    });
  }

  disbaleSubmitButtons() {
    let flag = false;
    if (this.responseData && (this.responseData.length - 1 != this.tempCount) || this.disableFlag) {
      flag = true;
    }
    return flag;
  }
}