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
var value, myTheme, yaxisvalue, quarter_check, datetitle, rootScope, monthArrayData, wonArrayData, lossArrayData, renderFirstPlotInChart, mimdate;
var month=(new Date()).getMonth();
var year=(new Date()).getFullYear();
if(month<3){
  year=(new Date()).getFullYear()-1;
}

var beforeDate = new Date("04/01/"+year);
var afterDate = new Date(new Date().setDate(new Date().getDate()));

@Component({
  selector: 'app-reports',
  templateUrl: './won-loss-report.component.html',
  styleUrls: ['./won-loss-report.component.css'],
  providers: [BidService, BusinessUnitService, UsersService, TerritoryService]

})
export class WonLossReportsComponent implements OnInit, AfterViewInit {
  user;
  showing1: boolean = true;
  dropdownBUSettings;
  dropdownTerritorySettings;
  selectedBUs = [];
  selectedTerritories = [];
  dateTimeRange = [null, null];
  start; end;
  business_units = [];
  territories = [];
  multiflagTerritory = "All";
  multiflagBu = "All";
  today;
  last90days;
  finalBu = [];
  finalTerritory = [];
  loader = false;

  constructor(
    private _compiler: Compiler,
    public router: Router, public _bidService: BidService, public _businessUnitService: BusinessUnitService, public _userService: UsersService, public _territoryService: TerritoryService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    rootScope = this;
    this.today = new Date()
    this.last90days = new Date(this.today.setDate(this.today.getDate() - 90))
    // this.readData();
    // this.renderFirstPlotInChart()
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
      });
    });
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
      });
    });
    Promise.all([buUsers, territoryPromise]).then(a => {
      // console.log(a, "eewweew")
      this.finalBu = this.bu_ids,
        this.finalTerritory = this.territory_ids
      this.readData();
    }).catch(err => {
      this.noData();
    })
  }
  bu_ids = [];
  territory_ids = [];
  onItemSelect(item: any) {
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
      "status": "ACTIVE",
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    this.onFilter(obj);
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
  onSelectAll(item: any) {
    this.bu_ids = this.finalBu;
    this.territory_ids = this.finalTerritory
    let obj = {
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start),
      "end_value": parseFloat(this.end),
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : beforeDate,
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : afterDate,
      "status": "ACTIVE",
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    // // console.log(obj);
    this.onFilter(obj);
  }

  onDeSelectAll(item, type) {
    this.bu_ids = this.finalBu;
    this.territory_ids = this.finalTerritory
    let obj = {
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start),
      "end_value": parseFloat(this.end),
      "territory_ids": this.territory_ids,
      "bu_ids": this.bu_ids,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : beforeDate,
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : afterDate,
      "status": "ACTIVE",
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    // // console.log(obj);
    this.onFilter(obj);
  }
  onFilter(obj) {
    this._bidService.winLossReport(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.noData();
        this.loader = false;
        return;
      }
      this.loader = false;
      wonArrayData = resp['data']['Won'];
      lossArrayData = resp['data']['Loss'];
      monthArrayData = resp['data']['Month'];
      yaxisvalue = resp['data']['yaxisvalue'];

      if (isEmpty(wonArrayData) && isEmpty(lossArrayData)) {

        this.noData()
      }
      else {
        this.renderFirstPlotInChart()
      }
      // this.renderFirstPlotInChart()
    }, error => {
      this.loader = false;
    })
  }

  onClear() {
    this.bu_ids = this.finalBu;
    this.territory_ids = this.finalTerritory
    this.selectedBUs = [];
    this.selectedTerritories = [];
    this.dateTimeRange = [null, null];
    this.start = '';
    this.end = '';
    this.multiflagTerritory = "All";
    this.multiflagBu = "All";
    this.readData();
  }

  readData() {
    let obj = {
      "company_id": this.user.company_id,
      "status": "ACTIVE",
      "start_date": beforeDate,
      "end_date": afterDate,
      multiflagTerritory: "All",
      multiflagBu: "All",
      territory_ids: undefined,
      bu_ids: undefined
    }

    if (!_.isEmpty(this.bu_ids)) {
      obj.bu_ids = this.bu_ids
    }
    else {
      obj.bu_ids = this.finalBu;
    }
    if (!_.isEmpty(this.territory_ids)) {
      obj.territory_ids = this.territory_ids
    }
    else {
      obj.territory_ids = this.finalTerritory
    }
    this._bidService.winLossReport(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.noData();
        this.loader = false;
        return;
      }
      this.loader = false;
      wonArrayData = resp['data']['Won'];
      lossArrayData = resp['data']['Loss'];
      monthArrayData = resp['data']['Month'];
      datetitle = resp['data']['year'];
      yaxisvalue = resp['data']['yaxisvalue'];
      // console.log("******",resp['data'])
      if (isEmpty(wonArrayData) && isEmpty(lossArrayData)) {
        this.noData()
      } else {
        this.renderFirstPlotInChart()
      }
    }, error => {
      this.loader = false;
    })
  }
  ngOnInit() {
    this.loader = true;
    // define chart JSON
    myConfig = {
      type: "bar",
      plot: {
        barWidth: 50,
        stacked: true,
        stackType: "normal",
        animation: {
          "effect": "ANIMATION_SLIDE_LEFT",
          "speed": 1
        }
      },
      title: {
        text: 'Win-Loss',
        adjustLayout: true,
        "width": 150,
        "height": 30

      },
      subtitle: {
        text: "",
        adjustLayout: true,
        "height": 50,
        "color": "#808080",
        "font-size": 12
      },
      legend: {
        "adjust-layout": true
      },
      scaleY: {
        label: {
          text: "Number of bids"
        },

        "min-value": 0,
        // "values":"1:50:1",
        "tick": {
          "visible": false
        },
        "guide": {
          "visible": false
        }
      },

      scaleX: {
        minValue: 20,
        label: {
          text: ""
        },
        labels: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
      },
      series: [{
        values: [],
        backgroundColor: "#90ec7d",
        text: "Won",
        alpha: 1
      }, {
        values: [],
        backgroundColor: "#7cb5ec",
        text: "Lost",
        alpha: 1

      }]
      // source: {
      //   text: 'Based on "Bids submitted to customers"'

      // }

    };
  }
  ngAfterViewInit() {
    // this.renderFirstPlotInChart()
  }
  renderFirstPlotInChart = function () {
    myConfig.series[0].values = wonArrayData
    myConfig.series[1].values = lossArrayData
    myConfig.subtitle.text = datetitle
    myConfig.scaleY.values = "0:" + yaxisvalue + ":1"
    myConfig.scaleX.labels = monthArrayData
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
      this.router.navigateByUrl('analysis/wonlossreport'));
  }

}
