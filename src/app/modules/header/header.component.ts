import { Component, OnInit, Input, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { BidService } from '../../services/bid.service';
import { SharedService } from '../../services/shared.service';
import { ChatService } from '../../services/chat.service';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { ViewAssignSheetComponent } from '../../components/view-assign-sheet/view-assign-sheet.component';
import { chain, get, map, find } from "lodash";
import { MatDialog } from '@angular/material';
import _ = require('lodash');
import { SubmissionDateComponent } from '../../components/submission-date/submission-date.component';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [BidService, LoginService, ChatService]
})


export class HeaderComponent implements OnInit, OnDestroy {
  // @ViewChild(DashboardComponent) _bid: DashboardComponent;
  // @ViewChild(HeaderComponent) header: HeaderComponent;
  @ViewChild(AlertComponent) _alert: AlertComponent;
  @Input('show') show;
  approval: boolean = false;
  logoHovered: boolean = false;
  sheetHeader = undefined
  // logoHovered: boolean = false;
  showSubHeader: boolean = false;
  bid;
  participants;
  bidData;
  disabled;
  userData: any;
  userType: string;
  search = "";
  badgeCount: number = 0;
  showing: boolean = false;
  user;
  notifications;
  myUrl;
  results;
  searchFlag = false;
  bid_id;
  bidDevComponent = false;
  userCustomType;
  searchKey = "";
  assignmentData = [];
  loader = false;

