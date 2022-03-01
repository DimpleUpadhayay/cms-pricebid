import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { PocDashboardService } from '../../../services/poc.service';
import { SharedService } from '../../../services/shared.service';
import { MatDialog } from '@angular/material';
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { HttpService } from '../../../services/http.service';


@Component({
  selector: 'app-approval-required',
  templateUrl: './approval-required.component.html',
  styleUrls: ['./approval-required.component.css'],
  providers: [BidService, UploadfileComponent, DownloadComponent, PocDashboardService]
})
export class ApprovalRequiredComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  selectedFile: File;
  bid_id;
  user;
  user_type;
  user_subtype
  module;
  response;
  reviewData;
  poc;
  bid;
  refreshObj;
  versionData;
  downloadIndex;
  access;
  bidStatus = "";
  // Boolean Varialbes
  disableFlag = false;
  reviewFlag = true;
  pocSubmited: boolean = false
  RFI = false;
  mainFlag = true;
  loader = false;
  //Array
  itemArray = [];
  attachment_data = [];
  
  constructor(private _bidService: BidService,
    public _sharedService: SharedService, private _httpService: HttpService,
    public dialog: MatDialog, private _activeRoute: ActivatedRoute, public _pocService: PocDashboardService) {
    this.bid_id = _activeRoute.snapshot.parent.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    // this.reviewData = JSON.parse(localStorage.getItem("reviewData"))
    /* if (this.reviewData && this.reviewData.length > 0) {
      this.reviewFlag = this.reviewData[this.reviewData.length - 1].review_flag;
    } */
    if (this.user & this.user.role_module_mapping && this.user.role_module_mapping.length) {
      this.module = this.user.role_module_mapping.find(a => a.module_name.replace(/ /g, '_').toLowerCase() == 'bid_development');
    }
    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: "BID_DEVELOPMENT",
      sub_module: "APPROVAL_REQUIRED",
    };
    // refresh call
    this._sharedService.newData.subscribe(a => {
      if (a.data == 'approvalrequired' && this.user_type != "BID_OWNER") {
        this.readDataRefresh();
      }
    }, error => {
    });
    this.response = [{
      "bid_id": this.bid_id,
      "submit_flag": false,
      "participants": [],
      "approval_add": [{
        "approval_required": "",
        "justification": "",
        "attachment_data": [],
        "draft": [{
          "user": this.user.user_id,
          "flag": true
        }]
      }]
    }]
    this.accessControl();
  }

  ngOnInit() {
    this.loader = true;

    this._sharedService.reviewType.emit({ type: 'empty' });
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  accessControl() {
    this._httpService.accessControl({
      "module": "approvalRequired",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": this.pocSubmited
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
      this.getBidById();
      this.getReview();
      this.getPoc();
      this.readData();
    }, error => {
    });
  }

  getBidById() {
    this._bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bid = resp['data']['bid'];
      this.bidStatus = this.bid.bidFinalStatus ? this.bid.bidFinalStatus : "";
    }, error => {
    });
  }

  // get approval req data
  readData() {
    this.loader = true;
    this._bidService.getApprovalData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this.loader = false;
          return;
        }
        this.response = resp['data']['approvalreq_data'];
        if (this.response[0].approval_add.length == 0) {
          let obj = {
            "approval_required": "",
            "justification": "",
            "attachment_data": []
          }
          this.response[0].approval_add.push(obj);
        }
        this.disableFlag = true;
        if (this.response.length == 1) {
          this.itemArray.push(this.response[0]);
        }
        this.disableFlag = this.response[0].submit_flag == true ? true : false;
        this.loader = false;
      },
        error => {
          this.loader = false;
        });
  }

  readDataRefresh() {
    this._bidService.getApprovalData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        this.response = resp['data']['approvalreq_data'];
        if (this.response[0].approval_add.length == 0) {
          let obj = {
            "approval_required": "",
            "justification": "",
            "attachment_data": []
          }
          this.response[0].approval_add.push(obj);
        }
        this.disableFlag = true;
        if (this.response.length == 1) {
          this.itemArray.push(this.response[0]);
        }
        this.disableFlag = this.response[0].submit_flag == true ? true : false;
      },
        error => {
        });
  }

  // to check whether bid is under review or not
  getReview() {
    this._bidService.getReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        this.reviewData = resp['data']['reviewtab_data'];
        this.reviewFlag = this.reviewData[this.reviewData.length - 1].review_flag;
      }, error => {
        this.reviewFlag = true;
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
    }, error => {
    })
  }

  addRow() {
    this.disableFlag = false;
    let reqData = {
      "approval_required": "",
      "justification": "",
      "attachment_data": [],
      "draft": [{
        "user": this.user.user_id,
        "flag": true
      }]
    };
    this.response[0].approval_add.push(reqData);
  }

  deleteRow(index) {
    if (this.response[0].approval_add.length == 1 || this.pocSubmited || this.response[0].submit_flag || this.bid.parent || this.bidStatus == 'DROPPED') {
      return;
    }
    if (this.user_type != "BID_OWNER") {
      this._alert.sweetError("Sorry, You are not authorised to delete")
      return false;
    }
    let dataval = this.response[0].approval_add[index];
    if (dataval.item_id == undefined) {
      this.response[0].approval_add.splice(index, 1);
      return;
    }
    this.response[0].approval_add.splice(index, 1);
    this._alert.deleted("").then(success => {
      this.loader = true
      let data = {
        "bulk_data": [/* {
          "approvalreq_id": this.response[0].approvalreq_id,
          "item_id": this.response[0].approval_add[index].item_id,
          "status": "INACTIVE",
        } */
          this.response
        ]
      }
      this._bidService.updateApprovalData(data)
        .subscribe((resp) => {
          this.response[0].approval_add.splice(index, 1);
          this.loader = false
        }, error => {
          this.loader = false
        });
    }, cancel => {
      this.readDataRefresh();
    });
  }

  onFileChanged(event) {
    this.selectedFile = <File>event.target.files[0];
  }

  // upload attachmnets
  onUpload(index) {
    if (this.pocSubmited || !this.reviewFlag || this.bid.parent || this.bidStatus == 'DROPPED') {
      return;
    }
    if (this.user_type != "BID_OWNER") {
      this._alert.sweetError("Sorry, You are not authorised to upload documents")
      return false;
    } else if (this.disableFlag) {

    } else {
      this.openDialog(index)
    }
  }

  openDialog(index): void {
    let obj = {
      "bid_id": this.bid_id,
      "type": 'approvalReq'
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
          "type": "BID_DEV_APPROVAL",
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
      if (this.response[0].approval_add[index].attachment_data) {
        this.attachment_data.forEach(item => {
          this.response[0].approval_add[index].attachment_data.push(item);
        });
      } else {
        this.response[0].approval_add[index].attachment_data = this.attachment_data;
      }
      this.attachment_data = [];
      if (result.length != 0)
        this.updateAttachment();
    }, error => {
    });
  }

  // save as draft call after upload and delete attachment
  updateAttachment() {
    let obj = {
      "bulk_data": this.response
    };
    if (this.response[0] && this.response[0].date_created) {
      this._bidService.updateApprovalData(obj).subscribe(success => {
        this.readDataRefresh();
      }, error => {
        this._alert.sweetError("Something went wrong");
      });
    } else {
      this._bidService.postApprovalData(obj).subscribe(success => {
        this.readDataRefresh();
      }, error => {
        this._alert.sweetError("Something went wrong");
      });
    }
  }

  // download attachmnets
  onDownloadDialog(index) {
    if (this.response[0].approval_add[index].attachment_data.length == 0) {
      this._alert.sweetNoAttachments();
      return;
    }
    this.downloadIndex = index;
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '365px',
      width: '850px',
      data: this.response[0].approval_add[index]
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      } else if (result == true) {
        this.updateAttachment();
      } else if (result) {
        this.versionData = result;
        this.openDialog(this.downloadIndex);
      }
    }, error => {
    });
  }

  // submit
  onSubmit() {
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    this.response[0] && this.response[0].date_created ? this.update() : this.create();
  }

  newValidate() {
    let validate = true;
    this.response[0].approval_add.forEach(element => {
      for (let item in element) {
        if (item == 'approval_required' || item == 'justification') {
          element[item] === '' ? validate = false : '';
        }
      }
    });
    return validate;
  }

  // create
  create() {
    if (this.response[0]) {
      this.response[0].participants.push(this.user.user_id);
      this.response[0].submit_flag = true;
      this.response[0].approval_add.forEach(element => {
        element.draft[0].flag = false;
      });
    }
    let obj =
    {
      "bulk_data": this.response
    }
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.postApprovalData(obj)
        .subscribe((response) => {
          this._sharedService.changeApprovalFlag({ "approval_flag": true });
          this.loader = false
          this.readDataRefresh();
          this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
          }, cancel => {
          });
        }, error => {
          this.loader = false
        });
    }, cancel => {
      if (this.response[0]) {
        this.response[0].participants.pop();
        this.response[0].submit_flag = false;
        this.response[0].approval_add.forEach(element => {
          if (!element.draft[0].flag) {
            element.draft[0].flag = true;
          }
        });
      }
      return;
    })
  }

  // update
  update() {
    if (this.response[0]) {
      this.response[0].participants.push(this.user.user_id);
      this.response[0].submit_flag = true;
      this.response[0].approval_add.forEach(element => {
        element.draft[0].flag = false;
      });
    }
    let obj =
    {
      "bulk_data": this.response
    }
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.updateApprovalData(obj)
        .subscribe((response) => {
          this._sharedService.changeApprovalFlag({ "approval_flag": true });
          this.loader = false
          this.readDataRefresh();
          this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
          }, cancel => {
          });
        }, error => {
          this.loader = false
        });
    }, cancel => {
      if (this.response[0]) {
        this.response[0].participants.pop();
        this.response[0].submit_flag = false;
        this.response[0].approval_add.forEach(element => {
          if (!element.draft[0].flag) {
            element.draft[0].flag = true;
          }
        });
      }
      this.loader = false
      return;
    });
  }

  // save as draft
  onSaveAsDraft() {
    this.response[0] && this.response[0].date_created ? this.updateDraft() : this.createDraft();
  }

  createDraft() {
    this.loader = true
    let obj =
    {
      "bulk_data": this.response
    }
    this._bidService.postApprovalData(obj)
      .subscribe((response) => {
        this.loader = false
        this._alert.sweetSuccess("Data saved as draft");
        this.readDataRefresh();
      }, error => {
        this.loader = false
      });
  }

  updateDraft() {
    this.loader = true
    let obj =
    {
      "bulk_data": this.response
    }
    this._bidService.updateApprovalData(obj)
      .subscribe((response) => {
        this.loader = false
        this._alert.sweetSuccess("Data saved as draft");
        this.readDataRefresh();
      }, error => {
        this.loader = false
      });
  }

  // reset data
  onReset() {
    this.response[0].approval_add.forEach(element => {
      element.approval_required = "";
      element.justification = "";
      element.attachment_data = [];
    });
  }

}
