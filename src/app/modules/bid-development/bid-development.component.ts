import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { BidService } from '../../services/bid.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PocDashboardService } from '../../services/poc.service'
import { AlertComponent } from '../../libraries/alert/alert.component';
import { ProjectScopeService } from '../../services/ps.service';
import { SchedulingService } from '../../services/scheduling.service';
import { SharedService } from '../../services/shared.service';
import { HttpService } from '../../services/http.service';
import { MatDialog } from '@angular/material';
import { BidTimelineReportComponent } from './bid-timeline-report/bid-timeline-report.component';

@Component({
  selector: 'app-bid-development',
  templateUrl: './bid-development.component.html',
  styleUrls: ['./bid-development.component.css'],
  providers: [BidService, PocDashboardService, ProjectScopeService, SchedulingService]
})
export class BidDevelopmentComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  sidebar = false;
  bid_id;
  bidData;
  reviseBidData = {};
  user;
  user_type;
  user_subtype;
  process = [];
  module;
  responseData: any = [];
  reviewCount: number = 1;
  checkReviewArray: boolean = true;
  approvalRequiredData;
  poc = {};
  mainData: any = [];
  prePricingReviewData;
  reviewData;
  prePricingReviewCompleted = false;
  reviewCompleted = false;
  pocSubmited: boolean = false
  RFI = false;
  mainFlag = true;
  revisedBid = false;
  review_flag = true;
  reviewNonPriceflag = true;
  proposalReviewFlag = true;
  solutionReviewFlag = true;
  legalReviewFlag = true;
  approvalFlag = true;
  approvedFlag = false;
  currentContributors = [];
  productType = 'pricing';
  allowSubmit = false;
  approval_flag = false;
  rejected = false;
  revisionFlag = false;
  deliveryReviewFirstFlag = false;
  reviewFirstFlag = false;
  proposalFirstReviewFlag = false;
  solutionFirstReviewFlag = false;
  isApprovedFlag = false;
  updateBid = {}
  revised;
  revisedBidObj;
  rfiData = {};
  revisedBidId;
  solutionData;
  pricingData;
  proposalData;
  legalData;
  breadcrumb = "";
  // showProposalReviewBtn = false;
  access;
  participants = [];
  _shared: any;
  loader = false;
  isCoOwner = false;
  bidStatus = "";
  approverParticipants: any;
  constructor(public _bidService: BidService, private _activeRoute: ActivatedRoute,
    public _pocService: PocDashboardService,
    public _psService: ProjectScopeService,
    public _SchedulingService: SchedulingService,
    public dialog: MatDialog,
    private router: Router, public _sharedService: SharedService, private _httpService: HttpService) {
    this._sharedService.reviewType.subscribe(a => {
      this.getResponseReviewStatus();
    });

    this._sharedService.currentMessage.subscribe(msg => {
      if (msg['flag'] != undefined)
        this.review_flag = msg['flag'];
      if (msg['revisionFlag'] != undefined)
        this.revisionFlag = msg['revisionFlag'];
      if (msg['proposalReviewFlag'] != undefined)
        this.proposalReviewFlag = msg['proposalReviewFlag']
      if (msg['solutionReviewFlag'] != undefined)
        this.solutionReviewFlag = msg['solutionReviewFlag']
      if (msg['reviewNonPriceflag'] != undefined)
        this.reviewNonPriceflag = msg['reviewNonPriceflag']
      if (msg['legalReviewFlag'] != undefined)
        this.legalReviewFlag = msg['legalReviewFlag']
      if (msg['prePricingReviewCompleted'] != undefined)
        this.prePricingReviewCompleted = msg['prePricingReviewCompleted']
      if (msg['reviewCompleted'] != undefined)
        this.reviewCompleted = msg['reviewCompleted']
      if (msg['isApprovedFlag'] != undefined)
        this.isApprovedFlag = msg['isApprovedFlag']
    }, error => {
    });
    this._sharedService.approval_flag.subscribe(msg => {
      this.approval_flag = msg['approval_flag'] ? msg['approval_flag'] : false;
    }, error => {
    });
    this.bid_id = _activeRoute.snapshot.params['id'];
    localStorage.setItem("bid_id", this.bid_id);

    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.productType = this.user.product_type ? this.user.product_type : 'pricing';

    if (this.productType == 'nonpricing') {
      this.allowSubmit = true;
    }
    this.checkBreadcrumb();

    this.mainData = [{
      "bid_id": this.bid_id,
      "main_add": [{
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
    }]
    _bidService.statusUpdated.subscribe((data) => {
      if (data && data.length != 0 && data[0]['main_add']) {
        this.mainData = data;
      } else if (data && data.length != 0 && data[0]['techsolution_add']) {
        this.solutionData = data;
      } else if (data && data.length != 0 && data[0]['proposal_add']) {
        this.proposalData = data;
      } else if (data && data.length != 0 && data[0]['solution_add']) {
        this.pricingData = data;
      } else if (data && data.length != 0 && data[0]['legalRisk_add']) {
        this.legalData = data;
      } else if (data && data.length != 0 && data[data.length - 1]['review_add']) {
        if (data[data.length - 1].cmsReview) {
          this.prePricingReviewData = data[data.length - 1];
        } else {
          this.reviewData = data[data.length - 1];
        }
      }
    }, error => {
    });
    _bidService.rfiUpdated.subscribe(
      (data) => {
        this.getPoc();
      }, error => {
      }
    );
    if (this.user & this.user.role_module_mapping && this.user.role_module_mapping.length) {
      this.module = this.user.role_module_mapping.find(a => a.module_name.replace(/ /g, '_').toLowerCase() == 'bid_development');
    }
    /* this._sharedService.showProposalReviewBtn.subscribe(data => {
      console.log(data);
      this.showProposalReviewBtn = data.flag;
    }, error =>{
    }); */
    _bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bidData = resp['data']['bid'];
      this.bidStatus = this.bidData.bidFinalStatus ? this.bidData.bidFinalStatus : "";
      this.bid_id = this.bidData.bid_id;
      this.participants = this.bidData.participants.filter(a => { return a.user_type });
      this.bidData.participants.forEach(element => {
        if (element.userTypes[0].user_type == 'APPROVER' && (element.user_id == this.user.user_id)) {
          this.approverParticipants = element.userTypes[0].user_type;
        }
      });
      // console.log("Hello 179", this.approverParticipants)
      if (this.bidData.currentParticipants && this.bidData.currentParticipants.length > 0) {
        this.currentContributors = this.bidData.participants.filter(a => {
          return a.user_type == 'CONTRIBUTOR';
        });
        if (this.currentContributors.length == this.bidData.currentParticipants.length) {
          this.allowSubmit = true;
        }
      }
      if (this.bidData.currentParticipants && this.bidData.currentParticipants.length == 0) {
        this.allowSubmit = true;
      }
      if (this.bidData.parent) {
        this.revisedBid = this.bidData.parent;
      }

      this.revised = this.bidData.revision_status ? this.bidData.revision_status : false;

      localStorage.setItem("bidData", JSON.stringify(this.bidData));
    }, error => {
    });

    if (this.user.product_type == 'nonpricing')
      this.getPricingData();

    this.accessControl();
    this.getApprovalData();
    this.getPoc();
    this.getMainData();
    this.getSolutionDataData();
    this.getProposalData();
    this.readNonPricingData();
    this.getSolutionReview();
    this.getProposalReview();
    this.getReviewData();
    this.init()
    // this.getResponseReviewStatus()
  }

  ngOnInit() {
  }

  goToDocumentEditor() {
    localStorage.setItem("bidData", JSON.stringify(this.bidData));
    window.open('/bid-development/document/' + this.bid_id, "_blank");
  }


  //  Set Response and review tab signals
  getResponseReviewStatus() {
    this._bidService.getReponseReviewStatus({ bid_id: this.bid_id }).subscribe(response => {
      this.setStatus(response['data']['bid'])
    }, error => {
    });
  }
  section;
  init() {
    this.section = {
      review: { status: false },
      solution_rev: { status: false },
      proposal_rev: { status: false },
      pricing_rev: { status: false },
      legal_rev: { status: false },
      legal_res: { status: false },
      response: { status: false },
      solution_res: { status: false },
      proposal_res: { status: false },
      pricing_res: { status: false },
      pricing_new_res: { status: false }
    }
  }

  checkResponse(data, type) {
    let responseDone = true;

    if (!data || (data && data.length == 0)) {
      return false;
    }
    if (type) {
      let finalArray = [];
      data.forEach(element => {
        Array.prototype.push.apply(finalArray, element[type]);
      });
      if (finalArray.length === 0) {
        return false
      }
      this.participants.forEach(participant => {

        let contributionNotdone = finalArray.findIndex((item) => {
          if (item.subItem && item.subItem.length > 0) {
            return item.subItem.some((subItem) => {
              return subItem.draft && subItem.draft.find(b => ((b.user || b.user_id) == participant.user_id && b.flag == true))
            });
          } else {
            return item.draft && item.draft.find(b => ((b.user || b.user_id) == participant.user_id && b.flag == true))
          }
        });
        if (contributionNotdone != -1) {
          responseDone = false;
          return
        }
      });
    } else {
      if (data['assignmentData'] && data['assignmentData'].length === 0) {
        return false
      }
      this.participants.forEach(participant => {
        if (data['assignmentData'].findIndex(b => b.user_id == participant.user_id && b.isWorkDone == false) != -1) {
          responseDone = false;
          return
        }
      })
    }
    return responseDone
  }

  checkReview(result, type, sub_type) {
    let reviewDone = true;
    if (result && result.length == 0 && sub_type == 'pricing' && this.section['pricing_rev']['status'] == true) {
      return true
    }
    if (!result || !result[type] || (result[type] && result[type].length === 0)) {
      return false;
    }
    this.participants.forEach(participant => {

      if (participant.userTypes[0].user_type != "REVIEWER") {
        return
      }

      let reviewNotDone = result[type].findIndex(a => a.draft[0].user == participant.user_id && a.draft[0].flag === true);
      let reviewNewDone = result[type].findIndex(a => a.draft[0].user == participant.user_id && a.draft[0].flag === false);

      if (reviewNotDone != -1) {
        reviewDone = false
        // return
      } else if (reviewNewDone != -1) {
      }
      else {
        if (type == 'techSolReview_add') {
          if (participant.userTypes[0].user_subtype != 'Finance'
            && participant.userTypes[0].user_subtype != 'Pricing'
            && participant.userTypes[0].user_subtype != 'Proposal'
            && participant.userTypes[0].user_subtype != 'Legal') {
            reviewDone = false
          }
        } else if (type == 'techSolReview_add') {
          if (participant.userTypes[0].user_subtype != 'Finance'
            && participant.userTypes[0].user_subtype != 'Pricing'
            && participant.userTypes[0].user_subtype != 'Proposal'
            && participant.userTypes[0].user_subtype != 'Legal') {
            reviewDone = false
          }
        } else if (type == 'proposalReview_add') {
          if (participant.userTypes[0].user_subtype != 'Finance'
            && participant.userTypes[0].user_subtype != 'Pricing'
            && participant.userTypes[0].user_subtype != 'Solution'
            && participant.userTypes[0].user_subtype != 'Legal') {
            reviewDone = false
          }
        } else if (type == 'review_add') {
          if ((participant.userTypes[0].user_subtype == 'Finance'
            || participant.userTypes[0].user_subtype == 'Pricing')
            && sub_type == 'pricing') {
            reviewDone = false
          } else if (
            participant.userTypes[0].user_subtype != 'Legal'
            && participant.userTypes[0].user_subtype != 'Solution'
            && participant.userTypes[0].user_subtype != 'Proposal'
            && participant.userTypes[0].user_subtype != 'Pricing'
            && participant.userTypes[0].user_subtype != 'Finance'
            && sub_type == 'pre_pricing') {
            reviewDone = false
          }
        }
      }
    });
    return reviewDone
  }

  setStatus(result) {
    if (!this.participants || !result) {
      return
    }
    if (this.RFI) {
      this.init()
      return
    }
    for (var key in result) {
      switch (key) {
        case 'bid_solution':
          this.section['solution_res']['status'] = this.checkResponse(result[key], 'techsolution_add')
          break;
        case 'bid_proposal':
          this.section['proposal_res']['status'] = this.checkResponse(result[key], 'proposal_add')
          break;
        case 'bid_pricing':
          this.section['pricing_res']['status'] = this.checkResponse(result[key], 'solution_add')
          break;
        case 'bid_new_pricing':
          this.section['pricing_new_res']['status'] = this.checkResponse(result[key], '')
          break;
        case 'bid_legal':
          this.section['legal_res']['status'] = this.checkResponse(result[key], 'legalRisk_add')
          break;

        case 'bid_solution_review':
          this.section['solution_rev']['status'] = this.checkReview(result[key], 'techSolReview_add', '')
          break;
        case 'bid_proposal_review':
          this.section['proposal_rev']['status'] = this.checkReview(result[key], 'proposalReview_add', '')
          break;
        case 'bid_pre_pricing_review':
          this.section['pricing_rev']['status'] = this.checkReview(result[key], 'review_add', 'pre_pricing')
          break;
        case 'bid_pricing_review':
          this.section['pricing_rev']['status'] = this.checkReview(result[key], 'review_add', 'pricing')
          break;
        case 'bid_legal_review':
          this.section['legal_rev']['status'] = this.checkReview(result[key], 'legalReview_add', '')
          break;

        default:
          break;
      }
    }
    if (this.section['solution_res']['status']
      && this.section['proposal_res']['status']
      && (this.section['pricing_res']['status'] || this.section['pricing_new_res']['status'])
      && this.section['legal_res']['status']) {
      this.section['response']['status'] = true;
    }

    if (this.section['solution_rev']['status']
      && this.section['proposal_rev']['status']
      && this.section['pricing_rev']['status']
      && this.section['legal_rev']['status']) {
      this.section['review']['status'] = true;
    }
  }

  //  end of signals logic



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
      this.isCoOwner = this.access.participants[0].userTypes[0].coOwner ? true : false;
      // console.log("access", this.access);
    }, error => {
    });
  }

  setLocalStorage() {
    localStorage.setItem("bidData", JSON.stringify(this.bidData));
    window.open('/bid-development/sheets/' + this.bid_id, "_blank");
  }

  checkBreadcrumb() {
    let path = window.location.pathname.split("/");
    switch (path[3]) {
      case 'mains': this.breadcrumb = 'Main'; break;
      case 'solution': this.breadcrumb = 'Solution'; break;
      case 'proposal': this.breadcrumb = 'Proposal'; break;
      case 'pricing': this.breadcrumb = 'Pricing'; break;
      case 'legal': this.breadcrumb = 'Legal'; break;
      case 'solution-review': this.breadcrumb = 'Solution Review'; break;
      case 'proposal-review': this.breadcrumb = 'Proposal Review'; break;
      case 'pricing-review': this.breadcrumb = 'Pricing Review'; break;
      case 'legal-review': this.breadcrumb = 'Legal Review'; break;
      case 'docs-required': this.breadcrumb = 'Docs Required'; break;
      case 'risk-assessment': this.breadcrumb = 'Risk Assessment'; break;
      case 'approvalrequired': this.breadcrumb = 'Approvals Required'; break;
      case 'rfi': this.breadcrumb = 'Information Required'; break;
      default: this.breadcrumb = '-';
    }
  }

  getApprovalData() {
    this.loader = true;
    this._bidService.getApprovalData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this.loader = false;
          return;
        }
        if (resp['data'] && resp['data']['approvalreq_data']) {
          this.approvalRequiredData = resp['data']['approvalreq_data'];
          this.approval_flag = this.approvalRequiredData[0].submit_flag;
        }
        this.loader = false;
      }, error => {
        this.loader = false;
      });
  }

  /* changeState() {
    this.header.changeStatus();
  } */

  getPoc() {
    this.loader = true;
    this._pocService.getPocDashboards({ bid_id: this.bid_id }).subscribe(data => {
      if (data['data'] == null) {
        this.approvalFlag = true;
        this.loader = false;
        return;
      }
      this.poc = data['data']['poc_list'][0];
      if (this.poc && this.poc['bid_id']) {
        this.pocSubmited = true;
        this.process = this.poc['process'].filter(a => {
          return a.status;
        });
        if (this.process.length > 0 || this.poc['status'] == "ACTIVE") {
          this.approvalFlag = false;
        }
        else {
          this.approvalFlag = true;
          this.reviewFirstFlag = true;
        }
        if (this.poc['process'].length != 0) {
          this.poc['process'].forEach(element => {
            if (element.action == "RFI") {
              this.revisionFlag = true;
            }
          });
        }
        if (this.process && this.process.findIndex(a => a.action == 'REJECTED') >= 0) {
          this.rejected = true;
          return
        }
        this.RFI = false;
        if (this.process && this.process.findIndex(a => a.action == 'RFI') >= 0) {
          this.RFI = true;
          return
        }
      }

      /* if (this.poc['process'] && this.poc['process'][this.poc['process'].length - 1].action == 'APPROVED') {
        this.approvedFlag = true;
        return;
      } */
      this.loader = false;
    }, error => {
      this.approvalFlag = true;
      this.loader = false;
    })
  }

  //get proposal data
  getProposalData() {
    this._bidService.getProposalData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" }).subscribe((resp: object) => {
      if (resp['data'] == null) {
        return;
      }
      this.proposalData = resp['data'];
      for (var i = 0; i < this.proposalData.length; i++) {
        this.proposalData[i].proposal_add.forEach(element => {
          if (!element.subItem) {
            element['subItem'] = [];
          }
        });
      }
    }, error => {
    });
  }

  // pricing data
  getPricingData() {
    this._bidService.getSolutionData({ "bid_id": this.bid_id, "user": this.user.user_id }).subscribe((resp: object) => {
      if (resp['data'] == null) {
        return;
      }
      this.pricingData = resp['data'];
      for (var i = 0; i < this.pricingData.length; i++) {
        this.pricingData[i].solution_add.forEach(element => {
          if (!element.subItem) {
            element['subItem'] = [];
          }
        });
      }
    }, error => {
    });
  }

  // Solution data
  getSolutionDataData() {
    this._bidService.getTechSolutionData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" }).subscribe((resp: object) => {
      if (resp['data'] == null) {
        return;
      }
      this.solutionData = resp['data'];
      for (var i = 0; i < this.solutionData.length; i++) {
        this.solutionData[i].techsolution_add.forEach(element => {
          if (!element.subItem) {
            element['subItem'] = [];
          }
        });
      }
    }, error => {
    });
  }

  // main data
  getMainData() {
    this.loader = true;
    this._bidService.getMainData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this.loader = false;
          return;
        }
        this.mainData = resp['data']['maintab_data'];
        // console.log(this.mainData, "main data");
        if (this.mainData[0].main_add.length != 0) {
          if (this.mainData[0].main_add && this.mainData[0].main_add[this.mainData[0].main_add.length - 1].action) {
            this.mainFlag = false;
          }
        }
        this.loader = false;
      }, error => {
        this.mainFlag = true;
        this.loader = false;
      });
  }

  // review data
  getReviewData() {
    this.loader = true;
    this._bidService.getReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this.review_flag = true;
          this.loader = false;
          return;
        }
        this.responseData = resp['data']['reviewtab_data'];
        this.review_flag = this.responseData[this.responseData.length - 1].review_flag;
        this.reviewFirstFlag = true; //this.responseData[0].review_flag
        localStorage.setItem("reviewData", JSON.stringify(resp['data']['reviewtab_data']));
        this.reviewCount = this.responseData.length + 1;
        /* this.responseData.forEach(element => {
          if (element.review_add && element.review_add.length == 0 && this.reviewCount) {
            this.checkReviewArray = false;
          }
        }); */
        this.loader = false;
      }, error => {
        this.review_flag = true;
        this.loader = false;
      });
  }

  //NonPricing review data
  readNonPricingData() {
    this.loader = true;
    this._bidService.getNonPricingReviewData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          this.loader = false;
          return;
        }
        let data = resp['data']['reviewtab_data'];
        this.deliveryReviewFirstFlag = true;
        this.reviewNonPriceflag = data[data.length - 1].reviewNonPriceflag;
        this.loader = false;
      }, error => {
        this.reviewNonPriceflag = true;
        this.loader = false;
      });
  }

  // to check whether bid is under review or not
  getProposalReview() {
    this._bidService.getProposalReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        let data = resp['data']['reviewtab_data'];
        this.proposalFirstReviewFlag = true; //data[0].ProposalReview_flag
        this.proposalReviewFlag = data[data.length - 1].ProposalReview_flag;
      }, error => {
      });
  }

  getSolutionReview() {
    this._bidService.getTechSolutionReviewData({ "bid_id": this.bid_id, "user": this.user.user_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        let data = resp['data']["reviewtab_data"];
        this.solutionFirstReviewFlag = true; //data[0].techSolReview_flag
        this.solutionReviewFlag = data[data.length - 1].techSolReview_flag;
      }, error => {
      });
  }

  // submit for revision
  onSubmitRevision() {
    let mainDataLength = this.mainData[0].main_add.length - 1;
    if (this.mainData[0].main_add[mainDataLength].draft[0].flag) {
      this.alert.sweetError("Please submit Bid Action Summary to proceed");
      return;
    }
    /* if (!this.approval_flag) {
      this.alert.sweetError("Please submit approval required section");
      return
    } */
    this.alert.submitForRevision("").then(success => {
      this.loader = true
      let obj, sheetId;
      if (this.productType == 'nonpricing') {
        obj = { bid_id: this.bid_id };
      } else {
        if (this.bidData && this.bidData.sheetId && this.bidData.sheetId[0]) {
          sheetId = this.bidData.sheetIds[0].sheetId;
        }
        obj = { sheetId: sheetId, bid_id: this.bid_id, productType: this.productType }
      }
      this._bidService.createBidRevision(obj).subscribe(data => {
        this.updateBidForRevision();
        this.loader = false;
      }, error => {
        this.loader = false;
      });
    }, cancel => {
      return;
    });
  }

  updateBidForRevision() {
    var refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: undefined,
      sub_module: "SOLUTION_PRICING",
      page: "sheet"
    }
    this.revised = true;
    this.updateBid['user_id'] = this.user.user_id;
    this.updateBid['company_id'] = this.user.company_id;
    this.updateBid['user_role'] = this.user.user_role;
    this.updateBid['bid_id'] = this.bid_id;
    this.updateBid['status'] = "ACTIVE";
    this.updateBid['revision_status'] = true;
    this.updateBid['parent'] = true;
    this.updateBid['approval_chain'] = this.bidData.approval_chain;
    this.updateBid['contributor'] = this.bidData.contributor;
    this.updateBid['reviewer'] = this.bidData.reviewer;
    this.updateBid['contributorTypes'] = this.bidData.contributorTypes;
    this.updateBid['reviewerTypes'] = this.bidData.reviewerTypes;
    this.updateBid['contributorTypes'] = this.bidData.contributorTypes;
    this.updateBid['reviewer'] = this.bidData.reviewer;
    this.updateBid['bid_parent_id'] = this.bidData.bid_revision_id ? this.bidData.bid_revision_id : this.bid_id;
    //  this.bidData.bid_parent_id ? this.bidData.bid_parent_id : this.bidData.bid_revision_id;
    this._bidService.updateSubmissionDate(this.updateBid).subscribe(data => {
      this._bidService.refreshContent(refreshObj).subscribe(resp => {
      }, cancel => {
      });
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
      this._sharedService.changeMessage({ "revisionFlag": false, "flag": false });
    }, error => {
      this.loader = false;
    });
  }

  // check bid response tasks
  checkResponseTasks(data, type) {
    let validate = true;
    if (data && data.length != 0) {
      data.forEach(element => {
        if (element[type].length != 0 && !element[type][0].draft[0].flag) {
          element[type].forEach(solnItem => {
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
    return validate;
  }

  checkResponseCategories(data, type) {
    let validate = true;
    if (data != undefined) {
      data.forEach(element => {
        if (element[type][0].draft.length == 1) {
          validate = false;
        }
      });
    } else if (data == undefined) {
      validate = false;
    }
    return validate;
  }

  checkSingleCategorySubmission(data, type) {
    let validate = false;
    data.forEach(element => {
      element[type].forEach(item => {
        if (!item.draft[0].flag) {
          validate = true;
        }
      });
    });
    return validate;
  }

  // submit for pricing review
  onSubmitPricingReview(type) {
    /* let mainDataLength = this.mainData[0].main_add.length - 1;
    if (this.mainData[0].main_add[mainDataLength].draft[0].flag) {
      this.alert.sweetError("Please submit Bid Action Summary to proceed");
      return;
    } */
    if (this.productType != "pricing" && !this.checkResponseCategories(this.pricingData, 'solution_add')) {
      if (this.pricingData == undefined) {
        this.alert.sweetError("Please create category in Pricing section");
      } else if (this.checkSingleCategorySubmission(this.pricingData, 'solution_add')) {
        this.alert.customConfirmation("All categories have not been submitted", "Do you want to proceed?").then(success => {
          this.taskForContributorInPricing(type);
        }).catch(cancel => {
          return false;
        });
      } else {
        this.alert.sweetError("Please submit atleast one category in Pricing section");
        return;
      }
      // return false;
    } else {
      this.taskForContributorInPricing(type);
    }
  }

  taskForContributorInPricing(type) {
    let obj = {
      "bid_id": this.bid_id,
      "review_add": [],
      // "product_type":"pricing"
    }
    if (!this.checkResponseTasks(this.pricingData, 'solution_add')) {
      this.alert.submitReview(type).then(success => {
        return;
        // if (type == "Pricing") {
        //   if (this.reviewCompleted) {
        //     this.alert.danger("Pricing Review has already been completed", "Do you still want to proceed? Are you sure?").then(success => {
        //       this.submitPricingReview(obj);
        //     }).catch(cancel => {
        //       return false;
        //     });
        //   } else {
        //     this.submitPricingReview(obj);
        //   }
        // } else {
        //   if (this.prePricingReviewCompleted) {
        //     this.alert.danger("Delivery Review has already been completed", "Do you still want to proceed? Are you sure?").then(success => {
        //       this.submitNonPricingReview(obj);
        //     }).catch(cancel => {
        //       return false;
        //     });
        //   } else {
        //     this.submitNonPricingReview(obj);
        //   }
        // }
      }).catch(cancel => {
        return false;
      });
    } else {
      if (type == "Pricing") {
        if (this.reviewCompleted) {
          this.alert.danger("Pricing Review has already been completed", "Do you still want to proceed? Are you sure?").then(success => {
            this.submitPricingReview(obj);
          }).catch(cancel => {
            return false;
          });
        } else {
          this.alert.submitForPricingReview("").then(success => {
            this.submitPricingReview(obj);
          }, cancel => {
            return;
          });
        }
      } else {
        if (this.prePricingReviewCompleted) {
          this.alert.danger("Delivery Review has already been completed", "Do you still want to proceed? Are you sure?").then(success => {
            this.submitNonPricingReview(obj);
          }).catch(cancel => {
            return false;
          });
        } else {
          this.alert.submitForPrePricingReview("").then(success => {
            this.submitNonPricingReview(obj);
          }, cancel => {
            return;
          });
        }
      }
    }
  }

  submitPricingReview(obj) {
    this.loader = true;
    this._bidService.postReviewData(obj).subscribe(response => {
      this.review_flag = false;
      this._sharedService.submitForReview.emit({ flag: false });
      // this._sharedService.reloadSheet.emit({reload:true});
      this._sharedService.mainPlusButton.emit({ reviewFlag: this.review_flag })
      // notify other users
      var refreshObj = {
        company_id: this.user.company_id,
        bid_id: this.bid_id,
        module: undefined,
        sub_module: "REVIEW"
      }
      this._bidService.refreshContent(refreshObj).subscribe(resp => {
      }, cancel => {
      });
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  submitNonPricingReview(obj) {
    this.loader = true;
    this._bidService.postNonPricingReviewData(obj).subscribe(response => {
      this.reviewNonPriceflag = false;
      this._sharedService.submitForReview.emit({ flag: false });
      // this._sharedService.reloadSheet.emit({reload:true});
      this._sharedService.mainPlusButton.emit({ reviewFlag: this.reviewNonPriceflag })
      // notify other users
      var refreshObj = {
        company_id: this.user.company_id,
        bid_id: this.bid_id,
        module: undefined,
        sub_module: "REVIEW"
      }
      this._bidService.refreshContent(refreshObj).subscribe(resp => {
      }, cancel => {
      });
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  onSubmitProposalReview() {
    /* let mainDataLength = this.mainData[0].main_add.length - 1;
    if (this.mainData[0].main_add[mainDataLength].draft[0].flag) {
      this.alert.sweetError("Please submit Bid Action Summary to proceed");
      return;
    } */
    if (!this.checkResponseCategories(this.proposalData, 'proposal_add')) {
      if (this.proposalData == undefined) {
        this.alert.sweetError("Please create category in Proposal section");
      } else if (this.checkSingleCategorySubmission(this.proposalData, 'proposal_add')) {
        this.alert.customConfirmation("All categories have not been submitted", "Do you want to proceed?").then(success => {
          this.taskForContributorInProposal();
        }).catch(cancel => {
          return false;
        });
      } else {
        this.alert.sweetError("Please submit atleast one category in Proposal section");
        return;
      }
      // return false;
    } else {
      this.taskForContributorInProposal();
    }
  }

  taskForContributorInProposal() {
    let obj = {
      "bid_id": this.bid_id,
      "proposalReview_add": [],
    }
    if (!this.checkResponseTasks(this.proposalData, 'proposal_add')) {
      this.alert.submitReview("Proposal").then(success => {
        return;
        // this.submitProposalReview(obj);
      }, cancel => {
        return;
      });
    } else {
      this.alert.submitForProposalReview("").then(success => {
        this.submitProposalReview(obj)
      }, cancel => {
        return;
      });
    }
  }

  submitProposalReview(obj) {
    this.loader = true;
    this._bidService.createProposalReview(obj).subscribe(response => {
      this.proposalReviewFlag = false;
      this._sharedService.submitForReview.emit({ flag: false });
      // this._sharedService.mainPlusButton.emit({ reviewFlag: this.review_flag })
      // notify other users
      var refreshObj = {
        company_id: this.user.company_id,
        bid_id: this.bid_id,
        module: undefined,
        sub_module: "PROPOSAL_REVIEW"
      }

      this._bidService.refreshContent(refreshObj).subscribe(resp => {
      }, cancel => {
      });
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  onSubmitTechnicalSolnReview() {
    /* let mainDataLength = this.mainData[0].main_add.length - 1;
    if (this.mainData[0].main_add[mainDataLength].draft[0].flag) {
      this.alert.sweetError("Please submit Bid Action Summary to proceed");
      return;
    } */
    if (!this.checkResponseCategories(this.solutionData, 'techsolution_add')) {
      if (this.solutionData == undefined) {
        this.alert.sweetError("Please create category in Solution section");
        return false;
      } else if (this.checkSingleCategorySubmission(this.solutionData, 'techsolution_add')) {
        this.alert.customConfirmation("All categories have not been submitted", "Do you want to proceed?").then(success => {
          this.taskForContributorInSolution();
        }).catch(cancel => {
          return false;
        });
      } else {
        this.alert.sweetError("Please submit atleast one category in Solution section");
        return;
      }
    } else {
      this.taskForContributorInSolution();
    }
  }

  taskForContributorInSolution() {
    let obj = {
      "bid_id": this.bid_id,
      "techSolReview_add": [],
    }
    if (!this.checkResponseTasks(this.solutionData, 'techsolution_add')) {
      this.alert.submitReview("Solution").then(success => {
        return;
        // this.submitSolution(obj);
      }, cancel => {
        return;
      });
    } else {
      this.alert.submitForSolutionReview("").then(success => {
        this.submitSolution(obj);
      }, cancel => {
        return;
      });
    }
  }

  submitSolution(obj) {
    this.loader = true;
    this._bidService.createSolutionReviewData(obj).subscribe(response => {
      this.solutionReviewFlag = false;
      this._sharedService.submitForReview.emit({ flag: false });
      // this._sharedService.mainPlusButton.emit({ reviewFlag: this.review_flag })
      // notify other users
      var refreshObj = {
        company_id: this.user.company_id,
        bid_id: this.bid_id,
        module: undefined,
        sub_module: "SOLUTION_REVIEW"
      }
      this._bidService.refreshContent(refreshObj).subscribe(resp => {
        // console.log("soln submitted by BM >>>>>");
      }, cancel => {
      });
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  onSubmitLegalReview() {
    let legalReviewUser = this.participants.filter(list => {
      return list.userTypes[0].user_subtype == "Legal" && list.userTypes[0].user_type == "REVIEWER"
    })
    if (legalReviewUser.length == 0) {
      this.alert.sweetError("Please select Legal Reviewer in Bid Creation");
      return;
    }

    let val = this.legalData[0].legalRisk_add.filter(a => { return a.draft.length == 2 && a.draft[1].flag });
    if (val.length != 0 || this.legalData[0].legalRisk_add[0].draft.length == 1) {
      this.alert.sweetError("Please submit legal response");
      return;
    }
    
    this.alert.customConfirmation("Are you sure to submit for Legal Review?", "Once submitted, you will not be able to make changes").then(ok => {
      this.loader = true;
      this._bidService.submitForLegalReview({ "bid_id": this.bid_id }).subscribe(resp => {
        this.legalReviewFlag = false;
        var refreshObj = {
          company_id: this.user.company_id,
          bid_id: this.bid_id,
          module: undefined,
          sub_module: "LEGAL_REVIEW"
        }
        this._bidService.refreshContent(refreshObj).subscribe(resp => {
        }, cancel => {
        });
        this.loader = false;
      }, error => {
        this.loader = false;
      });
    }, cancel => {
      return;
    });
  }

  // submit for approval
  onSubmitApproval() {
    if (this.process && this.process.length > 0 && this.process[this.process.length - 1].action == 'RFI' && this.process[this.process.length - 1].status) {
      this.alert.sweetError("Please submit RFI");
      return;
    }
    if (this.mainData && this.mainData[0] && this.mainData[0].main_add && this.mainData[0].main_add.length > 0) {
      let mainDataLength = this.mainData[0].main_add.length - 1;
      if (this.mainData[0].main_add[mainDataLength].draft[0].flag) {
        this.alert.sweetError("Please submit Bid Action Summary to proceed");
        return;
      }
    }
    /* if (!this.approval_flag) {
      this.alert.sweetError("Please Submit approval required section!");
      return
    } */
    // alert for BM that, approval required tab is empty
    if (!this.approval_flag) {
      this.alert.customConfirmation("Approval required is empty", "Do you want to proceed").then(success => {
        if (!this.poc) {
          this.poc = {};
        }
        this.poc['bid_id'] = this.bid_id;
        this.poc['company_id'] = this.user.company_id;
        this.poc['user_id'] = this.user.user_id;
        this.poc['status'] = 'ACTIVE';
        if (this.pocSubmited) {
          this._pocService.updatePocDashboard(this.poc).subscribe(data => {
            this.getPoc();
          }, error => {
          });
        } else {
          this._pocService.createPocDashboard(this.poc).subscribe(data => {
            this.getPoc();
          }, error => {
          });
        }
        this._sharedService.mainPlusButton.emit({ pocSubmited: true })
        var refreshObj = {
          company_id: this.user.company_id,
          bid_id: this.bid_id,
          module: undefined,
          sub_module: "SOLUTION_PRICING",
          page: "sheet"
        }
        this._bidService.refreshContent(refreshObj).subscribe(resp => {
        }, cancel => {
        });
      }, cancel => {
        return;
      });
    } else {
      if (!this.poc) {
        this.poc = {};
      }
      this.poc['bid_id'] = this.bid_id;
      this.poc['company_id'] = this.user.company_id;
      this.poc['user_id'] = this.user.user_id;
      this.poc['status'] = 'ACTIVE';
      this.alert.submitForApproval("").then(success => {
        if (this.pocSubmited) {
          this._pocService.updatePocDashboard(this.poc).subscribe(data => {
            this.getPoc();
          }, error => {
          });
        } else {
          this._pocService.createPocDashboard(this.poc).subscribe(data => {
            this.getPoc();
          }, error => {

          });
        }
        this._sharedService.mainPlusButton.emit({ pocSubmited: true })
        // notify other users
        var refreshObj = {
          company_id: this.user.company_id,
          bid_id: this.bid_id,
          module: undefined,
          sub_module: "SOLUTION_PRICING",
          page: "sheet"
        }
        // this._sharedService.reloadSheet.emit({reload:true});
        this._bidService.refreshContent(refreshObj).subscribe(resp => {
        }, cancel => {
        });
      }, cancel => {
        return;
      });
    }
    // this.RFI ? this.poc['process'] = [] : '';
    // alert(this.RFI + 'rfi');
    // alert(this.pocSubmited + 'pocSubmitted')
  }

  // For Sidebar Menu
  @HostListener('document:click', ['$event'])
  ClickedOut(event) {
    if (event.target.className == "fa fa-bars" || event.target.className == "breadcrumb-item Bid Development" || event.target.innerHTML == "Bid Review" || event.target.innerHTML == " Bid Response" || event.toElement == "li" || event.target.dataset.target == "#solution" ||
      event.target.dataset.target == "#review" || event.target.className == "ul.parent-menu"
      || event.target.className == "fa fa-chevron-down rotate") {
      this.sidebar = true;
    } else {
      this.sidebar = false;
    }
  }

  onDocuments() {
    window.open("/bid-documents/" + this.bid_id);
    return;
  }

  discussionBoard() {
    let discussionBoardFlag = true;
    let path = window.location.pathname.split("/");
    if (path[1] == 'approvalDashboard') {
      discussionBoardFlag = false;
    }
    return discussionBoardFlag;
  }

  goToApproverDashboard() {
    if (this.approvalFlag) {
      this.alert.sweetError("The bid has not been submitted for approval yet")
      return
    }
    this.router.navigateByUrl('/approvalDashboard/' + this.bid_id)
    return
  }

onBidTimeline() {
  let obj =
  {
      "bid_id": this.bid_id
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