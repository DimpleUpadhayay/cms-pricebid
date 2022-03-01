import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { MatDialog } from '@angular/material';
import { DownloadComponent } from '../../../components/download/download.component';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-legal-review',
  templateUrl: './legal-review.component.html',
  styleUrls: ['./legal-review.component.css'],
  providers: [BidService]
})
export class LegalReviewComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) _alert: AlertComponent;

  bid_id;
  user;
  userID;
  response = [];
  legalReviewData;
  legalReviewFlag = true;
  tempCount = 0;
  reviewButton;
  itemArray = [];
  disableFlag = false;
  versionData;
  attachment_data = [];
  downloadIndex;
  bidManager = [];
  legalReviewers = [];
  bidData;
  reqObj;
  loader = false;
  pocSubmited = false;
  access;
  user_type;
  user_subtype;
  company_id;
  refreshObj = {}
  mySubscription;
  approveReviewFlag = true;
  bidStatus = ""
  allContributorReviewer: any;

  constructor(private _bidService: BidService, public dialog: MatDialog, private _sharedService: SharedService, private _activeRoute: ActivatedRoute, private _httpService: HttpService) {
    this.bid_id = _activeRoute.snapshot.parent.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user']
    this.userID = this.user.user_id;

    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: undefined,
      sub_module: "LEGAL_REVIEW"
    }
    // refresh call
    this.mySubscription = this._sharedService.newData.subscribe(a => {
      if (a.data && a.data == "legal-review" && this.checkAction()) {
        this.readDataRefresh();
        this._sharedService.reviewType.emit({ type: 'legal-review' });
      }
    }, error => {

    })
  }

  ngOnInit() {
    this.accessControl();
    this._sharedService.reviewType.emit({ type: 'legal-review' });
  }

  ngOnDestroy() {
    this.mySubscription.unsubscribe();
    this.dialog.closeAll();
  }

  accessControl() {
    this._httpService.accessControl({
      "module": "legal_review",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": this.pocSubmited
    }).subscribe(response => {
      // console.log(response);
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
      this.getBidById();
      // this.getReview();
      // this.getPrePricingReview();
      // this.getPoc();
      // this.getProjectScope();
      this.readData()
    }, error => {
      console.log(error);
      this.loader = false;
    });
  }

  checkAction() {
    let validate = true;
    let data = this.response[this.response.length - 1].legalReview_add;

    if (this.access.writeAccess) {
      if (data.length != 0) {
        let d = data.filter(a => {
          return a.reviewer_id == this.userID
        });
        if (d.length != 0 && d[0].draft[0].flag) {
          validate = false;
        }
      }
    }
    return validate;
  }

  getBidById() {
    this._bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bidData = resp['data']['bid'];
      this.bidStatus = this.bidData.bidFinalStatus ? this.bidData.bidFinalStatus : "";
      this.allContributorReviewer = resp['data']['usersList'];
      this.bidManager = this.bidData.participants.filter(a => {
        return a.userTypes[0].user_type == 'BID_OWNER' && !a.userTypes[0].coOwner;
      });
      if (this.allContributorReviewer) {
        this.legalReviewers = this.allContributorReviewer.reviewerList.filter(a => {
          return a.userTypes[0].user_type == "REVIEWER" && (a.userTypes[0].user_subtype == 'Legal' || a.userTypes[0].user_subtype == 'Finance')
        });
      }
      else {
        this.legalReviewers = this.bidData.participants.filter(a => {
          return a.userTypes[0].user_type == "REVIEWER" && (a.userTypes[0].user_subtype == 'Legal' || a.userTypes[0].user_subtype == 'Finance')
        })
      }
    });
  }

  readData() {
    let obj = {
      "bid_id": this.bid_id
    }
    this.loader = true;
    this._bidService.getLegalReviewData(obj).subscribe(result => {
      if (result['data'] == true) {
        this.loader = false;
        return false;
      }
      this.response = result['data']['reviewtab_data'];
      this.legalReviewFlag = this.response[this.response.length - 1].legalReview_flag;
      this.manipulation();
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }

  manipulation() {
    this.response.forEach(element => {
      if (element.legalReview_add.length == 0) {
        let obj = {
          comment: "",
          action_required_by: "",
          reviewer_id: this.userID,
          attachment_data: [],
          draft: [{
            user: this.userID,
            user_type: this.user.user_type,
            flag: true
          }],
          action: true
        }
        element.legalReview_add.push(obj);
        this.itemArray.push(obj);
      }
    });
    this.tempCount = this.response.length - 1;
    this.onReviewButton(this.response[this.response.length - 1]);
  }

  readDataRefresh() {
    let obj = {
      "bid_id": this.bid_id
    }
    this._bidService.getLegalReviewData(obj).subscribe(result => {
      // console.log(">>result", result)
      if (result['data'] == true) {
        return false;
      }
      this.response = result['data']['reviewtab_data'];
      this.legalReviewFlag = this.response[this.response.length - 1].legalReview_flag;
      this.manipulation();
    });
  }

  onReviewButton(item) {
    this.disableFlag = false;
    this.reviewButton = item.legalReview_cat;
    // this.reviewNewData = this.response[this.tempCount].legalReview_add;
    // this.checkReviewStatus();
    let data = this.response[this.tempCount].legalReview_add.filter(element => {
      return element.reviewer_id == this.userID;
    });
    if (data.length != 0) {
      if (!data[0].draft[0].flag) {
        this.disableFlag = true;
      }
    }
  }

  onChange(event) {
    if (event == "noActionRequired") {
      this.approveReviewFlag = false;
    }
    else {
      this.approveReviewFlag = true;
    }
  }

  addRow(tempCount) {
    let reqData = {
      comment: "",
      action_required_by: "",
      reviewer_id: this.userID,
      attachment_data: [],
      draft: [{
        user: this.userID,
        user_type: this.user.user_type,
        flag: true
      }],
      action: true
    }
    this.response[tempCount].legalReview_add.push(reqData);
    this.itemArray.push(this.response[tempCount].legalReview_add[this.response[tempCount].legalReview_add.length - 1]);
    // this.checkReviewApproval();
  }

  deleteRow(index) {
    let dataval = this.response[this.tempCount].legalReview_add[index];
    /* if ((this.user.user_type != "REVIEWER" && this.user.user_subtype != "Legal") && !dataval.draft[0].flag) {
      return false;
    } */
    if (!this.access.writeAccess || dataval.reviewer_id != this.userID) {
      this._alert.sweetError("Sorry, You are not authorised to delete")
      return false;
    }
    if (this.tempCount != this.response.length - 1 || this.response[this.response.length - 1].legalReview_add.length == 1 || this.bidStatus == 'DROPPED') {
      return;
    }
    if (dataval.comment_id == undefined) {
      let ind = this.itemArray.findIndex(item => {
        return dataval.legalReview_cat == item.legalReview_cat && dataval.comment == item.comment && dataval.action_required_by == item.action_required_by;
      })
      this.response[this.response.length - 1].legalReview_add.splice(index, 1);
      this.itemArray.splice(ind, 1);
      // this.checkReviewApproval();
      return;
    }
    // delete row by API call if it is saved in database
    this._alert.deleted("").then(success => {
      this.loader = true
      let data = {
        "comment_id": this.response[this.response.length - 1].legalReview_add[index].comment_id,
        "legalReview_id": this.response[this.response.length - 1].legalReview_id
      }
      this._bidService.removeItemReview(data)
        .subscribe((resp) => {
          this.response[this.response.length - 1].legalReview_add.splice(index, 1);
          // this.checkReviewApproval();
          this.loader = false
        }, error => {
          this.loader = false
        });
    }, cancel => {
      return;
    });
  }

  uploadFlag = false;
  onUpload(index) {
    let document = this.response[this.tempCount].legalReview_add[index];
    if (!this.access.writeAccess || document.reviewer_id != this.userID) {
      this._alert.sweetError("Sorry, You are not authorised to upload documents")
      return false;
    }
    else if (this.response && this.response.length - 1 != this.tempCount || !document.draft[0].flag || this.bidStatus == 'DROPPED') {
      return false;
    } else {
      this.openDialog(index);
    }
  }

  fileAttached = false;
  openDialog(index): void {
    let obj = {
      "bid_id": this.bid_id,
      "type": 'legal-review'
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
          "type": "BID_DEV_LEGAL_REVIEW",
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
      if (this.response[this.tempCount].legalReview_add[index].attachment_data) {
        this.attachment_data.forEach(item => {
          this.response[this.tempCount].legalReview_add[index].attachment_data.push(item);
        });
      } else {
        this.response[this.tempCount].legalReview_add[index].attachment_data = this.attachment_data;
      }
      this.attachment_data = [];
      if (result.length != 0) {
        this.fileAttached = true;
        this.onSaveAsDraft();
      }
    });
  }

  onDownloadDialog(index) {
    if (this.response[this.tempCount].legalReview_add[index].attachment_data.length == 0) {
      this._alert.sweetNoAttachments();
      return;
    }
    this.downloadIndex = index;
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '365px',
      width: '850px',
      data: this.response[this.tempCount].legalReview_add[index]
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
  // save as draft
  onSaveAsDraft() {
    this.reqObj = {
      "legalReview_id": this.response[this.response.length - 1].legalReview_id,
      "bid_id": this.bid_id,
      "legalReview_add": [],
      'user_type': this.user.user_type,
      'user_subtype': this.user.user_subtype
    }
    let newData = this.response[this.response.length - 1].legalReview_add.filter(a => {
      return a.comment_id == undefined;
    });
    for (var i = 0; i < newData.length; i++) {
      newData[i].reviewer_id = this.user.user_id;
    }
    let reviewerData = this.response[this.response.length - 1].legalReview_add.filter(a => {
      return a.reviewer_id == this.userID;
    })
    this.reqObj.legalReview_add = reviewerData;
    this.loader = true
    this._bidService.SaveasDraftLegalReviewData(this.reqObj).subscribe(resp => {
      if (!this.fileAttached) {
        this._alert.sweetSuccess("Saved as draft successfully");
      }
      this.fileAttached = false;
      this.response = resp['data']['reviewtab_data'];
      this.manipulation();
      this.loader = false;
      // this.readDataRefresh();
    }, error => {
      this.loader = false;
    })
  }

  newValidate() {
    let validate = true;
    this.response[this.response.length - 1].legalReview_add.forEach(element => {
      for (let item in element) {
        if (item == 'comment' || item == "action_required_by") {
          element[item] === '' ? validate = false : '';
        }
      }
    });
    return validate;
  }

  // submit
  onSubmit() {
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    this.reqObj = {
      "legalReview_id": this.response[this.response.length - 1].legalReview_id,
      "bid_id": this.bid_id,
      "legalReview_add": [],
      'user_type': this.user.user_type,
      'user_subtype': this.user.user_subtype
    }
    let newData = this.response[this.response.length - 1].legalReview_add.filter(a => {
      return a.comment_id == undefined;
    });
    for (var i = 0; i < newData.length; i++) {
      newData[i].reviewer_id = this.user.user_id;
    }
    let reviewerData = this.response[this.response.length - 1].legalReview_add.filter(a => {
      return a.reviewer_id == this.userID;
    })
    this.reqObj.legalReview_add = reviewerData;
    if (this.reqObj.legalReview_add.length == 0) {
      this._alert.sweetError("Please enter inputs");
      return;
    }
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.SubmitLegalReviewData(this.reqObj).subscribe(resp => {
        this.response = [];
        this.disableFlag = true;
        this.response = resp['data']['reviewtab_data'];
        this.manipulation();
        this._sharedService.reviewType.emit({ type: 'legal-review' });
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        }, cancel => {
        });
        this.loader = false;
      }, error => {
        this.loader = false
      });
    }, cancel => {
      // this.selectedMain = [];
      // this.selectedItem = [];
      return;
    });
  }

  Approve
  onApprove() {
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    this.reqObj = {
      "legalReview_id": this.response[this.response.length - 1].legalReview_id,
      "bid_id": this.bid_id,
      "legalReview_add": [],
      'user_type': this.user.user_type,
      'user_subtype': this.user.user_subtype
    }
    let newData = this.response[this.response.length - 1].legalReview_add.filter(a => {
      return a.comment_id == undefined;
    });
    for (var i = 0; i < newData.length; i++) {
      newData[i].reviewer_id = this.user.user_id;
    }
    let reviewerData = this.response[this.response.length - 1].legalReview_add.filter(a => {
      return a.reviewer_id == this.userID;
    })
    this.reqObj.legalReview_add = reviewerData;
    if (this.reqObj.legalReview_add.length == 0) {
      this._alert.sweetError("Please enter inputs");
      return;
    }
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.approvalLegalReviewData(this.reqObj).subscribe(resp => {
        this.response = [];
        this.disableFlag = true;
        this.response = resp['data']['reviewtab_data'];
        this.manipulation();
        this._sharedService.reviewType.emit({ type: 'legal-review' });
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        }, cancel => {
        });
        this.loader = false
      }, error => {
        this.loader = false
      });
    }, cancel => {
      return;
    });
  }
  // reset review data
  onReset() {
    this.response[this.tempCount].legalReview_add.forEach(resp => {
      if (resp.draft[0].flag == true || resp.draft.length == 0) {
        resp.comment = "";
        resp.action_required_by = "";
      }
    });
  }
}
