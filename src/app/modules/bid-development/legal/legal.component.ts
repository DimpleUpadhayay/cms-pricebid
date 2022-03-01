import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { PocDashboardService } from '../../../services/poc.service';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { ProjectScopeService } from '../../../services/ps.service';
import { UsersService } from '../../../services/users.service';
import { HttpService } from '../../../services/http.service';
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.css'],
  providers: [UsersService]
})
export class LegalComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  bid_id;
  user;
  userID;
  response;
  bidData;
  dt = new Date();
  minDate = new Date(this.dt.getFullYear(), this.dt.getMonth(), this.dt.getDate());
  submission_date;
  participants;
  attachment_data = [];
  versionData;
  pocSubmited: boolean = false;
  access;
  user_type;
  user_subtype;
  loader = false;
  downloadIndex;
  req;
  company_id;
  refreshObj = {}
  mySubscription;
  legalReviewFlag = true;
  attachmentFlag = false;
  bidStatus = "";
  contributors;
  poc;
  rfiFlag = false;

  constructor(private _bidService: BidService, private _sharedService: SharedService, public _pocService: PocDashboardService, public dialog: MatDialog,
    private _activeRoute: ActivatedRoute, public _psService: ProjectScopeService, private _usersService: UsersService, private _httpService: HttpService) {
    this.bid_id = _activeRoute.snapshot.parent.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.userID = this.user.user_id;

    this._sharedService.reviewType.emit({ type: 'legal' });
    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: undefined,
      sub_module: "LEGAL"
    }
    // refresh call
    this.mySubscription = this._sharedService.newData.subscribe(a => {
      if ((a.data == "legal") && this.checkAction()) {
        this.readData();
        this._sharedService.reviewType.emit({ type: 'legal' });
      } else if (a.data == "legal-review") {
        this.readData();
        this.readLegalReview();
        this._sharedService.reviewType.emit({ type: 'legal' });
      }
    }, error => {

    })
  }

  checkAction() {
    let validate = true;
    if (this.access.writeAccess) {
      if (this.user_type == "CONTRIBUTOR") {
        this.response[0].legalRisk_add.forEach(element => {
          if (element.draft.length == 1) {
            validate = false;
          }
        });
      } else {
        this.response[0].legalRisk_add.forEach(element => {
          if (element.contributor == this.userID && element.draft.length > 1 && element.draft[1].flag) {
            validate = false;
          }
        });
      }
    }
    return validate;
  }

  ngOnInit() {
    this.loader = true;
    this.accessControl();

    this._sharedService.reviewType.emit({ type: 'tech' });
  }

  ngOnDestroy() {
    // this.mySubscription.unsubscribe();
    this.dialog.closeAll();
    // this.readData();
  }

  accessControl() {
    this._httpService.accessControl({
      "module": "legal",
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
      this.getPoc();
      // this.getProjectScope();
      // this.readData();
      this.readLegalReview();
    }, error => {
      console.log(error);
      this.loader = false;
    });
  }

  getBidById() {
    // this.loader = true;
    this._bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bidData = resp['data']['bid'];
      this.bidStatus = this.bidData.bidFinalStatus ? this.bidData.bidFinalStatus : "";
      this.submission_date = new Date(this.bidData.date_submission);
      this.participants = this.bidData.participants.filter(a => {
        return a.userTypes[0].user_type == 'BID_OWNER' && a.userTypes[0].user_subtype != "Presales";
      });
      this.contributors = this.bidData.participants.filter(a => {
        return a.userTypes[0].user_type == 'CONTRIBUTOR' && a.userTypes[0].user_subtype == "Legal";
      });
      this.contributors.push({ "username": "Reviewer", "user_id": "Reviewer" });
      this.readData();
      // this.loader = false;
    });
  }

  // // before refreshing page, check whether user is working or not
  // checkAction(data) {
  // }

  readData() {
    let obj = {
      "bid_id": this.bid_id,
      "user_type": this.user_type
    }
    this._bidService.getLegalData(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.response = [{
          "bid_id": this.bid_id,
          "user_type": "CONTRIBUTOR",
          "legalRisk_add": [
            {
              "description": "",
              "user_type": this.user_type,
              "user_id": (this.user_type == "CONTRIBUTOR" && this.user_subtype == "Legal") ? this.userID : "",
              "contributor": this.participants ? this.participants[0].user_id : "",
              "dateTimeRange": [],
              "startDate": "",
              "endDate": "",
              "draft": [
                {
                  "user_id": this.userID,
                  "user_type": this.user_type,
                  "flag": true
                }
              ],
              "mitigation": "",
              "attachment_data": [],
              "isParent": true,
              "parentId": "root",
              "action": false,
              "subItem": []
            }
          ]
        }]
        this.read();
        this.loader = false;
        return;
      } else {
        this.response = resp['data'];
        if (this.response[0].legalRisk_add.length == 0) {
          let obj = {
            "description": "",
            "user_type": this.user_type,
            "user_id": (this.user_type == "CONTRIBUTOR" && this.user_subtype == "Legal") ? this.userID : "",
            "contributor": this.participants ? this.participants[0].user_id : "",
            "dateTimeRange": [],
            "startDate": "",
            "endDate": "",
            "draft": [
              {
                "user_id": this.userID,
                "user_type": this.user_type,
                "flag": true
              }
            ],
            "mitigation": "",
            "attachment_data": [],
            "isParent": true,
            "parentId": "root",
            "action": false,
            "subItem": []
          }
          this.response[0].legalRisk_add.push(obj);
        }
        this.read();
        this.loader = false;
      }
    });
  }

  submitFlag = false;
  read() {
    this.response[0].legalRisk_add.forEach(element => {
      element['dateTimeRange'] = [element.startDate, element.endDate];
      element.contributor = this.participants ? this.participants[0].user_id : "";
    });
    let data = this.response[0].legalRisk_add[this.response[0].legalRisk_add.length - 1];
    if (this.user_type == "BID_OWNER" && data.draft.length > 1) {
      this.submitFlag = !data.draft[1].flag
    } else if (this.user_type == "BID_OWNER" && data.draft.length == 1) {
      this.submitFlag = true;
    }
    this._bidService.statusUpdated.emit(this.response);
  }

  readLegalReview() {
    let obj = {
      "bid_id": this.bid_id
    }
    this._bidService.getLegalReviewData(obj).subscribe(result => {
      if (result['data'] == true) {
        return false;
      }
      let reviewData = result['data']['reviewtab_data'];
      this.legalReviewFlag = reviewData[reviewData.length - 1].legalReview_flag;
      this._sharedService.changeMessage({ "legalReviewFlag": this.legalReviewFlag, "revisionFlag": true });
    }, error => {
      this._sharedService.changeMessage({ "revisionFlag": false, "legalReviewFlag": true });
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
        let process = [];
        process = this.poc.process.filter(a => {
          return a.status == true;
        })
      } else {
        // this.pocSubmited = true;
      }
    }, error => {
    })
  }

  addRow() {
    let obj = {
      "description": "",
      "user_type": "",
      "user_id": this.userID,
      "contributor": this.participants ? this.participants[0].user_id : "",
      "dateTimeRange": "",
      "startDate": "",
      "endDate": "",
      "draft": [
        {
          "user_id": this.userID,
          "user_type": this.user_type,
          "flag": true
        }
      ],
      "mitigation": "",
      "attachment_data": [],
      "isParent": true,
      "parentId": "root",
      "action": false,
      "subItem": []
    }
    this.response[0].legalRisk_add.push(obj); 
  }

  deleteRow(i) {
    if (this.response[0].legalRisk_add.length == 1 || this.pocSubmited || !this.response[0].legalRisk_add[i].draft[0].flag || this.bidStatus == 'DROPPED') {
      return;
    }
    if (this.user_type != "CONTRIBUTOR" && this.user_subtype != "Legal") {
      this._alert.sweetError("Sorry, You are not authorised to delete")
      return false;
    }
    if (this.response[0].legalRisk_add[i].item_id == undefined) {
      this.response[0]['legalRisk_add'].splice(i, 1);
      return;
    }

    this._alert.deleted("").then(success => {
      this._bidService.removeLegalItem({ item_id: this.response[0].legalRisk_add[i].item_id }).subscribe(resp => {
        this.response[0]['legalRisk_add'].splice(i, 1);
        // this._alert.sweetSuccess();
      });
    }, cancel => {
      return;
    });
  }

  onUpload(index) {
    if (this.pocSubmited || this.bidData.parent || this.bidStatus == 'DROPPED') {
      return;
    }
    if (this.user_type != "BID_OWNER" && this.user_type != "CONTRIBUTOR") {
      this._alert.sweetError("Sorry, You are not authorised to upload documents")
      return false;
    } else if (this.response[0].legalRisk_add[index].contributor != this.user.user_id && !this.response[0].legalRisk_add[index].draft[0].flag) {
      return false;
    } else if (this.response[0].legalRisk_add[index].contributor == this.user.user_id &&
      this.response[0].legalRisk_add[index].draft.length > 1 &&
      !this.response[0].legalRisk_add[index].draft[1].flag) {
      return false;
    } else {
      this.openDialog(index)
    }
  }

  openDialog(index) {
    let obj = {
      "bid_id": this.bid_id,
      "type": 'legal'
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
        let obj = {
          "attachment_id": result[i].attachment_id,
          "attachment_n": result[i].original_name,
          "attachment_path": result[i].filename,
          "description": result[i].description,
          "type": "BID_DEV_LEGAL",
          "doc_version": result[i].doc_version,
          "user_id": result[i].user_id,
          "revision": result[i].revision ? result[i].revision : false,
          "flag": result[i].flag,
          "isPublic": result[i].isPublic,
          "level": result[i].level,
          "parent_id": result[i].parent_id ? result[i].parent_id : "",
          "date_created": result[i].date_created
        }
        this.attachment_data.push(obj)
      }
      let attach = this.response[0].legalRisk_add[index].attachment_data.concat(this.attachment_data);
      this.response[0].legalRisk_add[index].attachment_data = attach;
      this.attachmentFlag = true;
      this.onSaveAsDraft();
    });
  }

  onDownloadDialog(index) {
    this.downloadIndex = index;
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '365px',
      width: '850px',
      data: this.response[0].legalRisk_add[index]
    })
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      } else if (result == true) {
        // this.updateAttachments(temp);
      } else {
        this.versionData = result;
        this.openDialog(this.downloadIndex);
      }
    })
  }

  onDateSelect(index) {
    this.response[0].legalRisk_add[index].startDate = this.response[0].legalRisk_add[index].dateTimeRange[0];
    this.response[0].legalRisk_add[index].endDate = this.response[0].legalRisk_add[index].dateTimeRange[1];
  }


  data = [];
  preSubmit() {
    let validate = true;
    this.data = [];
    this.response[0]['user_type'] = this.user_type;
    this.req = this.response;
    this.req[0].legalRisk_add.forEach(element => {
      element.user_type = "BID_OWNER";
    });
    if (this.user_type == "CONTRIBUTOR") {
      this.data = this.req[0].legalRisk_add.filter(a => a.draft.length == 1 && a.user_id == this.userID);
    } else {
      this.data = this.req[0].legalRisk_add.filter(a => a.draft.length > 1 && a.draft[1].flag);
    }
    if (this.data.length == 0) {
      validate = false;
    } /* else {
      this.req[0].legalRisk_add = this.data;
    } */
    return validate;
  }

  onSaveAsDraft() {
    if (!this.preSubmit()) {
      return false;
    }
    this.req[0].legalRisk_add = this.data;
    this._bidService.saveasDraftLegalData(this.req[0]).subscribe(resp => {
      if (resp['data'] == null) {
        return;
      }
      this.response = resp['data'];
      this.read();
      if (!this.attachmentFlag) {
        this._alert.sweetSuccess("Data has been saved successfully");
      }
      this.attachmentFlag = false;
    }, (error) => {
      this.loader = false;
      if (error.error.code == 400) {
        this._alert.sweetError(error.error.msg);
      }
    });
  }

  newValidate() {
    let validate = true;
    this.response[0].legalRisk_add.forEach(element => {
      for (let item in element) {
        if (this.user_type == "CONTRIBUTOR" && this.user_subtype == "Legal" && (item == 'description' || item == "startDate" || item == "endDate")) {
          (element[item] === '' || element[item] === null)   ? validate = false : '';
          // console.log("Legal", element[item])
        } else if (this.user_type == "BID_OWNER" && item == "mitigation") {
          element[item] === '' ? validate = false : '';
        }
      }
    });
    return validate;
  }
 
  onSubmit() {
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    if (!this.preSubmit()) {
      this._alert.sweetError("Please enter inputs");
      return false;
    }
    this.response[0]['user_type'] = this.user_type;
    this._alert.added("").then(success => {
      if (this.data.length != 0) {
        this.req[0].legalRisk_add = this.data;
      }
      this._bidService.submitLegalData(this.req[0]).subscribe(resp => {
        this.response = resp['data'];
        this.read();
        this._alert.sweetSuccess("Data has been submitted successfully");
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        });
      }, (error) => {
        console.log(error);
        this.loader = false;
        if (error.error.code == 400) {
          this._alert.sweetError(error.error.msg);
        }
      });
    }, cancel => {
      return;
    });

  }
  onReset() {
    this.response[0].legalRisk_add.forEach(element => {
      if (element.draft.length == 1 || element.draft[0].flag == true) {
        element.description = "";
        element.dateTimeRange = ""
        element.attachment_data = [];
      }
      else if (element.draft[1].flag == true && element.contributor == this.userID) {
        element.mitigation = ""
      }
    });
  }

}
