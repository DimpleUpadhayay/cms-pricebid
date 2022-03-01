import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';

import { MatDialog } from '@angular/material';

import { AlertComponent } from '../../../libraries/alert/alert.component';
import { BidService } from '../../../services/bid.service';
import { PocDashboardService } from '../../../services/poc.service';
import { SharedService } from '../../../services/shared.service';
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [UploadfileComponent, DownloadComponent, AlertComponent, PocDashboardService]
})

export class MainComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  bid;
  bid_id;
  user;
  user_type;
  user_subtype;
  reviewData;
  prePricingReviewData;
  currentContributors;
  sheetData;
  access;
  solnData;
  versionData;
  downloadIndex;
  refreshObj;
  mySubscription;
  poc;
  bidStatus = "";
  reviewCount = 0;
  productType = '';
  selectedFile: File = null;
  // Boolean Values
  prePricingReviewCompleted = false;
  reviewCompleted = false;
  reviewFlag = true;
  reviewNonPriceflag = false;
  proposalReviewFlag = true;
  solutionReviewFlag = true;
  pocSubmited: boolean = false
  RFI = false;
  mainFlag = true;
  rfiFlag = false;
  allowSubmit = false;
  parent = false;
  unfinishedSoln = false;
  loader = false;
  isApprovedFlag = false;
  // Arrays
  attachment_data = [];
  response = [];
  totalApprovers = [];

  constructor(public _bidService: BidService, public dialog: MatDialog,
    private _activeRoute: ActivatedRoute, public _pocService: PocDashboardService, public router: Router,
    public _sharedService: SharedService, private _httpService: HttpService) {
    this.bid_id = _activeRoute.snapshot.parent.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.productType = this.user.product_type ? this.user.product_type : 'pricing';
    if (this.productType == 'nonpricing') {
      this.allowSubmit = true;
    }
    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: "BID_DEVELOPMENT",
      sub_module: "MAIN",
    };

    // to hide plus button after submitted for review
    this.mySubscription = this._sharedService.mainPlusButton.subscribe(data => {
      this.reviewFlag = data['reviewFlag'];
      this.pocSubmited = data['pocSubmited'];
    }), error => {
    };
    this.mySubscription = this._sharedService.submitForReview.subscribe(data => {
      this.reviewFlag = data['flag'];
    }, error => {
    });
    // default obj
    this.response = [{
      bid_id: this.bid_id,
      main_add: [{
        item_name: "",
        description: "",
        remarks: "",
        draft: [{
          user: this.user.user_id,
          flag: true,
          user_type: this.user_type,
        }],
        attachment_data: [],
        action: false
      }]
    }];
    this.accessControl();
    this.getBidById();
    this.getProposalReview();
    this.getSolutionlReview();
    this.getPrePricingReview();
    this.readData();
    if (this.user.product_type == 'nonpricing')
      this.getSolution();
  }

  ngOnInit() {
    // refresh call
    this._sharedService.reviewType.emit({ type: 'empty' });
    this.mySubscription = this._sharedService.newData.subscribe(a => {
      if (a.data == 'main' && this.user_type != "BID_OWNER") {
        this.readDataRefresh();
      } else if (a.data == 'review' && this.user_type == "BID_OWNER") {
        this.getPrePricingReview();
        this.getSolution();
        this.readDataRefresh();
      } else if (a.data == 'solution' && this.user_type == "BID_OWNER") {
        this.getSolution();
      } else if (a.data == "spreadsheet" && this.user_type == "BID_OWNER") {
        let sheet = this.bid.sheetIds.find(a => { return a.user_id == this.user.user_id });
        let obj = {
          user_id: this.user.user_id,
          sheetId: sheet ? sheet.sheetId : "",
          bidId: this.bid_id,
          userType: "BID_OWNER"
        }
        // this.getAssignments(obj);
      }
    }, error => {
    });
    this.loader = true;
  }

  ngOnDestroy() {
    this.mySubscription.unsubscribe();
    this.dialog.closeAll();
  }

  // to give access to particular user
  accessControl() {
    this._httpService.accessControl({
      "module": "main",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": this.pocSubmited
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
    }, error => {
    });
  }

  // get bid details
  getBidById() {
    this._bidService.getBidById(this.bid_id).subscribe(data => {
      this.bid = data['data']['bid'];
      this.bidStatus = this.bid.bidFinalStatus ? this.bid.bidFinalStatus : "";
      this.parent = this.bid.parent;
      if (this.bid.currentParticipants && this.bid.currentParticipants.length > 0) {
        this.currentContributors = this.bid.participants.filter(a => {
          return a.user_type == 'CONTRIBUTOR';
        });
        if (this.currentContributors.length == this.bid.currentParticipants.length) {
          this.allowSubmit = true;
        }
      }
      if (this.bid.currentParticipants && this.bid.currentParticipants.length == 0) {
        this.allowSubmit = true;
      }
      if (this.user.product_type == 'pricing' && this.user.user_type == "BID_OWNER") {
        let sheet = this.bid.sheetIds.find(a => { return a.user_id == this.user.user_id });
        let obj = {
          user_id: this.user.user_id,
          sheetId: sheet ? sheet.sheetId : "",
          bidId: this.bid_id,
          userType: "BID_OWNER"
        }
        // this.getAssignments(obj);
      }
      this.totalApprovers = this.bid.participants.filter(a => {
        return a.level;
      });
      this.getPoc();
    }, error => {
    })
  }

  // get assignment details for sheet
  // getAssignments(obj) {
  //   this._bidService.getAssignmentData(obj).subscribe(resp => {
  //     if (resp['data'] == null) {
  //       return;
  //     }
  //     this.sheetData = resp['data'];
  //   }, error => {
  //   })
  // }

  // get main data
  readData() {
    this.loader = true
    this._bidService.getMainData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this._bidService.statusUpdated.emit(this.response);
          this.loader = false;
          return;
        }
        this.response = resp['data']['maintab_data'];
        this._bidService.statusUpdated.emit(this.response);
        if (this.response[0].main_add.length == 0) {
          let obj = {
            item_name: "",
            description: "",
            remarks: "",
            draft: [{
              user: this.user.user_id,
              flag: true,
              user_type: this.user_type,
            }],
            attachment_data: [],
            action: false
          }
          this.response[0].main_add.push(obj);
        }
        this.loader = false;
      }, err => {
        this.loader = false;
      });

  }

  // get main data for refresh
  readDataRefresh() {
    this._bidService.getMainData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this._bidService.statusUpdated.emit(this.response);
          this.loader = false;
          return;
        }
        this.response = resp['data']['maintab_data'];
        this._bidService.statusUpdated.emit(this.response);
        if (this.response[0].main_add.length == 0) {
          let obj = {
            item_name: "",
            description: "",
            remarks: "",
            draft: [{
              user: this.user.user_id,
              flag: true,
              user_type: this.user_type,
            }],
            attachment_data: [],
            action: false
          }
          this.response[0].main_add.push(obj);
        }
      }, err => {
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
      this.pocSubmited = true;
      if (this.poc.process.length > 0) {
        this.rfiFlag = this.poc.process[this.poc.process.length - 1].action == "RFI" && !this.poc.process[this.poc.process.length - 1].status ? true : false;
        if (this.rfiFlag && this.poc.status == "INACTIVE") {
          this.pocSubmited = false;
        }
        if (this.poc['process'].length != 0) {
          this.poc['process'].forEach(element => {
            if (element.action == "RFI") {
              this._sharedService.changeMessage({ "revisionFlag": true, "flag": this.reviewFlag });
            }
          });
        }
        let process = [];
        process = this.poc.process.filter(a => {
          return a.status == true;
        })
        if (this.totalApprovers.length == process.length) {
          this.isApprovedFlag = true;
        }
        this._sharedService.changeMessage({ "isApprovedFlag": this.isApprovedFlag });
      } else {
        // this.pocSubmited = true;
      }
    }, error => {
    })
  }

  // get solution data
  getSolution() {
    this._bidService.getSolutionData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" }).subscribe((resp: object) => {
      if (resp['data'] == null) {
        this.loader = false;
        return;
      }
      let respo = resp['data'];
      this.solnData = [];
      for (var i = 0; i < respo.length; i++) {
        respo[i].solution_add.forEach(element => {
          if (!element.subItem) {
            element['subItem'] = [];
          }
        });
        this.solnData.push(respo[i]);
      }
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  // to check whether bid is under review or not
  getProposalReview() {
    this._bidService.getProposalReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this._sharedService.changeMessage({ "proposalReviewFlag": true });
          return;
        }
        let data = resp['data']['reviewtab_data'];
        this.proposalReviewFlag = data[data.length - 1].ProposalReview_flag;
        this._sharedService.changeMessage({ "proposalReviewFlag": this.proposalReviewFlag });
      }, error => {
      });
  }

  // to check whether bid is under review or not
  getSolutionlReview() {
    this._bidService.getTechSolutionReviewData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this._sharedService.changeMessage({ "solutionReviewFlag": true });
          return;
        }
        let data = resp['data']["reviewtab_data"];
        this.solutionReviewFlag = data[data.length - 1].techSolReview_flag;
        this._sharedService.changeMessage({ "solutionReviewFlag": this.solutionReviewFlag });
      }, error => {
      });
  }

  // to check whether bid is under review or not
  getReview() {
    this._bidService.getReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this._sharedService.changeMessage({ "revisionFlag": false, "flag": this.prePricingReviewCompleted ? true : false });
          return;
        }
        this.reviewData = resp['data']['reviewtab_data'];
        this._bidService.statusUpdated.emit(this.reviewData);
        this.reviewFlag = this.reviewData[this.reviewData.length - 1].review_flag;
        this.reviewCount = this.reviewData.length;
        let ind = this.reviewData[this.reviewData.length - 1].review_add.findIndex(a => {
          return !a.approvalStatus
        })
        if (ind == -1 && this.reviewFlag) {
          this.reviewCompleted = true;
        } else {
          this.reviewCompleted = false;
        }
        this._sharedService.changeMessage({ "flag": this.reviewFlag, "revisionFlag": true, "reviewCompleted": this.reviewCompleted });
      }, error => {
        this._sharedService.changeMessage({ "revisionFlag": false, "flag": true });
      });
  }

  getPrePricingReview() {
    this._bidService.getNonPricingReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this._sharedService.changeMessage({ "revisionFlag": false, "reviewNonPriceflag": true, "flag": false, "prePricingReviewCompleted": false });
          return;
        }
        this.prePricingReviewData = resp['data']['reviewtab_data'];
        this._bidService.statusUpdated.emit(this.prePricingReviewData);
        this.reviewNonPriceflag = this.prePricingReviewData[this.prePricingReviewData.length - 1].reviewNonPriceflag;
        let ind = this.prePricingReviewData[this.prePricingReviewData.length - 1].review_add.findIndex(a => {
          return !a.approvalStatus
        })
        if (ind == -1 && this.reviewNonPriceflag) {
          this.prePricingReviewCompleted = true;
        } else {
          this.prePricingReviewCompleted = false;
        }
        this.getReview();
        this._sharedService.changeMessage({ "reviewNonPriceflag": this.reviewNonPriceflag, "prePricingReviewCompleted": this.prePricingReviewCompleted, "revisionFlag": true });
      }, error => {
        this.getReview();
        this._sharedService.changeMessage({ "revisionFlag": false, "reviewNonPriceflag": true });
      });
  }

  // add row on plus button
  addRow() {
    let reqData = {
      item_name: "",
      description: "",
      remarks: "",
      draft: [{
        user: this.user.user_id,
        flag: true,
        user_type: this.user_type,
      }],
      attachment_data: [],
      action: false
    };
    this.response[0].main_add.push(reqData);
  }

  // delete row
  deleteRow(index) {
    let data = this.response[0].main_add[index];
    if (this.pocSubmited || !data.draft[0].flag || this.response[0].main_add.length == 1 || this.bidStatus == 'DROPPED') {
      return;
    }
    if (this.user_type != "BID_OWNER") {
      this._alert.sweetError("Sorry, You are not authorised to delete")
      return false;
    }
    if (data.item_id == undefined) {
      this.response[0].main_add.splice(index, 1);
      return;
    }
    this._alert.deleted("").then(success => {
      this.loader = true;
      this.response[0].main_add.splice(index, 1);
      this._bidService.removeMainData({ "item_id": data.item_id, "maintab_id": this.response[0].maintab_id }).subscribe(resp => {
        this.readData();
        this.attachment_data = [];
        this.loader = false
      }, error => {
        this.loader = false
        return;
      });
    });
  }

  // upload documents
  onUpload(index) {
    if (this.user_type != "BID_OWNER" || this.bidStatus == 'DROPPED') {
      this._alert.sweetError("Sorry, You are not authorised to upload documents")
      return false;
    } else if (!this.response[0].main_add[index].draft[0].flag) {
      return false;
    } else {
      this.openDialog(index);
    }
  }

  openDialog(index): void {
    let obj = {
      "bid_id": this.bid_id,
      "type": 'main'
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
          "type": "BID_DEV_MAIN",
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
      if (this.response[0].main_add[index].attachment_data) {
        this.attachment_data.forEach(item => {
          this.response[0].main_add[index].attachment_data.push(item);
        })
      } else {
        this.response[0].main_add[index].attachment_data = this.attachment_data;
      }
      this.attachment_data = [];
      if (result.length != 0)
        this.updateAttachment()
    }, error => {
    });
  }

  // save as draft call after upload and delete attachment
  updateAttachment() {
    if (this.response[0] && this.response[0].date_created) {
      this.response[0]['isSave'] = false;
      this._bidService.saveMainData(this.response[0]).subscribe(success => {
        this.readDataRefresh();
      }, error => {
        this._alert.sweetError("Something went wrong");
      });
    } else {
      this.response[0]['isSave'] = true;
      this._bidService.createMainData(this.response[0]).subscribe(success => {
        this.readDataRefresh();
      }, error => {
        this._alert.sweetError("Something went wrong");
      });
    }
  }

  // to see and download attched file
  onDownloadDialog(index) {
    if (this.response[0].main_add[index].attachment_data.length == 0) {
      this._alert.sweetNoAttachments();
      return;
    }
    this.downloadIndex = index;
    if (this.response[0] && this.response[0].main_add) {
      const dialogRef = this.dialog.open(DownloadComponent, {
        height: '365px',
        width: '850px',
        data: this.response[0].main_add[index]
      });
      dialogRef.afterClosed().subscribe(result => {
        if (!result || result.length == 0) {
          return
        }
        if (!result) {
          return;
        } else if (result == true) {
          this.updateAttachment();
        } else {
          this.versionData = result;
          this.openDialog(this.downloadIndex);
        }
      }, error => {
      });
    }
  }

  // before submit main, notify BM that contributor's tasks are pending
  checkUnfinishedTasks() {
    let validate = true;
    if (this.solnData && this.solnData.length != 0) {
      this.solnData.forEach(element => {
        if (element.solution_add.length != 0 && !element.solution_add[0].draft[0].flag) {
          element.solution_add.forEach(solnItem => {
            if (solnItem.draft.length == 2 && solnItem.draft[1].flag || solnItem.action) {
              validate = false;
            }
            if (solnItem.subItem.length > 0) {
              solnItem.subItem.forEach(subitem => {
                if (subitem.draft[1].flag) {
                  validate = false;
                }
              });
            }
          });
        }
      });
    }
    if (this.user.product_type == 'pricing') {
      // if (this.sheetData && this.sheetData.assignmentData.length > 0) {
      //   this.sheetData.assignmentData.forEach(element => {
      //     if (element.user_type == "CONTRIBUTOR" && !element.isConfirm) {
      //       validate = false;
      //     }
      //   });
      // }
    }
    return validate;
  }

  // onEdit(i) {
  //   // console.log("HEllo");
  //   this.response[0].main_add[i].draft[0].flag = true;
  // }

  // submit main data
  onSubmit() {
    this.response[0]['isSave'] = false;
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    if (this.solnData != undefined && this.user.product_type == 'nonpricing') {
      if (!this.checkUnfinishedTasks()) {
        this._alert.submitMain("Contributors tasks are pending. Do you want to proceed?").then(success => {

          this.unfinishedSoln = true;
          this.response[0] && this.response[0].date_created ? this.update() : this.create();
        }).catch(cancel => {
          return false;
        });
      } else {
        this.response[0] && this.response[0].date_created ? this.update() : this.create();
      }
    } else if (this.user.product_type == 'pricing') {
      if (!this.checkUnfinishedTasks()) {
        this._alert.submitMain("Contributors tasks are pending. Do you want to proceed?").then(success => {
          this.unfinishedSoln = true;
          this.response[0] && this.response[0].date_created ? this.update() : this.create();
        }).catch(cancel => {
          return false;
        });
      } else {
        this.response[0] && this.response[0].date_created ? this.update() : this.create();
      }
    } else {
      this.response[0] && this.response[0].date_created ? this.update() : this.create();
    }
  }

  create() {
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.createMainData(this.response[0])
        .subscribe((response) => {
          this._sharedService.reviewType.emit({ type: 'other' });
          this.attachment_data = [];
          this.loader = false
          this.readData();
          this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
          }, cancel => {
          });
        }, error => {
          this.loader = false
        });
    }, cancel => {
      return;
    });
  }

  update() {
    if (this.unfinishedSoln) {
      this.loader = true
      this._bidService.submitMainData(this.response[0]).subscribe(resp => {
        this.attachment_data = [];
        this.loader = false
        this.readData();

        this._sharedService.reviewType.emit({ type: 'other' });
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        }, cancel => {
        });
      }, cancel => {
        this.loader = false
        return;
      });
    } else {
      this._alert.added("").then(success => {
        this.loader = true
        this._bidService.submitMainData(this.response[0]).subscribe(resp => {
          this.attachment_data = [];
          this.loader = false
          this.readData();
          this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
          }, cancel => {
          });
        }, error => {
          this.loader = false
        });
      }, cancel => {
        this.loader = false
        return;
      });
    }
  }

  // save as draft
  onSaveAsDraft() {
    this.response[0]['isSave'] = true;
    this.response[0] && this.response[0].date_created ? this.updateDraft() : this.createDraft();
  }

  createDraft() {
    this.loader = true
    this._bidService.createMainData(this.response[0]).subscribe((response) => {
      this.loader = false
      this._alert.sweetSuccess("Data saved as draft");
      this.readData();
      this.attachment_data = [];
    }, error => {
      this.loader = false
    });
  }

  updateDraft() {
    this.loader = true
    this._bidService.saveMainData(this.response[0]).subscribe(resp => {
      this.loader = false
      this._alert.sweetSuccess("Data saved as draft");
      this.readData();
      this.attachment_data = [];
    }, error => {
      this.loader = false
    });
  }

  newValidate() {
    let validate = true;
    this.response[0].main_add.forEach(element => {
      for (let item in element) {
        if (item == 'item_name' || item == 'description') {
          element[item] === '' ? validate = false : '';
        }
      }
    });
    return validate;
  }

  // reset main data
  onReset() {
    this.response[0].main_add.forEach(resp => {
      if (resp.action == false) {
        resp.item_name = "";
        resp.description = "";
        resp.remarks = "";
        resp.attachment_data = [];
      }
    })
  }

  // Check to show/hide add row button
  plusButton() {
    let flag = false;
    if (this.access.writeAccess && this.response[0].main_add[this.response[0].main_add.length - 1].action
      && !this.pocSubmited && (!this.response[0].submit_flag || this.rfiFlag)
      && !this.parent && this.bidStatus != 'DROPPED') {
      flag = true;
    }
    return flag;
  }

  // Check to disable submit buttons
  disabledButton() {
    let flag = false;
    if (!this.access.writeAccess || this.access.writeAccess
      && (!this.response[0].main_add[this.response[0].main_add.length - 1].draft[0].flag)) {
      flag = true;
    }
    return flag;
  }

}