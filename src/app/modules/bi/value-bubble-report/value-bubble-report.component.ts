import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Compiler } from '@angular/core';
import { isEmpty } from "lodash";
import { Router } from "@angular/router";
import { BidService } from "../../../services/bid.service";
import { BusinessUnitService } from "../../../services/businessUnit.service";
import { TerritoryService } from "../../../services/territories.service";
import { UsersService } from "../../../services/users.service";
import _ = require("lodash");


declare var zingchart: any;
var myConfig;
var value, myTheme, dateValue, rootScope, bubble, bidnames, renderFirstPlotInChart, datanames, BidNamevalue, mimdate;
datanames = ["Buffalo", "Toronto", "Carolina", "New Jersey", "Philadelphia", "Columbus", "Florida", "Boston", "Pittsburgh", "Ottawa", "Detroit", "NY Islanders", "Washington", "Tampa Bay", "Montréal", "NY Rangers"];
var month=(new Date()).getMonth();
var year=(new Date()).getFullYear();
if(month<3){
  year=(new Date()).getFullYear()-1;
}

var beforeDate = new Date("04/01/"+year);
var afterDate = new Date(new Date().setDate(new Date().getDate()));

@Component({
  selector: 'app-reports',
  templateUrl: './value-bubble-report.component.html',
  styleUrls: ['./value-bubble-report.component.css'],
  providers: [BidService, UsersService, BusinessUnitService, TerritoryService]

})
export class ValueBubbleReportsComponent implements OnInit {
  user;
  showing1: boolean = true;
  dropdownBUSettings;
  dropdownTerritorySettings;
  selectedBUs = [];
  selectedTerritories = [];
  dateTimeRange = [null, null];
  start;
  end;
  business_units = [];
  territories = [];
  multiflagTerritory = "All";
  multiflagBu = "All";
  date_range;
  finalBu = [];
  finalTerritory = [];
  loader = false;

