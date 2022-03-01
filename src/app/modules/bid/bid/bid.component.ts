import { Component, ViewChild, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import * as validatorCtrl from '../../../libraries/validation';
import _ = require('lodash');
import { MatDialog } from '@angular/material';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { BusinessUnitService } from '../../../services/businessUnit.service';
import { TerritoryService } from '../../../services/territories.service';
import { ApprovalChainService } from '../../../services/approvalChain.service';
import { PocDashboardService } from '../../../services/poc.service';
import { ChatService } from '../../../services/chat.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { SharedService } from '../../../services/shared.service';
import { Bid } from '../../../models/bid.model';
import { BidAccountInfoComponent } from '../../../components/BidAccountInfo/bidAccountInfo.component';
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { DeleteuserComponent } from '../deleteuser/deleteuser.component';
import { DeleteReviewerComponent } from '../delete-reviewer/delete-reviewer.component';
import { ReassignCownerCreateBidComponent } from '../reassign-cowner-create-bid/reassign-cowner-create-bid.component';
import { DeleteSalesManagerComponent } from '../delete-sales-manager/delete-sales-manager.component';
// import { BusinessUnit } from '../../../models/businessUnit.model';

declare var $: any;
var rootScope;
@Component({
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.css'],
  providers: [BidService, UsersService, BusinessUnitService, TerritoryService, ApprovalChainService, PocDashboardService, ChatService]
})

export class BidComponent implements OnDestroy {
  public bidForm;
  public tags = [];
  /*   businessUnits = [];
    territoryData = []; */
  businessUnitByIdList;
  territoryByIdList;
  fileSelected: any = 'Choose File';
  bid;
  searchDataArray;
  formSubmitted: boolean = false;
  accountSubmitted: boolean = false;
  contributorList: any;
  reviewerList: any;
  coOwnerList: any;
  approvalChains: any;
  options: {};
  searchData
  bids;
  user;
  bid_id;
  minDate;
  module;
  userType = ''
  types = [];
  // public min = new Date();
  approvalChain;
  totalApprover;
  poc;
  pocSubmited: boolean = false
  reviewData;
  reviewFlag = true;
  solutionReviewFlag = true;
  proposalReviewFlag = true;
  account = [];
  account_data;
  add = false;
  refreshObj;
  searchDataArray2 = [];
  activeSearch;
  account_name_info;
  accountNameFlag = false;
  selectedBUs = [];
  selectedTerritories = [];
  selectedContributor = [];
  selectedReview = [];
  selectedApproval = [];
  dropdownTerritorySettings;
  dropdownBUSettings;
  dropdownContributorSettings;
  dropdownReviewSettings;
  dropdownApprovalSettings;
  pricingReviewer = false;
  solutionReviewer = false;
  proposalReviewer = false;
  salesReviewer = false;
  deliveryReviewer = false;
  allReviewer = false;
  legalReviewer = false;
  loader = false;
  bidStatus = "";
  salesManagerName;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (!this.reviewFlag || !this.solutionReviewFlag || !this.proposalReviewFlag || this.pocSubmited || this.bid.revision_status || this.bid.OpportunityID) {
      return;
    }
    if (event.target && event.target['id'] == "account" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8)) {
      rootScope.showResults(event);
    }
  }

  @ViewChild("bidname") private elementRef: ElementRef;
  @ViewChild(AlertComponent) alert: AlertComponent;
  participants = [];
  constructor(public router: Router, public _bidService: BidService,
    public _approvalChainService: ApprovalChainService,
    public _businessUnitService: BusinessUnitService,
    public _territoryService: TerritoryService,
    public _userService: UsersService,
    public _route: ActivatedRoute,
    public dialog: MatDialog,
    public _formBuilder: FormBuilder,
    public _pocService: PocDashboardService,
    private _chatService: ChatService, public _sharedService: SharedService) {
    rootScope = this;
    rootScope.bid = new Bid();
    // rootScope.bid['contributorTypes'] = [];
    // rootScope.bid['reviewerTypes'] = [];
    rootScope.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    rootScope.userType = rootScope.user.user_type;
    rootScope.minDate = new Date();
    rootScope.defaultValid()


    // bid create fields
    rootScope.bidForm = _formBuilder.group({
      name: ["", Validators.compose([Validators.required])],
      account_name: ["", Validators.compose([Validators.required])],
      approval_chain: ["", Validators.compose([Validators.required])],
      bid_number: ["", Validators.compose([Validators.required])],
      date_submission: ["", Validators.compose([Validators.required])],
      date_closing: ["", Validators.compose([Validators.required])],
      date_received: ["", Validators.compose([Validators.required])],
      estimatedValue: ["", Validators.compose([Validators.required])],
      comments: ["", Validators.compose([Validators.required])],
      bu_ids: ["", Validators.compose([Validators.required])],
      territory_ids: ["", Validators.compose([Validators.required])],
      contributor: ["", Validators.compose([Validators.required])],
      contributorTypes: ["", Validators.compose([Validators.required])],
      reviewer: ["", Validators.compose([Validators.required])],
      reviewerTypes: ["", Validators.compose([Validators.required])],
      coOwner: [""],
      coOwnerTypes: [""],
      attachment_data: ["", Validators.compose([Validators.required])],
      tag: [""], participants: [],
      category: [""],
      types: []
    });

    rootScope.refreshObj = {
      company_id: rootScope.user.company_id,
      bid_id: rootScope.bid_id,
      module: "BID_CREATION",
      sub_module: "",
    };
    rootScope._sharedService.newData.subscribe(a => {
      if (a.data == 'bid_creation' && rootScope.userType != "BID_OWNER") {
        rootScope.readData();
      }
    });
    rootScope.getBuTerritories();
    rootScope.readCategoryData();
    rootScope.readTypeData();
    /*     rootScope.getBusinessUnits();
        rootScope.getTerritories(); */
    rootScope.getAllCoowners();
    if (rootScope.user && rootScope.user.role_module_mapping && rootScope.user.role_module_mapping.length) {
      rootScope.module = rootScope.user.role_module_mapping.find(a => a.module_name.replace(/ /g, '_').toLowerCase() == 'bid_creation');
    }
    rootScope.bid_id = rootScope._route.snapshot.params['id'];
    if (rootScope.bid_id) {
      rootScope.getBidById();
      rootScope.getPoc();
      rootScope.getReview();
      this.getTechSolutionReview();
      this.getProposalReview();
    } else {
      rootScope.add = true;
    }
    rootScope.readData();

    /*  rootScope.dropdownTerritorySettings = {
       singleSelection: false,
       idField: 'territory_id',
       textField: 'name',
       selectAllText: 'Select All',
       unSelectAllText: 'UnSelect All',
       allowSearchFilter: false,
       itemsShowLimit: 0,
     };
     rootScope.dropdownBUSettings = {
       singleSelection: false,
       idField: 'bu_id',
       textField: 'name',
       selectAllText: 'Select All',
       unSelectAllText: 'UnSelect All',
       allowSearchFilter: false,
       itemsShowLimit: 0,
     };
     rootScope.dropdownContributorSettings = {
       singleSelection: false,
       idField: 'user_id',
       textField: 'fullname',
       selectAllText: 'Select All',
       unSelectAllText: 'UnSelect All',
       allowSearchFilter: false,
       itemsShowLimit: 2,
     }
     rootScope.dropdownReviewSettings = {
       singleSelection: false,
       idField: 'user_id',
       textField: 'fullname',
       selectAllText: 'Select All',
       unSelectAllText: 'UnSelect All',
       allowSearchFilter: false,
       itemsShowLimit: 2,
     }
     rootScope.dropdownApprovalSettings = {
       singleSelection: true,
       limitSelection: 1,
       idField: 'ac_id',
       textField: 'name',
       selectAllText: 'Select All',
       unSelectAllText: 'UnSelect All',
       allowSearchFilter: false,
       itemsShowLimit: 2,
     } */
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }


  disableParticipants() {
    const contributor = this.bidForm.get('contributor');
    const reviewer = this.bidForm.get('reviewer');
    const coOwner = this.bidForm.get('coOwner');
    const territory_ids = this.bidForm.get('territory_ids');
    const bu_ids = this.bidForm.get('bu_ids');
    const approval_chain = this.bidForm.get('approval_chain');
    const category = this.bidForm.get('category');
    const types = this.bidForm.get('types');
    // const coOwner = this.bidForm.get('coOwner');
    // !this.reviewFlag || !this.solutionReviewFlag || !this.proposalReviewFlag // Disable Check if the bid id in under Reviewer 
    if (this.pocSubmited || rootScope.bidStatus == 'DROPPED') {
      contributor.disable();
      reviewer.disable();
      coOwner.disable();
      territory_ids.disable();
      bu_ids.disable();
      approval_chain.disable();
      category.disable();
      types.disable();
    }
    if (!this.reviewFlag || !this.solutionReviewFlag || !this.proposalReviewFlag || this.pocSubmited) {
      territory_ids.disable();
      bu_ids.disable();
      approval_chain.disable();
      category.disable();
      types.disable();
    }
    if (this.bid.coOwner == this.user.user_id) {
      coOwner.disable();
    }
  }


  openContributorList() {
    let contributor = [];
    contributor = this.bid.contributor;
    contributor.push(this.user.user_id);
    if (this.bid.user_id) {
      contributor.push(this.bid.user_id);
    }
    contributor = _.concat(contributor,
      this.bid.reviewer,
      this.bid.coOwner);
    contributor = _.uniq(contributor);
    let obj = {
      "selectedUserIds": contributor,
      "user_type": "CONTRIBUTOR",
      "bid_id": this.bid_id,
      "bu_ids": this.bid.bu_ids,
      "territory_ids": this.bid.territory_ids
    }
    rootScope._userService.getCompanyUserData(obj).subscribe(data => {
      if (data['data'] == null) {
        this.contributorList = [];
        return;
      }
      /* this.contributorList = data['data']['users'];
      this.contributorList.forEach(element => {
        element.username = element.user_subtype != null ? element.username + " - " + element.user_subtype : element.username;
      }); */
      this.contributorList = [];
      let arr = data['data']['users'];
      arr.forEach(element => {
        let con = element.userTypes.filter(a => { return a.user_type == "CONTRIBUTOR" });
        con.forEach(item => {
          let obj = {
            "username": element.username + " - " + item.user_subtype,
            "user_id": element.user_id
          }
          this.contributorList.push(obj);
        });
      });
      // console.log("contributorList >>>>", this.contributorList);
    });
  }

  cw;
  getAllCoowners() {
    let obj = {};
    obj['user_type'] = "BID_OWNER";
    obj['user_subtype'] = "Presales";
    obj['status'] = 'ACTIVE'
    if (rootScope.localBu && rootScope.localBu.length > 0)
      obj['bu_ids'] = rootScope.localBu;
    if (rootScope.localTerritory && rootScope.localTerritory.length > 0)
      obj['territory_ids'] = rootScope.localTerritory;

    rootScope._userService.getCompanyUserData(obj).subscribe(data => {
      if (data && data['code'] == '2000') {
        this.cw = [];
        let arr = data['data']['users'];
        arr.forEach(element => {
          let cw = element.userTypes.filter(a => { return a.user_type == "BID_OWNER" && a.user_subtype == "Presales" });
          cw.forEach(item => {
            let obj = {
              "username": element.username + " - " + item.user_subtype,
              "user_id": element.user_id,
              "user_type": element.user_type,
              "user_subtype": element.user_subtype
            }
            this.cw.push(obj);
          });
        });
        // console.log(this.cw);
      }
    })
  }

  openCoOwnerList() {
    let selectedUserIds = [];
    selectedUserIds.push(this.user.user_id);
    if (this.bid.user_id) {
      selectedUserIds.push(this.bid.user_id);
    }
    selectedUserIds = _.concat(selectedUserIds,
      this.bid.reviewer,
      this.bid.contributor);
    if (this.bid.coOwner != "") {
      selectedUserIds.push(this.bid.coOwner);
    }
    selectedUserIds = _.uniq(selectedUserIds);
    let obj = {
      "selectedUserIds": selectedUserIds,
      "user_type": "BID_OWNER",
      "user_subtype": "Presales",
      "bid_id": this.bid_id,
      "bu_ids": this.bid.bu_ids,
      "territory_ids": this.bid.territory_ids
    }
    rootScope._userService.getCompanyUserData(obj).subscribe(data => {
      if (data['data'] == null) {
        this.coOwnerList = [];
        return;
      }
      /* this.contributorList = data['data']['users'];
      this.contributorList.forEach(element => {
        element.username = element.user_subtype != null ? element.username + " - " + element.user_subtype : element.username;
      }); */
      this.coOwnerList = [];
      let arr = data['data']['users'];
      arr.forEach(element => {
        let con = element.userTypes.filter(a => { return a.user_type == "BID_OWNER" && a.user_subtype == "Presales" });
        con.forEach(item => {
          let obj = {
            "username": element.username + " - " + item.user_subtype,
            "user_id": element.user_id
          }
          this.coOwnerList.push(obj);
        });
      });
      // console.log("contributorList >>>>", this.contributorList);
    });
  }

  updateCoOwners() {
    if (!this.cw || !this.cw.length) {
      return;
    }
    this.bid.coOwner = "";
    this.bid.coOwnerTypes = this.bid.coOwnerTypes || "";
    let element = this.bid.coOwnerTypes;
    this.cw.forEach(item => {
      if (element == item.username) {
        this.bid.coOwner = item.user_id;
      }
    });
  }
  // Types and category List API READ CALL

  category;
  readCategoryData() {
    this.loader = true
    let obj = {
      "company_id": rootScope.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE',
    }
    rootScope._bidService.readCategory(obj).subscribe(resp => {
      if (resp['data'] == null) {
        return;
      }
      rootScope.category = resp['data']['category_data']
      // console.log(">>>>type123", rootScope.category)
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  readTypeData() {
    this.loader = true
    let obj = {
      "company_id": rootScope.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE',
    }
    this._bidService.readType(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false
        return;
      }
      rootScope.types = resp['data']['type_data']
      // console.log(">>>>type", rootScope.type)
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  openReviewerList() {
    let reviewer = [];
    reviewer = this.bid.reviewer;
    reviewer.push(this.user.user_id);
    if (this.bid.user_id) {
      reviewer.push(this.bid.user_id);
    }
    reviewer = _.concat(reviewer,
      this.bid.contributor,
      this.bid.coOwner);
    reviewer = _.uniq(reviewer);
    let obj = {
      "selectedUserIds": reviewer,
      "user_type": "REVIEWER",
      "bid_id": this.bid_id,
      "bu_ids": this.bid.bu_ids,
      "territory_ids": this.bid.territory_ids,
      "ReviewList" : true
    }
    rootScope._userService.getReviewersList(obj).subscribe(data => {
      if (data['data'] == null) {
        this.reviewerList = [];
        return;
      }
      // console.log(data);
      /* this.reviewerList = data['data']['users'];
      this.reviewerList.forEach(element => {
        element.username = element.user_subtype != null ? element.username + " - " + element.user_subtype : element.username;
      }); */
      let arr = [];
      arr = data['data']['users'];
      this.reviewerList = [];
      arr.forEach(element => {
        let rev = element.userTypes.filter(a => { return a.user_type == "REVIEWER" });
        rev.forEach(item => {
          let obj = {
            "username": element.username + " - " + item.user_subtype,
            "user_id": element.user_id,
            "user_subtype": item.user_subtype
          }
          this.reviewerList.push(obj);
        });
      });
      // console.log("reviewerList >>>>", this.reviewerList);
    });
  }

  /*  onItemSelect(item: any) {
     let businessUnits = [];
     if (rootScope.selectedBUs.length != 0) {
       rootScope.selectedBUs.forEach(element => {
         businessUnits.push(element.bu_id);
       });
     }
     rootScope.bidForm.value['bu_ids'] = businessUnits;
     let territoryData = [];
     if (rootScope.selectedTerritories.length != 0) {
       rootScope.selectedTerritories.forEach(element => {
         territoryData.push(element.territory_id);
       });
     }
     rootScope.bidForm.value['territory_ids'] = territoryData;
     rootScope.getContributors();
     rootScope.getReviewers();
     let contributorList = [];
     if (rootScope.selectedContributor.length != 0) {
       rootScope.selectedContributor.forEach(element => {
         contributorList.push(element.user_id);
       })
     }
     rootScope.bidForm.value['contributor'] = contributorList;
     let reviewerList = [];
     if (rootScope.selectedReview.length != 0) {
       rootScope.selectedReview.forEach(element => {
         reviewerList.push(element.user_id)
       })
     }
     rootScope.bidForm.value['reviewer'] = reviewerList;
     let approvalChains = [];
     if (rootScope.selectedApproval.length != 0) {
       rootScope.selectedApproval.forEach(element => {
         approvalChains.push(element.ac_id)
       })
     }
     rootScope.bidForm.value['approval_chain'] = approvalChains;

     rootScope.bid['contributor'] = contributorList;
     rootScope.bid['reviewer'] = reviewerList;
     rootScope.bid['approval_chain'] = approvalChains;
     rootScope.bid['bu_ids'] = businessUnits;
     rootScope.bid['territory_ids'] = territoryData;
   } */

  // get list of account names
  readData() {
    this.loader = true;
    let obj = {
      "company_id": rootScope.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE'
    }
    rootScope._bidService.readAccountInfo(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false;
        return;
      }
      this.loader = false;
      rootScope.account = resp['data']['account_data'];
      rootScope.searchDataArray2 = resp['data']['account_data'].length > 0 ? resp['data']['account_data'] : undefined;
      rootScope.accountNameFlag = false;
      if (rootScope.bid.account_name) {
        rootScope.bid.account_id = rootScope.account.filter(a => { return a.account_name == rootScope.bid.account_name; })[0]._id;
      }
    }, error => {
      this.loader = false;
    })
  }

  // get list of account names on keyboard input
  showResults(event) {
    if (rootScope.bid.revision_status) {
      return;
    }
    var searchText = rootScope.bid.account_name;
    if (searchText.length == 0) {
      rootScope.searchDataArray = undefined;
      rootScope.searchDataArray = [];
      this.searchDataArray2.length = 1;
      $("#showResults").hide();
      return;
    }
    let obj = {
      "company_id": rootScope.user.company_id,
      "account_name": searchText,
      "pageNo": 1,
      "size": 20,
      status: 'ACTIVE'
    }
    rootScope._bidService.searchAccount(obj).subscribe(response => {
      if (response['data'] == null) {
        rootScope.searchDataArray = [];
        rootScope.searchDataArray2 = [];
        rootScope.accountNameFlag = true;
        return;
      }
      if (response && response['data']) {
        // console.log(response['data'])
        rootScope.accountNameFlag = false;
        rootScope.searchDataArray = response['data']['account_data'].length > 0 ? response['data']['account_data'] : undefined;
        rootScope.searchDataArray2 = response['data']['account_data'].length > 0 ? response['data']['account_data'] : undefined;
        // var div = document.getElementById("showResults");
        // div.style.left = $("#account").offset().left + "px";
        // div.style.top = $("#account").offset().top + "px";
        $("#showResults").show();
      } else {
        rootScope.searchDataArray = [];
        rootScope.accountNameFlag = true;
      }
    }, error => {
      rootScope.searchDataArray = [];
      rootScope.searchDataArray2 = [];
    })
  }

  // set account name
  setData(id, name) {
    rootScope.bid.account_id = id;
    rootScope.account_name_info = rootScope.searchDataArray.filter(a => {
      return a._id == id;
    })
    // rootScope.searchDataArray = undefined;
    $("#showResults").hide();
    rootScope.bid.account_name = name;
  }

  // edit account name
  editAccount() {
    if (rootScope.bid.account_name == "") {
      return
    } else {
      let obj = {
        "account_name": rootScope.bid.account_name,
        "company_id": rootScope.user.company_id,
        "pageNo": 1
      }
      rootScope._bidService.readAccountInfo(obj).subscribe(resp => {
        if (resp['data'] == null) {
          return;
        }
        rootScope.account_name_info = resp['data']['account_data'];
        if (rootScope.account_name_info) {
          const dialogRef = rootScope.dialog.open(BidAccountInfoComponent, {
            height: '350px',
            width: '630px',
            data: rootScope.account_name_info[0]
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              rootScope.readData()
              rootScope.bid.account_name = result.account_name;
            }
          });
        }
      });
    }
  }

  // add new account name
  addBidAccount() {
    if (!this.reviewFlag || !this.solutionReviewFlag || !this.proposalReviewFlag || this.pocSubmited || this.bid.revision_status) {
      return;
    }
    this.searchDataArray = []
    const dialogRef = rootScope.dialog.open(BidAccountInfoComponent, {
      height: '350px',
      width: '630px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        rootScope.readData()
        rootScope.bid.account_name = result.account_name;
      }
    });
  }

  public ngAfterViewInit(): void {
    rootScope.elementRef.nativeElement.focus();
  }

  a = []
  // get BU and territorries details
  getBuTerritories() {
    rootScope._userService.getCompanyDetails({ "user_id": this.user.user_id }).subscribe(res => {
      this.businessUnitByIdList = res['data']['user']['bussiness_unit']
      let tempList = res['data']['user']['territory'];
      let rootExists = tempList.findIndex(a => a.parent_id == 'ROOT');
      if (rootExists === -1) {
        this.territoryByIdList = tempList;
        return
      }
      tempList.forEach(element => {
        if (element.parent_id == 'ROOT') {
          this.a.push(element)
          let b = tempList.filter(a => {
            return a.parent_id == element.territory_id
          })
          Array.prototype.push.apply(this.a, b);
        }
      });
      this.territoryByIdList = this.a
    })

  }

  /* getBusinessUnits() {
    rootScope._businessUnitService.getBusinessUnits([]).subscribe(data => {
      if (data['code'] == 2000) {
        rootScope.businessUnits = data['data'];
      }
    });
  } */


  /*  getTerritories() {
     rootScope._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
       if (territories['code'] === 2000) {
         rootScope.territoryData = territories['data']     //rootScope.errorMsg = "";
         // console.log(rootScope.territoryData, "check_t")
       } else if (territories['code'] === 3005) {
         //rootScope.errorMsg = "Ohh! It seems you are not connected with us yet";
       } else if (territories['code'] === 401) {
         //rootScope.users = [];
       } else if (territories['code'] === 3012) {
         //rootScope.errorMsg = "Your Email is Not Verified , kindly verify your email";
       } else if (territories['code'] === 3006) {
         //rootScope.errorMsg = "Ohh! Invalid User.";
       }
     });
   } */

  // get bid details to edit
  getBidById() {
    rootScope.defaultValid();
    rootScope._bidService.getBidById(rootScope.bid_id).subscribe(data => {
      rootScope.bid = data['data']['bid'];
      rootScope.bidStatus = this.bid.bidFinalStatus ? this.bid.bidFinalStatus : "";
      // rootScope.bid.account_name = rootScope.bid.account_id.account_name
      rootScope.add = rootScope.bid.revision_status ? false : true;
      rootScope.bidForm.value['bu_ids'] = rootScope.bid.bu_ids;
      rootScope.bidForm.value['territory_ids'] = rootScope.bid.territory_ids;
      localStorage.setItem("bidData", JSON.stringify(rootScope.bid));

      // rootScope.localBu = rootScope.bid.bu_ids;
      rootScope.selectedBUs = rootScope.bid.bu_ids;
      // rootScope.localTerritory = rootScope.bid.territory_ids;
      rootScope.selectedTerritories = rootScope.bid.territory_ids;
      if (rootScope.bid.participants) {
        rootScope.participants = rootScope.bid.participants;
      }// rootScope.getContributors();
      // rootScope.getReviewers();
      rootScope.setBuChildren(rootScope.bid.bu_ids);
      rootScope.openCoOwnerList();
      rootScope.setTerritoryChildren(rootScope.bid.territory_ids);
      rootScope.getApprovalChain();
      rootScope.disableParticipants();
      this.bidManagerName();
      if (this.bid.OpportunityID) {
        let territory_id = this.bidForm.get('territory_ids');
        let date_submission = this.bidForm.get('date_submission');
        let date_closing = this.bidForm.get('date_closing');
        territory_id.disable();
        date_submission.disable();
        date_closing.disable();
      }
    })
  }

  defaultValid() {
    for (var element in rootScope.bid) {
      rootScope.bid[element + 'RegexValid'] = true;
    }
  }

  res = [];
  localBu = [];
  setBuChildren(event) {
    if (event.length == 0) {
      rootScope.localBu = [];
      rootScope.bidForm.value['bu_ids'] = [];
      // rootScope.getContributors();
      // rootScope.getReviewers();
      this.reviewers();
      this.contributors();
      return
    }

    rootScope.localBu = event;
    rootScope._businessUnitService.getBusinessUnitsChild({ bu_parent: event }).subscribe(data => {
      if (data['code'] == 2000) {
        let obj = data['data'];
        let result = obj.map(a => a.bu_id);
        // console.log(result, "welcome");
        this.localBu = this.localBu.concat(result);
        // console.log(this.localBu, "hey >>>>>>>");
        // rootScope.getContributors();
        // rootScope.getReviewers();
        this.reviewers();
        this.contributors();
      }
    });
  }
  localTerritory = [];
  setTerritoryChildren(event) {
    if (event.length == 0) {
      rootScope.localTerritory = [];
      rootScope.bidForm.value['territory_ids'] = [];
      // rootScope.getContributors();
      // rootScope.getReviewers();
      this.reviewers();
      this.contributors();
      return
    }

    rootScope.localTerritory = event;
    rootScope._territoryService.getTerritoriesChild({ status: 'ACTIVE', territory_ids: event }).subscribe(data => {
      if (data['code'] == 2000) {
        let obj = data['data'];
        let result = obj.map(a => a.territory_id);
        this.localTerritory = this.localTerritory.concat(result);
        // console.log(this.localTerritory, "hey >>>>>>>");
        // rootScope.getContributors();
        // rootScope.getReviewers();
        this.reviewers();
        this.contributors();
      }
    });
  }

  con;
  contributors() {
    let obj = {};
    obj['user_type'] = "CONTRIBUTOR";
    obj['status'] = 'ACTIVE'
    if (rootScope.localBu && rootScope.localBu.length > 0)
      obj['bu_ids'] = rootScope.localBu;
    else
      return;
    if (rootScope.localTerritory && rootScope.localTerritory.length > 0)
      obj['territory_ids'] = rootScope.localTerritory;
    else
      return;

    rootScope._userService.getCompanyUserData(obj).subscribe(data => {
      if (data && data['code'] == '2000') {
        this.con = [];
        let arr = data['data']['users'];
        arr.forEach(element => {
          let con = element.userTypes.filter(a => { return a.user_type == "CONTRIBUTOR" });
          con.forEach(item => {
            let obj = {
              "username": element.username + " - " + item.user_subtype,
              "user_id": element.user_id,
              "user_type": item.user_type,
              "user_subtype": item.user_subtype

            }
            this.con.push(obj);
          });
        });
      }
    })
  }

  // get list of contributors according to BUs and territories
  /* getContributors() {
    let obj = {};
    let contributor = [];
    contributor = this.bid.contributor;
    contributor.push(this.user.user_id);
    contributor = _.concat(contributor, this.bid.reviewer);
    contributor = _.uniq(contributor);
    obj['user_type'] = "CONTRIBUTOR";
    obj['status'] = 'ACTIVE'
    obj["selectedUserIds"] = contributor;
    if (rootScope.localBu && rootScope.localBu.length > 0)
      obj['bu_ids'] = rootScope.localBu;
    if (rootScope.localTerritory && rootScope.localTerritory.length > 0)
      obj['territory_ids'] = rootScope.localTerritory;

    if (obj['bu_ids'] && obj['territory_ids']) {
      rootScope._userService.getCompanyUserData(obj).subscribe(data => {
        if (data && data['code'] == '2000') {
          this.contributorList = [];
          let arr = data['data']['users'];
          arr.forEach(element => {
            let con = element.userTypes.filter(a => { return a.user_type == "CONTRIBUTOR" });
            con.forEach(item => {
              let obj = {
                "username": element.username + " - " + item.user_subtype,
                "user_id": element.user_id
              }
              this.contributorList.push(obj);
            });
          });
        } else if (this.bid.bid_id) {
        } else {
          rootScope.bid['contributor'] = [];
          rootScope.bid['reviewer'] = [];
          this.bid['contributorTypes'] = [];
          this.bid['reviewerTypes'] = [];
          // rootScope.bid['approval_chain'] = [];
          this.contributorList = [];
        }

      })
      // console.log(obj);
      // rootScope._approvalChainService.getApprovalChain(obj).subscribe(data => {
      //   if (data['data'] == null) {
      //     return;
      //   }
      //   rootScope.approvalChains = data['data']['approval_chains'];
      //   rootScope.updateApprovalChain();
      // })

    } else {
      rootScope.bid['contributor'] = [];
      rootScope.bid['reviewer'] = [];
      this.bid['contributorTypes'] = [];
      this.bid['reviewerTypes'] = [];
      // rootScope.bid['approval_chain'] = [];
      this.contributorList = [];
      rootScope.approvalChains = [];
      this.reviewerList = [];
    }
  } */

  getApprovalChain() {
    if (rootScope.bid.bu_ids.length > 0 && rootScope.bid.territory_ids.length > 0) {
      // let buChildPromise =
      // let territoryChildPromise =
      let obj = {};
      let buPromise = new Promise((resolve, reject) => {
        this._businessUnitService.getBusinessUnitsParent({ child_bu: rootScope.bid.bu_ids }).subscribe(data => {
          resolve(data);
        }, error => {
          reject(error);
        })
      })

      let territoryPromise = new Promise((resolve, reject) => {
        this._territoryService.getTerritoriesParent({ child_territory: rootScope.bid.territory_ids }).subscribe(data => {
          if (data) {
            resolve(data)
          }
        }, error => {
          reject(error)
        });
      });

      Promise.all([buPromise, territoryPromise]).then(finalData => {
        let buResult = finalData[0]['data'].map(a => a.bu_id);
        let territoryResult = finalData[1]['data'].map(a => a.territory_id);

        if (buResult && buResult.length > 0)
          obj['bu_ids'] = buResult;
        if (territoryResult && territoryResult.length > 0)
          obj['territory_ids'] = territoryResult;

        if (obj['bu_ids'] && obj['territory_ids']) {
          rootScope._approvalChainService.getApprovalChain(obj).subscribe(data => {
            if (data['data'] == null) {
              return;
            }
            rootScope.approvalChains = data['data']['approval_chains'];
            rootScope.updateApprovalChain();
          })
          return
        }
      });

    }
  }

  updateApprovalChain() {
    let a = rootScope.bid;
    let temp = false;
    let approvalChains = [];

    // console.log(buResult, territoryResult, "result")
    if (
      rootScope.bid.estimatedValue && rootScope.bidForm.value['bu_ids']
      // && rootScope.bidForm.value['territory_ids']
      && rootScope.bid.territory_ids
      && rootScope.bidForm.value['bu_ids'].length
      // && rootScope.bidForm.value['territory_ids'].length
      && rootScope.bid.territory_ids.length
    ) {
      approvalChains = rootScope.approvalChains.filter(function (element) {
        return (element.rules.some(function (rule) {
          if (rule) {
            temp = true;
          }
          if ((parseInt(rule.r_amount) >= parseInt(a.estimatedValue)) && (parseInt(rule.l_amount) <= parseInt(a.estimatedValue))) {
            return (parseInt(rule.r_amount) >= parseInt(a.estimatedValue)) && (parseInt(rule.l_amount) <= parseInt(a.estimatedValue))
          }
        }));
      });
      if (approvalChains.length == 0) {
        approvalChains = rootScope.approvalChains.filter(function (element) {
          return element.rules.some(function (rule) {
            if (rule) {
              temp = true;
            }
            return parseInt(rule.l_amount) <= parseInt(a.estimatedValue) && parseInt(rule.r_amount) == 0
          });
        });
      }
      if (approvalChains.length == 0) {
        approvalChains = rootScope.approvalChains.filter(function (element) {
          return element.rules.length == 0;
        });
      } else {
        Array.prototype.push.apply(approvalChains, rootScope.approvalChains.filter(function (element) {
          return element.rules.length == 0;
        }));
      }

      if (temp && approvalChains.length > 0) {
        rootScope.approvalChains = approvalChains;
      }
    }
  }

  /* onReviewerChange() {
    this.updateContributorReviewers();
  } */

  rev;
  reviewers() {
    let obj = {};
    obj['user_type'] = "REVIEWER";
    obj['status'] = 'ACTIVE';
    obj['ReviewList'] = true;
    if (rootScope.localBu && rootScope.localBu.length > 0)
      obj['bu_ids'] = rootScope.localBu;
    else
      return;
    if (rootScope.localTerritory && rootScope.localTerritory.length > 0)
      obj['territory_ids'] = rootScope.localTerritory;
    else
      return;
    rootScope._userService.getReviewersList(obj).subscribe(data => {
      if (data['data'] == null) {
        this.rev = [];
        return;
      }
      let arr = [];
      arr = data['data']['users'];
      this.rev = [];
      arr.forEach(element => {
        let rev = element.userTypes.filter(a => { return a.user_type == "REVIEWER" });
        rev.forEach(item => {
          let obj = {
            "username": element.username + " - " + item.user_subtype,
            "user_id": element.user_id,
            "user_subtype": item.user_subtype
          }
          this.rev.push(obj);
        });
      });
      // console.log("rev >>>>", this.rev);
    });
  }

  // get list of reviewers according to BUs and territories
  /* getReviewers() {
    let obj = {};
    let reviewer = [];
    reviewer = this.bid.reviewer;
    reviewer.push(this.user.user_id);
    reviewer = _.concat(reviewer, this.bid.contributor);
    reviewer = _.uniq(reviewer);
    obj['user_type'] = "REVIEWER";
    obj['status'] = 'ACTIVE';
    obj["selectedUserIds"] = reviewer;
    if (rootScope.localBu && rootScope.localBu.length > 0) obj['bu_ids'] = rootScope.localBu;
    if (rootScope.localTerritory && rootScope.localTerritory.length > 0) obj['territory_ids'] = rootScope.localTerritory;

    if (obj['bu_ids'] && obj['territory_ids']) {
      rootScope._userService.getReviewersList(obj).subscribe(data => {
        if (data['data'] == null) {
          this.reviewerList = [];
          return;
        }
        let arr = [];
        arr = data['data']['users'];
        this.reviewerList = [];
        arr.forEach(element => {
          let rev = element.userTypes.filter(a => { return a.user_type == "REVIEWER" });
          rev.forEach(item => {
            let obj = {
              "username": element.username + " - " + item.user_subtype,
              "user_id": element.user_id,
              "user_subtype": item.user_subtype
            }
            this.reviewerList.push(obj);
          });
        });
        // console.log("reviewerList >>>>", this.reviewerList);
      });
    } else {
      this.reviewerList = [];
      this.contributorList = [];
      rootScope.approvalChains = [];
      rootScope.bid['contributor'] = [];
      rootScope.bid['reviewer'] = [];
      this.bid['contributorTypes'] = [];
      this.bid['reviewerTypes'] = [];
      // rootScope.bid['approval_chain'] = [];
    }
  } */

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
      this.disableParticipants();
    })
  }

  // to check whether bid is under pricing review or not
  getReview() {
    rootScope._bidService.getReviewData({ "bid_id": rootScope.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        rootScope.reviewData = resp['data']['reviewtab_data'];
        rootScope.reviewFlag = rootScope.reviewData[rootScope.reviewData.length - 1].review_flag;
        this.disableParticipants();
        // rootScope.reviewCount = rootScope.reviewData.length;
      });
  }

  // to check whether bid is under solution review or not
  getTechSolutionReview() {
    this._bidService.getTechSolutionReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        let data = resp['data']['reviewtab_data'];
        this.solutionReviewFlag = data[data.length - 1].techSolReview_flag;
        this.disableParticipants();
      });
  }

  // to check whether bid is under proposal review or not
  getProposalReview() {
    this._bidService.getProposalReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        this.reviewData = resp['data']['reviewtab_data'];
        this.proposalReviewFlag = this.reviewData[this.reviewData.length - 1].ProposalReview_flag;
        this.disableParticipants();
      });
  }

  // upload documents
  openDialog(): void {
    if (rootScope.pocSubmited/*  || !rootScope.reviewFlag */) {
      return;
    }
    let attachment = [];
    let obj = {
      "bid_id": this.bid_id ? this.bid_id : '',
      "type": 'BID_CREATION'
    }
    const dialogRef = rootScope.dialog.open(UploadfileComponent, {
      height: '340px',
      width: '850px',
      data: rootScope.versionData ? rootScope.versionData : obj
    });

    dialogRef.afterClosed().subscribe(result => {
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
          "type": "BID_CREATION",
          "doc_version": result[i].doc_version,
          "user_id": result[i].user_id,
          "revision": result[i].revision ? result[i].revision : false,
          "parent_id": result[i].parent_id ? result[i].parent_id : "",
          "flag": result[i].flag,
          "isPublic": result[i].isPublic,
          "level": result[i].level,
          "fullname": result[i].fname,
          "fname": result[i].fname
        }
        attachment.push(obj);
        rootScope.fileSelected = result.length + ' file selected';
      }
      if (rootScope.bid.attachment_data) {
        attachment.forEach(item => {
          rootScope.bid.attachment_data.push(item);
        })
      } else {
        rootScope.bid['attachment_data'] = attachment;
      }
    });
  }

  versionData;
  downloadIndex;
  // download file
  onDownloadDialog() {
    if (rootScope.bid.attachment_data.length == 0) {
      rootScope.alert.sweetNoAttachments();
      return;
    }
    rootScope.bid['module'] = 'BID_CREATION';
    //rootScope.downloadIndex = index;
    if (rootScope.bid['attachment_data']) {
      const dialogRef = rootScope.dialog.open(DownloadComponent, {
        height: '365px',
        width: '850px',
        data: rootScope.bid
      });
      dialogRef.afterClosed().subscribe(result => {
        if (typeof result === 'boolean') {
          return
        }
        if (result >= 0) {
          rootScope.fileSelected = result + ' file selected';;
          return
        }
        rootScope.versionData = result;
        if (result) {
          rootScope.openDialog();
        }
      });
    }
  }

  // add tags
  addTag(event) {
    if (event.keyCode == 32) {
      let index = rootScope.bid.tags.findIndex(item => item.name == rootScope.bid.tag.replace(/\s/g, ""))
      if (index == -1) {
        let obj = {
          name: rootScope.bid.tag.replace(/\s/g, ""),
          description: "this is a tag system",
        }
        rootScope.bid.tags.push(obj);
        rootScope.bid.tag = "";
      }
    }
  }

  // remove tags
  removeTag(id) {
    rootScope.bid.tags.splice(id, 1);
  }

  // bid validation
  // && element != "coOwner" && element != "coOwnerTypes"
  validate() {
    let validate = true;
    for (var element in rootScope.bid) {
      if (element && rootScope.bid[element] === '' && element != 'date_received' && element != "comments" &&
        element != 'date_created' && element != 'date_modified' && element != '__v'
        && element != "bid_number" && element != "coOwner") {
        // console.log("11111", element, rootScope.bid[element]);
        validate = false;
      }
      if (rootScope.bid[element] && typeof rootScope.bid[element] == 'object' && rootScope.bid[element].length == 0
        && element != 'currency' && element != 'attachment_data'
        && element != 'attachment_data'
        && element != 'comments'
        && element != 'tags' && element != 'date_received'
        && element != 'sheetIds' && element != 'currentParticipants'
        && element != "categories" && element != "uniqSubmitForm") {
        // console.log("22222", element, rootScope.bid[element]);
        validate = false
      }
    }
    return validate;
  }


  validateSingle(element) {
    let validate = true;
    if (element && rootScope.bid[element] === '') {
      validate = false;
    }
    if (rootScope.bid[element] && typeof rootScope.bid[element] == 'object' && rootScope.bid[element].length == 0
      && element != 'currency' && element != 'attachment_data'
      && element != 'attachment_data'
      && element != 'tags') {
      validate = false
    }
    return validate
  }

  validateRegex(element) {
    let validate = true;

    rootScope.bid[element + 'RegexValid'] = true;
    if (rootScope.bid[element] && !validatorCtrl.validateDealValue(rootScope.bid[element])) {
      rootScope.bid[element + 'RegexValid'] = false;
      validate = false;
    }
    return validate;

  }

  /* validateDate() {
      if (new Date(rootScope.bid.date_submission) < new Date(rootScope.bid.date_received)) {
          rootScope.alert.sweetError("Submission Date should be greater than Received Date");
          return;
      }
      if (new Date(rootScope.bid.date_submission) > new Date(rootScope.bid.date_closing)) {
          rootScope.alert.sweetError("Submission Date should be less than Closure Date");
          return;
      }
  } */

  // validate account name
  validateAccountName() {
    let validate = true;
    rootScope.searchDataArray2.forEach(element => {
      if (element.account_name == rootScope.bid.account_name && element != 'bid_number') {
        validate = false;
      }
    });
    return validate;
  }

  // check which reviewer is not present in bid
  checkReviewers() {
    let arr = [];
    let arr2 = [];
    this.pricingReviewer = false;
    this.solutionReviewer = false;
    this.proposalReviewer = false;
    this.salesReviewer = false;
    this.deliveryReviewer = false;
    this.allReviewer = false;
    this.legalReviewer = false;
    this.rev.forEach(element => {
      this.bid.reviewer.forEach(id => {
        if (id == element.user_id) {
          arr.push(element);
        }
      });
    });
    this.bid.reviewerTypes.forEach(element => {
      arr.forEach(item => {
        if (element == item.username) {
          arr2.push(item);
        }
      });
    });

    arr2.forEach(element => {
      // element.userTypes.forEach(item => {
      // if (item.user_type == "REVIEWER") {
      switch (element.user_subtype) {
        case "Pricing": {
          this.pricingReviewer = true;
          break;
        }
        case "Finance": {
          this.pricingReviewer = true;
          break;
        }
        case "Solution": {
          this.solutionReviewer = true;
          break;
        }
        case "Proposal": {
          this.proposalReviewer = true;
          break;
        }
        case "Sales": {
          this.salesReviewer = true;
          break;
        }
        case "Delivery": {
          this.deliveryReviewer = true;
          break;
        }
        case "All": {
          this.allReviewer = true;
          break;
        }
        case "Legal": {
          this.legalReviewer = true;
          break;
        }

      }
      // }
      // });
    });
  }

  validLegalContributor(contributorIds) {
    let validate = false;
    if (contributorIds) {
      contributorIds.forEach(element => {
        this.con.forEach(item => {
          if (element == item.user_id && item.user_subtype == "Legal" && item.user_type == "CONTRIBUTOR") {
            validate = true;
          }
        })
      })
    }
    return validate;
  }

  // create new bid
  createBid() {
    rootScope.formSubmitted = true;
    // rootScope.validateDate()
    if (String(rootScope.bid.estimatedValue).match(/[a-zA-Z!@#$%^&*_?\\d]/g)) {
      rootScope.alert.sweetError("Invalid estimated deal value");
      return;
    }
    if (new Date(rootScope.bid.date_submission) < new Date(rootScope.bid.date_received)) {
      rootScope.alert.sweetError("Submission Date should be greater than Received Date");
      return;
    }
    if (new Date(rootScope.bid.date_submission) > new Date(rootScope.bid.date_closing)) {
      rootScope.alert.sweetError("Submission Date should be less than Closure Date");
      return;
    }
    if (!rootScope.validate()) {
      rootScope.alert.sweetError("Please enter mandatory fields");
      return;
    }
    if (rootScope.bid.category == "" || rootScope.bid.category == null) {
      rootScope.alert.sweetError("Please enter mandatory fields")
      return;
    }
    if (!rootScope.validateRegex('estimatedValue')) {
      rootScope.alert.sweetError("Please enter mandatory fields estimate");
      return;
    }
    if (rootScope.validateAccountName()) {
      rootScope.accountNameFlag = true;
      rootScope.alert.sweetError("Account name does not exist. Please create new account name");
      return false;
    }
    this.updateContributorReviewers();
    this.checkReviewers();

    if ((this.salesReviewer || this.deliveryReviewer || this.allReviewer) && !this.pricingReviewer) {
      rootScope.alert.sweetError("Please select Pricing or Finance Reviewer");
      return;
    } else if (!this.pricingReviewer) {
      rootScope.alert.sweetError("Please select Pricing or Finance Reviewer");
      return;
    } else if (!this.legalReviewer) {
      rootScope.alert.sweetError("Please select Legal Reviewer");
      return;
    }
    if (this.salesReviewer || this.deliveryReviewer || this.allReviewer) {
    } else {
      rootScope.alert.sweetError("Please select Delivery Reviewer");
      return;
    }
    /*  else if (!this.solutionReviewer) {
      rootScope.alert.sweetError("Please select Solution and Proposal Reviewer");
      return;
    } else if (!this.proposalReviewer) {
      rootScope.alert.sweetError("Please select Proposal Reviewer");
      return;
    } */

    rootScope.bidForm.value.tags = rootScope.bid.tags;
    rootScope.bidForm.value.company_id = rootScope.user.company_id;
    rootScope.bidForm.value.user_role = rootScope.user.user_role;
    rootScope.bidForm.value.status = "ACTIVE";
    rootScope.bidForm.value.revision_id = "1"
    rootScope.bidForm.value.attachment_data = rootScope.bid.attachment_data;
    rootScope.bidForm.value.comments = rootScope.bid.comments;
    rootScope.bidForm['value']['account_id'] = rootScope.bid.account_id;
    rootScope.bidForm.value.coOwnerTypes = rootScope.bid.coOwnerTypes;
    rootScope.bidForm.value.contributorTypes = rootScope.bid.contributorTypes;
    rootScope.bidForm.value.reviewerTypes = rootScope.bid.reviewerTypes;
    rootScope.bidForm.value.account_id = rootScope.bid.account_id;

    if (!_.isEmpty(rootScope.bidForm.value.reviewer)) {
      rootScope.bidForm.value.reviewerObjArray = [];
      var reviewerIds = [];
      _.each(rootScope.bidForm.value.reviewer, function (n) {
        var found = _.find(rootScope.rev, function (m) {
          return m.username == n;
        });

        if (!_.isEmpty(found)) {
          reviewerIds.push(found.user_id);
          var subtype = found.username.split('-');
          rootScope.bidForm.value.reviewerObjArray.push({
            subtype: subtype[1].trim(),
            user_id: found.user_id
          });
        }
      });
      rootScope.bidForm.value.reviewer = reviewerIds;
    }

    if (!_.isEmpty(rootScope.bidForm.value.coOwner)) {
      rootScope.bidForm.value.coOwnerObj = {};
      var coOwnerId = "";
      var found = _.find(rootScope.coOwnerList, function (m) {
        return m.username == rootScope.bidForm.value.coOwner;
      });
      if (!_.isEmpty(found)) {
        coOwnerId = found.user_id;
        var subtype = found.username.split('-');
        rootScope.bidForm.value.coOwnerObj = {
          subtype: subtype[1].trim(),
          user_id: found.user_id
        };
      }
      rootScope.bidForm.value.coOwner = coOwnerId;
    }

    if (!_.isEmpty(rootScope.bidForm.value.contributor)) {
      rootScope.bidForm.value.contributorObjArray = [];
      var contributorIds = [];
      _.each(rootScope.bidForm.value.contributor, function (n) {
        var found = _.find(rootScope.con, function (m) {
          return m.username == n;
        });

        if (!_.isEmpty(found)) {
          contributorIds.push(found.user_id);
          var subtype = found.username.split('-');
          rootScope.bidForm.value.contributorObjArray.push({
            subtype: subtype[1].trim(),
            user_id: found.user_id
          });
        }
      });
      rootScope.bidForm.value.contributor = contributorIds;
    }
    if (!this.validLegalContributor(contributorIds)) {
      this.alert.sweetError("Please select Legal Contributor")
      return;
    }
    this.loader = true;

    rootScope.bidForm.value.extraSheets = ["document", "pricing"];

    rootScope._bidService.createBid(rootScope.bidForm.value).subscribe(data => {
      let bidID = data['data'].bid.bid_info.bid_id;
      this.loader = false;
      rootScope.createDiscussionBoard(bidID);
      rootScope.alert.sweetSuccess("Bid created successfully");
      rootScope._bidService.refreshContent(rootScope.refreshObj).subscribe(resp => {
      }, cancel => {
      });
      setTimeout(() => {
        this.loader = false
        this.router.navigateByUrl('/projectscope/' + bidID)
      }, 2000);
    }, error => {
      //rootScope._chatService.bidCreated({ company_id: rootScope.user.company_id, data: rootScope.bidForm.value });
      this.loader = false;
      rootScope.alert.sweetError(error.error.msg);
      rootScope.participants = [];
      rootScope.formSubmitted = false;
    })
  }

  // create discussion board after new bid creation
  createDiscussionBoard(bidID) {
    let obj = {
      bid_id: bidID,
      type: "Group",
      status: "ACTIVE",
      comments: []
    };
    rootScope._bidService.createDiscussionBoard(obj).subscribe(suceess => {
      // console.log("discussion board has been created")
    }, error => {
      // console.log("discussion board failed to")
      return;
    });
  }

  updateContributorReviewers() {
    this.bid.contributor = [];
    this.bid.reviewer = [];
    this.bid.contributorTypes.forEach(element => {
      this.con.forEach(item => {
        if (element == item.username) {
          this.bid.contributor.push(item.user_id)
        }

      });

    });

    this.bid.reviewerTypes.forEach(element => {
      this.rev.forEach(item => {
        if (element == item.username) {
          this.bid.reviewer.push(item.user_id)
        }
      });
    });
    // console.log(">>>", this.bid.contributor, this.bid.reviewer)
  }

  // BM want to re-assign the task to other contributor , if the contributor task is pending

  reviewerAdd;
  deleteReviewer(event) {
    let ReviewerUserName = event.value.username;
    let ReviewerUserId = [];
    let ReviewersDataFlag = [];
    this.rev.forEach(result => {
      if (ReviewerUserName.toLowerCase() == result.username.toLowerCase()) {
        ReviewerUserId.push(result.user_id)
        // ReviewersDataFlag.push(result.reviewersDataFlag)
      }
    }) 
    let obj = {
      "bid_id": this.bid_id,
      "reviewers": ReviewerUserId,
      "reviewersDataFlag": ReviewersDataFlag
    }
    this._bidService.getPendingTask(obj).subscribe(result => {
      result = result['data'];
      if (!result) {
        this.loader = false;
        return;
      }
      let data = result[0];
      if (!data || !data.pendingTasks || !data.pendingTasks.count) {
        this.loader = false;
        if (rootScope.bid_id) {
          this.alert.sweetSuccess("Reviewer has been removed sucessfully. Please update the bid")
        }
        return;
      }
      let owner = rootScope.participants.find(x => x.user_id == rootScope.user.user_id);
      data.user_type = owner.userTypes[0].user_type;
      data.user_subtype = owner.userTypes[0].user_subtype;
      data.bid_id = this.bid_id;
      data["ReviewerUserName"] = ReviewerUserName;
      // data["ReviewersDataFlag"] = ReviewersDataFlag
      const dialogRef = this.dialog.open(DeleteReviewerComponent, {
        height: '360px',
        width: '725px',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        // console.log("Hello Result 1631", result)
        if (result == 'NoData') {
          rootScope.getBidById();
          this.loader = false;
          return
        }
        if (!result || result.length == 0) {
          this.loader = false;
          return
        }
        // this.getBidById();
        result.submitData.forEach(found => {
          let pendingTask = found.pendingTasks;
          pendingTask.forEach(list => {
            this.rev.forEach(item => {
              if (list.reviewer_id == item.user_id && list.user_subtype == item.user_subtype) {
                this.bid.reviewer.push(item.user_id);
                this.bid.reviewerTypes.push(item.username);
              }
            });
          })
        })
        this.bid.reviewer = _.uniq(this.bid.reviewer);
        this.bid.reviewerTypes = _.uniq(this.bid.reviewerTypes);
        this.reassignUpdateBid();
      }, error => {
        this.loader = false;
      });
    }, error => {

    })
  }

  userDelete(event) {
    let contributorUserName = event.value.username;
    let contributorUserId = [];
    this.con.forEach(result => {
      if (contributorUserName.toLowerCase() == result.username.toLowerCase()) {
        contributorUserId.push(result.user_id)
      }
    })
    let obj = {
      "bid_id": this.bid_id,
      "contributors": contributorUserId
    }
    this._bidService.getPendingTask(obj).subscribe(result => {
      result = result['data'];
      if (!result) {
        return;
      }
      let data = result[0];
      if (!data || !data.pendingTasks || !data.pendingTasks.count) {
        this.loader = false;
        if (rootScope.bid_id) {
          this.alert.sweetSuccess("Contributor has been removed sucessfully. Please update the bid")
        }
        return
      }
      let owner = rootScope.participants.find(x => x.user_id == rootScope.user.user_id);
      data.user_type = owner.userTypes[0].user_type;
      data.user_subtype = owner.userTypes[0].user_subtype;
      data.bid_id = this.bid_id;
      data["contributorUserName"] = contributorUserName
      const dialogRef = this.dialog.open(DeleteuserComponent, {
        height: '382px',
        width: '820px',
        data: data
      })
      dialogRef.afterClosed().subscribe(result => {
        // console.log("Hello Result 1631", result)
        if (result == 'NoData') {
          rootScope.getBidById();
          this.loader = false;
          return
        }
        if (!result || result.length == 0) {
          this.loader = false;
          return
        }
        // this.getBidById(); 
        result.submitData.forEach(found => {
          let pendingTask = found.pendingTasks;
          pendingTask.forEach(list => {
            this.con.forEach(item => {
              if (list.contributor == item.user_id && list.user_subtype == item.user_subtype) {
                this.bid.contributor.push(item.user_id);
                this.bid.contributorTypes.push(item.username);
              }
            });
          })
        })
        this.bid.contributor = _.uniq(this.bid.contributor);
        this.bid.contributorTypes = _.uniq(this.bid.contributorTypes);
        this.reassignUpdateBid();
      }, error => {

      })
    })
  }

  CoOwnerUsername;
  coOwnerReassignId = []
  reAssignCoowner(item) {
    // console.log("Hello Coowner", item)
    let reassignCoowner = item;
    reassignCoowner.participants.filter(element => {
      if (element.userTypes[0].coOwner == true) {
        this.CoOwnerUsername = element.username;
        this.coOwnerReassignId.push(element.user_id);
        // console.log("Hello Data", this.username)
      }
    })
    let obj = {
      "bid_id": this.bid_id,
      "contributors": this.coOwnerReassignId
    }
    this._bidService.getPendingTask(obj).subscribe(result => {
      result = result['data'];
      if (!result) {
        return;
      }
      let data = result[0];
      if (!data || !data.pendingTasks || !data.pendingTasks.count) {
        this.loader = false;
        if (rootScope.bid_id) {
          this.alert.sweetSuccess("Co-Owner has been removed sucessfully. Please update the bid")
        }
        return
      }
      let owner = rootScope.participants.find(x => x.user_id == rootScope.user.user_id);
      data.user_type = owner.userTypes[0].user_type;
      data.user_subtype = owner.userTypes[0].user_subtype;
      data.bid_id = this.bid_id;
      data["coOwnerUserName"] = this.CoOwnerUsername
      const dialogRef = this.dialog.open(ReassignCownerCreateBidComponent, {
        height: '382px',
        width: '820px',
        data: data
      })
      dialogRef.afterClosed().subscribe(result => {
        // console.log("Hello Result 1631", result)
        if (result == 'NoData') {
          rootScope.getBidById();
          this.loader = false;
          return
        }
        if (!result || result.length == 0) {
          this.loader = false;
          return
        }
        // this.getBidById();
        result.submitData.forEach(found => {
          let pendingTask = found.pendingTasks;
          pendingTask.forEach(list => {
            this.cw.forEach(item => {
              if (list.contributor == item.user_id) {
                this.bid.coOwner = item.user_id;
                this.bid.coOwnerTypes = item.username;
              }
            });
          })
        })
        this.reassignUpdateBid();
      }, error => {
        this.loader = false;
      });
    }, error => {

    })
  }

  bidManagerName(){
    this.bid.participants.forEach(result => {
      if (result.user_id == this.bid.user_id && result.userTypes[0].user_type == "BID_OWNER" && result.userTypes[0].user_subtype == "Sales")
        this.salesManagerName = result.username + " - " + result.userTypes[0].user_subtype;
    })
  }

  deleteBidManager() {
    let obj = {
      "bid_id": this.bid_id,
      "BidManagerId": this.bid.user_id,
      "bidManagerName": this.salesManagerName
    }
    const dialogRef = this.dialog.open(DeleteSalesManagerComponent, {
      height: '310px',
      width: '725px',
      data: obj
    })
    dialogRef.afterClosed().subscribe(result => {
      // console.log("Hello Result 1631", result)
      if (result == 'NoData') {
        rootScope.getBidById();
        this.loader = false;
        return
      }
      rootScope.getBidById();
      this.reassignUpdateBid();
    }, error => {

    })
  }

  // update bid
  updateBid() {
    if (String(rootScope.bid.estimatedValue).match(/[a-zA-Z!@#$%^&*_?\\d]/g)) {
      rootScope.alert.sweetError("Invalid estimated deal value");
      return;
    }
    if (rootScope.bid.date_received == null) {
      rootScope.bid.date_received = "";
    }
    rootScope.formSubmitted = true;
    if (!rootScope.validateRegex('estimatedValue')) {
      rootScope.alert.sweetError("Please enter mandatory fields");
      return;
    }
    if (!rootScope.validate()) {
      rootScope.alert.sweetError("Please enter mandatory fields");
      return;
    }
    if (rootScope.bid.category == "" || rootScope.bid.category == null) {
      rootScope.alert.sweetError("Please enter mandatory fields")
      return;
    }
    if (rootScope.validateAccountName()) {
      rootScope.accountNameFlag = true;
      rootScope.alert.sweetError("Account name does not exist. Please create new account name");
      return false;
    }
    this.updateContributorReviewers();
    this.checkReviewers();
    if ((this.salesReviewer || this.deliveryReviewer || this.allReviewer) && !this.pricingReviewer) {
      rootScope.alert.sweetError("Please select Pricing or Finance Reviewer");
      return;
    } else if (!this.pricingReviewer) {
      rootScope.alert.sweetError("Please select Pricing or Finance Reviewer");
      return;
    }
    if (this.salesReviewer || this.deliveryReviewer || this.allReviewer) {
    } else {
      rootScope.alert.sweetError("Please select Delivery Reviewer");
      return;
    }
    if (!(!this.reviewFlag || !this.solutionReviewFlag || !this.proposalReviewFlag || this.pocSubmited) && !this.legalReviewer) {
      rootScope.alert.sweetError("Please select Legal Reviewer");
      return;
    }
    /*  else if (!this.solutionReviewer) {
      rootScope.alert.sweetError("Please select Solution and Proposal Reviewer");
      return;
    } else if (!this.proposalReviewer) {
      rootScope.alert.sweetError("Please select Proposal Reviewer");
      return;
    } */

    rootScope.onApprovalChainSelect().then(() => {
      rootScope.bidForm.value.tags = rootScope.bid.tags;
      rootScope.bidForm.value.user_id = rootScope.user.user_id;
      rootScope.bidForm.value.company_id = rootScope.user.company_id;
      rootScope.bidForm.value.user_role = rootScope.user.user_role;
      rootScope.bidForm.value.bid_id = rootScope.bid_id;
      rootScope.bidForm.value.comments = rootScope.bid.comments;
      rootScope.bidForm.value.revision_id = "1"
      rootScope.bidForm.value.status = "ACTIVE";
      rootScope.bidForm.value.attachment_data = rootScope.bid.attachment_data;
      rootScope.bidForm.value.contributorTypes = rootScope.bid.contributorTypes;
      rootScope.bidForm.value.reviewerTypes = rootScope.bid.reviewerTypes;
      rootScope.bidForm.value.coOwnerTypes = rootScope.bid.coOwnerTypes;
      rootScope.bidForm.value.account_id = rootScope.bid.account_id;
      rootScope.bidForm.value.contributor = rootScope.bid.contributorTypes;
      rootScope.bidForm.value.reviewer = rootScope.bid.reviewerTypes;
      rootScope.bidForm.value.coOwner = rootScope.bid.coOwnerTypes;
      rootScope.bidForm.value.approval_chain = rootScope.bid.approval_chain;
      rootScope.bidForm.value.estimatedValue = rootScope.bid.estimatedValue;

      if (rootScope.bidForm.value.reviewer == undefined) {
        rootScope.bidForm.value.contributor = rootScope.bid.contributorTypes;
        rootScope.bidForm.value.reviewer = rootScope.bid.reviewerTypes;
        rootScope.bidForm.value.coOwner = rootScope.bid.coOwnerTypes;
        rootScope.bidForm.value.approval_chain = rootScope.bid.approval_chain;
        rootScope.bidForm.value.estimatedValue = rootScope.bid.estimatedValue;
      }

      if (!_.isEmpty(rootScope.bidForm.value.reviewer)) {
        rootScope.bidForm.value.reviewerObjArray = [];
        var reviewerIds = [];
        _.each(rootScope.bidForm.value.reviewer, function (n) {
          var found = _.find(rootScope.rev, function (m) {
            return m.username == n;
          });

          if (!_.isEmpty(found)) {
            reviewerIds.push(found.user_id);
            var subtype = found.username.split('-');
            rootScope.bidForm.value.reviewerObjArray.push({
              subtype: subtype[1].trim(),
              user_id: found.user_id
            });
          }
        });
        rootScope.bidForm.value.reviewer = reviewerIds;
      }

      if (!_.isEmpty(rootScope.bidForm.value.coOwner)) {
        rootScope.bidForm.value.coOwnerObj = {};
        var coOwnerId = "";
        var found = _.find(rootScope.cw, function (m) {
          return m.username == rootScope.bidForm.value.coOwner;
        });
        if (!_.isEmpty(found)) {
          coOwnerId = found.user_id;
          var subtype = found.username.split('-');
          rootScope.bidForm.value.coOwnerObj = {
            subtype: subtype[1].trim(),
            user_id: found.user_id
          };
        }
        rootScope.bidForm.value.coOwner = coOwnerId;
      }

      if (!_.isEmpty(rootScope.bidForm.value.contributor)) {
        rootScope.bidForm.value.contributorObjArray = [];
        var contributorIds = [];
        _.each(rootScope.bidForm.value.contributor, function (n) {
          var found = _.find(rootScope.con, function (m) {
            return m.username == n;
          });

          if (!_.isEmpty(found)) {
            contributorIds.push(found.user_id);
            var subtype = found.username.split('-');
            rootScope.bidForm.value.contributorObjArray.push({
              subtype: subtype[1].trim(),
              user_id: found.user_id
            });
          }
        });
        rootScope.bidForm.value.contributor = contributorIds;
      }
      if (!this.validLegalContributor(contributorIds) && this.reviewFlag && this.solutionReviewFlag && this.proposalReviewFlag && !this.pocSubmited) {
        this.alert.sweetError("Please select Legal Contributor")
        return;
      }
      this.loader = true;
      rootScope._bidService.updateBid(rootScope.bidForm.value).subscribe(data => {
        this.loader = false;
        //rootScope._chatService.bidCreated({ company_id: rootScope.user.company_id, data: rootScope.bidForm.value });
        rootScope.alert.sweetSuccess("Bid updated successfully");
        rootScope._bidService.refreshContent(rootScope.refreshObj).subscribe(resp => {
        }, cancel => {
        });
        setTimeout(() => {
          rootScope.router.navigate(['/dashboard'])
        }, 2000);
      }, error => {
        this.loader = false;
        //rootScope._chatService.bidCreated({ company_id: rootScope.user.company_id, data: rootScope.bidForm.value });
        rootScope.alert.sweetError(error.error.msg);
        rootScope.formSubmitted = false;
      })
    }).catch(() => {
    });
  }


  // reassignUpdateBid bid
  reassignUpdateBid() {
    this.updateContributorReviewers();
    this.checkReviewers();

    rootScope.onApprovalChainSelect().then(() => {
      rootScope.bidForm.value.tags = rootScope.bid.tags;
      rootScope.bidForm.value.user_id = rootScope.user.user_id;
      rootScope.bidForm.value.company_id = rootScope.user.company_id;
      rootScope.bidForm.value.user_role = rootScope.user.user_role;
      rootScope.bidForm.value.bid_id = rootScope.bid_id;
      rootScope.bidForm.value.comments = rootScope.bid.comments;
      rootScope.bidForm.value.revision_id = "1"
      rootScope.bidForm.value.status = "ACTIVE";
      rootScope.bidForm.value.attachment_data = rootScope.bid.attachment_data;
      rootScope.bidForm.value.contributorTypes = rootScope.bid.contributorTypes;
      rootScope.bidForm.value.reviewerTypes = rootScope.bid.reviewerTypes;
      rootScope.bidForm.value.coOwnerTypes = rootScope.bid.coOwnerTypes;
      rootScope.bidForm.value.account_id = rootScope.bid.account_id;
      rootScope.bidForm.value.approval_chain = rootScope.bid.approval_chain;
      rootScope.bidForm.value.reviewer = rootScope.bid.reviewerTypes;
      rootScope.bidForm.value.coOwner = rootScope.bid.coOwnerTypes;
      rootScope.bidForm.value.contributor = rootScope.bid.contributorTypes;
      rootScope.bidForm.value.approval_chain = rootScope.bid.approval_chain;
      rootScope.bidForm.value.estimatedValue = rootScope.bid.estimatedValue;

      if (rootScope.bidForm.value.reviewer == undefined) {
        rootScope.bidForm.value.contributor = rootScope.bid.contributorTypes;
        rootScope.bidForm.value.reviewer = rootScope.bid.reviewerTypes;
        rootScope.bidForm.value.coOwner = rootScope.bid.coOwnerTypes;
        rootScope.bidForm.value.approval_chain = rootScope.bid.approval_chain;
        rootScope.bidForm.value.estimatedValue = rootScope.bid.estimatedValue;
      }

      if (!_.isEmpty(rootScope.bidForm.value.reviewer)) {
        rootScope.bidForm.value.reviewerObjArray = [];
        var reviewerIds = [];
        _.each(rootScope.bidForm.value.reviewer, function (n) {
          var found = _.find(rootScope.rev, function (m) {
            return m.username == n;
          });

          if (!_.isEmpty(found)) {
            reviewerIds.push(found.user_id);
            var subtype = found.username.split('-');
            rootScope.bidForm.value.reviewerObjArray.push({
              subtype: subtype[1].trim(),
              user_id: found.user_id
            });
          }
        });
        rootScope.bidForm.value.reviewer = reviewerIds;
      }

      if (!_.isEmpty(rootScope.bidForm.value.coOwner)) {
        rootScope.bidForm.value.coOwnerObj = {};
        var coOwnerId = "";
        var found = _.find(rootScope.cw, function (m) {
          return m.username == rootScope.bidForm.value.coOwner;
        });
        if (!_.isEmpty(found)) {
          coOwnerId = found.user_id;
          var subtype = found.username.split('-');
          rootScope.bidForm.value.coOwnerObj = {
            subtype: subtype[1].trim(),
            user_id: found.user_id
          };
        }
        rootScope.bidForm.value.coOwner = coOwnerId;
      }

      if (!_.isEmpty(rootScope.bidForm.value.contributor)) {
        rootScope.bidForm.value.contributorObjArray = [];
        var contributorIds = [];
        _.each(rootScope.bidForm.value.contributor, function (n) {
          var found = _.find(rootScope.con, function (m) {
            return m.username == n;
          });

          if (!_.isEmpty(found)) {
            contributorIds.push(found.user_id);
            var subtype = found.username.split('-');
            rootScope.bidForm.value.contributorObjArray.push({
              subtype: subtype[1].trim(),
              user_id: found.user_id
            });
          }
        });
        rootScope.bidForm.value.contributor = contributorIds;
      }
      this.loader = true;
      rootScope._bidService.updateBid(rootScope.bidForm.value).subscribe(data => {
        this.loader = false;
        rootScope._bidService.refreshContent(rootScope.refreshObj).subscribe(resp => {
        }, cancel => {
          this.loader = false;
        });
        this.loader = false;
      }, error => {
        this.loader = false;
        rootScope.formSubmitted = false;
      })
    }).catch(() => {
    });
  }

  // on selection of approval chain, add approvers to participants array
  onApprovalChainSelect() {
    return new Promise((resolve, reject) => {
      rootScope._approvalChainService.getApprovalChain({ ac_id: rootScope.bid.approval_chain }).subscribe(data => {
        if (data['data'] == null) {
          return;
        }

        if (data && data['data'] && data['data']['approval_chains'].length) {
          // rootScope.participants = [];
          rootScope.approvalChain = data['data']['approval_chains'][0];
          rootScope.approvalChain.users.forEach(item => {
            if (rootScope.participants.findIndex(a => a.user_id == item.user_id) == -1) {
              rootScope.participants.push(item);
            }
          });
          resolve(true)
          // console.log(rootScope.bid.approval_chain)
        }
        if (rootScope.bid['approval_chain'] == null) {
          rootScope.bid['approval_chain'] = [];
        }
      });
    });
  }

  // on Hover getting the name of Approval chain participation list
  hoverName = []
  onHoverTitle(name) {
    if (rootScope.approvalChains) {
      this.hoverName = [];
      let ac = rootScope.approvalChains.filter(a => {
        return a.name == name;
      });
      ac[0].users.forEach(item => {
        this.hoverName.push(" " + item.level + " - " + item.fullname + " ")
      })
    }
    return this.hoverName;
  }

  changeBoolean(index) {
    this[index] = !this[index];
  }

  // reset bid data
  reset() {
    rootScope.bid = new Bid();
    rootScope.selectedBUs = [];
    rootScope.selectedTerritories = [];
    rootScope.selectedContributor = [];
    rootScope.selectedReview = [];
    rootScope.selectedApproval = [];
  }

}