  constructor(public router: Router, public loginService: LoginService, public dialog: MatDialog, public _sharedService: SharedService,
    public _bidService: BidService, private _chatService: ChatService) {
    this.bid_id = localStorage.getItem("bid_id");
    this.user = JSON.parse(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user'))['data']['user'] : ""; // user details
    if (this.user['user_type']) {
      this.userCustomType = this.user['user_type'].replace("_", " ");
    }
    this.bidData = JSON.parse(localStorage.getItem('bidData'));
    this.participants = this.bidData ? this.bidData.participants : [];
    _sharedService.disableHeader.subscribe(
      (data) => {
        this.disabled = data.disable;
      }
    );

    this._sharedService.reviewType.subscribe(a => {
      if (this.participants && this.participants.length == 0) {
        return
      }
      this.getIndicatorStatus(a)
    });



    _sharedService.hideFooter.subscribe(data => {
      this.sheetHeader = data.hide ? data.hide : false;
      this.bid = data.bid;
      // console.log(this.bid, "bid");
      if (this.bid && this.bid.participants) {
        this.participants = this.bid.participants.filter(a => { return a.userTypes[0].user_type; })
      }
    })

    if (this.user.user_role == 'CUSTOM') {
      this._chatService.newNotification(this.user.user_id).subscribe(data => {
        this.myUrl = (this.router.url).split('/');
        if (this.user.user_role == 'CUSTOM')
          this.getNotifications();
      });
      this.getNotifications();
      // refresh call after any event occured
      _chatService.refreshContent(this.user.company_id).subscribe(data => {
        // console.log("data >>>>>>>>>>", data);
        if (data != null) {
          var flag = false;
          this.myUrl = (this.router.url).split('/');
          if (this.bidData) {
            this.myUrl.forEach(element => {
              if (element == this.bidData.bid_id) {
                flag = true;
              }
            });
          }
          if (flag || data['module'] == "BID_CREATION" || data['company_id'] == this.user.company_id) {
            this.checkRouting(this.myUrl, data);
          }
        }
      });
    }


    // receive notification on every page change
    if (this.user.user_role == 'CUSTOM')
      this.getNotifications();
  }

  getIndicatorStatus(a) {
    if (a.type == 'new-pricing') {
      this._bidService.getAllAssignmentDataForIndicator({
        bidId: this.bid_id,
      }).subscribe(response => {

        if (response['data'] == null) {
          return;
        }
        this.assignmentData = response['data']['assignmentData'];
        this.participants.forEach(element => {
          element.class = '';
          if (element.userTypes[0].user_type === 'BID_OWNER') {
            element.class = 'bid-owner-highlight';
            return
          }
          if (element.userTypes[0].user_type == 'CONTRIBUTOR' && this.assignmentData.length > 0) {
            if (this.assignmentData.findIndex(b => b.user_id == element.user_id && b.isWorkDone == true) != -1) {
              element.class = "review-success"
            }
            if (this.assignmentData.findIndex(b => b.user_id == element.user_id && b.isWorkDone == false) != -1) {
              element.class = "review-blink"
            }
          }
        });
      });
    }
  }

  // capitalize(word) {
  //     return word.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  // };
  capitalize(phrase) {
    if (!phrase) {
      return
    }
    return phrase
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngOnInit() {
    this._sharedService.bidSearch.subscribe(data => {
      this.disabled = data.disable;
      this.search = "";
    });
    this._sharedService.headerEvent.subscribe(data => {
      this.userData = data.userData;
      // console.log("userDataHeader", this.userData)
      this.user = data.userData;

      if (this.user['user_type']) {
        this.userCustomType = this.user['user_type'].replace("_", " ");
      }
      if (this.user.user_role == 'CUSTOM') {
        this._chatService.newNotification(this.user.user_id).subscribe(data => {
          this.myUrl = (this.router.url).split('/');
          if (this.user.user_role == 'CUSTOM')
            this.getNotifications();
        });
        this.getNotifications();

        // refresh call after any event occured
        this._chatService.refreshContent(this.user.company_id).subscribe(data => {
          // console.log("data >>>>>>>>>>", data);
          if (data != null) {
            var flag = false;
            this.myUrl = (this.router.url).split('/');
            if (this.bidData) {
              this.myUrl.forEach(element => {
                if (element == this.bidData.bid_id) {
                  flag = true;
                }
              });
            }
            if (flag || data['module'] == "BID_CREATION" || data['company_id'] == this.user.company_id) {
              this.checkRouting(this.myUrl, data);
            }
          }
        });
      }
    });

    this.loginService.getUserData().subscribe((data: any) => {
      this.userData = data ? data : '';
      // if (data && data.user_type == "BID_OWNER") {
      //   data.user_type = "Bid Owner"
      // } else if (data && data.user_type == "CONTRIBUTOR") {
      //   data.user_type = "Contributor"
      // } else if (data && data.user_type == "REVIEWER") {
      //   data.user_type = "Reviewer"
      // } else if (data && data.user_type == "APPROVER") {
      //   data.user_type = "Approver"
      // } else if (data && data.user_type == "COMPANY_ADMIN") {
      //   data.user_type = "Company Admin"
      // }
    });


    // $(".rotate").click(function () {
    //   $(this).toggleClass("up");
    // })

  }

  ngOnDestroy(): void {
    this.disabled = false;
  }

  // redirect to respective modules
  checkRouting(myUrl, data) {
    if (data['module'] == "BID_CREATION" && myUrl[1] == "dashboard") {
      this._sharedService.newData.emit({ data: "bid_creation" });
    } else if (data['module'] == "BID_CLONE" && myUrl[1] == "dashboard") {
      this._sharedService.newData.emit({ data: "bid_creation" });
    } else if (data['module'] == "PROJECT_SCOPE" && myUrl[1] == "projectscope") {
      this._sharedService.newData.emit({ data: "project_scope" });
    } else if (data['module'] == "SCHEDULING" && myUrl[1] == "scheduling") {
      this._sharedService.newData.emit({ data: "scheduling" });
    } else if (data['sub_module'] == "PRICING" && (myUrl[3] == "pricing" || myUrl[3] == "mains")) {
      this._sharedService.newData.emit({ data: "pricing" });
    } else if (data['sub_module'] == "PROPOSAL" && (myUrl[3] == "proposal" || myUrl[3] == "mains")) {
      this._sharedService.newData.emit({ data: "proposal" });
    } else if (data['sub_module'] == "SOLUTION" && (myUrl[3] == "solution" || myUrl[3] == "mains")) {
      this._sharedService.newData.emit({ data: "solution" });
    } else if (data['sub_module'] == "LEGAL" && myUrl[3] == "legal") {
      this._sharedService.newData.emit({ data: "legal" });
    } else if (data['sub_module'] == "MAIN" && myUrl[3] == "mains") {
      this._sharedService.newData.emit({ data: "main" });
    } else if (data['sub_module'] == "REVIEW" && (myUrl[3] == "pricing-review" || myUrl[3] == "pricing" || myUrl[3] == "mains" || myUrl[2] == "sheets")) {
      this._sharedService.newData.emit({ data: "review" });
    } else if (data['sub_module'] == "PROPOSAL_REVIEW" && (myUrl[3] == "proposal-review" || myUrl[3] == "proposal")) {
      this._sharedService.newData.emit({ data: "proposal-review" });
    } else if (data['sub_module'] == "SOLUTION_REVIEW" && (myUrl[3] == "solution-review" || myUrl[3] == "solution")) {
      this._sharedService.newData.emit({ data: "solution-review" });
    } else if (data['sub_module'] == "LEGAL_REVIEW" && (myUrl[3] == "legal-review" || myUrl[3] == "legal")) {
      this._sharedService.newData.emit({ data: "legal-review" });
    } else if (data['sub_module'] == "APPROVAL_REQUIRED" && myUrl[3] == "approvalrequired") {
      this._sharedService.newData.emit({ data: "approvalrequired" });
    } else if (data['module'] == "BID_APPROVAL" && data['sub_module'] == 'RFI') {
      if (myUrl[3] == "rfi" || myUrl[2] == "sheets" || myUrl[1] == "approvalDashboard")
        this._sharedService.newData.emit({ data: "rfi" });
      this._sharedService.newData.emit({ data: "approval" });
    } else if (data['module'] == "BID_APPROVAL" && data['sub_module'] != 'RFI') {
      if (myUrl[2] == "sheets")
        this._sharedService.newData.emit({ data: "spreadsheet" });
      else if (myUrl[1] == "approvalDashboard")
        this._sharedService.newData.emit({ data: "approvalDashboard" });
      else if (myUrl[1] == "dashboard")
        this._sharedService.newData.emit({ data: "approval" });
    } else if (data['sub_module'] == "SOLUTION_PRICING") {
      if (myUrl[1] == "dashboard") {
        this._sharedService.newData.emit({ data: "approval" });
      } else if (myUrl[1] == "approvalDashboard") {
        this._sharedService.newData.emit({ data: "approvalDashboard" });
      } else if (myUrl[2] == "sheets") {
        if (myUrl[3] == data.bid_id) {
          var url = this.router.url;
          this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
            this.router.navigate([url]));
        }
      } else if (myUrl[3] == "mains") {
        this._sharedService.newData.emit({ data: "spreadsheet" });
      }
    } else if (data['sub_module'] == "RISK_ASSESSMENT" && myUrl[3] == "risk-assessment") {
      this._sharedService.newData.emit({ data: "risk-assessment" });
    } else if (data['sub_module'] == "SOLUTION-NEW" && myUrl[3] == "solution") {
      this._sharedService.newData.emit({ data: "solution-new" });
    } else if (data['sub_module'] == "SOLUTION_REVIEW" && myUrl[3] == "solution-review") {
      this._sharedService.newData.emit({ data: "solution-new-review" });
    } else if (data['sub_module'] == "DOC-REQ" && myUrl[3] == "docs-required") {
      this._sharedService.newData.emit({ data: "docs-required" });
    } else if (data['module'] == "BID_DEVELOPMENT" && data['sub_module'] == 'RISK_ASSESSMENT') {
      this._sharedService.newData.emit({ data: "risk-assessment" });
    }
  }

  // fetch notification data from DB
  getNotifications() {
    this._bidService.getNotifications({ user_id: this.user.user_id, dismiss: false }).subscribe(success => {
      if (success['data'] == null) {
        return;
      }
      this.notifications = success['data'].reverse();
      this.notifications.forEach(element => {
        element.assigned_to = element.assigned_to.filter(a => {
          return a.user_id == this.user.user_id;
        });
      });
      this.badgeCount = 0;
      this.notifications.forEach(element => {
        if (element.assigned_to[0] && element.assigned_to[0].user_id == this.user.user_id && !element.assigned_to[0].read) {
          this.badgeCount++;
        }
      });
      this.results = chain(this.notifications).groupBy("bid_id").map(function (v, i) {
        return {
          bid_id: i,
          bid_name: get(find(v, 'bid_name'), 'bid_name'),
          account_name: get(find(v, 'account_name'), 'account_name'),
          assigned_to: map(v, 'assigned_to'),
          task: map(v, 'task'),
          module: map(v, 'module'),
          sub_module: map(v, 'sub_module'),
          _id: map(v, '_id'),
          date_created: map(v, 'date_created'),
          notify: []
        }
      }).value();

      this.results.forEach(element => {
        for (var i = 0; i < element.task.length; i++) {
          element['notify'].push({
            _id: element._id[i],
            task: element.task[i],
            assigned_to: element.assigned_to[i],
            module: element.module[i],
            sub_module: element.sub_module[i],
            date_created: element.date_created[i],
          })
        }
      });
      // // console.log(">>>>>>>>", this.results);
    }, error => {
      // console.log("error", error);
    });
  }

  // mark as read
  onReadNotification(item, result) {
    let obj = {
      _id: item._id,
      user_id: item.assigned_to[0].user_id
    }
    if (!item.assigned_to[0].read) {
      this._bidService.updateNotification(obj).subscribe(success => {
        this.getNotifications();
      }, error => {
        // console.log(error);
      });
    }

    if (item['module'] == "BID_CREATION") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/mains'));
    } else if (item['module'] == "PROJECT_SCOPE") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/projectscope/' + result.bid_id));
    } else if (item['module'] == "SCHEDULING") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/scheduling/' + result.bid_id));
    } else if (item['sub_module'] == "SOLUTION") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/pricing'));
    } else if (item['sub_module'] == "SOLUTION_PRICING") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/mains'));
    } else if (item['sub_module'] == "REVIEW") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/pricing-review'));
    } else if (item['module'] == "BID_DEVELOPMENT" && item['sub_module'] == "TECHNICAL_SOLUTION") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/solution'));
    } else if (item['module'] == "BID_DEVELOPMENT" && item['sub_module'] == "TECHNICAL_SOLUTION_REVIEW") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/solution-review'));
    } else if (item['module'] == "BID_DEVELOPMENT" && item['sub_module'] == "PROPOSAL") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/proposal'));
    } else if (item['module'] == "BID_DEVELOPMENT" && item['sub_module'] == "PROPOSAL_REVIEW") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/proposal-review'));
    } else if (item['module'] == "BID_DEVELOPMENT" && item['sub_module'] == "LEGAL") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/legal'));
    } else if (item['module'] == "BID_DEVELOPMENT" && item['sub_module'] == "LEGAL_REVIEW") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/legal-review'));
    } else if (item['module'] == "BID_DEVELOPMENT" && item['sub_module'] == "DOC_REQUIRED") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/docs-required'));
    } else if (item['module'] == "BID_APPROVAL" && item['sub_module'] == 'RFI') {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/rfi'));
    } else if (item['module'] == "BID_DEVELOPMENT" && item['sub_module'] == 'RISK_ASSESSMENT') {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid-development/' + result.bid_id + '/risk-assessment'));
    } else if (item['module'] == "BID_APPROVAL" && item['sub_module'] != 'RFI') {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/approvalDashboard/' + result.bid_id));
    } else if (item['module'] == "USERDELETION") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/bid/' + result.bid_id));
    } else if (item['module'] == "SOF" && item['sub_module'] == "SUBMITTED") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/salesOrderForm/' + result.bid_id));
    } else if (item['module'] == "EMD" && item['sub_module'] == "SUBMITTED") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/EMD/' + result.bid_id));
    }else if (item['module'] == "PBG" && item['sub_module'] == "SUBMITTED") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/PBG/' + result.bid_id));
    }
    else if (item['module'] == "EOI" && item['sub_module'] == "SUBMITTED") {
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/EOI/' + result.bid_id));
    }
    console.log(item['module']);
    this.showing = false;
  }

  // update submission date if submission date is over
  checkSubmissionDate(item, result, status) {
    this.clearCount();
    if (status == "yes") {
      this.updateSubmissionDate(item);
      let obj = {
        bid_id: result.bid_id,
        bid_submit: true
      }
      this._bidService.updateSubmissionDate(obj).subscribe(success => {
      }, error => {
      })
      return;
    }
    let obj;
    obj = {
      "item": item,
      "bid_id": result.bid_id,
      "status": status
    }
    const dialogRef = this.dialog.open(SubmissionDateComponent, {
      height: '300px',
      width: '300px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getNotifications();
      }
    });
  }

  updateSubmissionDate(item) {
    let obj = {
      _id: item._id,
      user_id: item.assigned_to[0].user_id,
      type: "BID_SUBMIT"
    }
    this._bidService.updateNotification(obj).subscribe(success => {
      this._alert.sweetSuccess("Data has been recored");
      this.getNotifications();
    }, error => {
      // console.log(error);
    });
  }

  clearCount() {
    this.searchKey = "";
    this.showing = !this.showing
    //this.badgeCount = 0;
  }

  // remove notification
  onDismiss(item, result) {
    let obj = {
      _id: item._id,
      user_id: item.assigned_to[0].user_id
    }
    this._bidService.dismissNotification(obj).subscribe(success => {
      this.getNotifications();
    }, error => {
      // console.log(error);
    });
  }

  onClear() {
    this.search = "";
    this._sharedService.searchUpdated.emit({ search: this.search })
  }

  // mark all as read
  onMarkAsRead() {
    this._bidService.updateNotifications({ user_id: this.user.user_id }).subscribe(success => {
      this.getNotifications();
    }, error => {
      // console.log(error);
    });
  }

  // dismiss all notifications
  onDismissAll() {
    this._bidService.dismissNotifications({ user_id: this.user.user_id }).subscribe(success => {
      this.getNotifications();
    }, error => {
      // console.log(error);
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    var element = event.target as HTMLElement;
    if (!element.classList.contains('breadcrumb-item')) {
      this.logoHovered = false;
    }
    if (event.toElement == "li" || event.target.innerHTML == "Company Settings" || event.target.innerHTML == " User Settings" || event.target.innerHTML == "Master Data" || event.target.dataset.target == "#solution" ||
      event.target.dataset.target == "#review" || event.target.className == "ul.parent-menu"
      || event.target.dataset.target == "#companySetting" || event.target.dataset.target == "#userSetting" || event.target.dataset.target == "#masterData" || event.target.className == "fa fa-chevron-down rotate") {

      this.logoHovered = true
    }
    else {
      this.logoHovered = false;
    }
  }


  // close notification panel on outside click
  ClickedOut(event) {
    if (event.target.className == "fa fa-bell" || event.target.className == "fa fa-bell ng-star-inserted") {
      this.showing = true;
    } else {
      this.showing = false;
    }
  }



  setBidData(bid) {
    // // this.sheetHeader = true;
    // this.bid = bid;
    // this.participants = bid.participants.filter(a => { return a.user_type; })
  }

  hideSearch() {
    this.disabled = true;
  }

  changePassword() {

    this._sharedService.changePassword.emit({ show: true, user: this.user });

  }

  changeState() {
    if (this.userData && this.userData.user_role == 'CUSTOM') {
      // this.router.navigateByUrl('/dashboard');
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/dashboard'));
    } else if (this.userData.user_role == 'COMPANY_ADMIN') {
      this.router.navigateByUrl('/viewCompany');
    } else if (this.userData.user_role == 'SUPPORT') {
      this.router.navigateByUrl('/company/list');
    }
    else if (this.userData.user_role == 'SUPPORT') {
      this.router.navigateByUrl('/company/list');
    }
  }

  getSignatures(username) {
    if (username) {
      return username.split(' ')[0][0].toUpperCase() + (username.split(' ')[1] ? username.split(' ')[1][0].toUpperCase() : '')
    }
    return
  }

  approvalDone() {
    this.approval = true;
  }

  //  bid search
  searchData() {
    this.searchFlag = true;
    this._sharedService.searchUpdated.emit({ search: this.search })
    // this._bid.filterBids(this.search);
  }

  changeStatus() {
    if (this.userData.user_role && this.userData.user_role == 'CUSTOM') {
      this.router.navigateByUrl('/dashboard');
      return;
    }
    this.logoHovered = true;
  }

  // logout from console
  doLogout() {
    // this._chatService.socket.disconnect();
    this.search = '';
    this._chatService.logoutSoket().subscribe(data => {
    });
    this.loginService.doLogout();
    // console.log(this._chatService.socket.disconnected);
  }
  sheetNames;
  username = [];
  getViewAssign() {
    this.loader = true;
    var sheetId = null;
    var userId = this.user.user_id;
    _.each(this.bidData.sheetIds, function (n) {
      if (n.user_id == userId) {
        sheetId = n.sheetId;
      }
    });
    if (sheetId == null) {
      _.each(this.bidData.sheetIds, function (n) {
        if (n.userType == "APPROVER") {
          sheetId = n.sheetId;
        }
      });
    }

    let obj = {
      bidId: this.bid_id,
      sheetId: sheetId,
      userType: this.user.user_type,
      user_id: this.user.user_id
    }

    var userObj = JSON.parse(localStorage.getItem('pricingUserDetails'));

    obj.userType = userObj.userType;
    obj.sheetId = userObj.sheetId;

    this._bidService.getAssignmentData(obj).subscribe(res => {
      if (res['data'] == null) {
        this.loader = false;
        return;
      } else if (res['data'].length == 1) {
        this._alert.sweetError("No Assignment");
        this.loader = false;
      } else {
        this.sheetNames = res['data'];
        /*  this.sheetNames.forEach(item => {
           this.participants.forEach(result => {
             if (item.user_id == result.user_id && item.userType == "CONTRIBUTOR") {
               let obj = {
                 username: result.fullname,
                 sheetName: item.sourceSheetName
               }
               this.username.push(obj);
             }
           })
         }) */
        const dialogRef = this.dialog.open(ViewAssignSheetComponent, {
          height: '350px',
          width: '630px',
          data: this.sheetNames
        });
        dialogRef.afterClosed().subscribe(result => {

        });
      }

    })
  }
}