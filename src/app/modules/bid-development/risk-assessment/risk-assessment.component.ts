import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BidService } from '../../../services/bid.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { PocDashboardService } from '../../../services/poc.service';
import { MatDialog } from '@angular/material';
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { SharedService } from '../../../services/shared.service';
import { UsersService } from '../../../services/users.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-risk-assessment',
  templateUrl: './risk-assessment.component.html',
  styleUrls: ['./risk-assessment.component.css'],
  providers: [UsersService]
})
export class RiskAssessmentComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  bid_id;
  user;
  user_type;
  user_subtype;
  module;
  response;
  refreshObj;
  attachment_data = [];
  bid;
  poc;
  pocSubmited: boolean = false
  // disableFlag = false;
  versionData;
  downloadIndex;
  reqObj;
  userList = [];
  reviewers = [];
  types = [];
  riskLevels = [];
  access;
  mySubscription;
  loader = false;
  bidStatus = "";

  constructor(private _activeRoute: ActivatedRoute, private _bidService: BidService,
    public _pocService: PocDashboardService, public dialog: MatDialog, public _sharedService: SharedService, private _usersService: UsersService, private _httpService: HttpService) {
    this.bid_id = _activeRoute.snapshot.parent.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    if (this.user & this.user.role_module_mapping && this.user.role_module_mapping.length) {
      this.module = this.user.role_module_mapping.find(a => a.module_name.replace(/ /g, '_').toLowerCase() == 'bid_development');
    }
    this.reqObj = {
      "bid_id": this.bid_id,
      "riskAssement_add": [],
      "riskAssement_id": ""
    }
    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: "BID_DEVELOPMENT",
      sub_module: "RISK_ASSESSMENT",
    };
    // refresh call
    /* this._sharedService.newData.subscribe(a => {
      if (a.data == 'risk-assessment' && this.user_type != "REVIEWER") {
        this.readData();
      }
    }); */
    this.types = ["Solution", "Finance", "Others"];
    this.riskLevels = ["High", "Medium", "Low"];
    /* this.response = [{
      bid_id: this.bid_id,
      "riskAssement_add": [
        {
          "risk_name": "",
          "mitigation": "",
          "description": "",
          "riskType": "",
          "reviewer_id": !this.checkUser() ? this.user.user_id : "",
          "attachment_data": [],
          "draft": [
            {
              "user": this.user.user_id,
              "user_type": this.user.user_type,
              "flag": true
            }
          ],
          "action": true
        }
      ]
    }]; */
    // this.getBidById()
    // this.readData();
    this.accessControl();
  }

  ngOnInit() {
    this._sharedService.reviewType.emit({ type: 'empty' });
    // refresh call
    this.mySubscription = this._sharedService.newData.subscribe(a => {
      if (a.data == 'risk-assessment' && this.checkAction(this.response[0].riskAssement_add)) {
        this.readDataRefresh();
      }
    }, error => {
    })
    this.loader = true;
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  checkAction(data) {
    var validate = true;
    if (data.length != 0) {
      let reviewers = data.filter(a => { return a.reviewer_id == this.user.user_id; });
      if (reviewers.length != 0 && reviewers[reviewers.length - 1].draft[0].flag) {
        validate = false;
      }
    }
    return validate;
  }
//  Reviewer gets all the data in risk assessment
  readData() {
    this.loader = true
    this._bidService.readRiskAssessment({ "bid_id": this.bid_id }).subscribe((data) => {
      if (data['data'] == null) {
        this.response = [{
          bid_id: this.bid_id,
          "riskAssement_add": [
            {
              "risk_name": "",
              "mitigation": "",
              "description": "",
              "riskType": "",
              "riskLevel": "",
              "reviewer_id": !this.checkUser() ? this.user.user_id : "",
              "attachment_data": [],
              "draft": [
                {
                  "user": this.user.user_id,
                  "user_type": this.user_type,
                  "flag": true
                }
              ],
              "action": true
            }
          ]
        }];
        this.loader = false;
        return;
      }
      this.response = data['data']['maintab_data'];
      // this.disableFlag = false;
      if (this.response[0].riskAssement_add.length == 0) {
        let obj = {
          "risk_name": "",
          "mitigation": "",
          "description": "",
          "riskType": "",
          "riskLevel": "",
          "reviewer_id": !this.checkUser() ? this.user.user_id : "",
          "attachment_data": [],
          "draft": [
            {
              "user": this.user.user_id,
              "user_type": this.user_type,
              "flag": true
            }
          ],
          "action": true
        }
        this.response[0].riskAssement_add.push(obj);
      } else {
        this.response[0].riskAssement_add.forEach(element => {
          // element.draft.forEach(item => {
          if (element.draft[0].user == this.user.user_id && !element.draft[0].flag) {
            // this.disableFlag = true;
          }
          // });
        });
      }
      this.loader = false;
    }, error => {
      this.loader = false
    });
  }

  readDataRefresh() {
    this._bidService.readRiskAssessment({ "bid_id": this.bid_id }).subscribe((data) => {
      if (data['data'] == null) {
        this.response = [{
          bid_id: this.bid_id,
          "riskAssement_add": [
            {
              "risk_name": "",
              "mitigation": "",
              "description": "",
              "riskType": "",
              "riskLevel": "",
              "reviewer_id": !this.checkUser() ? this.user.user_id : "",
              "attachment_data": [],
              "draft": [
                {
                  "user": this.user.user_id,
                  "user_type": this.user_type,
                  "flag": true
                }
              ],
              "action": true
            }
          ]
        }];
        return;
      }
      this.response = data['data']['maintab_data'];
      // this.disableFlag = false;
      if (this.response[0].riskAssement_add.length == 0) {
        let obj = {
          "risk_name": "",
          "mitigation": "",
          "description": "",
          "riskType": "",
          "riskLevel": "",
          "reviewer_id": !this.checkUser() ? this.user.user_id : "",
          "attachment_data": [],
          "draft": [
            {
              "user": this.user.user_id,
              "user_type": this.user_type,
              "flag": true
            }
          ],
          "action": true
        }
        this.response[0].riskAssement_add.push(obj);
      } else {
        this.response[0].riskAssement_add.forEach(element => {
          // element.draft.forEach(item => {
          if (element.draft[0].user == this.user.user_id && !element.draft[0].flag) {
            // this.disableFlag = true;
          }
          // });
        });
      }
    }, error => {
    });
  }

  getBidById() {
    this._bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bid = resp['data']['bid'];
      this.bidStatus = this.bid.bidFinalStatus ? this.bid.bidFinalStatus : "";
      let user_list = [];
      this.bid.participants.forEach(element => {
        element.userTypes.forEach(item => {
          if (item.user_type == "REVIEWER" && item.user_subtype != "Sales") {
            user_list.push(element);
          }
        });
      });
      for (var i = 0; i < user_list.length; i++) {
        let user = {
          "user_id": "",
          "username": "",
          "user_type": "",
          "user_subtype": ""
        }
        user.user_id = user_list[i].user_id;
        user.username = user_list[i].username;
        user.user_type = user_list[i].userTypes[0].user_type;
        user.user_subtype = user_list[i].userTypes[0].user_subtype;
        this.reviewers.push(user);
      }
      // console.log(this.reviewers);
    });
  }