  constructor(public _bidService: BidService, public _userService: UsersService,
    public _businessUnitService: BusinessUnitService, public router: Router, public _territoryService: TerritoryService,
    private _compiler: Compiler) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    rootScope = this;
    this.dropdownBUSettings = {
      singleSelection: false,
      idField: 'bu_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 0,
    };
    this.dropdownTerritorySettings = {
      singleSelection: false,
      idField: 'territory_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 0,
    };
    this.getBuTerritories();
  }

  // get BU and territorries details
  getBuTerritories() {
    let buUsers = new Promise((resolve, reject) => {
      this._userService.getBusinessUnitForUser({}).subscribe(res => {
        this.business_units = res['data'];
        var buids = res['data'];
        buids.forEach(element => {
          this.bu_ids.push(element.bu_id);
        });
        resolve(this.business_units);
      }, error => {
        reject(error)
      })
    })

    let territoryPromise = new Promise((resolve, reject) => {
      this._userService.getTerritoriesForUser({}).subscribe(res => {
        this.territories = res['data']
        var territoriesIds = res['data'];
        territoriesIds.forEach(element => {
          this.territory_ids.push(element.territory_id);
        });
        resolve(this.territories);
      }, error => {
        reject(error)
      })
    })

    Promise.all([buUsers, territoryPromise]).then(a => {
      this.finalBu = this.finalBu;
      this.finalTerritory = this.finalTerritory;
      this.readData();
    }).catch(err => {
      this.noData();
    })
  }

  bu_ids = [];
  territory_ids = [];
  onItemSelect(item: any) {
    // // console.log("item >>>>", item);
    if (this.selectedBUs.length != 0) {
      this.bu_ids = [];
      this.selectedBUs.forEach(element => {
        this.bu_ids.push(element.bu_id);
      });
    } else {
      this.bu_ids = this.finalBu
    }
    if (this.selectedTerritories.length != 0) {
      this.territory_ids = [];
      this.selectedTerritories.forEach(element => {
        this.territory_ids.push(element.territory_id);
      });
    } else {
      this.territory_ids = this.finalTerritory
    }
    let obj = {
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start),
      "end_value": parseFloat(this.end),
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : beforeDate,
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : afterDate,
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    // // console.log(obj);
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
    else {
      this.bu_ids = this.finalBu;
    }
    if (item[0].territory_id) {
      this.territory_ids = [];
      item.forEach(element => {
        this.territory_ids.push(element.territory_id);
      });
    }
    else {
      this.territory_ids = this.finalTerritory;
    }
    let obj = {
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start),
      "end_value": parseFloat(this.end),
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : beforeDate,
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : afterDate,
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    // // console.log(obj);
    this.onFilter(obj);
  }

  onDeSelectAll(item, type) {
    if (type == 'BU') {
      this.bu_ids = this.finalBu
    }
    if (type == 'Territory') {
      this.territory_ids = this.finalTerritory
    }
    let obj = {
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start),
      "end_value": parseFloat(this.end),
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : beforeDate,
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : afterDate,
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    // // console.log(obj);
    this.onFilter(obj);
  }

  onFilter(obj) {
    this._bidService.ValueBubbleReport(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.noData();
        this.loader = false;
        return;
      }
      bubble = resp['data']['value_bubble']
      mimdate = resp['data']['minimumDate']
      BidNamevalue = resp['data']['BidName']
      dateValue = resp['data']['Period']
      // this.renderFirstPlotInChart()
      if (isEmpty(resp['data']['value_bubble']) || resp['data']['value_bubble'] == undefined) {
        // console.log("********");
        this.noData();
        this.loader = false;
      }
      else {
        this.renderFirstPlotInChart();
        this.loader = false;
      }
    }, error => {
      this.loader = false;
    })
  }
  onClear() {
    this.selectedBUs = [];
    this.selectedTerritories = [];
    this.dateTimeRange = [null, null];
    this.start = '';
    this.end = '';
    this.territory_ids = this.finalTerritory,
      this.bu_ids = this.finalBu,
      this.multiflagTerritory = "All";
    this.multiflagBu = "All";
    this.readData();
  }
  noData = function () {
    var myConfig = {
      type: "null",

      noData: {
        text: "No data available",
        // backgroundColor: "#20b2db",
        fontSize: 18,
        textAlpha: .9,
        alpha: .6,
        bold: true
      },
      series: [{
        values: []
      }]
    };

    zingchart.render({
      id: 'myChart',
      data: myConfig,
      height: '100%',
      width: '100%'
    });
  }

  readData() {
    let obj = {
      "company_id": this.user.company_id,
      "report_flag": "FILTER",
      "start_date": beforeDate,
      "end_date": afterDate,
      multiflagTerritory: "All",
      multiflagBu: "All",
      territory_ids: undefined,
      bu_ids: undefined
    }

    if (!_.isEmpty(this.bu_ids)) {
      obj.bu_ids = this.bu_ids
    };

    if (!_.isEmpty(this.territory_ids)) {
      obj.territory_ids = this.territory_ids
    };
    this._bidService.ValueBubbleReport(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.noData();
        this.loader = false;
        return;
      }
      this.loader = false;
      bubble = resp['data']['value_bubble']
      mimdate = resp['data']['minimumDate']
      BidNamevalue = resp['data']['BidName']
      dateValue = resp['data']['Period']

      if (isEmpty(resp['data']['value_bubble']) || resp['data']['value_bubble'] == undefined) {
        this.noData()
      }
      else {
        this.renderFirstPlotInChart()
      }
    }, error => {
      this.loader = false;
    })
  }

  ngOnInit() {
    // define chart JSON
    this.loader = true;
    myConfig =
      {
        "type": "bubble",
        "title": {
          "text": 'Bids by Stage',
          "adjustLayout": true
        },
        "subtitle": {
          "text": "",
          "adjustLayout": true,
          "height": 50,
          "color": "#808080",
          "font-size": 12
        },
        "plot": {
          "tooltip": {
            "text": "Bid Name %data-country <br>Bid Value %node-size-value Mn<br>Bid Stage %node-value <br>  "
          },
          "animation": {
            "effect": 2,
            "sequence": 2,
            "method": 2
          }
        },
        "scale-x": {
          "zooming": true,
          "label": {
            "text": "Submission Date"
          },
          // "min-value":
          "step": "1day",
          "transform": {
            "type": "date",
            "all": '%d-%m-%y'
          }
        },
        "preview": {
          "adjust-layout": true
        },
        "scale-y": {
          "values": '1:4:1',
          "labels": ["Bid Creation", "Bid Development","Bid Approval", "Bid Submit"],
          "min-value": 1,
          "tick": {
            "visible": false
          },
          "guide": {
            "visible": false
          }
        },
        "plotarea": {
          "margin": "dynamic"
        },
        "series": [{
          "values": [],
          "data-country": ["abc", "pqwe"]
        },
        ]
      };

  }

  renderFirstPlotInChart = function () {
    myConfig.series[0].values = bubble,
      // myConfig.series[0]["value-box"].text="%"+datanames,
      myConfig.subtitle.text = dateValue
    myConfig["scale-x"]["min-value"] = mimdate
    myConfig.series[0]["data-country"] = BidNamevalue

    zingchart.render({
      id: 'myChart',
      data: myConfig,
      height: '100%',
      width: '100%',
      defaults: myTheme
    });
  }
  onReload() {
    this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
      this.router.navigateByUrl('analysis/bidsByStage'));
  }

}
