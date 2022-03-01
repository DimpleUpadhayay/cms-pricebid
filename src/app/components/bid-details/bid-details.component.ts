import { Component, OnInit, OnDestroy } from '@angular/core';
import { BidService } from '../../services/bid.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-bid-details',
  templateUrl: './bid-details.component.html',
  styleUrls: ['./bid-details.component.css'],
  providers: [BidService, HttpService]
})
export class BidDetailsComponent implements OnInit, OnDestroy {

  private bidSubscribe: any;
  bid: any;
  bid_id;
  participants: any;
  user = JSON.parse(localStorage.getItem('user'))['data']['user'];
  subType = '';
  flags = {
    "SOLUTION": true, "PROPOSAL": true, "PRICING": true, "DOCREQUIRED": true,
    "LEGAL": true,
    "PRE-PRICING": true, "SOLUTION_REVIEW": true, "PROPOSAL_REVIEW": true, "PRICING_REVIEW": true, "PRE-PRICING_REVIEW": true
    , "LEGAL_REVIEW": true
  }
  routerType;
  stage;
  result;
  stageNo;
  StageName;
  allStage = "";

  constructor(public _bidService: BidService,
    public sharedService: SharedService,
    private router: Router,
    public _httpService: HttpService,
    private _activeRoute: ActivatedRoute) {
    this.bid_id = _activeRoute.snapshot.params['id'];
    this.sharedService.reviewType.subscribe(a => {
      this.subType = a.subType ? a.subType : '';
      this.routerType = this.router.url.split('/')[3];
      this.getBidById();
    });
  }

  ngOnInit() {
    if (this.router.url.includes("projectscope") || this.router.url.includes("approvalDashboard") || this.router.url.includes("timeline") || this.router.url.includes("bid-summary") || this.router.url.includes("salesOrderForm") || this.router.url.includes("EMD") || this.router.url.includes("PBG") || this.router.url.includes("EOI"))
      this.getBidById();
  }

  getBidById() {
    this.bidSubscribe = this._bidService.getBidById(this.bid_id).subscribe(data => {
      this.bid = data['data']['bid'];
      if (data['data'] && data['data']['bid'] && data['data']['bid']['bid_stage'] && data['data']['bid']['bid_stage']) {
        let stage = data['data']['bid']['bid_stage']['stage_add'];
        let stageValue = data['data']['bid']['bid_stage'];
        var stagedata = "";
        if (stage) {
          stage.forEach(result => {
            stagedata += result.no + " - " + result.name.replace("Pre-Pricing", "Delivery") + " - " + result.progress + "\n";
          });
          stagedata += "\n";
        }
        this.allStage = stagedata;
        this.StageName = stageValue.stageName;
        this.stageNo = stageValue.total;

        // this.stage = stage[stage.length - 1];
      }
      if (this.bid.participants) {
        this.participants = this.participants && this.participants.length > 0 ? this.participants : this.bid.participants.filter(a => { return a.userTypes[0].user_type != 'APPROVER'; });
        if (this.participants) {
          this.participants.forEach(participant => {
            if (participant.userTypes[0].user_type === 'BID_OWNER') {
              participant.class = 'bid-owner-highlight';
              return
            }
            participant.class = '';
          });
          if (localStorage.getItem('bid_id'))
            this.setCurrentStatus();
        }
      }
    }, error => {
    });
  }

  ngOnDestroy() {
    if (this.bidSubscribe) {
      this.bidSubscribe.unsubscribe();
    }
  }
  setCurrentStatus() {
    let tempContributors = [], tempReviewers = [];
    tempContributors = this.participants.map(a => {
      if (a.userTypes[0].user_type == 'CONTRIBUTOR' || a.userTypes[0].user_type == 'BID_OWNER') {
        return a.user_id
      }
    }).filter(obj => { return obj });
    tempReviewers = this.participants.map(a => {
      if (a.userTypes[0].user_type == 'REVIEWER') {
        return a.user_id
      }
    }).filter(obj => { return obj });

    let obj = {
      contributors: tempContributors, reviewers: tempReviewers,
      bid_id: this.bid_id, typesFlags: this.flags
    }
    this._bidService.getPendingTask(obj).subscribe(resp => {
      this.participants.forEach(element => {
        element.userTypes[0].user_type != 'BID_OWNER' ? element['class'] = 'empty' : ''
        let pendingObj;
        let objIndex = resp['data'].findIndex(a => a.user_id === element.user_id)
        if (objIndex == -1) {
          return
        }

        pendingObj = resp['data'][objIndex]

        switch (this.routerType) {
          case 'solution':
            element['class'] = element['class'] + ' ' + pendingObj.pendingTasks.solution_className
            break;
          case 'proposal':
            element['class'] = element['class'] + ' ' + pendingObj.pendingTasks.proposal_className
            break;
          case 'pricing':
            element['class'] = element['class'] + ' ' + pendingObj.pendingTasks.pricing_className
            break
          case 'docs-required':
            element['class'] = element['class'] + ' ' + pendingObj.pendingTasks.docrequired_className
            break
          case 'legal':
            element['class'] = element['class'] + ' ' + pendingObj.pendingTasks.legal_className
            break
          case 'solution-review':
            element['class'] = element['class'] + ' ' + pendingObj.pendingTasks.solution_review_className
            break;
          case 'proposal-review':
            element['class'] = element['class'] + ' ' + pendingObj.pendingTasks.proposal_review_className
            break;
          case 'pricing-review':
            element['class'] = this.subType === 'getNonPricingReviewData' ? element['class'] + ' ' + pendingObj.pendingTasks['pre-pricing_review_className'] : element['class'] + ' ' + pendingObj.pendingTasks.pricing_review_className
            break;
          case 'legal-review':
            element['class'] = element['class'] + ' ' + pendingObj.pendingTasks.legal_review_className
            break;
        }
      });
    }, error => {
    });
  }

  getSignatures(firstName, lastName) {
    if (firstName != undefined || lastName != undefined) {
      let name = (firstName.trim())[0].toUpperCase() + (lastName.trim())[0].toUpperCase()
      return name
    } else {
      return "NA";
    }
  }

  goToMain() {
    this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
      this.router.navigateByUrl('/bid-development/' + this.bid_id + '/mains'));
  }
}
