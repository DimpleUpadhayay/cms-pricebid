import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material';
import _ = require('lodash');

import { BidService } from '../../../services/bid.service';
import { PocDashboardService } from '../../../services/poc.service';
import { SharedService } from '../../../services/shared.service';
import { HttpService } from '../../../services/http.service';
import { ProjectScopeService } from '../../../services/ps.service';

import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { AlertComponent } from '../../../libraries/alert/alert.component';
@Component({
  selector: 'app-docs-required',
  templateUrl: './docs-required.component.html',
  styleUrls: ['./docs-required.component.css'],
  providers: [BidService, UploadfileComponent, DownloadComponent, ProjectScopeService]
})
export class DocsRequiredComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  bid_id;
  bid;
  selectedFile: File;
  docsData;
  refreshObj;
  user;
  user_type;
  user_subtype;
  userID;
  downloadIndex;
  versionData;
  bidData;
  poc;
  reqData;
  mySubscription;
  access;
  submission_date;
  temp = 0;
  bidStatus = "";
  dt = new Date();
  minDate = new Date(this.dt.getFullYear(), this.dt.getMonth(), this.dt.getDate());
  projectScope;

  // Array
  userList = [];
  attachment_data = [];
  contributors = [];
  contributor = [];

  // Boolean Values
  assignmentByBM = true;
  submitFlag = false;
  loader = false;
  revokeFlag = false;
  reassignFlag = false;
  disableFlag = false;
  pocSubmited: boolean = false

  constructor(private _bidService: BidService, private _pocService: PocDashboardService, private dialog: MatDialog,
    private _activeRoute: ActivatedRoute, private _sharedService: SharedService, private _httpService: HttpService,
    private _psService: ProjectScopeService) {
    this.bid_id = _activeRoute.snapshot.parent.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.userID = this.user.user_id;
    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: "BID_DEVELOPMENT",
      sub_module: "DOC-REQ",
    };
    this._sharedService.reviewType.emit({ type: 'empty' });
    this.accessControl();
  }

  ngOnInit() {
    this._sharedService.reviewType.emit({ type: 'empty' });
    this.mySubscription = this._sharedService.newData.subscribe(a => {
      if (a.data == 'docs-required' && this.checkAction(this.docsData)) {
        this.readDocsRequiredDataRefresh()
      }
    }, error => {
    })
    this.loader = true
  }

  ngOnDestroy() {
    this.dialog.closeAll()
  }

  checkAction(data) {
    var validate = true
    if (data.docrequired_add.length != 0) {
      let contributor = data.docrequired_add.filter(a => { return a.contributor == this.user.user_id || a.draft.length == 1 })
      if (contributor.length != 0 && contributor[0].draft.length == 2 && contributor[0].draft[1].flag) {
        validate = false
      } else if (contributor[contributor.length - 1].draft.length == 1) {
        validate = false
      }
    }
    return validate
  }

  accessControl() {
    this._httpService.accessControl({
      "module": "docRequired",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": this.pocSubmited
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
      this.getBidById();
      this.getProjectScope();
      this.readDocsRequiredData();
    }, error => {
    });
  }

  getBidById() {
    this._bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bidData = resp['data']['bid']
      this.bidStatus = this.bidData.bidFinalStatus ? this.bidData.bidFinalStatus : "";
      this.submission_date = new Date(this.bidData.date_submission);
      this.getContributorList(this.bidData.contributor);
    }, error => {
    })
  }

  getContributorList(contributor) {
    let user_list = this.bidData.participants;
    for (var i = 0; i < user_list.length; i++) {
      if (user_list[i].userTypes && user_list[i].userTypes[0].user_type == "CONTRIBUTOR") {
        let user = {
          "user_id": "",
          "username": "",
          "user_type": "",
          "user_subtype": ""
        }
        user.user_id = user_list[i].user_id;
        user.username = user_list[i].username;
        user.user_type = user_list[i].userTypes ? user_list[i].userTypes[0].user_type : user_list[i].user_type;
        user.user_subtype = user_list[i].userTypes ? user_list[i].userTypes[0].user_subtype : user_list[i].user_subtype;
        this.userList.push(user);
      }
    }
    for (var i = 0; i < this.userList.length; i++) {
      contributor.forEach(item => {
        if (item == this.userList[i].user_id) {
          this.contributors.push(this.userList[i]);
        }
      })
    }
    //add BM to list
    user_list.forEach(item => {
      if (item.userTypes[0].user_type == "BID_OWNER"/*  && item.user_id == this.user.user_id */) {
        this.contributors.push(item);
      }
    });
  }

  readDocsRequiredData() {
    this.loader = true
    let obj = {
      "bid_id": this.bid_id, "user": this.user.user_id, "user_type": this.access.participants[0].userTypes[0].user_type,
      "user_subType": this.access.participants[0].userTypes[0].user_subtype, "status": "ACTIVE"
    }
    this._bidService.getDocsRequiredData(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.docsData = {
          "bid_id": this.bid_id,
          "docrequired_add": [{
            "contributor": "",
            "description": "",
            "remarks": "",
            "dateTimeRange": "",
            "attachment_data": [],
            "draft": [
              {
                "user": this.user.user_id,
                "user_type": "BID_OWNER",
                "flag": true
              }
            ],
            "action": true
          }]
        }
        this.loader = false
        if (this.user_type == "BID_OWNER")
          this.submitFlag = true;
        return;
      }
      this.docsData = resp['data'][0]
      let contributo = this.docsData.docrequired_add.filter(a => { return a.contributor == this.user.user_id })
      if ((contributo.length == 0 && this.user_type == 'CONTRIBUTOR') || this.docsData.docrequired_add[0].draft[0].flag) {
        this.submitFlag = true
      } else if (contributo.length == 0) {
        this.submitFlag = false
      } else if (contributo.length != 0 && contributo[0].draft[1].user_type == "BID_OWNER" && contributo[0].draft[1].flag) {
        this.submitFlag = true
      } else {
        this.submitFlag = contributo[contributo.length - 1].draft[1].flag
      }
      this.docsData.docrequired_add.forEach(element => {
        element.dateTimeRange = [element.startDate, element.endDate]
        if (element.action && element.contributor == this.userID) {
          this.submitFlag = true
        }
      })
      if (this.docsData.docrequired_add.length == 0) {
        let data = {
          "contributor": "",
          "description": "",
          "remarks": "",
          "dateTimeRange": "",
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
        this.docsData.docrequired_add.push(data)
      }
      let contributor = this.docsData.docrequired_add.filter(a => { return a.contributor == this.user.user_id })
      this.assignmentByBM = this.docsData.docrequired_add[0].draft[0].flag
      if (this.user_type == "BID_OWNER" && this.docsData.docrequired_add.length != 0) {
        if (contributor.length != 0 && contributor[0].draft.length > 1 && !contributor[0].draft[1].flag)
          this.disableFlag = true
      } else if (this.user_type == "CONTRIBUTOR" && this.docsData.docrequired_add.length != 0) {
        if (contributor.length != 0) {
          if (contributor[0].draft.length > 1 && !contributor[0].draft[1].flag) {
            this.disableFlag = true
          }
        } else {
          this.disableFlag = true
        }
      }
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // BM can re-assign the task, if the task is assigned to the contributor
  onReassign(index) {
    if (this.bidStatus == 'DROPPED') {
      return;
    }
    let selectedRow = this.docsData.docrequired_add[index];
    selectedRow.reassignFlag = true;
    this.reassignFlag = true;
    this.getPendingTask(selectedRow);
  }

  // Pending task api for Each and every user in the Bid
  getPendingTask(rowData) {
    let contributor = rowData.contributor;
    this.contributors.forEach(x => {
      if (x.user_id == contributor) {
        x.reassignFlag = true;
        return false;
      }
    })
    let obj = {
      "bid_id": this.bid_id,
      "contributors": this.contributors.filter(x => !x.reassignFlag).map(x => x.user_id)
    }
    this._bidService.getPendingTask(obj).subscribe(result => {
      let pendingTasks = result['data'];

      pendingTasks.forEach(user => {
        let matchingContributor = this.contributors.find(x => x.user_id == user.user_id);
        matchingContributor.count = user.pendingTasks.count;
      });
      rowData["originalContributor"] = rowData.contributor;
      rowData.contributor = "";
    })
  }

  // if the BM is re-assigning the task, and he wants to reset the user
  onReassignClear(index) {
    let selectedRow = this.docsData.docrequired_add[index];
    selectedRow.contributor = selectedRow.originalContributor;
    delete selectedRow.reassignFlag;
    delete selectedRow.originalContributor;
    this.reassignFlag = false;
  }

  readDocsRequiredDataRefresh() {
    let obj = {
      "bid_id": this.bid_id, "user": this.user.user_id, "user_type": this.access.participants[0].userTypes[0].user_type,
      "user_subType": this.access.participants[0].userTypes[0].user_subtype, "status": "ACTIVE"
    }
    this._bidService.getDocsRequiredData(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.docsData = {
          "bid_id": this.bid_id,
          "docrequired_add": [{
            "contributor": "",
            "description": "",
            "remarks": "",
            "dateTimeRange": "",
            "attachment_data": [],
            "draft": [
              {
                "user": this.user.user_id,
                "user_type": "BID_OWNER",
                "flag": true
              }
            ],
            "action": true
          }]
        }
        if (this.user_type == "BID_OWNER")
          this.submitFlag = true;
        return;
      }
      this.docsData = resp['data'][0]
      let contributo = this.docsData.docrequired_add.filter(a => { return a.contributor == this.user.user_id })
      if ((contributo.length == 0 && this.user_type == 'CONTRIBUTOR') || this.docsData.docrequired_add[0].draft[0].flag) {
        this.submitFlag = true
      } else if (contributo.length == 0) {
        this.submitFlag = false
      } else if (contributo.length != 0 && contributo[0].draft[1].user_type == "BID_OWNER" && contributo[0].draft[1].flag) {
        this.submitFlag = true
      } else {
        this.submitFlag = contributo[contributo.length - 1].draft[1].flag
      }
      this.docsData.docrequired_add.forEach(element => {
        element.dateTimeRange = [element.startDate, element.endDate]
        if (element.action && element.contributor == this.userID) {
          this.submitFlag = true
        }
      })
      if (this.docsData.docrequired_add.length == 0) {
        let data = {
          "contributor": "",
          "description": "",
          "remarks": "",
          "dateTimeRange": "",
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
        this.docsData.docrequired_add.push(data)
      }
      let contributor = this.docsData.docrequired_add.filter(a => { return a.contributor == this.user.user_id })
      this.assignmentByBM = this.docsData.docrequired_add[0].draft[0].flag
      if (this.user_type == "BID_OWNER" && this.docsData.docrequired_add.length != 0) {
        if (contributor.length != 0 && contributor[0].draft.length > 1 && !contributor[0].draft[1].flag)
          this.disableFlag = true
      } else if (this.user_type == "CONTRIBUTOR" && this.docsData.docrequired_add.length != 0) {
        if (contributor.length != 0) {
          if (contributor[0].draft.length > 1 && !contributor[0].draft[1].flag) {
            this.disableFlag = true
          }
        } else {
          this.disableFlag = true
        }
      }
    }, error => {
    })
  }

  onDateSelect(temp, index) {
    this.docsData.docrequired_add[index].startDate = this.docsData.docrequired_add[index].dateTimeRange[0]
    this.docsData.docrequired_add[index].endDate = this.docsData.docrequired_add[index].dateTimeRange[1]
  }

  addRow() {
    if (this.user_type != "BID_OWNER" || this.bidData.parent) {
      return false
    }
    let reqData = {
      "contributor": "",
      "description": "",
      "dateTimeRange": "",
      "remarks": "",
      "attachment_data": [],
      "draft": [
        {
          "user": this.user.user_id,
          "user_type": "BID_OWNER",
          "flag": true
        }
      ],
      "action": true
    }
    this.docsData.docrequired_add.push(reqData)
  }

  // Delete Row
  deleteRow(index) {
    if (this.docsData.docrequired_add.length == 1 || this.pocSubmited || this.bidData.parent || this.bidStatus == 'DROPPED') {
      return false
    }
    if (this.user_type != "BID_OWNER") {
      this._alert.sweetError("Sorry, You are not authorised to delete")
      return false
    }
    let dataval = this.docsData.docrequired_add[index]
    if (dataval.item_id == undefined) {
      this.docsData.docrequired_add.splice(index, 1)
      return
    } else if (!dataval.draft[0].flag) {
      return
    }
    this._alert.deleted("").then(success => {
      this.loader = true
      this._bidService.deleteDocsRequired({ "item_id": dataval.item_id }).subscribe(resp => {
        this.docsData.docrequired_add.splice(index, 1)
        this.loader = false
      }, error => {
        this.loader = false
        this.readDocsRequiredDataRefresh()
      })
    }, error => {
      return
    })
  }

  onFileChanged(event) {
    this.selectedFile = <File>event.target.files[0]
  }

  // upload attachmnets
  onUpload(index) {
    let data = this.docsData.docrequired_add[index]
    if (this.pocSubmited || (data.contributor != this.userID && data.draft.length > 1) || this.bidData.parent || this.bidStatus == 'DROPPED') {
      return
    }
    if (this.user_type != "BID_OWNER" && this.user_type != "CONTRIBUTOR") {
      this._alert.sweetError("Sorry, You are not authorised to upload documents")
      return false
    } else if (data.draft.length == 2 && data.draft[1].user == this.user.user_id && !data.draft[1].flag) {
      return false
    }/*  else if (this.disableFlag) {

    } */ else {
      this.openDialog(index)
    }
  }

  openDialog(index): void {
    let obj = {
      "bid_id": this.bid_id,
      "type": 'docReq'
    }
    const dialogRef = this.dialog.open(UploadfileComponent, {
      height: '340px',
      width: '850px',
      data: this.versionData ? this.versionData : obj
    })

    dialogRef.afterClosed().subscribe(result => {
      this.versionData = undefined
      if (!result || result.length == 0) {
        return
      }
      for (var i = 0; i < result.length; i++) {
        let obj
        obj = {
          "attachment_id": result[i].attachment_id,
          "attachment_n": result[i].original_name,
          "attachment_path": result[i].filename,
          "description": result[i].description,
          "type": "BID_DEV_DOCREQ",
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
      if (this.docsData.docrequired_add[index].attachment_data) {
        this.attachment_data.forEach(item => {
          this.docsData.docrequired_add[index].attachment_data.push(item)
        })
      } else {
        this.docsData.docrequired_add[index].attachment_data = this.attachment_data
      }
      this.attachment_data = []
      if (result.length != 0)
        this.updateAttachment()
    }, error => {
    })
  }

  // save as draft call after upload and delete attachment
  updateAttachment() {
    this.docsData.docrequired_add.forEach(element => {
      this.contributors.forEach(con => {
        if (con.user_id == element.contributor) {
          element['user_type'] = con.user_type
        }
      })
    })
    this.docsData['user_type'] = this.access.participants[0].userTypes[0].user_type
    this.docsData['user_subtype'] = this.access.participants[0].userTypes[0].user_subtype

    if (this.docsData.docrequired_add[0].draft.length == 1) {
      if (this.docsData.date_created) {
        this._bidService.saveAsDraftDocsRequired(this.docsData).subscribe(success => {
          this.readDocsRequiredDataRefresh()
        }, error => {
          this._alert.sweetError("Something went wrong")
        })
      } else {
        this.docsData.isSave = true
        this._bidService.createDocsRequiredData(this.docsData).subscribe(success => {
          this.readDocsRequiredDataRefresh()
        }, error => {
          this._alert.sweetError("Something went wrong")
        })
      }
    } else if (this.docsData.docrequired_add[0].draft.length > 1) {
      this.getContributorsData()
      this.docsData.docrequired_add = this.contributor
      this._bidService.saveAsDraftDocsRequired(this.docsData).subscribe(success => {
        this.readDocsRequiredDataRefresh()
      }, error => {
        this._alert.sweetError("Something went wrong")
      })
    } else {
      this.docsData.isSave = true
      this._bidService.createDocsRequiredData(this.docsData).subscribe(success => {
        this.readDocsRequiredDataRefresh()
      }, error => {
        this._alert.sweetError("Something went wrong")
      })
    }
  }

  // download attachmnets
  onDownloadDialog(index) {
    if (this.docsData.docrequired_add[index].attachment_data.length == 0) {
      this._alert.sweetNoAttachments()
      return
    }
    this.downloadIndex = index
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '365px',
      width: '850px',
      data: this.docsData.docrequired_add[index]
    })
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return
      } else if (result == true) {
        this.updateAttachment()
      } else if (result) {
        this.versionData = result
        this.openDialog(this.downloadIndex)
      }
    }, error => {
    })
  }

  // to check whether bid is under approval or not
  getPoc() {
    this.loader = true
    this._pocService.getPocDashboards({ bid_id: this.bid_id }).subscribe(data => {
      if (data['data'] == null) {
        this.loader = false
        return
      }
      this.loader = false
      this.poc = data['data']['poc_list'][0]
      if (!this.poc) {
        return
      }
      if (this.poc && this.poc['bid_id']) {
        if (this.poc['process'] && this.poc['process'].findIndex(a => a.action == 'RFI' && a.status == true) >= 0) {
          this.pocSubmited = false
          return
        }
        this.pocSubmited = true
      }
    }, error => {
      this.loader = false
    })
  }

  // Project scope Api if Project scope is not submitted
  getProjectScope() {
    this._psService.getProjectScopes(this.bid_id, this.user_type).subscribe(projectScopeData => {
      if (projectScopeData['data'] == null) {
        return
      }
      this.projectScope = projectScopeData['data']['projectscope_data'][0]
    }, error => {

    })
  }

  newValidate() {
    let validate = true
    this.docsData.docrequired_add.forEach(element => {
      for (let item in element) {
        if (element.draft.length == 1 && item != "remarks") {
          element[item] === '' || (item == "dateTimeRange" && (element[item][0] == undefined || element[item][1] == undefined)) ? validate = false : ''
        } else if (element.draft.length > 1 && this.userID == element.contributor && item == 'remarks' && element.draft[1].flag) {
          element[item] === '' || element[item] == null ? validate = false : ''
        }
      }
    })
    return validate
  }

  getContributorsData() {
    this.contributor = []
    this.docsData.docrequired_add.forEach(element => {
      this.contributors.forEach(con => {
        if (con.user_id == element.contributor) {
          element['user_type'] = con.user_type
        }
      })
    })
    if (this.user_type == "BID_OWNER") {
      this.docsData.docrequired_add.forEach(element => {
        if ((element.contributor == this.userID
          && (element.draft.length == 1 || (element.draft.length == 2 && element.draft[1].flag)))
          || (element.draft.length == 1 && element.draft[0].flag)) {
          this.contributor.push(element)
        }
      });
    } else if (this.user_type == "CONTRIBUTOR") {
      this.contributor = this.docsData.docrequired_add.filter(element => {
        return element.contributor == this.userID && (element.draft.length == 2 && element.draft[1].flag)
      })
    }
  }

  // "BM and contributor can edit the task, if the task is submitted"
  onEdit(index) {
    if (this.bidStatus == 'DROPPED') {
      return;
    }
    this.submitFlag = true;
    this.revokeFlag = true;
    let data = this.docsData.docrequired_add[index];
    if (data.contributor == this.userID && data.draft[1].flag == false) {
      data.draft[1].flag = true;
    }
    this.onSaveAsDraft();
    this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
    }, cancel => {
    });
  }

  onSubmit() {
    if (this.projectScope == undefined || this.projectScope.participants.length == 0) {
      this._alert.sweetError("Please Submit PROJECT SUMMARY")
      return
    }
    if (!this.newValidate()) {
      this._alert.sweetError("Please enter manadary fields")
      return
    }
    // this.getContributorsData();
    this.docsData['user_type'] = this.access.participants[0].userTypes[0].user_type
    this.docsData['user_subtype'] = this.access.participants[0].userTypes[0].user_subtype
    this.docsData && this.docsData.date_created ? this.update() : this.create()
  }

  create() {
    this._alert.added("").then(success => {
      this.loader = true
      this._bidService.createDocsRequiredData(this.docsData)
        .subscribe((response) => {
          this.attachment_data = []
          this.readDocsRequiredDataRefresh()
          this.loader = false
          this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
          }, cancel => {
          })
        }, error => {
          this.loader = false
        })
    }, cancel => {
      return
    })
  }

  update() {
    if (this.docsData.docrequired_add[0].draft.length != 1) {
      this.getContributorsData()
      if (this.contributor.length == 0) {
        this._alert.sweetError("Please enter inputs")
        return
      }
    }
    this._alert.added("").then(success => {
      this.loader = true
      if (this.docsData.docrequired_add[0].draft.length == 1) {
        this._bidService.submitDocsRequired(this.docsData)
          .subscribe((response) => {
            this.attachment_data = []
            this.readDocsRequiredDataRefresh()
            this.loader = false
            this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
            }, cancel => {
            })
          }, error => {
            this.loader = false
          })
      } else {
        this.getContributorsData()
        this.docsData.docrequired_add = this.contributor
        this._bidService.submitDocsRequired(this.docsData)
          .subscribe((response) => {
            this.attachment_data = []
            this.readDocsRequiredDataRefresh()
            this.loader = false
            this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
            }, cancel => {
            })
          }, error => {
            this.loader = false
          })
      }
    }, cancel => {
      return
    })
  }

  // save as draft
  onSaveAsDraft() {
    this.docsData['isSave'] = true
    // this.getContributorsData();
    this.docsData['user_type'] = this.access.participants[0].userTypes[0].user_type
    this.docsData['user_subtype'] = this.access.participants[0].userTypes[0].user_subtype
    this.docsData && this.docsData.date_created ? this.updateDraft() : this.createDraft()
  }

  createDraft() {
    this.loader = true
    this._bidService.createDocsRequiredData(this.docsData)
      .subscribe((response) => {
        this.loader = false
        this._alert.sweetSuccess("Data saved as draft")
        this.readDocsRequiredDataRefresh()
      }, error => {
        this.loader = false
      })
  }

  updateDraft() {
    if (this.docsData.docrequired_add[0].draft.length != 1) {
      this.getContributorsData()
      if (this.contributor.length == 0) {
        this._alert.sweetError("Please enter inputs")
        return
      }
    }
    this.loader = true
    if (this.docsData.docrequired_add[0].draft.length == 1) { // When BM assign task for 1st Time
      this._bidService.saveAsDraftDocsRequired(this.docsData)
        .subscribe((response) => {
          this.loader = false
          this._alert.sweetSuccess("Data saved as draft")
          this.readDocsRequiredDataRefresh()
        }, error => {
          this.loader = false
        })
    } else {
      this.getContributorsData()
      this.docsData.docrequired_add = this.contributor
      this._bidService.saveAsDraftDocsRequired(this.docsData)
        .subscribe((response) => {
          this.loader = false
          if (!this.revokeFlag)
            this._alert.sweetSuccess("Data saved as draft");
          this.revokeFlag = false;
          this.readDocsRequiredDataRefresh();
        }, error => {
          this.loader = false
        })
    }
  }

  // Reset Starts Here
  onReset() {
    this.docsData.docrequired_add.forEach(element => {
      if (!element.draft || element.draft.length == 0 || element.draft[0].flag) {
        element.dateTimeRange = "";
        element.description = "";
        element.contributor = "";
        element.attachment_data = [];
      } else if (element.draft[1].flag && element.contributor == this.userID) {
        element.remarks = ""
      }
    })
  }

  updateReassignmentRow(index) {
    let obj = {
      "bid_id": this.bid_id, "user": this.user.user_id, "user_type": this.access.participants[0].userTypes[0].user_type,
      "user_subType": this.access.participants[0].userTypes[0].user_subtype, "status": "ACTIVE"
    };
    this._bidService.getDocsRequiredData(obj).subscribe(result => {
      result = result['data'][0];
      if (!result) return;
      let element = result['docrequired_add'][index];
      element.dateTimeRange = [element.startDate, element.endDate];
      this.docsData.docrequired_add[index] = result['docrequired_add'][index];
    })
  }

  onReassignSubmit(index) {
    this.docsData['user_type'] = this.user_type;
    this.docsData['user_subtype'] = this.user_subtype;
    this.docsData['reassign'] = true;
    let reqObj = Object.assign({}, this.docsData);
    let reassignData = [reqObj["docrequired_add"][index]];

    reqObj["docrequired_add"] = JSON.parse(JSON.stringify(reassignData));
    if (reqObj["docrequired_add"][0].contributor == "") {
      this._alert.sweetError("Please select the Contributor")
      return;
    }
    reqObj["docrequired_add"].forEach(element => {
      element.draft = [element.draft[0]];
      element.draft[0].flag = true;
      this.contributors.forEach(con => {
        if (con.user_id == element.contributor) {
          element['user_type'] = con.user_type;
        }
      });
    });
    if (this.docsData.date_created && this.user_type == "BID_OWNER") {
      this._alert.added("").then(success => {
        this.onReassignClear(index);
        this._bidService.submitDocsRequired(reqObj).subscribe(resp => {
          this.updateReassignmentRow(index);
          this._sharedService.reviewType.emit({ type: 'tech' });
          this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
          }, cancel => {
          });
        }, error => {
          this.loader = false;
        });
      }, cancel => {
        this.loader = false;
        return;
      });
    }
  }

  disableSubmitButtons() {
    let flag = false;
    if ((!this.submitFlag && this.user_type == 'CONTRIBUTOR') || this.bidData.parent || this.reassignFlag) {
      flag = true;
    }
    return flag;
  }
}