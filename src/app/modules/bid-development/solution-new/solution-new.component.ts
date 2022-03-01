import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isNumber } from 'util';

import { MatDialog } from '@angular/material';

import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { SolutionCategoryComponent } from '../pricing/solution-category/solution-category.component';
import { ClonecategoryComponent } from '../clonecategory/clonecategory.component';

import { PocDashboardService } from '../../../services/poc.service';
import { BidService } from '../../../services/bid.service';
import { SharedService } from '../../../services/shared.service';
import { HttpService } from '../../../services/http.service';
import { ProjectScopeService } from '../../../services/ps.service';
 
var rootScope;

@Component({
  selector: 'app-solution-new',
  templateUrl: './solution-new.component.html',
  styleUrls: ['./solution-new.component.css'],
  providers: [PocDashboardService, ProjectScopeService]
})
export class SolutionNewComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  user;
  temp = 0;
  productType = '';
  responseLength;
  selectedFile: File = null;
  bid_id;
  participants;
  user_type;
  user_subtype;
  poc;
  userID;
  bidData;
  reviewData;
  refreshObj;
  rootScope = this;
  mySubscription;
  start;
  versionData;
  downloadIndex;
  downloadTemp;
  access;
  submission_date;
  selectedCategory = '';
  bidStatus = "";
  projectScope;

  // Boolean Varialbes
  uploadFlag = false;
  disabledFlag = false;
  solutionReviewFlag = true;
  reassignFlag = false;
  pocSubmited: boolean = false;
  subItemflag = false;
  rfiFlag = false;
  actionFlag = false;
  tempFlag = false;
  loader = false;
  revokeFlag = false;
  reviewCompleted = false;
  reviewComment = false;
  assignmentByBM = true;
  isCoOwner = false;

  // Array
  response = [];
  attachment_data = [];
  userList = [];
  contributors = [];
  techProposalCats = [];
  oldAttachments = [];
  process = [];
  itemTechSoln = [];
  dateTimeRange = [null, null];
  revokeData = [];
  reviewers = [];
  techSolutionIdName = [];
  dt = new Date();
  minDate = new Date(this.dt.getFullYear(), this.dt.getMonth(), this.dt.getDate());
  contributorMaster: any;
  allContributorList: any;

  constructor(private _bidService: BidService, private dialog: MatDialog,
    private _pocService: PocDashboardService, private router: Router,
    private _activeRoute: ActivatedRoute, private _httpService: HttpService,
    private _sharedService: SharedService, private _psService: ProjectScopeService) {
    rootScope = this;
    this.bid_id = _activeRoute.snapshot.parent.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.userID = this.user.user_id;
    this.productType = this.user.product_type;
    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: undefined,
      sub_module: "SOLUTION-NEW",
    };
    // refresh call
    this.mySubscription = this._sharedService.newData.subscribe(a => {
      if ((a.data == "solution-new" || a.data == "solution-review") && this.checkAction(this.response)) {
        this.getTechSolutionReviewData();
        this.readDataRefresh();
        this._sharedService.reviewType.emit({ type: 'tech' });
      }
    });
    this.accessControl();
    // this.responseLength = 0;
  }

  ngOnInit() {
    this.loader = true;
    this._sharedService.reviewType.emit({ type: 'tech' });
    this._sharedService.submitForReview.subscribe(data => {
      this.solutionReviewFlag = data.flag;
    });
  }

  ngOnDestroy() {
    this.mySubscription.unsubscribe();
    this.dialog.closeAll();
  }

  getSignatures(firstName, lastName) {
    if (firstName != undefined || lastName != undefined) {
      let name = (firstName.trim())[0].toUpperCase() + (lastName.trim())[0].toUpperCase()
      return name
    } else {
      return "NA";
    }
  }

  accessControl() {
    this._httpService.accessControl({
      "module": "solution",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": this.pocSubmited
    }).subscribe(response => {
      this.access = response['data'];
      if (this.access.participants[0] && this.access.participants[0].userTypes[0]) {
        this.user_type = this.access.participants[0].userTypes[0].user_type;
        this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
        this.isCoOwner = this.access.participants[0].userTypes[0].coOwner ? true : false;
      }
      this.getBidById();
      this.getTechSolutionReviewData();
      this.getPoc();
      this.getProjectScope();
      this.readData();
    }, error => {
      // console.log(error);
      this.loader = false;
    });
  }

  getBidById() {
    this.loader = true;
    this._bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bidData = resp['data']['bid'];
      this.allContributorList = resp['data']['usersList'];
      this.bidStatus = this.bidData.bidFinalStatus ? this.bidData.bidFinalStatus : "";
      this.submission_date = new Date(this.bidData.date_submission);
      this.getContributorList();
      this.participants = this.bidData.participants.filter(a => {
        return a.user_type == 'CONTRIBUTOR'
      });
      this.reviewers = this.bidData.participants.filter(a => {
        return a.userTypes[0].user_type == "REVIEWER" && (a.userTypes[0].user_subtype == "Solution" || a.userTypes[0].user_subtype == 'Delivery' || a.userTypes[0].user_subtype == "Sales" || a.userTypes[0].user_subtype == "All")
      });
      this.loader = false;
    });
  } 
 
  // to check whether bid is under review or not
  getTechSolutionReviewData() {
    this.reviewComment = false;
    this._bidService.getTechSolutionReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this._sharedService.changeMessage({ "solutionReviewFlag": true });
          return;
        }
        let data = resp['data']['reviewtab_data'];
        this.solutionReviewFlag = data[data.length - 1].techSolReview_flag;
        if (data[data.length - 1].techSolReview_add.length > 0) {
          this.reviewComment = true;
        }
        data[data.length - 1].techSolReview_add.forEach(element => {
          if (element.approvalStatus) {
            this.reviewCompleted = true;
          } else {
            this.reviewCompleted = false;
          }
        });
        this._sharedService.changeMessage({ "solutionReviewFlag": this.solutionReviewFlag });
      }, error => {

      });
  }

  getProjectScope() {
    this._psService.getProjectScopes(this.bid_id, this.user_type).subscribe(projectScopeData => {
      if (projectScopeData['data'] == null) {
        return;
      }
      this.projectScope = projectScopeData['data']['projectscope_data'][0]
    }, error => {

    })
  }

  // before refreshing page, check whether user is working or not
  checkAction(data) {
    let validate = true;
    let subItem = false;
    if (data.length != 0) {
      let flag = false;
      if (data[this.temp].techsolution_add.length != 0) {
        data[this.temp].techsolution_add.forEach(element => {
          if (element.contributor == this.user.user_id) {
            flag = true;
            if (element.subItem && element.subItem.length != 0 && element.subItem[element.subItem.length - 1].draft[1].flag) {
              subItem = true;
            }
          }
        });
      }
      let contributor = this.response[this.temp].techsolution_add.filter(a => { return a.contributor == this.user.user_id; });
      if ((contributor == undefined || contributor.length == 0 && flag) || data[this.temp].techsolution_add[0].draft[0].flag) {
        validate = false;
      } else if (contributor.length != 0 && contributor[0].draft[1].flag) {
        validate = false;
      } else if (subItem) {
        validate = false;
      }
    }
    return validate;
  }

  getContributorList() {
    // console.log("Hello 247" , this.allContributorList)
    this.contributorMaster = [];
    this.allContributorList.contributorList.forEach(item =>{
      let user = {
        "user_id": item.user_id,
        "username": item.username,
        "eleUserRemove": item.eleUserRemove,
        "user_type": item.userTypes ? item.userTypes[0].user_type : item.user_type,
        "user_subtype": item.userTypes ? item.userTypes[0].user_subtype : item.user_subtype
      }
      this.contributors.push(user);
      this.contributorMaster.push(user);
    })
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
      let process = this.poc.process;
      if (process.length == 0 || (process[process.length - 1].action == "RFI" && process[process.length - 1].status)) {
        this.rfiFlag = true;
      } else {
        this.rfiFlag = false;
      }
    })
  }
  // Read call Api when screen Loads
  readData() {
    this.loader = true;
    this.contributors = []
    let obj = {
      "bid_id": this.bid_id, "user": this.user.user_id, "user_type": this.user_type,
      "user_subType": this.user_subtype, "status": "ACTIVE"
    };
    this._bidService.getTechSolutionData(obj).subscribe((resp: object) => {
      if (resp['data'] == null) {
        this.responseLength = 0;
        this.loader = false;
        return;
      }
      let respo = resp['data'];
      this._bidService.statusUpdated.emit(respo);
      this.response = [];
      this.techProposalCats = [];
      this.techSolutionIdName = [];
      for (let i = 0; i < respo.length; i++) {
        this.response.push(respo[i]);
        //this.disabledFlag = true;
        respo[i].techsolution_add.forEach(element => {
          element.dateTimeRange = [element.startDate, element.endDate];
          if (element.action == true && element.contributor == this.userID) {
            this.actionFlag = true;
            return;
          }
          if (!element.subItem) {
            element['subItem'] = [];
          } else {
            element.subItem.forEach(item => {
              item.dateTimeRange = [item.startDate, item.endDate];
            });
          }
        });

        this.techProposalCats.push(respo[i].techsolution_cat);
        this.techSolutionIdName.push({ id: respo[i].techsolution_id, name: respo[i].techsolution_cat })
        this.responseLength = this.response.length;
      }
      // this.response.forEach(result => {
      //   result.techsolution_add.forEach(c => {
      //     if (c.draft[0].flag == true) {
      //       this.contributors = this.contributors.filter(item => item.eleUserRemove == "notRemoved")
      //     }
      //     else if (c.draft[0].flag == false) {
      //       this.contributors = this.contributorMaster;
      //     }
      //   }); 
      // })
      // console.log("Line 358", this.contributors)
      this.selectedCategory = this.selectedCategory == '' ? this.techProposalCats[0] : this.selectedCategory;
      this.onSelectCategory(this.selectedCategory, false);
      this.loader = false;
    }, error => {
      this.loader = false;
      //this._alert.sweetError(error.error.msg);
    });
  }
  // Read call Api When screen refresh
  readDataRefresh() {
    let obj = {
      "bid_id": this.bid_id, "user": this.user.user_id, "user_type": this.user_type,
      "user_subType": this.user_subtype, "status": "ACTIVE"
    };
    this._bidService.getTechSolutionData(obj).subscribe((resp: object) => {
      if (resp['data'] == null) {
        this.responseLength = 0;
        return;
      }
      let respo = resp['data'];
      this._bidService.statusUpdated.emit(respo);
      this.response = [];
      this.techProposalCats = [];
      this.techSolutionIdName = [];
      for (let i = 0; i < respo.length; i++) {
        this.response.push(respo[i]);
        respo[i].techsolution_add.forEach(element => {
          element.dateTimeRange = [element.startDate, element.endDate];
          if (element.action == true && element.contributor == this.userID) {
            this.actionFlag = true;
            return;
          }
          if (!element.subItem) {
            element['subItem'] = [];
          } else {
            element.subItem.forEach(item => {
              item.dateTimeRange = [item.startDate, item.endDate];
            });
          }
        });
        this.techProposalCats.push(respo[i].techsolution_cat);
        this.techSolutionIdName.push({ id: respo[i].techsolution_id, name: respo[i].techsolution_cat })
        this.responseLength = this.response.length;
      }
      // this.response[0].techsolution_add.forEach(c => {
      //     let found = this.contributors.find(element => element.user_id == c.contributor);
      //     if (!found) {
      //       c['deletedUser'] = true;
      //       c['username'] = c.username;
      //     } else {
      //       c['deletedUser'] = false;
      //     }
      // }); 
      this.selectedCategory = this.selectedCategory == '' ? this.techProposalCats[0] : this.selectedCategory;
      this.onSelectCategory(this.selectedCategory, false);
      this.loader = false;
    }, error => {
    });
  }

  // Bid Manager didn't select solution Reviewer
  validateSolRev() {
    let solRevData = this.bidData.participants.filter(item =>
      (item.userTypes[0].user_subtype == "Solution" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "All" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "Sales" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "Delivery" && item.userTypes[0].user_type == "REVIEWER"))
    if (solRevData.length == 0) {
      this._alert.sweetError("Please Select Solution/Delivery/All/Sales Reviewer in Bid Creation")
      return false
    }
    return true
  }


  // create Technical Solution category
  onTechSolnAdd() {
    if (this.projectScope == undefined || this.projectScope.participants.length == 0) {
      this._alert.sweetError("Please Submit PROJECT SUMMARY")
      return
    }
    if (!this.validateSolRev()) {
      return
    }
    if (this.revokeFlag) {
      this._alert.sweetError("Please Save/Submit the task");
      return;
    }
    const dialogRef = this.dialog.open(SolutionCategoryComponent, {
      height: '250px',
      width: '405px',
      data: this.techProposalCats
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedCategory = result;
        let obj = {
          bid_id: this.bid_id,
          techsolution_cat: result,
          techsolution_add: [{
            item_name: "",
            description: "",
            remarks: "",
            contributor: "",
            draft: [{
              _id: false,
              user: this.userID,
              user_type: this.user.user_type,
              flag: true
            }],
            attachment_data: [],
            isParent: true,
            parentId: "root",
            action: false,
            subItem: []
          }]
        }
        this.response.push(obj);
        this.temp = this.response.length - 1;
        this.responseLength++;
        this.techProposalCats.push(result);
        this.disabledFlag = false;
        this.tempFlag = true;
        this._bidService.createTechSolutionData(obj).subscribe((resp) => {
          this.tempFlag = true;
          this.response = [];
          this.techProposalCats = [];
          this.revokeFlag = false;
          this.readDataRefresh();
        }, (error) => { // console.log(error);
        });
      } else {
        return;
      }
    });
  }

  // delete category
  onDeleteCategory(item) {
    if (this.revokeFlag) {
      this._alert.sweetError("Please Save/Submit the task");
      return;
    }
    let data = this.response.filter(a => {
      return a.techsolution_cat == item;
    })
    this._alert.deleted("").then(success => {
      this._bidService.deleteTechSolutionCategory({ techsolution_id: data[0].techsolution_id, bid_id: this.bid_id }).subscribe(success => {
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        }, cancel => {
        });
        this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
          this.router.navigateByUrl('/bid-development/' + this.bid_id + '/solution'));
      });
    }, cancel => {
      return;
    });
  }

  // BM can clone the category in solution, proposal and Pricing section
  onCloneCategory() {
    if (this.revokeFlag) {
      this._alert.sweetError("Please Save/Submit the task");
      return;
    }
    let data = {};
    data['categoryData'] = this.techSolutionIdName;
    data['type'] = "solution";
    data['user_type'] = this.user_type;
    const dialogRef = this.dialog.open(ClonecategoryComponent, {
      height: '375px',
      width: '750px',
      data: data,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.readDataRefresh();
    }, error => {
    })
  }

  // BM can re-assign the task, if the task is assigned to the contributor
  onReassign(index, temp) {
    if ((!this.solutionReviewFlag && this.reviewComment) || this.bidStatus == 'DROPPED') {
      return;
    } 
    if(!this.solutionReviewFlag){
      this._alert.sweetError("Bid is already under Solution Review");
      return
    }
    if(!this.solutionReviewFlag){
      this._alert.sweetError("Bid is already under Solution Review");
      return
    } 
    let selectedRow = this.response[temp].techsolution_add[index];

    if (selectedRow.subItem.length != 0) {
      selectedRow = selectedRow.subItem[selectedRow.subItem.length - 1];
    }

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
  onReassignClear(index, temp) {
    let selectedRow = this.response[temp].techsolution_add[index];
    if (selectedRow.subItem.length != 0) {
      selectedRow = selectedRow.subItem[selectedRow.subItem.length - 1];
    }
    selectedRow.contributor = selectedRow.originalContributor;
    delete selectedRow.reassignFlag;
    delete selectedRow.originalContributor;
    this.reassignFlag = false;
  }

  // BM can add the row in category
  addRow(index, temp) {
    if (this.bidData.parent) {
      return false;
    }
    this.disabledFlag = false;
    this.response[temp]['techsolution_add'].push({
      item_name: "",
      description: "",
      remarks: "",
      contributor: "",
      dateTimeRange: [],
      draft: [{
        _id: false,
        user: this.userID,
        user_type: this.user.user_type,
        flag: true
      }],
      attachment_data: [],
      isParent: true,
      parentId: "root",
      action: false,
      subItem: []
    });
    this.itemTechSoln.push(this.response[temp].techsolution_add[this.response[temp]['techsolution_add'].length - 1]);
  }

  // BM can delete the each row in category
  deleteRow(index, temp) {
    if (this.response[temp].techsolution_add.length == 1 || this.pocSubmited || !this.response[this.temp].techsolution_add[0].draft[0].flag || this.bidStatus == 'DROPPED' || (this.access.createAccess && !this.isCoOwner)) {
      return;
    }
    if (this.user_type != "BID_OWNER") {
      this._alert.sweetError("Sorry, You are not authorised to delete")
      return false;
    }
    let dataval = this.response[temp];
    if (dataval.techsolution_add[index].item_id == undefined) {
      this.response[temp]['techsolution_add'].splice(index, 1);
      return;
    }
    this._alert.deleted("").then(success => {
      this.loader = true
      let data = {
        "item_id": dataval.techsolution_add[index].item_id
      };
      this._bidService.deleteTechSolutionData(data).subscribe((resp) => {
        this.response[temp]['techsolution_add'].splice(index, 1);
        this.loader = false
      }, error => {
        this.loader = false
      });
    })
  }

  onDateSelect(temp, index) {
    this.response[temp].techsolution_add[index].startDate = this.response[temp].techsolution_add[index].dateTimeRange[0]
    this.response[temp].techsolution_add[index].endDate = this.response[temp].techsolution_add[index].dateTimeRange[1]
  }

  //upload attachments
  onUpload(index, temp) {
    if (this.pocSubmited || this.bidData.parent || this.bidStatus == 'DROPPED' || (this.access.createAccess && !this.isCoOwner)) {
      return;
    }
    if (this.user_type != "BID_OWNER" && this.user_type != "CONTRIBUTOR") {
      this._alert.sweetError("Sorry, You are not authorised to upload documents")
      return false;
    } else if (/* (this.user_type == "BID_OWNER" && !this.response[temp].techsolution_add[0].draft[0].flag) ||
      this.user_type == "CONTRIBUTOR" && */
      !this.tempFlag && this.response[temp].techsolution_add[index].contributor != this.user.user_id && !this.response[temp].techsolution_add[index].draft[0].flag) {
      return false;
    } else if (this.response[temp].techsolution_add[index].contributor == this.user.user_id &&
      this.response[temp].techsolution_add[index].draft.length > 1 &&
      !this.response[temp].techsolution_add[index].draft[1].flag) {
      return false;
    } else {
      this.openDialog(index, temp)
    }
  }

  // attach file after review to new rows
  onUploadReview(index, temp) {
    if (this.pocSubmited) {
      return;
    }
    if (this.user_type != "BID_OWNER" && this.user_type != "CONTRIBUTOR") {
      this._alert.sweetError("Sorry, You are not authorised to upload documents")
      return false;
    } else if (this.response[temp].techsolution_add[index].subItem.length != 0 && !this.response[temp].techsolution_add[index].subItem[this.response[temp].techsolution_add[index].subItem.length - 1].draft[1].flag) {
      return false;
    }
    this.openDialog(index, temp)
  }

  openDialog(index, temp): void {
    let obj = {
      "bid_id": this.bid_id,
      "type": 'solution-new'
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
      for (let i = 0; i < result.length; i++) {
        let obj = {
          "attachment_id": "",
          "attachment_n": "",
          "attachment_path": "",
          "description": "",
          "type": "BID_DEV_TECHSOL",
          "doc_version": result[i].doc_version,
          "user_id": result[i].user_id,
          "revision": result[i].revision ? result[i].revision : false,
          "flag": result[i].flag,
          "isPublic": result[i].isPublic,
          "level": result[i].level,
          "parent_id": result[i].parent_id ? result[i].parent_id : "",
          "date_created": result[i].date_created
        }
        obj.attachment_id = result[i].attachment_id;
        obj.attachment_n = result[i].original_name;
        obj.attachment_path = result[i].filename;
        obj.description = result[i].description;
        this.attachment_data.push(obj)
      }
      if (this.response[this.temp].techsolution_add[index].subItem.length == 0) {
        let attach = this.response[temp].techsolution_add[index].attachment_data.concat(this.attachment_data);
        this.response[temp].techsolution_add[index].attachment_data = attach;
      }
      if (this.response[temp].techsolution_add[index].subItem.length != 0) {
        this.oldAttachments = [];
        if (this.response[temp].techsolution_add[index].subItem.length > 1)
          this.oldAttachments = this.response[temp].techsolution_add[index].subItem[this.response[temp].techsolution_add[index].subItem.length - 2].attachment_data;
        else
          this.oldAttachments = this.oldAttachments.concat(this.response[this.temp].techsolution_add[index].attachment_data);
        if (this.response[temp].techsolution_add[index].subItem[this.response[temp].techsolution_add[index].subItem.length - 1].attachment_data.length != 0) {
          this.attachment_data.forEach(element => {
            this.response[temp].techsolution_add[index].subItem[this.response[temp].techsolution_add[index].subItem.length - 1].attachment_data.push(element);
          });
        } else {
          this.response[temp].techsolution_add[index].subItem[this.response[temp].techsolution_add[index].subItem.length - 1].attachment_data = this.attachment_data;
        }
      }
      this.attachment_data = [];
      if (result.length != 0)
        this.onSaveAsDraft(temp, 'save', 'upload');
    });
  }

  // download attachments
  onDownloadDialog(index, temp) {
    let dt = this.response[temp].techsolution_add[index];
    if ((dt.attachment_data.length == 0 && dt.subItem.length == 0) || (dt.subItem.length != 0 && dt.subItem[dt.subItem.length - 1].attachment_data.length == 0)) {
      this._alert.sweetNoAttachments();
      return;
    }
    this.downloadIndex = index;
    this.downloadTemp = temp;
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '365px',
      width: '850px',
      data: dt.subItem.length != 0 ? dt.subItem[dt.subItem.length - 1] : dt /* : this.response[temp] */
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      } else if (result == true) {
        this.onSaveAsDraft(temp, 'save', 'upload');
      } else {
        this.versionData = result;
        this.openDialog(this.downloadIndex, this.downloadTemp);
      }
    });
  }

  // check flags in particular category for locking or unlocking
  onSelectCategory(item, i) {
    if (this.revokeFlag) {
      this._alert.sweetError("Please submit the task");
      return;
    }
    if (isNumber(i)) {
      this.temp = i;
    }
    this.assignmentByBM = this.response[this.temp].techsolution_add[0].draft[0].flag;
    this.subItemflag = false;
    this.selectedCategory = item;
    let flag = false;
    this.revokeFlag = false;
    this.actionFlag = false;
    if (this.response.length != 0) {
      let contributor = [];
      this.response[this.temp].techsolution_add.forEach(element => {
        contributor.push(element);
        if (element.subItem && element.subItem.length != 0) {
          element.subItem.forEach(item => {
            contributor.push(item);
          });
        }
      });
      contributor = contributor.filter(a => {
        return a.contributor == this.userID;
      });
      /* if (contributor.find(a => a.isRevoke)) {
        this.isRevoke = true;
      } else {
        this.isRevoke = false;
      } */
      if ((contributor.length == 0 && this.user_type == 'CONTRIBUTOR' && flag) || this.response[this.temp].techsolution_add[0].draft[0].flag) {
        this.actionFlag = true;
      } else if (contributor.length == 0) {
        this.actionFlag = false;
      } else if (contributor.length != 0 && contributor[0].draft[1].user_type == "BID_OWNER" && contributor[0].draft[1].flag) {
        this.actionFlag = true;
      } else {
        contributor.forEach(element => {
          if (element.draft[1].flag) {
            this.actionFlag = true;
          }
        });
      }
    }
  }

  newValidate() {
    let validate = true;
    this.response[this.temp].techsolution_add.forEach(element => {
      for (let item in element) {
        if (element.draft.length == 1 && item != "remarks") {
          element[item] === '' || (item == "dateTimeRange" && (element[item][0] == undefined || element[item][1] == undefined)) ? validate = false : '';
        } else if (element.draft.length > 1 && this.userID == element.contributor && item == 'remarks' && element.draft[1].flag) {
          element[item] === '' || element[item] == null ? validate = false : '';
        }
        if (element.subItem.length != 0) {
          element.subItem.forEach(subElement => {
            if (subElement.draft[1].flag && subElement.draft[1].user == this.userID && subElement.remarks == '') {
              validate = false;
            }
          });
        }
      }
    });
    return validate;
  }

  //reset data
  onReset() {
    this.response[this.temp].techsolution_add.forEach(element => {
      if (!element.draft || element.draft.length == 0 || element.draft[0].flag) {
        element.item_name = "";
        element.description = "";
        element.contributor = "";
        element.dateTimeRange = "";
        element.attachment_data = [];
      } else if (element.draft[1].flag && element.contributor == this.userID) {
        element.remarks = "";
      } else if (!element.draft[1].flag && element.subItem.length > 0 && element.contributor == this.userID) {
        element.subItem.forEach(item => {
          if (item.draft[0].flag) {
            item.remarks = "";
          }
        });
      }
    });
  }

  // save as draft
  onSaveAsDraft(temp, type, upload) {
    // add type and subtype to request 
    this.response[temp].techsolution_add.forEach(element => {
      this.contributors.forEach(con => {
        if (con.user_id == element.contributor) {
          element['user_type'] = con.user_type;
        }
      });
    });
    this.response[temp]['user_type'] = this.user_type;
    this.response[temp]['user_subtype'] = this.user_subtype;
    var type;
    if (type == "revoke"/*  || this.isRevoke */) {
      type = "saveSolutionRevoke";
    } else if (type == 'save') {
      type = "saveTechSolutionData";
    }

    if (this.response[temp].date_created && this.user_type == "BID_OWNER" && this.response[temp].techsolution_add[0].draft.length == 1) {
      if (upload != 'upload')
        this.loader = true;
      this._bidService[type](this.response[temp]).subscribe(resp => {
        if (upload != 'upload')
          this._alert.sweetSuccess("Saved as draft successfully");
        this.tempFlag = true;
        this.loader = false;
        this.revokeFlag = false;
        this.readDataRefresh();
      }, error => {
        this.loader = false
        return;
      });
    } else if (this.response[temp].techsolution_add[0].draft.length > 1) {
      // saving respective contributors data
      let contributor = [];
      this.response[temp].techsolution_add.forEach(element => {
        contributor.push(element);
        if (element.subItem && element.subItem.length != 0) {
          element.subItem.forEach(item => {
            contributor.push(item);
          });
        }
      });
      contributor = contributor.filter(a => {
        return (a.contributor == this.userID && a.draft[1].flag == true)
      });
      if (upload != 'upload')
        this.loader = true
      let obj = {};
      obj['bid_id'] = this.bid_id;
      obj['techsolution_id'] = this.response[temp].techsolution_id
      obj['techsolution_cat'] = this.response[temp].techsolution_cat
      obj['techsolution_add'] = contributor;
      obj['user_type'] = this.user_type;
      obj['user_subtype'] = this.user_subtype;
      this._bidService[type](obj).subscribe(resp => {
        if (upload != 'upload')
          this._alert.sweetSuccess("Saved as draft successfully");
        // this.itemTechSoln = [];
        // this.response = [];
        // this.techProposalCats = [];
        this.loader = false;
        this.revokeFlag = false;
        this.readDataRefresh();
      }, error => {
        this.loader = false
        return;
      });
    }
  }

  // checks whether all tasks assigned by reviewer is completed or not
  reviewAcknowledgement() {
    let validate = true;
    this.response[this.temp].techsolution_add.forEach(element => {
      // // console.log(element.action)
      if (element.action && element.contributor == this.userID) {
        validate = false
      }
    });
    return validate;
  }

  duplicateItems(arr) {
    let valueArr = arr.map(function (item) { return item.item_name });
    let isDuplicate = valueArr.some(function (item, idx) {
      return valueArr.indexOf(item) != idx
    });
    return isDuplicate;
  }

  // submit Technical Solution
  onSubmit(index, temp) { 
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    if (this.duplicateItems(this.response[temp].techsolution_add)) {
      this._alert.sweetError("Duplicate item name");
      return false;
    }
    if (!this.reviewAcknowledgement()/*  && !this.subItemAdded */) {
      this._alert.sweetError("Please complete tasks assigned by Reviewer");
      return false;
    }

    // add type and subtype to request 
    this.response[temp].techsolution_add.forEach(element => {
      this.contributors.forEach(con => {
        if (con.user_id == element.contributor) {
          element['user_type'] = con.user_type;
        }
      });
    });
    this.response[temp]['user_type'] = this.user_type;
    this.response[temp]['user_subtype'] = this.user_subtype;

    if (this.response[temp].date_created && this.user_type == "BID_OWNER" && this.response[temp].techsolution_add[0].draft.length == 1) { // submit for BM
      this._alert.added("").then(success => {
        this.loader = true;
        this._bidService.updateTechSolutionAttachment(this.response[temp]).subscribe(resp => {
          this.tempFlag = false;
          // this.response = [];
          // this.techProposalCats = [];
          // this.itemTechSoln = [];
          this.loader = false
          this.readDataRefresh();
          this._sharedService.reviewType.emit({ type: 'tech' });
          // this._sharedService.reloadSheet.emit({reload:true});
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
    } else if (this.response[temp].techsolution_add[0].draft.length > 1) {
      // submit for contributor
      let contributor = [];
      this.response[temp].techsolution_add.forEach(element => {
        contributor.push(element);
        if (element.subItem && element.subItem.length != 0) {
          element.subItem.forEach(item => {
            contributor.push(item);
          });
        }
      });
      contributor = contributor.filter(a => {
        return (a.contributor == this.userID && a.draft[1].flag == true)
      });
      let obj = {};
      obj['bid_id'] = this.bid_id;
      obj['techsolution_id'] = this.response[temp].techsolution_id
      obj['techsolution_cat'] = this.response[temp].techsolution_cat
      obj['user_type'] = this.user_type;
      obj['user_subtype'] = this.user_subtype;
      obj['techsolution_add'] = contributor;
      this.disabledFlag = true;
      this._alert.added("").then(success => {
        this.loader = true
        this._bidService.updateTechSolutionAttachment(obj).subscribe(resp => {
          this.actionFlag = false;
          this.tempFlag = false;
          // this.itemTechSoln = [];
          // this.response = [];
          // this.techProposalCats = [];
          this.loader = false
          this.readDataRefresh();
          this._sharedService.reviewType.emit({ type: 'tech' });
          this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
          }, cancel => {
          });
        }, error => {
          this.loader = false
        });
      }, cancel => {
        this.disabledFlag = false;
      });

    }
  }

  validate(index, temp) {
    let validate = false;
    let data, tempData;
    tempData = this.response[temp].techsolution_add[index];
    if (tempData.subItem.length > 0) {
      data = tempData.subItem[tempData.subItem.length - 1];
    } else {
      data = tempData;
    }
    if (this.user_type == "BID_OWNER" && data.draft.length == 2 && !data.draft[0].flag && data.draft[1].flag) {
      validate = false;
    } else if (data.draft.length == 2 && !data.draft[0].flag && !data.draft[1].flag && data.contributor == this.userID) {
      validate = true;
    }
    return validate
  }

  // BM and contributor can edit the task, if the task is submitted 
  onEdit(index, temp) {
    if (!this.validate(index, temp) || (!this.solutionReviewFlag && this.reviewComment) || this.bidStatus == 'DROPPED') {
      return;
    }
    // if(!this.solutionReviewFlag){
    //   this._alert.sweetError("Bid is already under Solution Review");
    //   return
    // }
    this.revokeFlag = true;
    this.revokeData = [];
    let data, tempData;
    tempData = this.response[temp].techsolution_add[index];
    if (tempData.subItem.length > 0) {
      data = tempData.subItem[tempData.subItem.length - 1];
    } else {
      data = tempData;
    }
    if (this.user_type == "BID_OWNER" && data.draft[1].flag) {
      data.draft[0].flag = true;
      this.revokeData.push(data);
    } else if (!data.draft[0].flag && !data.draft[1].flag && data.contributor == this.userID) {
      if (data.subItem && data.subItem.length != 0) {
        data.subItem[data.subItem.length - 1].draft[1].flag = true;
        this.revokeData.push(data.subItem[data.subItem.length - 1]);
      } else {
        data.draft[1].flag = true;
        this.revokeData.push(data);
      }
    }
    this.response[temp].techsolution_add = this.revokeData;
    this.response[temp].techsolution_add.forEach(element => {
      this.contributors.forEach(con => {
        if (con.user_id == element.contributor) {
          element['user_type'] = con.user_type;
        }
      });
    });
    this.response[temp]['user_type'] = this.user_type;
    this.response[temp]['user_subtype'] = this.user_subtype;
    this._bidService.saveSolutionRevoke(this.response[temp]).subscribe(resp => {
      this.revokeFlag = false;
      this.readDataRefresh();
      this._sharedService.reviewType.emit({ type: 'tech' });
      this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
      }, cancel => {
      });
    })
  }

  onRevoke(index, temp) {
    if (!this.newValidate()) {
      this._alert.sweetError("Please fill empty fields");
      return false;
    }
    this.response[temp].techsolution_add = this.revokeData;
    this.response[temp].techsolution_add.forEach(element => {
      this.contributors.forEach(con => {
        if (con.user_id == element.contributor) {
          element['user_type'] = con.user_type;
        }
      });
    });
    this.response[temp]['user_type'] = this.user_type;
    this.response[temp]['user_subtype'] = this.user_subtype;
    this._bidService.submitSolutionRevoke(this.response[temp]).subscribe(resp => {
      this._alert.sweetSuccess("Data has been saved successfully");
      this.revokeFlag = false;
      this.readDataRefresh();
    })
  }

  // BM can submit the reassign task
  onReassignSubmit(index, temp) {
    this.response[temp]['user_type'] = this.user_type;
    this.response[temp]['user_subtype'] = this.user_subtype;
    this.response[temp]['reassign'] = true;
    let reqObj = Object.assign({}, this.response[temp]);
    let reassignData;

    if (reqObj["techsolution_add"][index].subItem.length) {
      let subItems = reqObj["techsolution_add"][index].subItem;
      reassignData = [subItems[subItems.length - 1]];
    } else {
      reassignData = [reqObj["techsolution_add"][index]];
    }

    reqObj["techsolution_add"] = JSON.parse(JSON.stringify(reassignData));
    if (reqObj["techsolution_add"][0].contributor == "") {
      this._alert.sweetError("Please select the Contributor")
      return;
    }
    reqObj["techsolution_add"].forEach(element => {
      element.draft = [element.draft[0]];
      element.draft[0].flag = true;
      this.contributors.forEach(con => {
        if (con.user_id == element.contributor) {
          element['user_type'] = con.user_type;
        }
      });
    });
    if (this.response[temp].date_created && this.user_type == "BID_OWNER") {
      this._alert.added("").then(success => {
        this.onReassignClear(index, temp);
        this._bidService.updateTechSolutionAttachment(reqObj).subscribe(resp => {
          this.reassignFlag = false;
          this.actionFlag = false;
          this.readDataRefresh();
          this._sharedService.reviewType.emit({ type: 'tech' });
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

  // ngIf and disable checks starts
  categoryIcon() {
    let flag = false;
    if (this.solutionReviewFlag && !this.pocSubmited && this.isCoOwner && !this.bidData.parent && this.bidStatus != 'DROPPED') {
      flag = true;
    }
    return flag;
  }

  disableRow() {
    let flag = false;
    if (!this.solutionReviewFlag || this.pocSubmited || this.bidData.parent || this.bidStatus == 'DROPPED') {
      flag = true;
    }
    return flag;
  }

  disableRemarks() {
    let flag = false;
    if ((!this.solutionReviewFlag && this.reviewComment) || this.pocSubmited || this.bidData.parent || this.bidStatus == 'DROPPED') {
      flag = true;
    }
    return flag;
  }

  disableSubItemRow() {
    let flag = false;
    if ((!this.access.createAccess && !this.isCoOwner) || !this.assignmentByBM || !this.actionFlag || this.bidData.parent || this.bidStatus == 'DROPPED') {
      flag = true;
    }
    return flag;
  }

  disableSubmitButtonBeforeRevoke() {
    let flag = false;
    if ((!this.solutionReviewFlag && this.reviewComment) || this.pocSubmited || !this.access.writeAccess || !this.actionFlag || this.bidData.parent || this.bidStatus == 'DROPPED' || this.reassignFlag) {
      flag = true;
    }
    return flag;
  }

  disableSubmitButtonAfterRevoke() {
    let flag = false;
    if ((!this.solutionReviewFlag && this.reviewComment) || this.pocSubmited || !this.access.writeAccess || this.bidData.parent || this.bidStatus == 'DROPPED' || this.reassignFlag) {
      flag = true;
    }
    return flag;
  }
  // ngIf and disable checks ends

}
