import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PocDashboardService } from '../../../services/poc.service';
import { ProjectScopeService } from '../../../services/ps.service';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { ApprovalChainService } from '../../../services/approvalChain.service';
import { BusinessUnitService } from '../../../services/businessUnit.service';
import { TerritoryService } from '../../../services/territories.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { SharedService } from '../../../services/shared.service';
import { poc } from '../../../models/poc.model';
import { ac_comments } from '../../../models/ac_comments';
import { ProjectScope } from '../../../models/ps.model';
import { DownloadComponent } from '../../../components/download/download.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-poc',
  templateUrl: './poc.component.html',
  styleUrls: ['./poc.component.css'],
  providers: [PocDashboardService, DownloadComponent, ProjectScopeService, BidService, UsersService, ApprovalChainService, BusinessUnitService, TerritoryService]
})

export class pocComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  eligibility;
  submitted;
  reviewFlag;
  process;
  pocSubmited;
  approval_chain_id;
  response;
  mainResponse;
  currentLevel;
  dropdownBUSettings;
  dropdownTerritorySettings;
  ac_comment;
  reviewData;
  refreshObj;
  mySubscription;
  approvedUsers: any;
  public poc;
  public ps;
  public approvalChain;
  public bid;
  public user;
  public totalApprovers;
  public bid_id;
  temp = 0;
  rfiTemp = 0;
  productType = '';
  read = '';
  update: boolean = false;
  disabled = false;
  currentCheck = false;
  loader = false;
  newArray = []
  categories: any = [];
  rfiCategories: any = [];
  selectedBUs = [];
  selectedTerritories = [];
  business_units = [];
  territories = [];
  bu_ids = [];
  territory_ids = [];
  similar = [];
  recent = [];
  multiflagTerritory = "All";
  multiflagBu = "All";

  constructor(public _pocService: PocDashboardService, public router: Router,
    public _psService: ProjectScopeService, public dialog: MatDialog, _activeRoute: ActivatedRoute,
    public _bidService: BidService, public _userService: UsersService,
    public _sharedService: SharedService,
    public _approvalChainService: ApprovalChainService,
    public _formBuilder: FormBuilder,
    public _businessUnitService: BusinessUnitService, public _territoryService: TerritoryService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.productType = this.user.product_type;
    this.poc = new poc();
    this.ac_comment = new ac_comments();
    this.ps = new ProjectScope();
    this.bid_id = _activeRoute.snapshot.params['id'];
    // Approval comment secition
    this.ac_comment.comment_add = [{
      comment: '',
      comment_type: '',
      justification: '',
      approver_id: this.user.user_id,
      approver_name: this.user.fullname,
      action_taken: false,
      attachment_data: [],
      comment_flag: false
    }];

    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: "BID_APPROVAL",
      sub_module: "RFI",
    };
    /* this._sharedService.newData.subscribe(a => {
      if (a.data == 'rfi') {
        this.getRfi();
      }
    }); */

    // Approval requried section
    this.response = [{
      "bid_id": this.bid_id,
      "approval_required": "",
      "approval_add": [],
      "justification": "",
      "approvar_name": "",
      "attachment_data": ""
    }];
    this.readData();
    // Approval required closde

    // Main data
    /* this.mainResponse = [{
      "bid_id": this.bid_id,
      "main_cat": "main",
      "main_add": [{
        "item_name": "",
        "description": "",
        "remarks": "",
        "contributor": "",
        "attachment_data": []
      }]
    }] */
    this.mainReadData();
    this.dropdownBUSettings = {
      singleSelection: false,
      idField: 'bu_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      badgeShowLimit: 3,
      itemsShowLimit: 0,
    };
    this.dropdownTerritorySettings = {
      singleSelection: false,
      idField: 'territory_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      badgeShowLimit: 3,
      itemsShowLimit: 0
    };
    this.getBusinessUnits();
    this.getTerritories();
    this.gerReviewData();
  }

  ngOnInit() {
    this.getProjectScopes();
    this.getBid();
    this.getComments();
    this.getRfi();
    this.mySubscription = this._sharedService.newData.subscribe(a => {
      if (a.data == 'approvalDashboard' || a.data == "rfi") {
        if (!this.currentCheck) {
          this.read = '';
          this.showNow = false;
          this.newArray = [];
          this.categories = [];
          this.getPoc();
          this.getComments();
        }
      }
    }, error => {
    });
  }

  ngOnDestroy() {
    this.mySubscription.unsubscribe();
    this.dialog.closeAll();
  }

  // get BUs
  getBusinessUnits() {
    this._businessUnitService.getBusinessUnits([]).subscribe(data => {
      if (data['code'] == 2000) {
        this.business_units = data['data'];
      }
    }, error => {
    });
  }

  // get territories
  getTerritories() {
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
      if (territories['code'] === 2000) {
        this.territories = territories['data'];
      }
    }, error => {
    });
  }

  // review data
  gerReviewData() {
    this.loader = true
    this._bidService.getReviewData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          // this.reviewData.length = 0;
          this.loader = false;
          return;
        }
        // this.reviewData = [];
        this.reviewData = resp['data']['reviewtab_data'];
        // console.log(">>>>>reviewData", this.reviewData)
        this.loader = false
      });
  }

  onItemSelect(item: any) {
    // console.log("item >>>>", item);
    if (this.selectedBUs.length != 0) {
      this.bu_ids = [];
      this.selectedBUs.forEach(element => {
        this.bu_ids.push(element.bu_id);
      });
    } else {
      this.bu_ids = [];
    }
    if (this.selectedTerritories.length != 0) {
      this.territory_ids = [];
      this.selectedTerritories.forEach(element => {
        this.territory_ids.push(element.territory_id);
      });
    } else {
      this.territory_ids = [];
    }
    let obj = {
      "company_id": this.user.company_id,
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      // "bid_value": this.bid.estimatedValue,
      "account_id": this.bid.account_id ? this.bid.account_id._id : this.bid.account_name,
      "bid_id": this.bid_id,
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    // console.log(obj);
    this.readRecent(obj);
  }

  onSelectAll(item: any) {
    // // console.log("item >>>>", item);
    if (item[0].bu_id) {
      this.bu_ids = [];
      item.forEach(element => {
        this.bu_ids.push(element.bu_id);
      });
    }
    if (item[0].territory_id) {
      this.territory_ids = [];
      item.forEach(element => {
        this.territory_ids.push(element.territory_id);
      });
    }
    let obj = {
      "company_id": this.user.company_id,
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      // "bid_value": this.bid.estimatedValue,
      "account_id": this.bid.account_id ? this.bid.account_id._id : this.bid.account_name,
      "bid_id": this.bid_id,
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    // console.log(obj);
    this.readRecent(obj);
  }

  onDeSelectAll(item, type) {
    // // console.log("item >>>>", item);
    if (type == 'BU') {
      this.bu_ids = [];
    }
    if (type == 'Territory') {
      this.territory_ids = [];
    }
    let obj = {
      "company_id": this.user.company_id,
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      // "bid_value": this.bid.estimatedValue,
      "account_id": this.bid.account_id ? this.bid.account_id._id : this.bid.account_name,
      "bid_id": this.bid_id,
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    // console.log(obj);
    this.readRecent(obj);
  }

  // read similar 5 data
  readBidSimilar() {
    /* if (!this.bid.account_id) {
      return false;
    } */
    let obj =
    {
      // "company_id": this.user.company_id,
      "territory_ids": this.user.territory_ids,
      "bu_ids": this.user.bu_ids,
      "bid_value": this.bid.estimatedValue,
      // "account_id": this.bid.account_id ? this.bid.account_id._id : this.bid.account_name,
      "bid_id": this.bid_id
    }
    this._bidService.bidSimilar(obj).subscribe(resp => {
      if (resp['data'] == null) {
        return;
      }
      this.similar = resp['data']['bid']['bid_find'];
      this.similar.forEach(element => {
        element.date_submission = new Date(element.date_submission);
      });
      this.recent = resp['data']['bid']['bid_find'];
      this.recent.forEach(element => {
        element.date_submission = new Date(element.date_submission);
      });
      // console.log(this.similar);
    }, error => {
    })
  }

  // read recent 5 data
  readRecent(obj) {
    if (obj == undefined) {
      obj =
      {
        "company_id": this.user.company_id,
        "account_id": this.bid.account_id ? this.bid.account_id._id : this.bid.account_name,
        "bid_id": this.bid_id
      }
    }
    this._bidService.bidRecent(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.recent = [];
        return;
      }
      this.recent = resp['data']['bid']['bid_find'];
      this.recent.forEach(element => {
        element.date_submission = new Date(element.date_submission);
      });
    }, error => {
      this.recent = [];
    })
  }

  // get approval required data
  readData() {
    this._bidService.getApprovalData({ "bid_id": this.bid_id, "user": this.user.user_id, submit_flag: true })
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
        // this.disableFlag = true;
        // if (this.response.length == 1) {
        //   this.itemArray.push(this.response[0]);
        // }
        // this.disableFlag = this.response[0].submit_flag == true ? true : false;
      }, error => {
      });
  }
  // Approval Required Attachment Download section Api Code
  onDownloadDialog(i) {
    if (this.response[0].approval_add[i].attachment_data.length == 0) {
      this.alert.sweetError("No attachments");
      return;
    }
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '365px',
      width: '850px',
      data: this.response[0].approval_add[i]
    });
  }

  // main data
  mainReadData() {
    this._bidService.getMainData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        this.mainResponse = resp['data']['maintab_data'];
        // console.log("read>>>>>>>>", this.mainResponse)
      }, error => {
      })
  }

  getComments() {
    let obj = {
    }
    this.newArray = [];
    let array = [];
    if (!this.currentCheck) {
      this.categories = []
    }
    obj['bid_id'] = this.bid_id;

    this._bidService.getRfi(obj).subscribe(data => {
      if (data['data'] == null) {
        return;
      }
      if (data['code'] == 2000) {
        this.categories = data['data']['approval_data'];
        this.categories.map(a => {
          Array.prototype.push.apply(array, a.comment_add);
        });
        this.newArray = array;
        // console.log(">>>>newArray", this.newArray)
        this.newArray.forEach(res => {
          if (res.comment_type == 'RFI') {
            res.comment_type = 'INFORMATION REQUIRED'
          }
        });
      }
    }, error => {
    });
  }

  // get rfi data
  getRfi() {
    let obj = {
    }
    obj['com_cat'] = 'RFI';
    obj['bid_id'] = this.bid_id;
    this._bidService.getRfi(obj).subscribe(data => {
      if (data['data'] == null) {
        return;
      }
      if (data['code'] == 2000) {
        this.rfiCategories = data['data']['approval_data'];
      }
    }, error => {
    })
  }

  /* changeState() {
    this.header.changeStatus();
  } */

  onCheck() {
    let validate = true;
    let files = [];
    this.mainDocuments = [];
    this.PricingDocuments = [];
    if (this.mainResponse) {
      this.mainDocuments = this.mainResponse[0].main_add[this.mainResponse[0].main_add.length - 1].attachment_data
    }
    if (this.reviewData) {
      let pricingFiles = this.reviewData[this.reviewData.length - 1].review_add.filter(a => { return a.solution_id == "Review completed" })
      pricingFiles.forEach(element => {
        element.attachment_data.forEach(item => {
          this.PricingDocuments.push(item);
        });
      });
    }
    files = this.mainDocuments.concat(this.PricingDocuments);
    if (files.length == 0) {
      validate = false;
    }
    this.file = { "attachment_data": files };
    return validate;
  }

  // download attachments
  file;
  mainDocuments = [];
  PricingDocuments = [];
  onDownload() {
    if (!this.onCheck()) {
      this.alert.sweetError("No attachments");
      // open pricing sheet in new window
      if (this.user.product_type == "pricing")
        window.open("/bid-development/sheets/" + this.bid_id);
      return;
    }
    else {
      const dialogRef = this.dialog.open(DownloadComponent, {
        height: '365px',
        width: '850px',
        data: this.file
      });
      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          return
        }
      }, error => {
      });
    }
    // open pricing sheet in new window
    if (this.user.product_type == "pricing")
      window.open("/bid-development/sheets/" + this.bid_id);

    // >>>>  New version > to download files >>>>
    // let attData = this.attachments[index];
    // this._bidService.downloadFile({ attachment_id: attData.attachment_id, responseType: 'blob' }).subscribe(data => {
    // const blob = new Blob([data], { type: data.type }),
    // url = window.URL.createObjectURL(blob);
    // saveAs(url, attData.original_name ? attData.original_name : attData.attachment_n);
    // });


    // this.reviewData[this.reviewData.length - 1].review_add.forEach(element => {
    //   element.attachment_data.forEach(item => {
    //     window.open(item.filename);
    //   });
    // });

    // }
  }



  // get project scope's data
  getProjectScopes() {
    this._psService.getProjectScopes(this.bid_id, "").subscribe(ProjectScopes => {
      if (ProjectScopes['data'] == null) {
        return;
      }
      if (ProjectScopes['code'] === 2000) {
        this.ps = ProjectScopes['data']['projectscope_data'][0];
        // Calling the DT trigger to manually render the table
        //this.dtTrigger.next();
      } else if (ProjectScopes['code'] === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (ProjectScopes['code'] === 401) {
        //this.users = [];
      } else if (ProjectScopes['code'] === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (ProjectScopes['code'] === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
    }, error => {
    });
  }

  // check 1st level of approval chain
  checkFirstLevel() {
    let user = this.totalApprovers.find(a => a.user_id == this.user.user_id);
    if (!user) {
      this.sendNotification(`The bid is currently awaiting approval from << ${this.totalApprovers && this.totalApprovers[0].fullname} >> `);
      return
    } 
    this.currentLevel = user.level;
    if (this.currentLevel != 1) {
      this.sendNotification(`The bid is currently awaiting approval from << ${this.totalApprovers && this.totalApprovers[0].fullname} >> `);
      return
    }
    this.showNow = true;
  }

  // check other level of approval chain
  checkOtherLevel() {
    let exists; 

    let user = this.totalApprovers.find(a => a.user_id == this.user.user_id);
    if (!user) {
      var u_id=this.poc.process[this.poc.process.length-1].approver_id;
      var i = this.totalApprovers.findIndex(a => a.user_id == u_id);
      if (i >= 0) {
        this.sendNotification(`The bid is currently awaiting approval from << ${this.totalApprovers[i + 1].fullname} >> `)
      }
      return
    }
    this.currentLevel = user.level;
    let previousUser = this.totalApprovers.find(a => a.level == this.currentLevel - 1);
    if (!previousUser) {
      exists = undefined;
      return
    }
    exists = this.process.findIndex(a => a.approver_id == previousUser.user_id);
    if (exists == -1) {
      this.sendNotification(`The bid is currently awaiting approval from << ${ previousUser.fullname } >> `);
    }
  }

  // check apprval status of bid
  checkStatus() {
    if (this.poc['status'] == "INACTIVE") {
      this.sendNotification("Your bid is under RFI stage");
      return false;
    }
    if (this.process.findIndex(a => a.action == 'REJECTED') >= 0) {
      this.sendNotification("The bid has been rejected");
      return false;
    }
    else if ((this.process.findIndex(a => a.action == 'RFI') >= 0) || this.poc.rfi) {
      if (this.user.user_type == 'BID_OWNER') {
        this.sendNotification('Your bid is under revision');
        return false;
      } else {
        this.sendNotification('Your bid is under revision, please wait for bid manager to revise the bid');
        return false;
      }
    }
    else if (this.totalApprovers && (this.totalApprovers.length == this.process.length)) {
      this.sendNotification('Approval process completed');
      if (this.bid.isApproved == false) {
        this._bidService.afterApproval({ isApproved: true, bid_id: this.bid_id }).subscribe(success => {
        }), error => {
        };
      }
      // this.header.approvalDone();
      return false;
    }
    else if ((this.process.findIndex(a => a.action == 'APPROVED') >= 0
      && this.process.findIndex(a => a.approver_id == this.user.user_id) >= 0)) {
      this.sendNotification('Your action has been recorded');
      return true;
    }
    else if ((this.process.findIndex(a => a.action == 'CONDITIONALLY_APPROVED') >= 0 && this.process.findIndex(a => a.approver_id == this.user.user_id) >= 0)) {
      this.sendNotification('Your action has been recorded');
      return true;
    }
    return true;
  }

  getPoc() {
    this._pocService.getPocDashboards({ status: 'ACTIVE', bid_id: this.bid_id }).subscribe(data => {
      if (data['data'] == null) {
        return;
      }
      this.poc = data['data']['poc_list'][0];
      if (!this.poc) {
        return;
      }
      this.process = this.poc.process.filter(a => {
        return a.status;
      });
      this.update = true;
      if (!this.checkStatus()) {
        return;
      }
      if (this.process.length == 0) {
        this.checkFirstLevel();
        return;
      }
      if (this.process.length > 0) {
        this.checkOtherLevel();
      }
      this.showNow = true;
    }, error => {
    })
  }

  getApprovalChainById() {
    this._approvalChainService.getApprovalChain({ ac_id: this.approval_chain_id }).subscribe(data => {
      if (data['data'] == null) {
        return;
      }
      if (data && data['data'] && data['data']['approval_chains'].length) {
        this.approvalChain = data['data']['approval_chains'][0];
        this.totalApprovers = this.approvalChain.users;
        this.getPoc();
      }
    }, error => {
    })
  }

  getBid() {
    this._bidService.getBidById(this.bid_id).subscribe(data => {
      this.bid = data['data']['bid'];
      localStorage.setItem("bidData", JSON.stringify(this.bid));
      this.approval_chain_id = this.bid.approval_chain;
      this.getApprovalChainById();
    }, error => {
    })
  }

  addComment(type) {
    let acObj = {
      comment: '',
      comment_type: '',
      justification: '',
      approver_id: this.user.user_id,
      approver_name: this.user.fullname,
      action_taken: false,
      attachment_data: [],
      comment_flag: false
    }
    this.ac_comment.comment_add.push(acObj);
  }

  deleteComment(i) {
    if (this.ac_comment.comment_add.length == 1) {
      this.alert.sweetError("Minimum one comment required");
      return;
    }
    this.ac_comment.comment_add.splice(i, 1);
  }

  // submit approval
  save(status) {
    if (this.ac_comment.comment_add.findIndex(a => a.comment == '') >= 0) {
      this.alert.sweetError("Please enter comment");
      return
    }
    let msg;
    if (status == "APPROVED") {
      msg = "approve"//"APPROVE"
    } else if (status == "REJECTED") {
      msg = "reject"//"REJECT"
    } else if (status == "CONDITIONALLY_APPROVED") {
      msg = "conditionally approve"//"CONDITIONALLY APPROVE"
    } else if (status == "RFI") {
      msg = "RFI"
    }
    this.alert.confirm(msg).then(succes => {
      this.disabled = true;
      // console.log(this.totalApprovers, this.user);
      let obj = {
        action: status,
        approver_id: this.user.user_id,
        status: true,
        fullname: this.totalApprovers.find(a => a.user_id == this.user.user_id).fullname,
        level: this.totalApprovers.find(a => a.user_id == this.user.user_id).level,
      }
      this.poc.process.push(obj);
      this.poc['bid_id'] = this.bid_id;
      this.poc['company_id'] = this.user.company_id;
      this.poc['user_id'] = this.user.user_id;
      if (status.toLowerCase() == 'rfi') {
        this.poc['rfi'] = true;
      }
      this.ac_comment.comment_add.map(a => {
        a.comment_type = status;
      });
      this.update ? this.updatePoc(status) : this.createPoc(status)
    }, cancel => {
      return false;
    });
  }

  // Information required  Button redirecting to Rfi Page
  onRfi(i) {
    if (this.newArray[i].comment_type == "INFORMATION REQUIRED") {
      this.router.navigateByUrl('/bid-development/' + this.bid_id + '/rfi')
    }
  }

  createPoc(status) {
    this.loader = true
    this._pocService.createPocDashboard(this.poc).subscribe(data => {
      this.createComments(status);
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  updatePoc(status) {
    this.loader = true
    this._pocService.updatePocDashboard(this.poc).subscribe(data => {
      this.refreshObj = {
        company_id: this.user.company_id,
        bid_id: this.bid_id,
        module: "BID_APPROVAL",
        sub_module: status
      }
      this.loader = false

      this.createComments(status);
      setTimeout(() => {
        this.router.navigateByUrl('/dashboard');
      }, 2000);
    }, error => {
      this.loader = false
    })
  }

  // create approval comments
  createComments(status) {
    this.loader = true
    this.ac_comment['bid_id'] = this.bid_id;
    this.ac_comment['com_cat'] = status;
    this.ac_comment['poc_flag'] = false;
    this.ac_comment['status'] = 'ACTIVE';
    this.ac_comment['poc_id'] = this.poc.poc_id;
    this._pocService.createApprovalComments(this.ac_comment).subscribe(data => {
      this.newArray = [];
      if (!this.currentCheck) {
        this.categories = [];
      } this.getPoc();
      this.getComments()
      this.currentCheck = true;
      this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
      }, cancel => {
      });
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  showNow = false;
  sendNotification(message) {
    this.read = message
    return;
  }

  // clear filter
  onClear() {
    this.selectedTerritories = [];
    this.selectedBUs = [];
    this.readRecent(undefined);
    this.multiflagTerritory = "All";
    this.multiflagBu = "All";
  }

  // close similar 5 or recent 5
  onClose() {
    this.selectedTerritories = [];
    this.selectedBUs = [];
  }

}
