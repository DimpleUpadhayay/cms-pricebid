import { Component, OnInit } from "@angular/core";
import { each, max } from "lodash";
import { Router } from "@angular/router";
import { ReportService } from "../../../services/reports.service";
import { BidService } from "../../../services/bid.service";
import { BusinessUnitService } from "../../../services/businessUnit.service";
import { TerritoryService } from "../../../services/territories.service";
import { UsersService } from "../../../services/users.service";
import _ = require("lodash");


declare var zingchart: any;
var myConfig;
var value, myTheme, quarter_check, rootScope;
var beforeDate = new Date(new Date().setDate(new Date().getDate() - 180));
var afterDate = new Date(new Date().setDate(new Date().getDate()));
var yvalue = 0

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  providers: [ReportService, BidService, UsersService, BusinessUnitService, TerritoryService]
})
export class ReportsComponent implements OnInit {
  user;
  yearArray = [];
  yearTotalBidValues = [];
  noOfbidsPerYear = [];
  quarterTotalBidValues = [];
  noOfBidsPerQuarter = [];
  selectedYearRange = [];
  noOfBidsPerMonth = [];
  monthTotalBidValue = [];
  counter = 0;
  dropdownListBusiness = [];
  dropdownListTerritory = [];
  dropdownListValueRange = [];
  selectedItems = [];
  dropdownSettings = {};
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
  yearChart = false;
  quarterChart = false;
  monthChart = false;
  Yrangevalue = 0
  quarterValue = "";
  year = new Date().getFullYear();
  years = [this.year + 1];
  finalBu = [];
  finalTerritory = [];
  loader = false;

