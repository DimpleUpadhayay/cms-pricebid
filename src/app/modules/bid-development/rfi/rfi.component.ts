import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BidService } from '../../../services/bid.service'
import { SharedService } from '../../../services/shared.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { PocDashboardService } from '../../../services/poc.service';
import { MatDialog } from '@angular/material';

// import * as _ from "lodash";
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { HttpService } from '../../../services/http.service';
@Component({
  selector: 'app-rfi',
  templateUrl: './rfi.component.html',
  styleUrls: ['./rfi.component.css'],
  providers: [UploadfileComponent, PocDashboardService]

})
export class RfiComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) alert: AlertComponent;
  bid_id;
  user;
  read;
  module;
  user_type;
  user_subtype;
  poc;
  temp = 0;
  message: any;
  categories;
  refreshObj;
  versionData
  downloadIndex;
  rfiButton;
  access;
  // Boolean Varialbes
  pocSubmited: boolean = false
  RFI = false;
  mainFlag = true;
  loader = false;
  bidStatus = "";
  // Array
  attachment_data = [];

  constructor(private _activeRoute: ActivatedRoute,
    private _bidService: BidService, private _httpService: HttpService,
    private dialog: MatDialog,
    private _pocService: PocDashboardService, public _sharedService: SharedService
  ) {
    // rootScope = this;
    this.bid_id = _activeRoute.snapshot.parent.params['id']
    this.read = _bidService.read;
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];

    if (this.user & this.user.role_module_mapping && this.user.role_module_mapping.length) {
      this.module = this.user.role_module_mapping.find(a => a.module_name.toLowerCase() == 'bid_development');
    }
    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: "BID_APPROVAL",
      sub_module: "RFI",
    };
    // refresh call
    this._sharedService.newData.subscribe(a => {
      if (a.data == 'rfi') {
        this.getRfiRefresh();
      }
    });
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
      "module": "informationRequired",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": this.pocSubmited
    }).subscribe(response => {
      // console.log(response);
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
      this.getPoc();
      this.getRfi();
    }, error => {
      console.log(error);
    });
  }

  onAdd(temp) {
    let reqData = {
      "action_taken": false,
      "attachment_data": [],
      "comment": "",
      "comment_type": "RFI",
      "justification": "",
      "approver_id": this.categories[temp].comment_add[0].approver_id,
      "approver_name": this.categories[temp].comment_add[0].approver_name
    };
    this.categories[temp].comment_add.push(reqData);
  }

  onDelete(index) {
    if (this.pocSubmited || this.categories[this.categories.length - 1].submit_flag) {
      return;
    }
    if (this.user_type != "BID_OWNER") {
      this.alert.sweetError("Sorry, You are not authorised to delete")
      return false;
    }
    let data = this.categories[this.temp].comment_add[index];
    if (data.comment == "" || data.justification == "" || data.comment_id == undefined) {
      this.categories[this.temp].comment_add.splice(index, 1);
      return;
    }
    this.categories[this.temp].comment_add.splice(index, 1);
    this.alert.deleted("").then(success => {

      this._sharedService.reviewType.emit({ type: 'tech' });
      this._bidService.updateRfi(this.categories[this.temp]).subscribe(resp => {
        this.categories[0].comment_add.splice(index, 1);
        this.getRfiRefresh();
        this.attachment_data = [];
      });
    }, error => {
      this.getRfiRefresh();
      //this.alert.sweetError("Failed to delete");
    });
  }

  getPoc() {
    this._pocService.getPocDashboards({ bid_id: this.bid_id }).subscribe(data => {
      if (data['data'] == null) {
        return;
      }
      this.poc = data['data']['poc_list'][0];
      if (!this.poc) {
        return;
      }
      if (this.poc && this.poc['bid_id']) {
        if (this.poc['process'] && this.poc['process'].findIndex(a => a.action == 'RFI' && a.status == true) >= 0) {
          this.pocSubmited = false;
          //this.RFI = true;
          return
        }
        this.pocSubmited = true;
      }
    })
  }

  // get RFI data
  getRfi() {
    this.loader = true;
    let obj = {
    }
    obj['com_cat'] = 'RFI';
    obj['bid_id'] = this.bid_id;
    this._bidService.getRfi(obj).subscribe(data => {
      if (data['data'] == null) {
        this.categories = [];
        this.loader = false;
        return;
      }
      if (data['code'] == 2000) {
        this.categories = data['data']['approval_data'];
        this.temp = this.categories.length - 1;
        this.rfiButton = this.categories[this.temp].ac_id
        this.loader = false;
      }
    }, error => {
      this.loader = false;
    })
  }

  getRfiRefresh() {
    let obj = {
    }
    obj['com_cat'] = 'RFI';
    obj['bid_id'] = this.bid_id;
    this._bidService.getRfi(obj).subscribe(data => {
      if (data['data'] == null) {
        return;
      }
      if (data['code'] == 2000) {
        this.categories = data['data']['approval_data'];
        this.temp = this.categories.length - 1;
        this.rfiButton = this.categories[this.temp].ac_id
      }
    }, error => {
    })
  }

  onRfiButton(cat) {
    this.rfiButton = cat.ac_id;
    // console.log(this.rfiButton)
  }

  // upload attachments
  onUpload(index) {
    if (this.categories[this.temp].submit_flag) {
      return;
    }
    if (this.user_type != "BID_OWNER") {
      this.alert.sweetError("Sorry, You are not authorised to upload documents")
      return false;
    } else {
      this.openDialog(index);
    }
  }

  openDialog(index): void {
    let obj = {
      "bid_id": this.bid_id,
      "type": 'RFI'
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
          "type": "BID_DEV_RFI",
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
      /* this.categories[this.categories.length - 1].comment_add[index].attachment_data = this.attachment_data;
      this.attachment_data = []; */
      if (this.categories[this.temp].comment_add[index].attachment_data) {
        this.attachment_data.forEach(item => {
          this.categories[this.temp].comment_add[index].attachment_data.push(item);
        })
      } else {
        this.categories[this.temp].comment_add[index].attachment_data = this.attachment_data;
      }
      this.attachment_data = [];
      if (result.length != 0)
        this.updateAttachments(this.temp);
    });
  }

  // save as draft call after upload and delete attachment
  updateAttachments(temp) {
    this._bidService.updateRfi(this.categories[temp]).subscribe(success => {
      this._sharedService.reviewType.emit({ type: 'tech' });
      this.getRfiRefresh();
    }, error => {
      this.alert.sweetError("Something went wrong");
    });
  }

  // download attachments
  onDownloadDialog(index) {
    if (this.categories[this.temp].comment_add[index].attachment_data.length == 0) {
      this.alert.sweetNoAttachments();
      return;
    }
    this.downloadIndex = index;
    if (this.categories[this.temp] && this.categories[this.temp].comment_add) {
      const dialogRef = this.dialog.open(DownloadComponent, {
        height: '365px',
        width: '850px',
        data: this.categories[this.temp].comment_add[index]
      });
      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          return;
        } else if (result == true) {
          this.updateAttachments(this.temp);
        } else if (result) {
          this.versionData = result;
          this.openDialog(this.downloadIndex);
        }
      });
    }
  }

  // save as draft
  onSaveAsDraft(temp) {
    this.categories[temp].submit_flag = false;
    this.categories[temp].comment_add.forEach(element => {
      element.comment_flag = true;
    });
    this._bidService.updateRfi(this.categories[temp]).subscribe(data => {
      this._sharedService.reviewType.emit({ type: 'tech' });
      this.alert.sweetSuccess("Data saved as draft");
      this.getRfiRefresh();
    });
  }

  // submir rfi data
  updateRfi(temp) {
    if (!this.validate()) {
      this.alert.sweetError("Please fill empty fields");
      return;
    }
    this.categories[temp].comment_add.forEach(element => {
      if (element.comment == "" || element.justification == "") {
        this.alert.sweetError("Please fill empty fields");
        return false;
      }
    });
    this.categories[temp].submit_flag = true;
    this.categories[temp].comment_add.forEach(element => {
      element.comment_flag = true;
      /* element.draft.forEach(item => {
        item.flag = false
      }); */
    });
    this.alert.added("").then(sucess => {
      this.poc.process.map(a => {
        return a.status = false;
      });
      this.poc['status'] = "INACTIVE"
      this._bidService.updateRfi(this.categories[temp]).subscribe(data => {
        this.updatePoc();
        this._sharedService.reviewType.emit({ type: 'tech' });
        this._sharedService.changeMessage({ "revisionFlag": true, "flag": true });
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        }, cancel => {
        });
        this.getRfiRefresh();
      })
    }, cancel => {
      this.categories[0].comment_add.forEach(element => {
        element.comment_flag = false;
        this.categories[temp].submit_flag = false;
      });
    });
  }

  validate() {
    let validate = true;
    this.categories[this.temp].comment_add.forEach(element => {
      if (element.comment == "" || element.justification == "") {
        validate = false;
      }
    });
    return validate;
  }

  updatePoc() {
    this._pocService.updatePocDashboard(this.poc).subscribe(data => {
      this._sharedService.reviewType.emit({ type: 'tech' });
      this._bidService.rfiUpdated.emit(this.poc);
    });
  }

  // reset rfi
  onReset() {
    this.categories[this.temp].comment_add.forEach(element => {
      //element.comment = "";
      element.justification = "";
      element.attachment_data = [];
    });
  }

}