// Reviewer can add the row
  addRow() {
    if (this.checkUser() || this.bid.parent) {
      return false;
    }
    let reqData = {
      "risk_name": "",
      "mitigation": "",
      "description": "",
      "riskType": "",
      "riskLevel": "",
      "reviewer_id": this.user.user_id,
      "attachment_data": [],
      "draft": [
        {
          "user": this.user.user_id,
          "user_type": this.user.user_type,
          "flag": true
        }
      ],
      "action": true
    };
    this.response[0].riskAssement_add.push(reqData);
  }
// Reviewer can delete the row
  deleteRow(index) {
    if (this.response[0].riskAssement_add.length == 1 || this.pocSubmited || this.response[0].riskAssement_add[index].reviewer_id != this.user.user_id || !this.response[0].riskAssement_add[index].draft[0].flag || this.bid.parent || this.bidStatus == 'DROPPED') {
      return;
    }
    if (this.checkUser()) {
      // this._alert.sweetError("Sorry, You are not authorised to delete")
      return false;
    }
    let dataval = this.response[0].riskAssement_add[index];
    if (dataval.item_id == undefined) {
      this.response[0].riskAssement_add.splice(index, 1);
      return;
    }
    this._alert.deleted("").then(success => {
      this.loader = true
      this._bidService.removeItemRiskAssessment({ "item_id": dataval.item_id })
        .subscribe((resp) => {
          this.response[0].riskAssement_add.splice(index, 1);
          this.loader = false
        }, error => {
          this.loader = false
        });
    }, cancel => {
      this.readDataRefresh();
    });
  }

  checkUser() {
    let flag = true;
    if (this.access && this.access.writeAccess) {
      flag = false;
    }
    return flag;
  }

  // upload attachmnets
  onUpload(index) {
    if (this.pocSubmited || this.bid.parent || this.bidStatus == 'DROPPED') {
      return;
    }
    if (this.checkUser() || !this.response[0].riskAssement_add[index].draft[0].flag) {
      return false;
    } else {
      this.openDialog(index)
    }
  }

  openDialog(index): void {
    let obj = {
      "bid_id": this.bid_id,
      "type": 'risk-assessment'
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
          "type": "BID_DEV_RISK",
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
      if (this.response[0].riskAssement_add[index].attachment_data) {
        this.attachment_data.forEach(item => {
          this.response[0].riskAssement_add[index].attachment_data.push(item);
        });
      } else {
        this.response[0].riskAssement_add[index].attachment_data = this.attachment_data;
      }
      this.attachment_data = [];
      if (result.length != 0)
        this.updateAttachment();
    });
  }

  // save as draft call after upload and delete attachment
  updateAttachment() {
    let reviewerData = this.response[0].riskAssement_add.filter(a => {
      return a.draft[0].user == this.user.user_id;
    })
    this.reqObj.riskAssement_add = reviewerData;
    this.reqObj.riskAssement_id = this.response[0].riskAssement_id;
    this.reqObj['user_type'] = this.access.participants[0].userTypes[0].user_type;
    this.reqObj['user_subtype'] = this.access.participants[0].userTypes[0].user_subtype
    if (this.response[0] && this.response[0].date_created) {
      this._bidService.saveAsDraftRiskAssessment(this.reqObj).subscribe(success => {
        this.readDataRefresh();
      }, error => {
        this._alert.sweetError("Something went wrong");
      });
    } else {
      this.reqObj.isSave = true;
      this._bidService.createRiskAssessment(this.reqObj).subscribe(success => {
        this.readDataRefresh();
      }, error => {
        this._alert.sweetError("Something went wrong");
      });
    }
  }

  // download attachmnets
  onDownloadDialog(index) {
    if (this.response[0].riskAssement_add[index].attachment_data.length == 0) {
      this._alert.sweetNoAttachments();
      return;
    }
    this.downloadIndex = index;
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '365px',
      width: '850px',
      data: this.response[0].riskAssement_add[index]
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
    });
  }

  // Revoke Icon Click
  onEdit(index) {
    if (this.pocSubmited || this.bid.parent || this.bidStatus == 'DROPPED') {
      return;
    }
    let data = this.response[0].riskAssement_add[index];
    if (data.draft[0].flag == false) {
      data.draft[0].flag = true;
    }
  }

  // to check whether bid is under approval or not
  getPoc() {
    this.loader = true;
    this._pocService.getPocDashboards({ bid_id: this.bid_id }).subscribe(data => {
      if (data['data'] == null) {
        this.loader = false;
        return;
      }
      this.poc = data['data']['poc_list'][0];
      if (!this.poc) {
        return;
      }
      if (this.poc.status == "ACTIVE") {
        this.pocSubmited = true;
      }
      this.loader = false;
    })
  }

  newValidate() {
    let validate = true;
    this.reqObj.riskAssement_add.forEach(element => {
      for (let item in element) {
        if ((item == 'mitigation' || item == 'description' ||
          item == "risk_name" || item == "riskType" || item == "riskLevel")) {
          element[item] === '' ? validate = false : '';
        }
      }
    });
    return validate;
  }

  onSubmit() {
    let reviewerData = this.response[0].riskAssement_add.filter(a => {
      return a.draft[0].user == this.user.user_id;
    })
    this.reqObj.riskAssement_add = reviewerData;
    this.reqObj.riskAssement_id = this.response[0].riskAssement_id;
    this.reqObj['user_type'] = this.access.participants[0].userTypes[0].user_type;
    this.reqObj['user_subtype'] = this.access.participants[0].userTypes[0].user_subtype
    if (this.reqObj.riskAssement_add.length == 0) {
      this._alert.sweetError("Please enter inputs");
      return;
    }
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    this.response[0] && this.response[0].date_created ? this.update() : this.create();
  }

  create() {
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.createRiskAssessment(this.reqObj)
        .subscribe((response) => {
          this.attachment_data = [];
          this.loader = false
          this.readDataRefresh();
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
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.submitRiskAssessment(this.reqObj)
        .subscribe((response) => {
          this.attachment_data = [];
          this.loader = false
          this.readDataRefresh();
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

  // save as draft
  onSaveAsDraft() {
    let reviewerData = this.response[0].riskAssement_add.filter(a => {
      return a.draft[0].user == this.user.user_id;
    })
    this.reqObj.riskAssement_add = reviewerData;
    this.reqObj.isSave = true;
    this.reqObj.riskAssement_id = this.response[0].riskAssement_id;
    this.reqObj['user_type'] = this.access.participants[0].userTypes[0].user_type;
    this.reqObj['user_subtype'] = this.access.participants[0].userTypes[0].user_subtype
    if (this.reqObj.riskAssement_add.length == 0) {
      this._alert.sweetError("Please enter inputs");
      return;
    }
    this.response[0] && this.response[0].date_created ? this.updateDraft() : this.createDraft();
  }

  createDraft() {
    this.loader = true
    this._bidService.createRiskAssessment(this.reqObj)
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
    this._bidService.saveAsDraftRiskAssessment(this.reqObj)
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
    if (this.user_type != "REVIEWER") {
      return false;
    }
    this.response[0].riskAssement_add.forEach(element => {
      element.draft.forEach(item => {
        if (item.user == this.user.user_id && item.flag) {
          element.risk_name = "";
          element.description = "";
          element.riskType = "";
          element.riskLevel = "";
          element.mitigation = "";
          element.attachment_data = [];
        }
      });
    });
  }

  accessControl() {
    this._httpService.accessControl({
      "module": "riskAssessment",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": this.pocSubmited
    }).subscribe(response => {
      // console.log(response);
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
      /* this.response = [{
        bid_id: this.bid_id,
        "riskAssement_add": [
          {
            "risk_name": "",
            "mitigation": "",
            "description": "",
            "riskType": "",
            "reviewer_id": !this.checkUser() ? this.user.user_id : "",
            "attachment_data": [],
            "draft": [
              {
                "user": this.user.user_id,
                "user_type": this.user.user_type,
                "flag": true
              }
            ],
            "action": true
          }
        ]
      }]; */
      this.getBidById();
      this.getPoc();
      this.readData();
    }, error => {
      console.log(error);
      this.loader = false;
    });
  }

}
