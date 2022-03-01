import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UploadfileComponent } from '../../upload-file/upload-file.component';
import { DownloadComponent } from '../../download/download.component';
import { BidService } from '../../../services/bid.service';
import { Validators, FormBuilder } from '@angular/forms';
import { competitor } from '../../../models/competitor.model';
import { ActivatedRoute, Router } from '@angular/router';
import { isUndefined } from 'util';
import { AlertComponent } from '../../../libraries/alert/alert.component';

import * as validatorCtrl from '../../../libraries/validation';
import { pull } from "lodash";
import { CompAccountInfoComponent } from '../../compAccountInfo/compAccountInfo.component';
import _ = require('lodash');
import { HttpService } from '../../../services/http.service';
var rootScope;

declare var $: any;

@Component({
  selector: 'app-competitor',
  templateUrl: './competitor.component.html',
  styleUrls: ['./competitor.component.css'],
  providers: [BidService]
})

export class CompetitorComponent implements OnInit, OnDestroy {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  public summaryForm;
  public positive;
  formsubmitted = false;
  competsubmitted = false;
  validate = true;
  respCompet;
  respCreate;
  user;
  company_id;
  bid;
  bid_id;
  submissionDate;
  flag = true;
  scoreT = ["T1", "T2", "T3", "T4"]
  scoreC = ["L1", "L2", "L3", "L4"]
  model = 'some text';
  result;
  versionData;
  downloadIndex;
  searchData1 = [];
  searchData2 = [];
  searchData3 = [];
  searchDataArray = [];
  searchDataArray2 = [];
  activeSearch;
  account_name_info;
  competitor;
  a = [];
  bidResult = ["Won", "Loss", "No Decision", "Awaiting"]
  bidReason = ["Technical Rating low", "High Price", "Poor Customer Relationship", "Disqualification during evaluation", "Customer retained Incumbent",
    "Lacking OEM support", "Competition's better relationship", "Existing Delivery Issues (Renewal / CS / US)"];
  access;
  user_type;
  user_subtype;
  loader = false;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.target && event.target['id'] == "competition" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8)) {
      this.showResults(event);
    } else if ((event.target && event.target['id'] == "competition1" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8))) {
      this.showResults1(event);
    } else if ((event.target && event.target['id'] == "competition2" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8))) {
      this.showResults2(event);
    }
    else if ((event.target && event.target['id'] == "competition3" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8))) {
      this.showResults3(event);
    }
  }

  constructor(public dialog: MatDialog, private _bidService: BidService, public _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute, public router: Router, private ref: ChangeDetectorRef,
    private _httpService: HttpService) {
    rootScope = this;
    this.competitor = new competitor();

    this.bid_id = _activeRoute.snapshot.params['id']
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.company_id = this.user.company_id;
    this.competitor = {
      "company_id": this.company_id,
      "bid_id": this.bid_id,
      "submit_flag": false,
      "bid_submit": false,
      "bid_winner": "",
      "bid_winner_value": "",
      "bid_result": "",
      "reason": "",
      "bid_our_value": "",
      "result_date": "",
      "remarks": "",
      "positive_point": [''],
      "new_point": [""],
      competition: [{
        "competitor_id": undefined,
        "index_no": 0,
        "status": true,
        "solution_component": [{
          "componentName": "",
          "componentId": "",
          "technicalName": "",
          "commercialValue": null
        }],
        "total": null,
        "score": {
          "technical": "",
          "commercial": ""
        }
      }, {
        "competitor_id": undefined,
        "index_no": 0,
        "status": true,
        "solution_component": [{
          "componentName": "",
          "componentId": "",
          "technicalName": "",
          "commercialValue": null
        }],
        "total": null,
        "score": {
          "technical": "",
          "commercial": ""
        }
      }, {
        "competitor_id": undefined,
        "index_no": 0,
        "status": true,
        "solution_component": [{
          "componentName": "",
          "componentId": "",
          "technicalName": "",
          "commercialValue": null
        }],
        "total": null,
        "score": {
          "technical": "",
          "commercial": ""
        }
      }, {
        "competitor_id": undefined,
        "index_no": 0,
        "status": true,
        "solution_component": [{
          "componentName": "",
          "componentId": "",
          "technicalName": "",
          "commercialValue": null
        }],
        "total": null,
        "score": {
          "technical": "",
          "commercial": ""
        }
      }]
    }
    this.summaryForm = _formBuilder.group({
      bid_submit: ["", Validators.compose([Validators.required])],
      bid_result: ["", Validators.compose([Validators.required])],
      bid_winner: ["", Validators.compose([Validators.required])],
      bid_winner_value: ["", Validators.compose([Validators.required])],
      bid_our_value: ["", Validators.compose([Validators.required])],
      result_date: ["", Validators.compose([Validators.required])],
      remarks: ["", Validators.compose([Validators.required])],
      positive_point: [''],
      new_point: [''],
      solution_component: [],
      total: [],
      score: []
    });



    // default compition object
    this.accessControl();
    this.readData()
    this.getBidById();
    this.competitorRead();
    this.otherCompetitorRead();
    this.competitorList();
  }

  bid_winner = "";
  // won() {
  //   let obj = {
  //     "company_id": this.user.company_id,
  //     "pageNo": 1,
  //     "isCompany": true,
  //     "status": "ACTIVE"
  //   }
  //   this._bidService.competitorRead(obj).subscribe(resp => {
  //     if (resp['data'] == null) {
  //       return;
  //     }
  //     let data = [];
  //     data = resp['data']['competition_data'];
  //     if (data && data.length == 1) {
  //       this.bid_winner = data[0].competitor_name;
  //       this.competitor.bid_winner = data[0]._id;
  //     }
  //   })
  // }
  // || this.competitor.bid_result == 'No Decision' || this.competitor.bid_result == 'Dropped' || this.competitor.bid_result == 'Awaiting'
  onBidResult() {
    if (this.competitor.bid_result == 'Won' || this.competitor.bid_result == 'Loss') {
      this.competitor.bid_submit = true;
    } else {
      this.competitor.result_date = "";
    }
    if (this.competitor.bid_result == 'Loss' || this.competitor.bid_result == 'No Decision' || this.competitor.bid_result == 'Awaiting') {
      this.bid_winner = "";
      this.competitor.bid_winner_value = "";
      this.competitor.bid_our_value = "";
      this.competitor.result_date = "";
      this.searchDataArray.length = 1;
    }
    if (this.competitor.bid_result == 'Loss') {
      this.competitor.reason = "";
    }
    if (this.competitor.bid_result == 'Won') {
      let obj = {
        "company_id": this.user.company_id,
        "pageNo": 1,
        "isCompany": true,
        "status": "ACTIVE"
      }
      this._bidService.competitorRead(obj).subscribe(resp => {
        if (resp['data'] == null) {
          return;
        }
        let data = [];
        data = resp['data']['competition_data'];
        if (data && data.length == 1) {
          this.bid_winner = data[0].competitor_name;
          this.competitor.bid_winner = data[0]._id;
        }
      }, error => {

      })
    }
  }

  onBidWinningValue() {
    if (this.competitor.bid_result == 'Won') {
      this.competitor.bid_our_value = this.competitor.bid_winner_value
    }
  }


  ngOnInit() {
    this.loader = true;
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  accessControl() {
    this._httpService.accessControl({
      "module": "WIN_LOSS_SUMMARY",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": false
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
      // console.log(this.access);
    }, error => {
    });
  }

  trackByFn(index: any, item: any) {
    return index;
  }


  // get list of competition names on keyboard input
  showResults(event) {
    // if (this.competitor.submit_flag/* this.bid.revision_status */) {
    //   return;
    // }
    var searchText = this.bid_winner;
    if (searchText.length == 0) {
      this.searchDataArray = undefined;
      this.searchDataArray = [];
      this.searchDataArray.length = 1;
      $("#showResults").hide();
      return;
    }
    let obj = {
      "company_id": this.user.company_id,
      "competitor_name": searchText,
      "pageNo": 1,
      "size": 20,
      "status": "ACTIVE"
    }
    this._bidService.competitorRead(obj).subscribe(response => {
      if (response['data'] == null) {
        return;
      }
      if (response && response['data']) {
        // console.log(response['data'])
        // this.accountNameFlag = false;
        this.searchDataArray = response['data']['competition_data'].length > 0 ? response['data']['competition_data'] : undefined;
        this.searchDataArray2 = response['data']['competition_data'].length > 0 ? response['data']['competition_data'] : undefined;
        $("#showResults").show();
      } else {
        this.searchDataArray = [];
        // this.accountNameFlag = true;
      }
    }, error => {
      this.searchDataArray = [];
      this.searchDataArray2 = [];
    });
  }


  // ================Competitor SearchResult1 Starts Here =================
  showResults1(event) {
    if (this.competitor.submit_flag/* this.bid.revision_status */) {
      return;
    }
    var searchText = this.competitor1;
    if (searchText.length == 0) {
      this.searchData1 = undefined;
      this.searchData1 = [];
      $("#showResults1").hide();
      return;
    }
    let obj = {
      "company_id": this.user.company_id,
      "competitor_name": searchText,
      "pageNo": 1,
      "size": 20,
      "status": "ACTIVE"
    }
    this._bidService.competitorRead(obj).subscribe(response => {
      if (response['data'] == null) {
        return;
      }
      if (response && response['data']) {
        this.searchData1 = response['data']['competition_data'].length > 0 ? response['data']['competition_data'] : undefined;
        this.searchDataArray2 = response['data']['competition_data'].length > 0 ? response['data']['competition_data'] : undefined;
        $("#showResults1").show();
      } else {
        this.searchData1 = [];
      }
    }, error => {
      this.searchData1 = [];
    })
  }

  competitor1 = "";
  setData1(id, name) {
    $("#showResults1").hide();
    this.competitor1 = name;
    this.competitor.competition[1].competitor_id = id;
  }

  // ================Competitor SearchResult2 Starts Here =================
  showResults2(event) {
    if (this.competitor.submit_flag/* this.bid.revision_status */) {
      return;
    }
    var searchText = this.competitor2;
    if (searchText.length == 0) {
      this.searchData2 = undefined;
      this.searchData2 = [];
      $("#showResults2").hide();
      return;
    }
    let obj = {
      "company_id": this.user.company_id,
      "competitor_name": searchText,
      "pageNo": 1,
      "size": 20,
      "status": "ACTIVE"
    }
    this._bidService.competitorRead(obj).subscribe(response => {
      if (response['data'] == null) {
        return;
      }
      if (response && response['data']) {
        this.searchData2 = response['data']['competition_data'].length > 0 ? response['data']['competition_data'] : undefined;
        $("#showResults2").show();
      } else {
        this.searchData2 = [];
      }
    }, error => {
      this.searchData2 = [];
      // this.searchDataArray2 = [];
    })
  }
  competitor2 = "";
  setData2(id, name) {
    $("#showResults2").hide();
    this.competitor2 = name;
    this.competitor.competition[2].competitor_id = id;
  }
  // ================Competitor SearchResult3 Starts Here =================
  showResults3(event) {
    if (this.competitor.submit_flag/* this.bid.revision_status */) {
      return;
    }
    var searchText = this.competitor3;
    if (searchText.length == 0) {
      this.searchData3 = undefined;
      this.searchData3 = [];
      $("#showResults3").hide();
      return;
    }
    let obj = {
      "company_id": this.user.company_id,
      "competitor_name": searchText,
      "pageNo": 1,
      "size": 20,
      "status": "ACTIVE"
    }
    this._bidService.competitorRead(obj).subscribe(response => {
      if (response['data'] == null) {
        return;
      }
      if (response && response['data']) {
        this.searchData3 = response['data']['competition_data'].length > 0 ? response['data']['competition_data'] : undefined;
        $("#showResults3").show();
      } else {
        this.searchData3 = [];
      }
    }, error => {
      this.searchData3 = [];
      // this.searchDataArray2 = [];
    })
  }
  competitor3 = "";
  setData3(id, name) {
    $("#showResults3").hide();
    this.competitor3 = name;
    this.competitor.competition[3].competitor_id = id;
  }
  // end for competitor Serach3 (show result )>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  // bid details
  getBidById() {
    this._bidService.getBidById(this.bid_id).subscribe(data => {
      this.bid = data['data']['bid'];
      if (!this.competitor._id) {
        this.competitor.bid_submit = this.bid.bid_submit;
      }
      localStorage.setItem("bidData", JSON.stringify(this.bid));
      let dt = new Date(this.bid.date_submission)
      this.submissionDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    }, error => {
    })
  }

  // read compitition
  competitorRead() {
    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      "status": "ACTIVE"
    }
    this._bidService.competitorRead(obj).subscribe(resp => {
      if (resp['data'] == null) {
        return;
      }
      this.searchDataArray = resp['data']['competition_data'];
      // this.accountNameFlag = false;
      if (this.bid_winner) {
        this.competitor.bid_winner = this.searchDataArray.filter(a => { return a.competitor_name == this.bid_winner; })[0]._id;
      }
    }, error => {
    })
  }

  CompetitorSearch() {
    let validate = true;
    let competitorSearch1 = this.compListName.filter(a => {
      return a.competitor_name == this.competitor1
    })
    if (competitorSearch1.length == 0 && this.competitor1 != "Competitor 1") {
      this.competitor1 = "Competitor 1";
      this.competitor.competition[1].competitor_id = "";
      // validate = false;
    } else if (competitorSearch1.length != 0) {
      this.competitor.competition[1].competitor_id = competitorSearch1[0]._id;
    }

    let competitorSearch2 = this.compListName.filter(a => {
      return a.competitor_name == this.competitor2
    })
    if (competitorSearch2.length == 0 && this.competitor2 != "Competitor 2") {
      this.competitor2 = "Competitor 2"
      this.competitor.competition[2].competitor_id = "";
      // validate = false;
    } else if (competitorSearch2.length != 0) {
      this.competitor.competition[2].competitor_id = competitorSearch2[0]._id;
    }

    let competitorSearch3 = this.compListName.filter(a => {
      return a.competitor_name == this.competitor3
    })
    if (competitorSearch3.length == 0 && this.competitor3 != "Competitor 3") {
      this.competitor3 = "Competitor 3";
      this.competitor.competition[3].competitor_id = "";
      // validate = false;
    } else if (competitorSearch3.length != 0) {
      this.competitor.competition[3].competitor_id = competitorSearch3[0]._id;
    }
    return validate;
  }

  compListName = [];
  competitorList() {
    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      "status": "ACTIVE"
    }
    this._bidService.competitorRead(obj).subscribe(resp => {
      if (resp['data'] == null) {
        return;
      }
      this.compListName = resp['data']['competition_data'];
    }, error => {
    })
  }


  our_offer = "Our Offer";
  otherCompetitorRead() {
    let obj = {
      "company_id": this.user.company_id,
      "isCompany": true,
      "pageNo": 1,
      "status": "ACTIVE"
    }
    this._bidService.competitorRead(obj).subscribe(resp => {
      if (resp['data'] == null) {
        return;
      }
      let data = resp['data']['competition_data'];
      if (data && data.length != 0) {
        this.our_offer = data[0].competitor_name;
        this.competitor.competition[0].competitor_id = data[0]._id;
      }
    }, error => {
    })
  }

  setData(id, name) {
    // this.bid.account_id = id;
    // this.account_name_info = this.searchDataArray.filter(a => {
    //   return a._id == id;
    // })
    // this.searchDataArray = undefined;
    $("#showResults").hide();
    this.competitor.bid_winner = id;
    this.bid_winner = name;
  }

  addAccount() {
    if (this.competitor.submit_flag) {
      return;
    }
    const dialogRef = this.dialog.open(CompAccountInfoComponent, {
      height: '350px',
      width: '570px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bid_winner = result.competitor_name;
        this.competitorRead();
        this.competitorList();
      }
    }, error => {
    });
  }

  editable_elements;
  // fetch compitition details
  readData() {
    this._bidService.getCompetition({ "bid_id": this.bid_id }).subscribe((resp) => {
      if (resp['data'] == null) {
        this.loader = false;
        return;
      } else {
        if (resp['data'].bid_summary_data && resp['data'].bid_summary_data.length > 0) {
          rootScope.competitor = resp['data'].bid_summary_data[0];
          rootScope.competitor.bid_winner_valueRegexValid = true;
          rootScope.competitor.bid_our_valueRegexValid = true;
          this.competitor1 = rootScope.competitor.competition[1].competitor_id ? rootScope.competitor.competition[1].competitor_id.competitor_name : "Competitor 1"
          this.competitor2 = rootScope.competitor.competition[2].competitor_id ? rootScope.competitor.competition[2].competitor_id.competitor_name : "Competitor 2"
          this.competitor3 = rootScope.competitor.competition[3].competitor_id ? rootScope.competitor.competition[3].competitor_id.competitor_name : "Competitor 3"
          this.editable_elements = document.querySelectorAll("[contenteditable=true]");
          if (rootScope.competitor.submit_flag) {
            // console.log("this.editable_elements",this.editable_elements);
            // rootScope.showReadOnlyHeader = true;
            // this.editable_elements[0].setAttribute("contentEditable", false);
            // this.editable_elements[1].setAttribute("contentEditable", false);
            // this.editable_elements[2].setAttribute("contentEditable", false);
          }
          if (rootScope.competitor.bid_winner) {
            this.bid_winner = rootScope.competitor.bid_winner.competitor_name ? rootScope.competitor.bid_winner.competitor_name : "";
          } else {
            this.bid_winner = "";
          }
        }
      }
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }

  // get commercial values in table
  total(index) {
    var totalValue = 0;
    setTimeout(function () {
      _.each(rootScope.competitor.competition[index].solution_component, function (n) {
        totalValue = totalValue + ((n.commercialValue == null || n.commercialValue == "" || isNaN(n.commercialValue)) ? 0 : parseFloat(n.commercialValue));
      });
      rootScope.competitor.competition[index].total = totalValue.toFixed(2);
    }, 100);
    this.ref.detectChanges();
  }

  onAddPositive() {
    if (this.user.user_id != this.bid.user_id) {
      return;
    }
    this.competitor.positive_point.push('');
  }

  onDeletePositive(i) {
    if (this.competitor.positive_point.length == 1 /* || this.competitor.submit_flag */ || this.user.user_id != this.bid.user_id) {
      return
    }
    this._alert.deleted("").then(success => {
      this.competitor.positive_point.splice(i, 1);
    });
  }

  onAddNewPoint() {
    if (this.user.user_id != this.bid.user_id) {
      return;
    }
    this.competitor.new_point.push("");
  }

  onDeleteNewPoint(i) {
    if (this.competitor.new_point.length == 1 /* || this.competitor.submit_flag */ || this.user.user_id != this.bid.user_id) {
      return
    }
    this._alert.deleted("").then(success => {
      this.competitor.new_point.splice(i, 1);
    });
  }

  onAddSolution() {
    if (this.user.user_id != this.bid.user_id) {
      return;
    }
    _.each(this.competitor.competition, function (n) {
      n.solution_component.push({
        "componentName": "",
        "componentId": "",
        "technicalName": "",
        "commercialValue": null
      })
    });
  }

  onDeleteSolution(i) {
    if (this.competitor.competition[0].solution_component.length == 1 /* || this.competitor.submit_flag */ || this.user.user_id != this.bid.user_id) {
      return
    }
    _.each(this.competitor.competition, function (n) {
      _.remove(n.solution_component, function (n, j) {
        if (j == i) {
          return n
        }
      });
    });
  }

  // upload file
  openDialog(index): void {
    if (/* this.competitor.submit_flag || */ this.user.user_id != this.bid.user_id) {
      return;
    }
    let attachment = [];
    let obj = {
      "bid_id": this.bid_id,
      "type": 'WIN_LOSS_SUMMARY'
    }
    const dialogRef = this.dialog.open(UploadfileComponent, {
      height: '340px',
      width: '850px',
      data: this.versionData ? this.versionData : obj
    });
    dialogRef.afterClosed().subscribe(result => {
      this.versionData = undefined;
      if (isUndefined(result)) {
        return;
      }
      for (var i = 0; i < result.length; i++) {
        let obj;
        obj = {
          "attachment_id": result[i].attachment_id,
          "attachment_n": result[i].original_name,
          "attachment_path": result[i].filename,
          "description": result[i].description,
          "type": "WIN_LOSS_SUMMARY",
          "doc_version": result[i].doc_version,
          "user_id": result[i].user_id,
          "revision": result[i].revision ? result[i].revision : false,
          "parent_id": result[i].parent_id ? result[i].parent_id : "",
          "flag": result[i].flag
        }
        attachment.push(obj);
      }
      _.each(this.competitor.competition, function (o) {
        _.each(o.solution_component, function (n, j) {
          if (j == index) {
            if (n.attachment_data) {
              _.each(attachment, function (m) {
                n.attachment_data.push(m)
              })
            } else {
              n['attachment_data'] = attachment;
            }
          }
        });
      });
      _.each(this.competitor.competition, function (o) {
        _.each(o.solution_component, function (n, j) {
          n.attachment_data = _.uniqBy(n.attachment_data, 'attachment_id');
        })
      });

      attachment = [];
    }, error => {
    });
  }

  // download file
  onDownloadDialog(index) {
    var obj;
    var breakLoop = false;
    _.each(this.competitor.competition, function (n) {
      _.each(n.solution_component, function (n, j) {
        if (j == index) {
          if (_.isEmpty(n.attachment_data)) {
            rootScope._alert.sweetNoAttachments();
            breakLoop = true;
          } else {
            obj = n;
          }
        }
      });
    });
    if (breakLoop) {
      return false;
    }
    obj['submit_flag'] = this.competitor.submit_flag;
    const dialogRef = rootScope.dialog.open(DownloadComponent, {
      height: '365px',
      width: '850px',
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result || result.length == 0) {
        return
      }
      rootScope.versionData = result;
      if (result) {
        rootScope.openDialog(rootScope.downloadIndex);
      }
    }, error => {
    });
  }

  // save as draft
  onSaveAsDraft() {
    if (!this.CompetitorSearch()) {
      this._alert.sweetError("Please select valid competitor name");
      return false;
    }
    this.competitor.submit_flag = false;
    this.competitor.company_id = rootScope.company_id;
    this.competitor.bid_id = rootScope.bid_id;
    if (this.competitor.date_created) {
      this.loader = true;
      this._bidService.updateCompetition(this.competitor).subscribe((resp) => {
        this.loader = false;
        this._alert.sweetSuccess("Bid Summary saved as draft");
        this.readData();
      }, err => {
        this.loader = false;
        return;
      });
    } else {
      this.loader = true;
      this._bidService.postCompetition(this.competitor).subscribe(resp => {
        this.loader = false;
        this._alert.sweetSuccess("Bid Summary saved as draft");
        this.readData();
      }, err => {
        this.loader = false;
        return;
      })
    }
    // console.log("************** final data **************", rootScope.competitor);
  }

  onSave() {
    // this.formsubmitted = true;
    // console.log("************** final data **************", rootScope.competitor);
    if (!this.CompetitorSearch()) {
      this._alert.sweetError("Please select valid competitor name");
      return false;
    }
    this.competitor.company_id = rootScope.company_id;
    this.competitor.bid_id = rootScope.bid_id;
    this.competitor.date_created ? this.update() : this.create();
  }

  // create deal summary
  remarkError = false;
  create() {
    this.formsubmitted = true;
    if (this.competitor.bid_result == '' || ((this.bid_winner == '' || this.competitor.bid_our_value == '' || this.competitor.bid_winner_value == "") && this.competitor.bid_result != 'No Decision' && this.competitor.bid_result != 'Awaiting') || ((this.competitor.bid_result == 'Loss' || this.competitor.bid_result == 'Dropped') && this.competitor.reason == '')) {
      this._alert.sweetError("Please enter mandatory fields");
      return;
    }
    if (this.competitor.result_date == '') {
      this._alert.sweetError("Please enter mandatory fields");
      return;
    }
    /* if ((this.competitor.bid_result == 'Loss' || this.competitor.bid_result == 'Won') && this.competitor.result_date == '') {
      this._alert.sweetError("Please enter the result date");
      return;
    } */
    /* if (this.competitor.bid_result == '' || this.bid_winner == '' || this.competitor.bid_our_value == '' || this.competitor.bid_winner_value == "" || this.competitor.result_date == '' || (this.competitor.reason == 'Other' && this.competitor.bid_result != 'Won' && this.competitor.remarks == '')) {
      this.remarkError = true;
      this._alert.sweetError("Please enter Remarks");
      return;
    } */
    if (this.competitor1 == this.competitor2 || this.competitor2 == this.competitor3 || this.competitor1 == this.competitor3) {
      this._alert.sweetError("Competitor Name Cannot be Same")
      return
    }

    this.competitor.submit_flag = true;
    this._alert.added('').then(a => {
      this.loader = true;
      this._bidService.postCompetition(this.competitor).subscribe(resp => {
        this.loader = false;
        this._alert.sweetSuccess("Bid Summary created succesfully");
        this.readData();
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      }, err => {
        console.log(err);
        this._alert.sweetError(err.error.msg);
        this.loader = false;
        return;
      })
    }, error => {
      this.loader = false;
      this.competitor.submit_flag = false;
      return;
    });
  }

  // update deal summary
  update() {
    this.formsubmitted = true;
    if (this.competitor.bid_result == '' || ((this.bid_winner == '' || this.competitor.bid_our_value == '' || this.competitor.bid_winner_value == "") && this.competitor.bid_result != 'No Decision' && this.competitor.bid_result != 'Awaiting') || ((this.competitor.bid_result == 'Loss' || this.competitor.bid_result == 'Dropped') && this.competitor.reason == '')) {
      this._alert.sweetError("Please enter mandatory fields");
      return;
    }
    if (this.competitor.result_date == '') {
      this._alert.sweetError("Please enter mandatory fields");
      return;
    }
    /* if ((this.competitor.bid_result == 'Loss' || this.competitor.bid_result == 'Won') && this.competitor.result_date == '') {
      this._alert.sweetError("Please enter the result date");
      return;
    } */
    /* if (this.competitor.bid_result == '' || this.bid_winner == '' || this.competitor.bid_our_value == '' || this.competitor.bid_winner_value == "" || this.competitor.result_date == '' || (this.competitor.reason == 'Other' && this.competitor.bid_result != 'Won' && this.competitor.remarks == '')) {
      this.remarkError = true;
      this._alert.sweetError("Please enter Remarks");
      return;
    } */
    if (this.competitor1 == this.competitor2 || this.competitor2 == this.competitor3 || this.competitor1 == this.competitor3) {
      this._alert.sweetError("Competitor Name Cannot be Same")
      return
    }
    this.competitor.submit_flag = true;
    this._alert.added('').then(a => {
      this.loader = true;
      this._bidService.updateCompetition(this.competitor).subscribe((resp) => {
        this.loader = false;
        this._alert.sweetSuccess("Bid Summary updated succesfully");
        this.readData();
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      }, err => {
        this.loader = false;
        return;
      })
    }, error => {
      this.competitor.submit_flag = false;
      return;
    });
  }

  validateSingle(element) {
    if (element && this.competitor[element] === '') {
      this.validate = false;
    }
    return this.validate
  }

  validateRegex(element) {
    this.competitor[element + 'RegexValid'] = true;
    if (this.competitor[element] && !validatorCtrl.validateWinBidValue(this.competitor[element])) {
      this.competitor[element + 'RegexValid'] = false;
      this.validate = false;
    }
    return this.validate;
  }

  onNoDecision() {
    this.competitor.bid_winner = '';
    this.competitor.bid_winner_value = '';
    this.searchDataArray.length = 1;
  }

  scoreList(val) {
    // this.scoreT.splice(this.scoreT.indexOf(val), 1)
    this.scoreT = pull(this.scoreT, val);
  }

  // reset deal summary
  onReset() {
    this.competitor = {
      "company_id": this.company_id,
      "bid_id": this.bid_id,
      "submit_flag": false,
      "bid_submit": false,
      "bid_winner": "",
      "bid_winner_value": "",
      "bid_result": "",
      "reason": "",
      "bid_our_value": "",
      "result_date": "",
      "remarks": "",
      "positive_point": [''],
      "new_point": [""],
      competition: [{
        "competitor_id": undefined,
        "index_no": 0,
        "status": true,
        "solution_component": [{
          "componentName": "",
          "componentId": "",
          "technicalName": "",
          "commercialValue": null
        }],
        "total": null,
        "score": {
          "technical": "",
          "commercial": ""
        }
      }, {
        "competitor_id": undefined,
        "index_no": 0,
        "status": true,
        "solution_component": [{
          "componentName": "",
          "componentId": "",
          "technicalName": "",
          "commercialValue": null
        }],
        "total": null,
        "score": {
          "technical": "",
          "commercial": ""
        }
      }, {
        "competitor_id": undefined,
        "index_no": 0,
        "status": true,
        "solution_component": [{
          "componentName": "",
          "componentId": "",
          "technicalName": "",
          "commercialValue": null
        }],
        "total": null,
        "score": {
          "technical": "",
          "commercial": ""
        }
      }, {
        "competitor_id": undefined,
        "index_no": 0,
        "status": true,
        "solution_component": [{
          "componentName": "",
          "componentId": "",
          "technicalName": "",
          "commercialValue": null
        }],
        "total": null,
        "score": {
          "technical": "",
          "commercial": ""
        }
      }]
    }
  }

}