  constructor(
    public router: Router,
    public reportService: ReportService,

    public _bidService: BidService,
    public _businessUnitService: BusinessUnitService, public _userService: UsersService, public _territoryService: TerritoryService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    rootScope = this;
    // this.readData();
    for (let i = 0; i < 3; i++) {
      this.years.push(this.year - i);
    }

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
      this.finalBu = this.bu_ids
      this.finalTerritory = this.territory_ids
      this.readData();
    }).catch(err => {
      this.noData();
    })
  }

  bu_ids = [];
  territory_ids = [];
  onItemSelect(item: any) {
    let time_flag;
    if (rootScope.yearChart) {
      time_flag = "YEAR";
    } else if (rootScope.quarterChart) {
      time_flag = "QUARTER";
    } else if (rootScope.monthChart) {
      time_flag = "MONTH";
    }
    if (this.selectedBUs.length != 0) {
      this.bu_ids = [];
      this.selectedBUs.forEach(element => {
        this.bu_ids.push(element.bu_id);
        rootScope.bu_ids.push(element.bu_id);
      });
    } else {
      this.bu_ids = this.finalBu;
      rootScope.bu_ids = this.finalBu;

    }
    if (this.selectedTerritories.length != 0) {
      this.territory_ids = [];
      this.selectedTerritories.forEach(element => {
        this.territory_ids.push(element.territory_id);
        rootScope.territory_ids.push(element.territory_id)
      });
    } else {
      this.territory_ids = this.finalTerritory
      rootScope.territory_ids = this.finalTerritory
    }
    rootScope.valueTrendsGraphBid(
      {
        "time_flag": time_flag,
        "company_id": this.user.company_id,
        // "year": [this.year - 1, this.year],
        "year": [this.year - 2, this.year - 1, this.year],
        "start_value": parseFloat(this.start),
        "end_value": parseFloat(this.end),
        "territory_ids": this.territory_ids,
        "bu_ids": this.bu_ids,
        "report_flag": "FILTER",
        "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : beforeDate,
        "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : afterDate,
        "multiflagTerritory": rootScope.multiflagTerritory,
        "multiflagBu": rootScope.multiflagBu,
        "quarter": rootScope.quarterValue

      }, time_flag, true)
  }

  onSelectAll(item: any) {
    let time_flag;
    if (rootScope.yearChart) {
      time_flag = "YEAR";
    } else if (rootScope.quarterChart) {
      time_flag = "QUARTER";
    } else if (rootScope.monthChart) {
      time_flag = "MONTH";
    }

    if (item[0].bu_id) {
      this.bu_ids = [];
      rootScope.bu_ids = [];
      item.forEach(element => {
        this.bu_ids.push(element.bu_id);
        rootScope.bu_ids.push(element.bu_id);
      });
    }
    else {
      this.bu_ids = this.finalBu
      rootScope.bu_ids = this.finalBu
    }
    if (item[0].territory_id) {
      this.territory_ids = [];
      rootScope.territory_ids = [];
      item.forEach(element => {
        this.territory_ids.push(element.territory_id);
        rootScope.territory_ids.push(element.territory_ids);
      });
    }
    else {
      this.territory_ids = this.finalTerritory;
      rootScope.territory_ids = this.finalTerritory;
    }
    rootScope.valueTrendsGraphBid(
      {
        "time_flag": time_flag,
        "company_id": this.user.company_id,
        // "year": [new Date().getFullYear() - 1, new Date().getFullYear()],
        // "year": [this.year - 1, this.year],
        "year": [this.year - 2, this.year - 1, this.year],
        "start_value": parseFloat(this.start),
        "end_value": parseFloat(this.end),
        "territory_ids": this.territory_ids,
        "bu_ids": this.bu_ids,
        "report_flag": "FILTER",
        "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : beforeDate,
        "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : afterDate,
        "multiflagTerritory": rootScope.multiflagTerritory,
        "multiflagBu": rootScope.multiflagBu
      }, time_flag, true)
  }

  onDeSelectAll(item, type) {

    let time_flag;
    if (rootScope.yearChart) {
      time_flag = "YEAR";
    } else if (rootScope.quarterChart) {
      time_flag = "QUARTER";
    } else if (rootScope.monthChart) {
      time_flag = "MONTH";
    }
    // this.bu_ids=this.finalBu;
    // rootScope.bu_ids=this.finalTerritory;
    // this.territory_ids = this.finalTerritory;
    // rootScope.territory_ids = this.finalTerritory
    rootScope.valueTrendsGraphBid(
      {
        "time_flag": time_flag,
        "company_id": this.user.company_id,
        // "year": [new Date().getFullYear() - 1, new Date().getFullYear()],
        "year": [this.year - 2, this.year - 1, this.year],
        "start_value": parseFloat(this.start),
        "end_value": parseFloat(this.end),
        "territory_ids": this.territory_ids,
        "bu_ids": this.bu_ids,
        "report_flag": "FILTER",
        "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : beforeDate,
        "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : afterDate,
        "multiflagTerritory": rootScope.multiflagTerritory,
        "multiflagBu": rootScope.multiflagBu
      }, time_flag, true)

  }

  onClear() {

    rootScope.yearChart = true;
    rootScope.quarterChart = false;
    rootScope.monthChart = false;
    this.selectedBUs = [];
    this.selectedTerritories = [];
    this.dateTimeRange = [null, null];
    this.start = '';
    this.end = '';
    this.bu_ids = this.finalBu,
      this.territory_ids = this.finalTerritory,
      this.multiflagTerritory = "All";
    this.multiflagBu = "All";
    this.readData();
  }

  ngOnInit() {
    this.loader = true;
  }

  readData() {
    rootScope.valueTrendsGraphBid(
      {
        "time_flag": "YEAR",
        "company_id": this.user.company_id,
        // "year": [new Date().getFullYear() - 1, new Date().getFullYear()],
        "year": [this.year - 2, this.year - 1, this.year],
        "start_date": beforeDate,
        "end_date": afterDate,
        multiflagTerritory: "All",
        multiflagBu: "All",
        territory_ids: undefined,
        bu_ids: undefined
      }
      , "year");
  }

  valueTrendsGraphBid = function (reqObj, flag, select) {
    rootScope.yearArray = [];
    rootScope.monthTotalBidValue = [];
    rootScope.quarterTotalBidValues = [];
    rootScope.yearTotalBidValues = [];
    if (!_.isEmpty(this.bu_ids)) {
      reqObj.bu_ids = this.bu_ids
    };

    if (!_.isEmpty(this.territory_ids)) {
      reqObj.territory_ids = this.territory_ids
    };
    rootScope.reportService.valueTrendsGraphBid(reqObj).subscribe((resData) => {
      if (resData && resData.data) {
        if (flag.toLowerCase() == "year") {
          if (resData.data.year)
            rootScope.yearArray = resData.data.year;
          else
            rootScope.yearArray = [];


          if (resData.data.year_total_bids)
            rootScope.noOfbidsPerYear = resData.data.year_total_bids;
          else
            rootScope.noOfbidsPerYear = [];


          if (resData.data.year_total_bids_value) {
            rootScope.yearTotalBidValues = resData.data.year_total_bids_value;
            for (var i = 0; i < rootScope.yearTotalBidValues.length; i++) {
              rootScope.yearTotalBidValues[i] = parseFloat(rootScope.yearTotalBidValues[i]);
            }
          } else
            rootScope.yearTotalBidValues = [];

          rootScope.plotGraph();
        }

        if (flag.toLowerCase() == "quarter") {
          if (resData.data.year)
            rootScope.yearArray = resData.data.year;
          else
            rootScope.yearArray = []


          if (resData.data.quarterTotalBids)
            rootScope.noOfBidsPerQuarter = resData.data.quarterTotalBids;
          else
            rootScope.noOfBidsPerQuarter = []

          if (resData.data.quarterTotalBids_Value) {
            rootScope.quarterTotalBidValues = resData.data.quarterTotalBids_Value;
            // for (var i = 0; i < rootScope.quarterTotalBidValues.length; i++) {
            //     rootScope.quarterTotalBidValues[i] = parseInt(rootScope.quarterTotalBidValues[i]);
            // }
            each(rootScope.quarterTotalBidValues, function (n) {
              each(n, function (m) {
                m = parseInt(m);
              });
            });
          }

          // var a = rootScope.quarterTotalBidValues;
          var a = rootScope.noOfBidsPerQuarter;

          if (select) {
            rootScope.removePlotForLast(a);
          }
          if (rootScope.yearArray.length == 1) {
            for (var i = 0; i < 1; i++) {
              rootScope.addAnotherPlot(a[i], rootScope.quarterTotalBidValues[i], rootScope.yearArray[i]);
            }
          }

          else {
            for (var i = 0; i < 2; i++) {
              rootScope.addAnotherPlot(a[i], rootScope.quarterTotalBidValues[i], rootScope.yearArray[i]);
            }
          }
        }

        if (flag.toLowerCase() == "month") {
          if (resData.data.year)
            rootScope.yearArray = resData.data.year;

          if (resData.data.monthTotalBids)
            rootScope.noOfBidsPerMonth = resData.data.monthTotalBids;


          if (resData.data.monthTotalBids_Value) {
            rootScope.monthTotalBidValue = resData.data.monthTotalBids_Value;
            // for (var i = 0; i < rootScope.monthTotalBidValue.length; i++) {
            //     rootScope.monthTotalBidValue[i] = parseInt(rootScope.monthTotalBidValue[i]);
            // }
            each(rootScope.monthTotalBidValue, function (n) {
              each(n, function (m) {
                m = parseInt(m);
              });
            });
          }

          // var a = rootScope.monthTotalBidValue;
          var a = rootScope.noOfBidsPerMonth;
          if (select) {
            rootScope.removePlotForLast(a);
          }
          let lenvale = rootScope.yearArray.length

          for (var i = 0; i < lenvale; i++) {

            rootScope.addAnotherPlot(a[i], rootScope.monthTotalBidValue[i], rootScope.yearArray[i]);
          }



        }
        if (rootScope.counter == 0)

          // rootScope.plotGraph();
          rootScope.counter++;
        this.loader = false;
      }
    }, err => {
      this.loader = false;
    });
  }

  /*
  * callback for GET request is when we will render the chart
  */
  renderFirstPlotInChart = function () {


    myConfig.series[0].values = rootScope.noOfbidsPerYear;
    var valueTextArray = [];

    each(myConfig.series[0].values, function (n) {
      valueTextArray.push("₹");
    });
    myConfig.series[0]['data-sub-text'] = valueTextArray;
    myConfig.series[0]['data-sub-rating'] = rootScope.yearTotalBidValues;
    myConfig.series[0]["text"] = rootScope.yearArray

    // myConfig.series[0].values = [[5000,235],[5000,235],[5000,235]];
    zingchart.render({
      id: 'myChart',
      data: myConfig,
      height: '100%',
      width: '100%',
      defaults: myTheme
    });
  }

  addAnotherPlot = function (noOfBids, value, text) {
    zingchart.exec('myChart', 'addplot', {
      data: {
        values: noOfBids,
        'data-sub-text': "₹",
        'data-sub-rating': value,
        text: text
      }
    });
  };

  // month
  removePlotForLast = function (lastdata) {
    zingchart.exec('myChart', 'removeplot', {
      data: {
        plotindex: 1
      }
    });
    zingchart.exec('myChart', 'removeplot', {
      data: {
        plotindex: 2
      }
    });

    var valuegert = zingchart.exec('myChart', 'getseriesvalues', {
      data: {
        plotindex: 2
      }
    });

    // var a = rootScope.datatest.month_value1
    // var b = rootScope.datatest.month_value2
    // var c = rootScope.datatest.month_value3
    // var d = rootScope.datatest.month_value4

    // for(i=0;i<2;i++){
    // addAnotherPlot(a[i]);
    // }
    // if (quarter_check == "Q1") {
    //   for (var i = 0; i < 2; i++) {
    //     rootScope.addAnotherPlot(a[i]);
    //   }
    // } else if (quarter_check == "Q2") {
    //   for (var i = 0; i < 2; i++) {
    //     rootScope.addAnotherPlot(b[i]);
    //   }
    // } else if (quarter_check == "Q3") {
    //   for (var i = 0; i < 2; i++) {
    //     rootScope.addAnotherPlot(c[i]);
    //   }
    // } else if (quarter_check == "Q4") {
    //   for (var i = 0; i < 2; i++) {
    //     rootScope.addAnotherPlot(d[i]);
    //   }
    // }
    // zingchart.bind('myChart', 'node_click', removePlotForLast);
  }

  getLastDrillDown = function (ddt) {
    rootScope.removePlotForLast()
    // zingchart.bind('myChart', 'node_click', removePlotForLast);
  }

  getLastChart = function (gd) {
    rootScope.yearChart = false;
    rootScope.monthChart = true;
    rootScope.quarterChart = false;


    // console.log("monthChart >>>", rootScope.monthChart)


    var quarter_axis = []
    if (gd.scaleval == "Q1") {
      rootScope.quarterValue = 1;
      rootScope.valueTrendsGraphBid({
        "company_id": rootScope.user.company_id,
        "year": rootScope.selectedYearRange,
        "report_flag": "FILTER",
        "time_flag": "MONTH",
        "quarter": 1,
        "bu_ids": rootScope.bu_ids,
        "territory_ids": rootScope.territory_ids,
        "start_date": rootScope.dateTimeRange[0] ? rootScope.dateTimeRange[0] : beforeDate,
        "end_date": rootScope.dateTimeRange[1] ? rootScope.dateTimeRange[1] : afterDate,
        "multiflagTerritory": rootScope.multiflagTerritory,
        "multiflagBu": rootScope.multiflagBu
      }, "month");
      quarter_check = "Q1"
      quarter_axis = ['APR', 'MAY', 'JUN'];
    } else if (gd.scaleval == "Q2") {
      quarter_check = "Q2"
      quarter_axis = ['JUL', 'AUG', 'SEPT'];
      rootScope.quarterValue = 2;
      rootScope.valueTrendsGraphBid({
        "company_id": rootScope.user.company_id,
        "year": rootScope.selectedYearRange,
        "report_flag": "TIME",
        "time_flag": "MONTH",
        "quarter": 2,
        "bu_ids": rootScope.bu_ids,
        "territory_ids": rootScope.territory_ids,
        "start_date": rootScope.dateTimeRange[0] ? rootScope.dateTimeRange[0] : beforeDate,
        "end_date": rootScope.dateTimeRange[1] ? rootScope.dateTimeRange[1] : afterDate,
        "multiflagTerritory": rootScope.multiflagTerritory,
        "multiflagBu": rootScope.multiflagBu
      }, "month");
    } else if (gd.scaleval == "Q3") {
      quarter_check = "Q3"
      quarter_axis = ['OCT', 'NOV', 'DEC'];
      rootScope.quarterValue = 3;
      rootScope.valueTrendsGraphBid({
        "company_id": rootScope.user.company_id,
        "year": rootScope.selectedYearRange,
        "report_flag": "TIME",
        "time_flag": "MONTH",
        "quarter": 3,
        "bu_ids": rootScope.bu_ids,
        "territory_ids": rootScope.territory_ids,
        "start_date": rootScope.dateTimeRange[0] ? rootScope.dateTimeRange[0] : beforeDate,
        "end_date": rootScope.dateTimeRange[1] ? rootScope.dateTimeRange[1] : afterDate,
        "multiflagTerritory": rootScope.multiflagTerritory,
        "multiflagBu": rootScope.multiflagBu,
      }, "month");
    } else if (gd.scaleval == "Q4") {
      quarter_check = "Q4"
      quarter_axis = ['Jan', 'Feb', 'March'];
      rootScope.quarterValue = 4;
      rootScope.valueTrendsGraphBid({
        "company_id": rootScope.user.company_id,
        "year": rootScope.selectedYearRange,
        "report_flag": "TIME",
        "time_flag": "MONTH",
        "quarter": 4,
        "bu_ids": rootScope.bu_ids,
        "territory_ids": rootScope.territory_ids,
        "start_date": rootScope.dateTimeRange[0] ? rootScope.dateTimeRange[0] : beforeDate,
        "end_date": rootScope.dateTimeRange[1] ? rootScope.dateTimeRange[1] : afterDate,
        "multiflagTerritory": rootScope.multiflagTerritory,
        "multiflagBu": rootScope.multiflagBu,
      }, "month");
    }

    myConfig.scaleX = {
      values: quarter_axis, // rootScope will prevent users from noticing the scale repaint
      guide: {
        lineStyle: 'solid'
      }
    };
    var Yrange;
    if (rootScope.noOfBidsPerMonth.length > 0) {

      Yrange = rootScope.getMaxValue(rootScope.noOfBidsPerMonth);
      // // console.log("Yrange 1", Yrange);
      Yrange = 2 + parseInt(Yrange);
      // // console.log("Yrange 2", Yrange);
      Yrange = '0:' + Yrange + ':1';
    }
    // else {

    //   Yrange = 5
    //   Yrange = '0:' + Yrange + ':1';
    // }
    myConfig.scaleY = {
      values: Yrange, // rootScope will prevent users from noticing the scale repaint
      guide: {
        lineStyle: 'solid'
      },
      "min-value": 0,
      "decimals": 0,
      "format": "%v",
      "step": 1
    }

    zingchart.render({
      id: 'myChart',
      data: myConfig,
      height: '100%',
      width: '100%',
      defaults: myTheme //define custom theme from above
    });

    zingchart.exec('myChart', 'removeplot', {
      data: {
        plotindex: 1
      }
    });
    zingchart.exec('myChart', 'removeplot', {
      data: {
        plotindex: 2
      }
    });
    // rootScope.getLastDrillDown();
  }

  getNextChart = function (graphData) {
    rootScope.yearChart = false;
    rootScope.monthChart = false;
    rootScope.quarterChart = true;
    if (graphData.scaleval)
      rootScope.selectedYearRange = [graphData.scaleval - 1, graphData.scaleval]

    rootScope.valueTrendsGraphBid({
      "company_id": rootScope.user.company_id,
      "year": rootScope.selectedYearRange,
      "report_flag": "FILTER",
      "time_flag": "QUARTER",
      "bu_ids": rootScope.bu_ids,
      "territory_ids": rootScope.territory_ids,
      "start_date": rootScope.dateTimeRange[0] ? rootScope.dateTimeRange[0] : beforeDate,
      "end_date": rootScope.dateTimeRange[1] ? rootScope.dateTimeRange[1] : afterDate,
      "multiflagTerritory": rootScope.multiflagTerritory,
      "multiflagBu": rootScope.multiflagBu
    }, "quarter");

    myConfig.scaleX = {
      values: ['Q1', 'Q2', 'Q3', 'Q4'], // rootScope will prevent users from noticing the scale repaint
      guide: {
        lineStyle: 'solid'
      }
    };

    var Yrange;
    if (rootScope.noOfBidsPerQuarter.length > 0) {

      Yrange = rootScope.getMaxValue(rootScope.noOfBidsPerQuarter);
      // console.log("Yrange 1", Yrange);
      Yrange = 2 + parseInt(Yrange);
      // console.log("Yrange 2", Yrange);
      Yrange = '0:' + Yrange;
    }
    // else {

    //   Yrange = 5
    //   Yrange = '0:' + Yrange + ':1';
    // }
    myConfig.scaleY = {
      values: Yrange, // rootScope will prevent users from noticing the scale repaint
      guide: {
        lineStyle: 'solid'
      },
      "min-value": 0,
      "decimals": 0,
      "format": "%v",
      "step": 1,
    }

    zingchart.render({
      id: 'myChart',
      data: myConfig,
      height: '100%',
      width: '100%',
      defaults: myTheme //define custom theme from above
    });

    zingchart.exec('myChart', 'removeplot', {
      data: {
        plotindex: 1
      }
    });

    zingchart.bind('myChart', 'node_click', rootScope.getLastChart);
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

  plotGraph() {

    if (rootScope.yearArray.length > 0) {
      rootScope.yearChart = true;
      rootScope.monthChart = false;
      rootScope.quarterChart = false;
      // console.log("yearChart >>>", rootScope.yearChart)

      // // console.log("in after view init")
      // // console.log("rootScope.yearArray", rootScope.yearArray);
      if (rootScope.yearArray.length > 1)
        value = rootScope.yearArray[0] + ":" + rootScope.yearArray[rootScope.yearArray.length - 1] + ":1"
      else if (rootScope.yearArray.length == 1)
        value = rootScope.yearArray[0] + ":" + rootScope.yearArray[rootScope.yearArray.length - 1] + ":1"

      // // console.log("year data value", value);
      // define chart JSON
      var Yrange;
      if (rootScope.noOfbidsPerYear.length > 0) {
        Yrange = rootScope.getMaxValue(rootScope.noOfbidsPerYear);
        // Yrange = 50 + parseInt(Yrange);
        Yrange = parseInt(Yrange);
        Yrange = '0:' + Yrange
      }
      // // console.log("Yrange", Yrange);
      myConfig = {
        type: 'bar',
        title: {
          text: 'Bid Volume & Value Analysis',
        },
        plot: {
          barWidth: 50, // comment this if want dynamic bar width
          animation: {}, // add animation to make the chart look alive
          "value-box": {
            //Displays all data values by default.
            "text": "%data-sub-text: %data-sub-rating",
          },
        },
        tooltip: {
          fontColor: '#fff'
        },
        legend: {
          toggleAction: 'remove',
          margin: "93% auto auto auto"
        },
        scaleY: {
          values: Yrange, // rootScope will prevent users from noticing the scale repaint
          guide: {
            lineStyle: 'solid'
          },
          "format": "%v",
          "decimals": 0,
          // "min-value": 0,
          "step": 1,
        },
        scaleX: {
          values: value, // rootScope will prevent users from noticing the scale repaint
          guide: {
            lineStyle: 'solid'
          }
        },
        series: [{
          values: [],
          text: 'Year',
        }]
      };
      //using basic custom theme
      quarter_check = ""
      myTheme = {
        palette: {
          vbar: [
            ['#009688', '#009688'],
            ['#FFC107', '#FFC107'],
            ['#9C27B0', '#9C27B0']
          ]
        },
      };

      rootScope.renderFirstPlotInChart()

      zingchart.bind('myChart', 'node_click', rootScope.getNextChart);
      zingchart.bind('myChart', 'load', function (e) {
      });
    }
    else {
      // console.log("*******plot**************",rootScope.yearArray.length);
      this.noData();
    }
  };

  getMaxValue = function (arr) {
    return max(arr);
  }

  onReload() {
    this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
      this.router.navigateByUrl('analysis/bidVolumeAnalysis'));
  }

}
