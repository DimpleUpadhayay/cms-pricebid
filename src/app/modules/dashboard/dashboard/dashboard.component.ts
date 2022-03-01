import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';


import { BidService } from '../../../services/bid.service';
import { PocDashboardService } from '../../../services/poc.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { SharedService } from '../../../services/shared.service';
import { LoginService } from '../../../services/login.service';
import { HttpService } from '../../../services/http.service';

import _ = require('lodash');
import { UsersService } from '../../../services/users.service';
import { DropbidComponent } from '../dropbid/dropbid.component';
import { MatDialog } from '@angular/material';
import { BidTimelineReportComponent } from '../../bid-development/bid-timeline-report/bid-timeline-report.component';
declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [BidService, PocDashboardService, UsersService]

})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) alert: AlertComponent;

  public bids = undefined;
  public businessUnits;
  public territoryData;
  condition;
  approved = false;
  approvedStatus;
  rejected;
  user;
  showList = false;
  module;
  value = new Date().getMonth();
  flags = {}
  // approvalChain;
  poc;
  user_type;
  user_subtype;
  showGreen = false;
  showOrange = false;
  year = new Date().getFullYear();
  years = [this.year + 1];
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  process = [];
  bidName = '';
  p = 1;
  request;
  bidsPerMonth;
  noBid = false;
  searchFlag = false;
  revisedBids = [];
  id;
  mySubscription;
  userNewData = {
    confirmPassword: '',
    newPassword: '',
    currentPassword: ''
  };
  access;
  role;
  accessBtn;
  message;
  userFormSubmitted;
  dateTimeRange = [null, null];
  selectedBUs = [];
  selectedTerritories = [];
  start; end;
  multiflagTerritory = "All";
  multiflagBu = "All";
  bussiness_unit = [];
  territory = [];
  dropdownBUSettings: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; allowSearchFilter: boolean; itemsShowLimit: number; };
  dropdownTerritorySettings: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; allowSearchFilter: boolean; itemsShowLimit: number; };
  bu_ids: any[];
  territory_ids: any[];
  loader = false;
  bidStatus = ""
  showData;
  staging;
  productType;

  constructor(private _bidService: BidService,
    private _router: Router,
    public dialog: MatDialog,
    public _sharedService: SharedService,
    public _loginService: LoginService,
    public _pocService: PocDashboardService, private _httpService: HttpService,
    public _UsersService: UsersService
  ) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];

    this.productType = this.user.product_type ? this.user.product_type : 'pricing';
    if (this.productType === 'pricing') {
      this.flags = {
        "SOLUTION": true,
        "NEW_PROPOSAL": true,
        "SPREADSHEET": true,
        "DOCREQUIRED": true,
        "SOLUTION_REVIEW": true,
        "DOCUMENTEDITOR": true,
        "SPREADSHEET_REVIEW": true
      }
    }

    if (this.productType !== 'pricing') {
      this.flags = {
        "SOLUTION": true,
        "PROPOSAL": true,
        "PRICING": true,
        "DOCREQUIRED": true,
        "LEGAL": true,
        "PRE-PRICING": true,
        "SOLUTION_REVIEW": true,
        "PROPOSAL_REVIEW": true,
        "PRICING_REVIEW": true,
        "PRE-PRICING_REVIEW": true,
      }
    }
    if (this.user && this.user.role_module_mapping && this.user.role_module_mapping.length) {
      this.module = this.user.role_module_mapping.find(a => a.module_name.replace(/ /g, '_').toLowerCase() == 'bid_creation');
    }

    this.dropdownBUSettings = {
      singleSelection: false,
      idField: 'bu_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 0,
    }

    this.dropdownTerritorySettings = {
      singleSelection: false,
      idField: 'territory_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 0
    };

    // On navigation bar Search bid on the dashboard
    _sharedService.changePassword.subscribe(a => {
      $("#changePassword").modal("show");
    })
    _sharedService.searchUpdated.subscribe(
      (data) => {
        this.bidName = data.search;

        if (this.bidName == "") {
          this.request = {
            "pageNo": 1,
            "month": this.value + 1,
            "year": this.year
          }
          this.searchFlag = false;
          this.getBids(this.request);
          this.onClear()
          // this._router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
          //   this._router.navigateByUrl('/dashboard'));
        } else {
          this.getSearchedBids({ pageNo: 1 });
        }
      }
    );

    this._httpService.accessControl({
      "module": "dashboard",
      "user_id": this.user.user_id
    }).subscribe(response => {
      this.access = response['data'];
      if (this.access && this.access.userTypes && this.access.userTypes[0]) {
        this.user_type = this.access.userTypes[0].user_type;
        this.user_subtype = this.access.userTypes[0].user_subtype;
      }// console.log(this.access);
    }, error => {
      this.loader = false;
    });
    this.showData = JSON.parse(localStorage.getItem('lastBidObj'))
    this.request = {
      "pageNo": 1,
      "month": this.value + 1,
      "year": +this.year
    }
    if (this.showData) {
      this.value = this.showData.value;
      this.request = {
        "pageNo": this.showData.pageNo,
        "month": this.showData.month,
        "year": this.showData.year,
      }
      // this.onMonthYearChange();
    }
    // console.log(">>>>>>>123", this.request)
    for (let i = 0; i < 3; i++) {
      this.years.push(this.year - i);
    }
    this.getBids(this.request);
    // localStorage.removeItem("lastBidObj");
    delete this.showData;
    this.getUserById()
  }

  ngOnInit() {

    this.loader = true;
    this._sharedService.bidSearch.emit({ disable: true });
    // this._header.hideSearch();
    this.mySubscription = this._sharedService.newData.subscribe(a => {
      console.log("onscreenload", a)
      if (a.data == 'bid_creation' || a.data == "approval") {
        let req = {
          "pageNo": 1,
          "month": this.value + 1,
          "year": this.year
        }
        this.getBidsRefresh(req);
      }
    });

  }

  userRoleBasedButtonAccessControl(bid_id) {
    this._httpService.userRoleBasedButtonAccessControl({
      "module": "dashboard",
      "user_id": this.user.user_id,
      "bid_id": bid_id
    }).subscribe(response => {
      this.accessBtn = response['data'];
    }, error => {
      this.loader = false;
    });
  }

  ngOnDestroy() {
    this.dialog.closeAll();
    this.mySubscription.unsubscribe();
    this._sharedService.bidSearch.emit({ disable: false });
  }

  // search bid results
  getSearchedBids(req) {
    this.p = req.pageNo;
    this.loader = true;
    var obj = {
      "bid_name": this.bidName,
      "status": 'ACTIVE',
      "user_id": this.user.user_id,
      "pageNo": req.pageNo,
      "size": 8,
      "company_id": this.user.company_id,
      user_type: undefined,
      "start_value": parseFloat(this.start) ? parseFloat(this.start) : undefined,
      "end_value": parseFloat(this.end) ? parseFloat(this.end) : undefined,
      "territory_ids": this.territory_ids ? this.territory_ids : undefined,
      "bu_ids": this.bu_ids ? this.bu_ids : undefined,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : '',
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : '',
      "multiflagTerritory": this.multiflagTerritory ? this.multiflagTerritory : undefined,
      "multiflagBu": this.multiflagBu ? this.multiflagBu : undefined,

    }
    console.log("im innnnnnnn")
    if (this.user && this.user.userTypes) {
      var isViewer = false;
      var isSofViewer = false;
      var isSofProductViewer = false;
      var isfinanceController = false;
      var isbgwriter = false;
      var isaccountsExeTreasury = false;
      var isEMDPBGViewer = false;

      _.each(this.user.userTypes, function (n) {
        if (n.user_type == "VIEWER") {
          isViewer = true;
          return false;
        };
        if (n.user_type == "SOF_VIEWER") {
          isSofViewer = true;
          return false;
        };
        if (n.user_type == "SOF_PRODUCT_VIEWER") {
          isSofProductViewer = true;
          return false;
        };
        if (n.user_type == "BG_WRITER") {
          isbgwriter = true;
          return false;
        };
        if (n.user_type == "FINANCE_CONTROLLER") {
          isfinanceController = true;
          return false;
        };
        if (n.user_type == "ACCOUNTS_EXE_TREASURY") {
          isaccountsExeTreasury = true;
          return false;
        }
        if (n.user_type == "EMD_PBG_VIEWER") {
          isEMDPBGViewer = true;
          return false;
        }
      });
      if (isViewer) {
        obj.user_type = "VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofViewer) {
        obj.user_type = "SOF_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isbgwriter) {
        obj.user_type = "BG_WRITER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isfinanceController) {
        obj.user_type = "FINANCE_CONTROLLER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofProductViewer) {
        obj.user_type = "SOF_PRODUCT_VIEWER";
        obj.bu_ids = this.user.bu_ids,
        obj.territory_ids = this.user.territory_ids
      }
      if (isaccountsExeTreasury) {
        obj.user_type = "ACCOUNTS_EXE_TREASURY";
        obj.bu_ids = this.user.bu_ids,
        obj.territory_ids = this.user.territory_ids
      }
      if (isEMDPBGViewer) {
        obj.user_type = "EMD_PBG_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
    }

    this._bidService.getBidData(obj).subscribe(success => {
      this.searchFlag = true;
      this.bids = [];
      this.bids = success['data'].bid;
      this.noBid = this.bids.length == 0 ? true : false;
      this.bidsPerMonth = success['data'].bid_page_count.bidsPerMonth;
      this.bids.forEach(element => {
        if (element.bid_stage) {
          this.staging = ""
          element.bid_stage.stage_add.forEach(result => {
            this.staging += result.no + " - " + result.name.replace("Pre-Pricing", "Delivery") + " - " + result.progress + "\n";
          });
          element['staging'] = this.staging;
          // console.log("revisedbids483", this.staging)
        }
      });
      if (this.bids && this.bids.length == 0) {
        this.loader = false;
        return
      }
      this.bids.forEach(element => {
        if (element.approval_chain) {
          element.totalApprovers = element.participants.filter(a => {
            return a.level;
          });
        }
        if (element.bid_revision_id) {
          this.viewBidForSearch(element.bid_revision_id, element.revision_status, element, this.request, obj)
        }
        if (element.participants) {
          element.nonApprovers = element.participants.filter(a => {
            a.class = a.userTypes && a.userTypes[0].user_type === 'BID_OWNER'
              ? 'text-truncate second1-circle-color circleThree bidManager'
              : 'text-truncate second1-circle-color circleThree nobidManager';
            return a.userTypes && a.level == undefined;
          });

          this.setSignals(element)
        }
        //this.getPoc(element, element.bid_id);
        if (element.poc_docs.length != 0) {
          element.disableDelete = true;
          this.checkStatus(element);
        }
      });
      this.loader = false;
    }, error => {
      this.bids = [];
      this.loader = false;
      this.noBid = true;
    });
  }

  cloneData = {
    name: '',
    bid_number: ''
  };
  cloneObj = {}
  submitCloneData = false;
  clone(item) {
    this.cloneObj = this.bids.find(a => a.bid_id == item.bid_id);
    this.alert.clone("Welcome").then(a => {
      $("#cloneBid").modal('show');
    }, error => {
      return;
    });
  }

  setCloneData(cloneData) {
    this.submitCloneData = true;
    var uniqueIndex;
    let req = {
      "pageNo": 1,
      "month": this.value + 1,
      "year": this.year
    }
    // || !cloneData.bid_number
    if (!cloneData.name) {
      this.alert.sweetError("Plese fill empty fields");
      return;
    }
    if (this.cloneObj['name'] === cloneData.name) {
      this.alert.sweetError("Bid name cannot be empty ");
      return;
    }
    // if (this.cloneObj['bid_number'] === cloneData.bid_number) {
    //   this.alert.sweetError("Bid number cannot be empty");
    //   return;
    // }
    uniqueIndex = this.bids.findIndex(a => a.name == cloneData.name);
    if (uniqueIndex != -1) {
      this.alert.sweetError("Bid name cannot be same");
      return
    }

    // uniqueIndex = this.bids.findIndex(a => a.bid_number == cloneData.bid_number);
    // if (uniqueIndex != -1) {
    //   this.alert.sweetError("Bid number cannot be same");
    //   return
    // }
    this.cloneObj['name'] = cloneData.name;
    // this.cloneObj['bid_number'] = cloneData.bid_number;
    this._bidService.clone(this.cloneObj).subscribe(data => {
      $("#cloneBid").modal('hide');
      let refreshObj = {
        company_id: this.user.company_id,
        // bid_id: this.bid_id,
        module: "BID_CLONE",
        sub_module: "",
      };
      this._bidService.refreshContent(refreshObj).subscribe(resp => {
      }, cancel => {
      });
      this.getBids(req);
    });
  }

  refresh() {
    this._router.navigate(["/dashboard?success=true"]);
  }

  cancelClone() {
    this.cloneData = {
      name: '',
      bid_number: ''
    };
    // this.alert.sweetError("Bid cloning is cancel!")
  }
  // DropBid Api  Starts Here


  // BM can drop the bid with the reason, if the BM want to revive the bid (if the bid is dropped ). Drop Bid API
  onDrop(item, type) {
    let req = {
      "pageNo": 1,
      "month": this.value + 1,
      "year": this.year
    }
    if (type == 'Live') {
      this.alert.customConfirmation("Revive Bid", "Do you want to Revive this Bid?").then(success => {
        let obj = {
          "bid_id": item.bid_id,
          "bidFinalStatus": "LIVE"
        }
        this._bidService.dropBid(obj).subscribe(res => {
          this.getBids(req);
        }, error => {

        })
      }).catch(cancel => {
        return false;
      });
    }
    else if (type == 'Drop') {
      // this.alert.customConfirmation("Drop Bid", "Do you want to Drop this Bid?").then(success => {
      let obj = {
        "bid_id": item.bid_id,
      }
      const dialogRef = this.dialog.open(DropbidComponent, {
        height: '310px',
        width: '450px',
        data: obj,
      });
      dialogRef.afterClosed().subscribe(result => {
        this.getBids(req);
      }, error => {
      })
    }
  }


  // for revised bids
  viewBid(id, status, element, request) {
    this.id = id;
    if (id) {
      var obj = {
        status: 'ACTIVE', user_id: this.user.user_id, "pageNo": 1,
        bid_revision_id: id,
        "size": 8,
        "month": request.month,
        "year": request.year,
        "company_id": this.user.company_id,
        user_type: undefined,
        bu_ids: undefined,
        territory_ids: undefined
      }


      if (this.user && this.user.userTypes) {
        var isViewer = false;
        var isSofViewer = false;
        var isSofProductViewer = false;
        var isfinanceController = false;
        var isbgwriter = false;
        var isaccountsExeTreasury = false;
        var isEMDPBGViewer = false;

        _.each(this.user.userTypes, function (n) {
          if (n.user_type == "VIEWER") {
            isViewer = true;
            return false;
          };
          if (n.user_type == "SOF_VIEWER") {
            isSofViewer = true;
            return false;
          };
          if (n.user_type == "SOF_PRODUCT_VIEWER") {
            isSofProductViewer = true;
            return false;
          };
          if (n.user_type == "BG_WRITER") {
            isbgwriter = true;
            return false;
          };
          if (n.user_type == "FINANCE_CONTROLLER") {
            isfinanceController = true;
            return false;
          };
          if (n.user_type == "ACCOUNTS_EXE_TREASURY") {
            isaccountsExeTreasury = true;
            return false;
          }
          if (n.user_type == "EMD_PBG_VIEWER") {
            isEMDPBGViewer = true;
            return false;
          }
        });
        if (isViewer) {
          obj.user_type = "VIEWER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isSofViewer) {
          obj.user_type = "SOF_VIEWER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isSofProductViewer) {
          obj.user_type = "SOF_PRODUCT_VIEWER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isbgwriter) {
          obj.user_type = "BG_WRITER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isfinanceController) {
          obj.user_type = "FINANCE_CONTROLLER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isaccountsExeTreasury) {
          obj.user_type = "ACCOUNTS_EXE_TREASURY";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isEMDPBGViewer) {
          obj.user_type = "EMD_PBG_VIEWER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
      }

      this._bidService.getBidData(obj).subscribe(bid => {
        this.revisedBids = bid['data'].bid;
        // this.bidsPerMonth = bid['data'].bid_page_count.bidsPerMonth;

        this.revisedBids.forEach(element => {
          if (element.bid_stage) {
            this.staging = ""
            element.bid_stage.stage_add.forEach(result => {
              this.staging += result.no + " - " + result.name.replace("Pre-Pricing", "Delivery") + " - " + result.progress + "\n";
            });
            element['staging'] = this.staging;
            // console.log("revisedbids483", this.staging)
          }
        });
        if (this.revisedBids && this.revisedBids.length == 0) {
          this.loader = false;
          return
        }
        element.revisedBids = this.revisedBids;
        // $("#viewRevisionBid").modal('show');
        var i = 1.5;
        var j = 1;
        element.revisedBids.forEach(item => {
          item.topPos = -9 * i;
          item.leftPos = 18 * i;
          item.z_index = -1 * j;
          i++;
          j++;
          if (item.approval_chain) {
            item.totalApprovers = item.participants.filter(a => {
              return a.level;
            });
          }
          item.nonApprovers = item.participants.filter(a => {
            return a.userTypes && a.level == undefined;
          });
          if (item.poc_docs.length != 0) {
            element.disableDelete = true;
            this.checkStatus(element);
          }
        });
      });
      return
    }
    // $("#viewRevisionBid").modal('hide');
    // this._router.navigate(['/bid-development', id]);
  }

  // for revised bids in search
  viewBidForSearch(id, status, element, request, filter_Value) {

    this.id = id;
    if (id) {
      var obj = {
        "bid_name": this.bidName ? this.bidName : undefined,
        status: 'ACTIVE', user_id: this.user.user_id, "pageNo": 1,
        bid_revision_id: id,
        "size": 8, /* "month": request.month, */
        // "year": request.year,
        "company_id": this.user.company_id,
        user_type: undefined,
        // bu_ids: undefined,
        // territory_ids: undefined,
        "start_value": filter_Value.start_value ? filter_Value.start_value : undefined,
        "end_value": filter_Value.end_value ? filter_Value.end_value : undefined,
        "territory_ids": filter_Value.territory_ids ? filter_Value.territory_ids : undefined,
        "bu_ids": filter_Value.bu_ids ? filter_Value.bu_ids : undefined,
        "report_flag": "FILTER",
        "start_date": filter_Value.start_date ? filter_Value.start_date : undefined,
        "end_date": filter_Value.end_date ? filter_Value.end_date : undefined,
        "multiflagTerritory": filter_Value.multiflagTerritory ? filter_Value.multiflagTerritory : undefined,
        "multiflagBu": filter_Value.multiflagBu ? filter_Value.multiflagBu : undefined,
      }


      if (this.user && this.user.userTypes) {
        var isViewer = false;
        var isSofViewer = false;
        var isSofProductViewer = false;
        var isfinanceController = false;
        var isbgwriter = false;
        var isaccountsExeTreasury = false;
        var isEMDPBGViewer = false;

        _.each(this.user.userTypes, function (n) {
          if (n.user_type == "VIEWER") {
            isViewer = true;
            return false;
          };
          if (n.user_type == "SOF_VIEWER") {
            isSofViewer = true;
            return false;
          };
          if (n.user_type == "SOF_PRODUCT_VIEWER") {
            isSofViewer = true;
            return false;
          };
          if (n.user_type == "BG_WRITER") {
            isbgwriter = true;
            return false;
          };
          if (n.user_type == "FINANCE_CONTROLLER") {
            isfinanceController = true;
            return false;
          };
          if (n.user_type == "ACCOUNTS_EXE_TREASURY") {
            isaccountsExeTreasury = true;
            return false;
          }
          if (n.user_type == "EMD_PBG_VIEWER") {
            isEMDPBGViewer = true;
            return false;
          }
        });
        if (isViewer) {
          obj.user_type = "VIEWER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isSofViewer) {
          obj.user_type = "SOF_VIEWER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isbgwriter) {
          obj.user_type = "BG_WRITER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isfinanceController) {
          obj.user_type = "FINANCE_CONTROLLER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isSofProductViewer) {
          obj.user_type = "SOF_PRODUCT_VIEWER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isaccountsExeTreasury) {
          obj.user_type = "ACCOUNTS_EXE_TREASURY";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
        if (isEMDPBGViewer) {
          obj.user_type = "EMD_PBG_VIEWER";
          obj.bu_ids = this.user.bu_ids,
            obj.territory_ids = this.user.territory_ids
        }
      }

      this._bidService.getBidData(obj).subscribe(bid => {
        this.revisedBids = bid['data'].bid;

        // this.bidsPerMonth = bid['data'].bid_page_count.bidsPerMonth;

        this.revisedBids.forEach(element => {
          if (element.bid_stage) {
            this.staging = ""
            element.bid_stage.stage_add.forEach(result => {
              this.staging += result.no + " - " + result.name.replace("Pre-Pricing", "Delivery") + " - " + result.progress + "\n";
            });
            element['staging'] = this.staging;
            // console.log("revisedbids483", this.staging)
          }
        });
        if (this.revisedBids && this.revisedBids.length == 0) {
          this.loader = false;
          return
        }

        element.revisedBids = this.revisedBids;

        // $("#viewRevisionBid").modal('show');
        var i = 1.5;
        var j = 1;
        element.revisedBids.forEach(item => {
          item.topPos = -9 * i;
          item.leftPos = 18 * i;
          item.z_index = -1 * j;
          i++;
          j++;
          if (item.approval_chain) {
            item.totalApprovers = item.participants.filter(a => {
              return a.level;
            });
          }
          item.nonApprovers = item.participants.filter(a => {
            return a.userTypes && a.level == undefined;
          });
          if (item.poc_docs.length != 0) {
            element.disableDelete = true;
            this.checkStatus(element);
          }
        });
      });
      return
    }
    // $("#viewRevisionBid").modal('hide');
    // this._router.navigate(['/bid-development', id]);
  }

  // open modules of revised bid in new window
  hideModal(state, id) {
    $("#viewRevisionBid").modal('hide');
    window.open(state + "/" + id);
  }

  // open modal to show their revised bids
  openOldVersion(id, bid_id) {
    var obj = {
      "bid_name": this.bidName ? this.bidName : undefined,
      "status": 'ACTIVE', user_id: this.user.user_id, "pageNo": 1,
      // "bid_id": bid_id,
      "bid_revision_id": id,
      "size": 8, "month": this.request.month,
      "year": this.request.year,
      "company_id": this.user.company_id,
      user_type: undefined,
      bu_ids: undefined,
      territory_ids: undefined
    }

    if (this.user && this.user.userTypes) {
      var isViewer = false;
      var isSofViewer = false;
      var isSofProductViewer = false;
      var isfinanceController = false;
      var isbgwriter = false;
      var isaccountsExeTreasury = false;
      var isEMDPBGViewer = false;

      _.each(this.user.userTypes, function (n) {
        if (n.user_type == "VIEWER") {
          isViewer = true;
          return false;
        };
        if (n.user_type == "SOF_VIEWER") {
          isSofViewer = true;
          return false;
        };
        if (n.user_type == "SOF_PRODUCT_VIEWER") {
          isSofViewer = true;
          return false;
        };
        if (n.user_type == "BG_WRITER") {
          isbgwriter = true;
          return false;
        };
        if (n.user_type == "FINANCE_CONTROLLER") {
          isfinanceController = true;
          return false;
        };
        if (n.user_type == "ACCOUNTS_EXE_TREASURY") {
          isaccountsExeTreasury = true;
          return false;
        }
        if (n.user_type == "EMD_PBG_VIEWER") {
          isEMDPBGViewer = true;
          return false;
        }
      });
      if (isViewer) {
        obj.user_type = "VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofViewer) {
        obj.user_type = "SOF_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isbgwriter) {
        obj.user_type = "BG_WRITER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isfinanceController) {
        obj.user_type = "FINANCE_CONTROLLER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isaccountsExeTreasury) {
        obj.user_type = "ACCOUNTS_EXE_TREASURY";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofProductViewer) {
        obj.user_type = "SOF_PRODUCT_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isEMDPBGViewer) {
        obj.user_type = "EMD_PBG_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }

    }

    this._bidService.getBidData(obj).subscribe(bid => {
      $("#viewRevisionBid").modal('show');

      this.revisedBids = bid['data']['bid'];
      // this.bidsPerMonth = bid['data'].bid_page_count.bidsPerMonth;
      this.revisedBids.forEach(element => {
        if (element.bid_stage) {
          this.staging = ""
          element.bid_stage.stage_add.forEach(result => {
            this.staging += result.no + " - " + result.name.replace("Pre-Pricing", "Delivery") + " - " + result.progress + "\n";
          });
          element['staging'] = this.staging;
          // console.log("revisedbids483", this.staging)
        }
      });
      if (this.revisedBids && this.revisedBids.length == 0) {
        this.loader = false;
        return
      }

      this.revisedBids.forEach(item => {
        if (item.approval_chain) {
          item.totalApprovers = item.participants.filter(a => {
            return a.level;
          });
        }
        item.nonApprovers = item.participants.filter(a => {
          return a.userTypes && a.level == undefined;
        });
        if (item.poc_docs.length != 0) {
          item.disableDelete = true;
          this.checkStatus(item);
        }
      });
    });
  }

  /* filterBids(value) {
    this.bidName = value;
  }
 
  getFirstValue(value) {
    return value.toString()[0];
  } */

  //display bid created date
  getBidCreatedMonth(value) {
    let month = new Date(value).getMonth();
    return this.monthNames[month];
  }

  // display submission date
  getSubmissionDate(value) {
    return new Date(value).getDate();
  }

  // display month name
  getSubmissionMonth(value) {
    let month = new Date(value).getMonth();
    return this.monthNames[month];
  }

  changeState(type, id) {
    if (this.access.viewApprovalDashboardAccess) {
      $("#viewRevisionBid").modal('hide');
      this._router.navigate(['/' + type, id]);
    }
  }

  // get bid data
  getBids(request) {
    this.loader = true;
    var obj = {
      status: 'ACTIVE',
      user_id: this.user.user_id,
      "pageNo": request.pageNo,
      "size": 8,
      "company_id": this.user.company_id,
      user_type: undefined,
      bu_ids: undefined,
      territory_ids: undefined,
      "month": request.month,
      "year": request.year,
    }


    this.p = request.pageNo;
    this.year = request.year;
    if (this.user && this.user.userTypes) {
      var isViewer = false;
      var isSofViewer = false;
      var isSofProductViewer = false;
      var isfinanceController = false;
      var isbgwriter = false;
      var isaccountsExeTreasury = false;
      var isEMDPBGViewer = false;

      _.each(this.user.userTypes, function (n) {
        if (n.user_type == "VIEWER") {
          isViewer = true;
          return false;
        };
        if (n.user_type == "SOF_VIEWER") {
          isSofViewer = true;
          return false;
        };
        if (n.user_type == "SOF_PRODUCT_VIEWER") {
          isSofViewer = true;
          return false;
        };
        if (n.user_type == "BG_WRITER") {
          isbgwriter = true;
          return false;
        };
        if (n.user_type == "FINANCE_CONTROLLER") {
          isfinanceController = true;
          return false;
        };
        if (n.user_type == "ACCOUNTS_EXE_TREASURY") {
          isaccountsExeTreasury = true;
          return false;
        }
        if (n.user_type == "EMD_PBG_VIEWER") {
          isEMDPBGViewer = true;
          return false;
        }
      });
      if (isViewer) {
        obj.user_type = "VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofViewer) {
        obj.user_type = "SOF_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isbgwriter) {
        obj.user_type = "BG_WRITER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isfinanceController) {
        obj.user_type = "FINANCE_CONTROLLER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofProductViewer) {
        obj.user_type = "SOF_PRODUCT_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isaccountsExeTreasury) {
        obj.user_type = "ACCOUNTS_EXE_TREASURY";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isEMDPBGViewer) {
        obj.user_type = "EMD_PBG_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
    }

    this._bidService.getBidData(obj).subscribe(bid => {
      this.bids = bid['data'].bid;
      this.noBid = this.bids.length == 0 ? true : false;
      this.bidsPerMonth = bid['data'].bid_page_count.bidsPerMonth;
      this.bids.forEach(element => {
        if (element.bid_stage) {
          this.staging = ""
          element.bid_stage.stage_add.forEach(result => {
            this.staging += result.no + " - " + result.name.replace("Pre-Pricing", "Delivery") + " - " + result.progress + "\n";
          });
          element['staging'] = this.staging;
          // console.log(">>", this.staging)
        }
      });
      if (this.bids && this.bids.length == 0) {
        this.loader = false;
        return
      }
      this.bids.forEach(element => {
        if (element.approval_chain) {
          if (element.participants) {
            element.totalApprovers = element.participants.filter(a => {
              return a.level;
            });
          }
        }
        if (element.bid_revision_id) {
          this.viewBid(element.bid_revision_id, element.revision_status, element, request)
        }
        if (element.participants) {
          if (element.participants.length == 1) {
            element.nonApprovers = element.participants.filter(a => {
              a.class = a.userTypes && a.userTypes[0].user_type === 'BID_OWNER'
                ? 'text-truncate second1-circle-color circleThree bidManager blink'
                : 'text-truncate second1-circle-color circleThree nobidManager';
              return a.userTypes && a.level == undefined;
            });
          } else {
            element.nonApprovers = element.participants.filter(a => {
              a.class = a.userTypes && a.userTypes[0].user_type === 'BID_OWNER'
                ? 'text-truncate second1-circle-color circleThree bidManager'
                : 'text-truncate second1-circle-color circleThree nobidManager';
              return a.userTypes && a.level == undefined;
            });
          }
          this.setSignals(element)
        }
        // console.log(element.nonApprovers, "nn")
        //this.getPoc(element, element.bid_id);
        if (element.poc_docs.length != 0) {
          element.disableDelete = true;
          this.checkStatus(element);
        }
      });
      this.loader = false;
      // console.log(this.bids);
    }, error => {
      if (error.error.code === 403) {
        // this._router.navigateByUrl()
      }
      this.bids = [];
      this.noBid = true;
      this.loader = false;
    });
  }

  setSignals(element) {
    let tempContributors = [], tempReviewers = [];

    tempContributors = element.nonApprovers.map(a => {
      if (a.userTypes[0].user_type == 'CONTRIBUTOR' || a.userTypes[0].user_type == 'BID_OWNER') {
        return a.user_id
      }
    }).filter(obj => {
      return obj
    });
    tempReviewers = element.nonApprovers.map(a => {
      if (a.userTypes[0].user_type == 'REVIEWER') {
        return a.user_id
      }
    }).filter(obj => {
      return obj
    });
    let obj = {
      contributors: tempContributors,
      reviewers: tempReviewers,
      bid_id: element.bid_id,
      typesFlags: this.flags
    }
    this._bidService.getPendingTask(obj).subscribe(resp => {
      element.nonApprovers.forEach(item => {
        if (resp['data'].findIndex(a => a.user_id === item.user_id && a.pendingTasks.className == 'blink') != -1) {
          item.class = 'text-truncate second1-circle-color circleThree nobidManager review-blink';
          let userObj = resp['data'].find(a => a.user_id === item.user_id);
          let pendingTasks = userObj ? userObj.pendingTasks : {};
          item.desc = "\nTasks Pending in :- "
          for (let key in pendingTasks) {
            if (pendingTasks[key]
              && key.includes("_className")
              && pendingTasks[key] == "blink") {
              item.desc += (key.split("_")[0]).toUpperCase().replace("PRE-PRICING", "DELIVERY") + "  ";
            }
          }
        }
      });
    }, error => {
    });
  }

  getBidsRefresh(request) {
    var obj = {
      status: 'ACTIVE', user_id: this.user.user_id, "pageNo": request.pageNo,
      "size": 8, "month": request.month,
      "year": request.year,
      "company_id": this.user.company_id,
      user_type: undefined,
      bu_ids: undefined,
      territory_ids: undefined
    }

    if (this.user && this.user.userTypes) {
      var isViewer = false;
      var isSofViewer = false;
      var isSofProductViewer = false;
      var isfinanceController = false;
      var isbgwriter = false;
      var isaccountsExeTreasury = false;
      var isEMDPBGViewer = false;

      _.each(this.user.userTypes, function (n) {
        if (n.user_type == "VIEWER") {
          isViewer = true;
          return false;
        };
        if (n.user_type == "SOF_VIEWER") {
          isSofViewer = true;
          return false;
        };
        if (n.user_type == "SOF_PRODUCT_VIEWER") {
          isSofViewer = true;
          return false;
        };
        if (n.user_type == "BG_WRITER") {
          isbgwriter = true;
          return false;
        };
        if (n.user_type == "FINANCE_CONTROLLER") {
          isfinanceController = true;
          return false;
        };
        if (n.user_type == "ACCOUNTS_EXE_TREASURY") {
          isaccountsExeTreasury = true;
          return false;
        }
        if (n.user_type == "EMD_PBG_VIEWER") {
          isEMDPBGViewer = true;
          return false;
        }
      });
      if (isViewer) {
        obj.user_type = "VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofViewer) {
        obj.user_type = "SOF_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isbgwriter) {
        obj.user_type = "BG_WRITER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isfinanceController) {
        obj.user_type = "FINANCE_CONTROLLER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofProductViewer) {
        obj.user_type = "SOF_PRODUCT_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isaccountsExeTreasury) {
        obj.user_type = "ACCOUNTS_EXE_TREASURY";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isEMDPBGViewer) {
        obj.user_type = "EMD_PBG_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
    }
    this._bidService.getBidData(obj).subscribe(bid => {
      this.bids = bid['data'].bid;
      this.noBid = this.bids.length == 0 ? true : false;
      this.bidsPerMonth = bid['data'].bid_page_count.bidsPerMonth;
      this.bids.forEach(element => {
        if (element.bid_stage) {
          this.staging = ""
          element.bid_stage.stage_add.forEach(result => {
            this.staging += result.no + " - " + result.name.replace("Pre-Pricing", "Delivery") + " - " + result.progress + "\n";
          });
          element['staging'] = this.staging;
          // console.log("revisedbids483", this.staging)
        }
      });
      if (this.bids && this.bids.length == 0) {
        return
      }
      this.bids.forEach(element => {
        if (element.approval_chain) {
          if (element.participants) {
            element.totalApprovers = element.participants.filter(a => {
              return a.level;
            });
          }
        }
        if (element.bid_revision_id) {
          this.viewBid(element.bid_revision_id, element.revision_status, element, request)
        }
        if (element.participants) {
          element.nonApprovers = element.participants.filter(a => {
            a.class = a.userTypes && a.userTypes[0].user_type === 'BID_OWNER'
              ? 'text-truncate second1-circle-color circleThree bidManager'
              : 'text-truncate second1-circle-color circleThree nobidManager';
            return a.userTypes && a.level == undefined;
          });

          this.setSignals(element)
        }
        //this.getPoc(element, element.bid_id);
        if (element.poc_docs.length != 0) {
          element.disableDelete = true;
          this.checkStatus(element);
        }
      });
    }, error => {
      if (error.error.code === 403) {
      }
      this.bids = [];
      this.noBid = true;
    });
  }

  /* getPoc(item, bid_id) {
    this._pocService.getPocDashboards({ status: 'ACTIVE', bid_id: bid_id }).subscribe(data => {
      this.poc = data['data']['poc_list'][0];
      item.poc = this.poc;
      if (item.poc) {
        item.disableDelete = true;
        this.checkStatus(item);
      }
    })
  } */

  // to check approval status of every bid. eg. approved, rejected
  checkStatus(item) {
    if (item.poc_docs && (item.poc_docs.length == 0 || item.poc_docs[0].process.length == 0)) {
      return;
    }
    this.process = item.poc_docs[0].process.filter(a => {
      return a.status == true;
    })
    if (this.process.length == 0) {
      item.approvedStatus = 'n/F'
      return;
    }
    if (this.process.findIndex(a => a.action == 'REJECTED') != -1) {
      item.approvedStatus = 'rejected';
    }
    else if (item.totalApprovers.length == this.process.length && this.process[this.process.length - 1].action == 'CONDITIONALLY_APPROVED') {
      item.approvedStatus = 'condition';
    }
    else if (item.totalApprovers.length == this.process.length && this.process[this.process.length - 1].action == 'APPROVED') {
      item.approvedStatus = 'approved';
    }
  }

  // delete bid
  deactivate(id) {
    this.alert.deleted('').then(() => {
      let obj = {};
      obj['user_id'] = this.user.user_id;
      obj['company_id'] = this.user.company_id;
      obj['user_role'] = this.user.user_role;
      obj['bid_id'] = id;
      obj['status'] = "INACTIVE";
      localStorage.removeItem('bidData');
      localStorage.removeItem('bid_id');
      this._bidService.updateBid(obj).subscribe(data => {
        this.bids.forEach(element => {
          if (element.approval_chain && element.bid_id == id) {
            element.totalApprovers = [];
            element.nonApprovers = [];
          }
        });
        // this.getBids(this.request);
        var url = this._router.url;
        this._router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
          this._router.navigate([url]));

      })
    }).catch(e => {

    })
  }

  // display first and last name initials on list of participants
  getSignatures(firstName, lastName) {
    if (firstName && lastName) {
      let name = (firstName.trim())[0].toUpperCase() + (lastName.trim())[0].toUpperCase()
      return name
    } else {
      return "NA";
    }
  }

  // display estimated deal value
  dealValueLength(val) {
    let deal = val.toString().split("");
    if (deal.length > 4) {
      return deal[0] + "" + deal[1] + "" + deal[2] + "" + deal[3]
    }
    return val;
  }

  // pagination
  loadNextPage(event) {
    this.bids = undefined;
    this.p = event;
    this.request = {
      "pageNo": this.p,
      "month": this.value + 1,
      "year": this.year,
    }
    this.request['value'] = this.value
    localStorage.setItem("lastBidObj", JSON.stringify(this.request));
    if (this.bidName == "")
      this.getBids(this.request);
    else {
      this.getSearchedBids(this.request);
    }
  }

  // display bid according to month
  onMonthYearChange() {
    this.noBid = false;
    this.bids = undefined;
    this.p = 1;
    this.request = {
      "pageNo": 1,
      "month": this.value + 1,
      "year": this.year,
    }
    this.request['value'] = this.value;
    if (this.showData) {
      this.request = {
        "pageNo": this.showData.pageNo,
        "month": this.value + 1,
        "year": this.showData.year,
      }
    }
    localStorage.setItem("lastBidObj", JSON.stringify(this.request));
    this.getBids(this.request);
  }


  //new window open (bid action summary)
  // goToLink(id){

  //   window.open('/bid-development/'+id)
  // }

  getUserById() {
    this._UsersService.getCompanyDetails({ user_id: this.user.user_id }).subscribe(data => {
      this.bussiness_unit = data['data']['user']['bussiness_unit']
      this.territory = data['data']['user']['territory']
      this.role = data['data']['user']['user_type'];
    }, error => {

    })
  }



  onItemSelect(item: any) {
    // // console.log("item >>>>", item);
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
      "bid_name": this.bidName,
      "status": 'ACTIVE',
      "user_id": this.user.user_id,
      "pageNo": this.request.pageNo,
      "size": 8,
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start) ? parseFloat(this.start) : "",
      "end_value": parseFloat(this.end) ? parseFloat(this.end) : "",
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : '',
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : '',
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu,
      user_type: undefined
    }

    this.onFilter(obj);
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
      "bid_name": this.bidName,
      "status": 'ACTIVE',
      "user_id": this.user.user_id,
      "pageNo": this.request.pageNo,
      "size": 8,
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start) ? parseFloat(this.start) : "",
      "end_value": parseFloat(this.end) ? parseFloat(this.end) : "",
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : '',
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : '',
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu,
      user_type: undefined
    }

    this.onFilter(obj);
  }

  onDeSelectAll(item, type) {
    // // console.log("item >>>>", item);
    if (type == 'BU') {
      this.bu_ids = [];
    }
    let territories = [];
    if (type == 'Territory') {
      this.territory_ids = [];
    }
    let obj = {
      "bid_name": this.bidName,
      "status": 'ACTIVE',
      "user_id": this.user.user_id,
      "pageNo": this.request.pageNo,
      "size": 8,
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start) ? parseFloat(this.start) : "",
      "end_value": parseFloat(this.end) ? parseFloat(this.end) : "",
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : '',
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : '',
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu,
      user_type: undefined
    }

    this.onFilter(obj);
  }

  onFilter(obj) {
    if (this.user && this.user.userTypes) {
      var isViewer = false;
      var isSofViewer = false;
      var isSofProductViewer = false;
      var isfinanceController = false;
      var isbgwriter = false;
      var isaccountsExeTreasury = false;
      var isEMDPBGViewer = true;
      _.each(this.user.userTypes, function (n) {
        if (n.user_type == "VIEWER") {
          isViewer = true;
          return false;
        };
        if (n.user_type == "SOF_VIEWER") {
          isSofViewer = true;
          return false;
        };
        if (n.user_type == "SOF_PRODUCT_VIEWER") {
          isSofViewer = true;
          return false;
        };
        if (n.user_type == "BG_WRITER") {
          isbgwriter = true;
          return false;
        };
        if (n.user_type == "FINANCE_CONTROLLER") {
          isfinanceController = true;
          return false;
        };
        if (n.user_type == "ACCOUNTS_EXE_TREASURY") {
          isaccountsExeTreasury = true;
          return false;
        }
        if (n.user_type == "EMD_PBG_VIEWER") {
          isEMDPBGViewer = true;
          return false;
        }
      });
      if (isViewer) {
        obj.user_type = "VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofViewer) {
        obj.user_type = "SOF_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isSofProductViewer) {
        obj.user_type = "SOF_PRODUCT_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isbgwriter) {
        obj.user_type = "BG_WRITER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isfinanceController) {
        obj.user_type = "FINANCE_CONTROLLER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
      if (isaccountsExeTreasury) {
        obj.user_type = "ACCOUNTS_EXE_TREASURY";
        obj.bu_ids = this.user.bu_ids,
        obj.territory_ids = this.user.territory_ids
      }
      if (isEMDPBGViewer) {
        obj.user_type = "EMD_PBG_VIEWER";
        obj.bu_ids = this.user.bu_ids,
          obj.territory_ids = this.user.territory_ids
      }
    }
    this._bidService.getBidData(obj).subscribe(success => {
      this.searchFlag = true;
      this.bids = success['data'].bid;

      this.noBid = this.bids.length == 0 ? true : false;
      this.bidsPerMonth = success['data'].bid_page_count.bidsPerMonth;
      this.bids.forEach(element => {
        if (!element.bid_stage) {
          element['bid_stage'] = [];
        }
      });
      if (this.bids && this.bids.length == 0) {
        return
      }
      this.bids.forEach(element => {
        if (element.approval_chain) {
          element.totalApprovers = element.participants.filter(a => {
            return a.level;
          });
        }
        if (element.bid_revision_id) {
          this.viewBidForSearch(element.bid_revision_id, element.revision_status, element, this.request, obj)
        }
        element.nonApprovers = element.participants.filter(a => {
          return a.userTypes && a.level == undefined;
        });
        //this.getPoc(element, element.bid_id);
        if (element.poc_docs.length != 0) {
          element.disableDelete = true;
          this.checkStatus(element);
        }
      });
    }, error => {
      this.bids = [];
      this.noBid = true;
    });
  }



  onClear() {
    this.selectedBUs = [];
    this.selectedTerritories = [];
    this.dateTimeRange = [null, null];
    this.start = '';
    this.end = '';
    this.multiflagTerritory = "All";
    this.multiflagBu = "All";
    if (this.searchFlag == true) {
      this.getSearchedBids({ pageNo: 1 });
    }
  }

  gotoLink(bidId) {
    if (this.searchFlag == true) {
      window.open('/bid-development/' + bidId, "_blank")
    } else {
      this._router.navigateByUrl('/bid-development/' + bidId)
    }

  }

  onReports() {
    if (this.access.userTypes[0].user_type == "FINANCE_CONTROLLER" || this.access.userTypes[0].user_type == "BG_WRITER" || this.access.userTypes[0].user_type == "EMD_PBG_VIEWER") {
      this._router.navigateByUrl('/analysis/pbg-historyData');
      return;
    }
    if (this.access.userTypes[0].user_type == "SOF_VIEWER" || this.access.userTypes[0].user_type == "SOF_PRODUCT_VIEWER") {
      this._router.navigateByUrl('/analysis/filterSOF');
      return;
    }
    if (this.access.userTypes[0].user_type == "ACCOUNTS_EXE_TREASURY") {
      this._router.navigateByUrl('/analysis/filterEOI');
      return;
    }
    else {
      if (!this.access.viewGraphAccess) {
        this._router.navigateByUrl('/analysis/productivity');
      } else {
        this._router.navigateByUrl('/analysis');
      }
    }
  }

  checkBidSummary(type, result) {
    if (result.bidFinalStatus == 'DROPPED') {
      this.alert.sweetError("This bid has been dropped");
      return
    }
    if (this.access && this.access.viewBidClosureSummaryAccess && result.poc_docs && (result.approvedStatus == 'approved' || result.approvedStatus == 'condition' || result.approvedStatus == 'rejected')) {
      $("#viewRevisionBid").modal('hide');
      this._router.navigate(['/' + type, result.bid_id]);
    }
  }

  hideModalBidSummary(state, result) {
    if (result.bidFinalStatus == 'DROPPED') {
      this.alert.sweetError("This bid has been dropped");
      return
    }
    if (this.access && this.access.viewBidClosureSummaryAccess && result.poc_docs && (result.approvedStatus == 'approved' || result.approvedStatus == 'condition' || result.approvedStatus == 'rejected')) {
      $("#viewRevisionBid").modal('hide');
      window.open(state + "/" + result.bid_id);
    }
  }

  WinLossSubmitStatus(item, type) {
    let WinLossSubmit = false;
    let currentBid = item;
    currentBid.bidSummaryData.forEach(element => {
      if (type == 'Win-Loss-Summary') {
        if (element.submit_flag == true) {
          WinLossSubmit = true
        }
      }
      if (type == 'SOF' || type == 'PBG') {
        if (element.submit_flag == true && element.bid_result == "Won") {
          WinLossSubmit = true
        }
      }
    })
    return WinLossSubmit;
  }
 
  WinLossSubmitDrop(item, type) {
    let WinLossSubmitDropHide = true;
    let currentBid = item;
    currentBid.bidSummaryData.forEach(element => {
      if (type == 'Drop') {
        if (element.submit_flag == true) {
          WinLossSubmitDropHide = false
        }
      }
    })
    return WinLossSubmitDropHide;
  }

  hideModalPBGEMDForm(type, result) {
    $("#viewRevisionBid").modal('hide');
    window.open(type + "/" + result.bid_id);
  }
 
  onBidTimeline(item , type) {
    if(type == 'hideModal'){
      $("#viewRevisionBid").modal('hide');
    }
    let obj =
    {
        "bid_id": item.bid_id
    }
    const dialogRef = this.dialog.open(BidTimelineReportComponent, {
      height: '500px',
      width: '930px',
      data:  obj
    });
    dialogRef.afterClosed().subscribe(result => {
    
    }, error => {
  
    })
  }
}
