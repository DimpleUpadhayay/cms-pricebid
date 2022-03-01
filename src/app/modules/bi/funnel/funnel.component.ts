import { OnInit, Component, ViewChild } from "@angular/core";
import { isEmpty } from "lodash";
import { Router } from "@angular/router";
import { BidService } from "../../../services/bid.service";
import { BusinessUnitService } from "../../../services/businessUnit.service";
import { TerritoryService } from "../../../services/territories.service";
import { AlertComponent } from "../../../libraries/alert/alert.component";
import { UsersService } from "../../../services/users.service";
import _ = require("lodash");



declare var zingchart: any;
var myConfig;
var myTheme,funnelObject,titleYear;

var month=(new Date()).getMonth();
var year=(new Date()).getFullYear();
if(month<3){
  year=(new Date()).getFullYear()-1;
}

var beforeDate = new Date("04/01/"+year);
var afterDate = new Date(new Date().setDate(new Date().getDate()));
var funnelSampleObject = {
  "data": {
    // "year": "Period: 05-02-2019 - 04-08-2019",
    "name": "FunnelReport",
    "funnelArrayofObject": [{
      "text": "Total bid ",
      "values": [],
      "background-color": "orange",
      "no": 0
    }, {
      "values": [],
      "text": "Total bid approved",
      "background-color": "green",
      "no": 1
    }, {
      "values": [0],
      "text": "Total bid submit",
      "background-color": "blue",
      "no": 2
    }, {
      "values": [0],
      "text": "Total bid won",
      "no": 3,
      "background-color": "purple"
    }],
    "nullGraphvalue": {
      "Won": 0,
      "Loss": 0,
      "Nodecision": 0
    },
    "funnel_Array_Array": [
      ["Total bid created", 0],
      ["Total bid won", 0],
      ["Total bid submit", 0],
      ["Total bid approved", 0]
    ]
  }
}

@Component({
  selector: 'app-funnel',
  templateUrl: './funnel.component.html',
  styleUrls: ['./funnel.component.css'],
  providers: [BidService, BusinessUnitService, UsersService, TerritoryService]
})

export class funnelComponent implements OnInit {
  user;
  showing1: boolean = true;
  selectedBUs = [];
  selectedTerritories = [];
  dropdownBUSettings;
  dropdownTerritorySettings;
  dateTimeRange = [null, null];
  start; end;
  business_units = [];
  territories = [];
  multiflagTerritory = "All";
  multiflagBu = "All";
  yearname;
  finalBu = [];
  finalTerritory = [];
  loader = false;
  @ViewChild(AlertComponent) alert: AlertComponent;

  constructor(public _bidService: BidService, public router: Router,
    public _businessUnitService: BusinessUnitService, public _userService: UsersService, public _territoryService: TerritoryService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    // this.readData();
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
      itemsShowLimit: 0
    };
    this.getBuTerritories();
  }
  bu_ids = [];
  territory_ids = [];

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
      this.finalBu = this.bu_ids,
        this.finalTerritory = this.territory_ids
      this.readData();
    }).catch(err => {
      this.noData();
    })
  }


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
    if (item[0].territory_id) {
      this.territory_ids = [];
      item.forEach(element => {
        this.territory_ids.push(element.territory_id);
      });
    }
    // this.territory_ids=this.finalTerritory;
    // this.bu_ids=this.finalBu
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
    let obj = {
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start),
      "end_value": parseFloat(this.end),
      "territory_ids": this.finalTerritory,
      "bu_ids": this.finalBu,
      "report_flag": "FILTER",
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : beforeDate,
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : afterDate,
      "multiflagTerritory": this.multiflagTerritory,
      "multiflagBu": this.multiflagBu
    }
    this.onFilter(obj);

  }

  onFilter(obj) {
    this._bidService.ValueFunnelReport(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.noData();
        this.loader = false;
        return;
      }
      if (resp && resp['data']) {
        funnelObject = resp['data']['funnelArrayofObject']
        titleYear = resp['data']['year']
        if (funnelObject != undefined) {
          if (isEmpty(resp['data'])) {
            // console.log("emprty");]
            this.loader = false;
            this.noData()
          }
          else {
            this.renderFirstPlotInChart()
          }
        }
        else {
          this.loader = false;
          this.noData()
        }
      } /* else {
        this.renderFirstPlotInChart()
      } */
    }, error => {
      this.loader = false;
    });
  }

  onClear() {
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
  noData = function () {
    var myConfig = {
      type: "null",
      noData: {
        // text:"Currently there Is no data In the chart",
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
      obj.bu_ids = this.bu_ids;
    }
    else {
      obj.bu_ids = this.finalBu;
    }
    if (!_.isEmpty(this.territory_ids)) {
      obj.territory_ids = this.territory_ids
    } else {
      obj.territory_ids = this.finalBu;
    }
    this._bidService.ValueFunnelReport(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.noData();
        this.loader = false;
        return;
      }
      if (resp && resp['data']) {

        if (isEmpty(resp['data'])) {
          this.loader = false;
          this.noData()
        }
        else {

          funnelObject = resp['data']['funnelArrayofObject']

          // wonBidCount = resp['data']['nullGraphvalue']['Won'];
          // lossBidCount = resp['data']['nullGraphvalue']['Loss'];
          // noDecisionCount = resp['data']['nullGraphvalue']['Nodecision'];
          titleYear = resp['data']['year']
          this.loader = false;
          // wonBidCount = resp['data']['funnelArrayofObject']['nullGraphvalue']['Won'];
          // console.log(wonBidCount, lossBidCount, noDecisionCount)

          // console.log(titleYear);
          if (funnelObject != undefined)
            this.renderFirstPlotInChart()
          else {

            funnelObject = funnelSampleObject['data']['funnelArrayofObject']
            // titleYear = funnelSampleObject['data']['year']
            this.renderFirstPlotInChart()
          }
        }
      }
      else {
        this.loader = false;
        this.noData()
      }
    }, error => {
      this.loader = false;
    });
  }

  ngOnInit() {
    this.loader = true;
    myConfig = {
      globals: {
        title: {
          text: 'Bid Funnel',
          adjustLayout: true,
          "width": 150,
          "height": 30

        },
        subtitle: {
          text: "",
          adjustLayout: true,
          // "width":150,
          "height": 50,
          "color": "#808080",
          "font-size": 12

        }
      },



      graphset: [
        {
          "x": "0%",
          "y": "5%",
          "type": "hfunnel",
          "height": "75%",
          "width": "94%",
          "scale-y": {
            "placement": "opposite",
            "labels": ["Bids Created", "Bids Approved", "Bids Submitted to Customers", "Bids Won",],
            "item": {
              "font-color": "black",
              // "font-family": "'Poppins', sans-serif",
              'font-family': "Helvetica Neue, Helvetica, Arial, sans- serif",
              "font-weight": "bold"
            }
          },
          "plotarea": {
            "margin": "40 20 20 20"
          },
          "plot": {
            "animation": {
              "effect": "ANIMATION_SLIDE_LEFT"
            },
            "value-box": {
              "text": "%v",
              "placement": "in",
              "font-color": "white",
              // "font-family": "'Poppins', sans-serif",
              'font-family': "Helvetica Neue, Helvetica, Arial, sans- serif",
              "font-size": 18,
              "font-weight": "normal"
            },
            "min-exit": "0%",
            "hover-state": {
              "background-color": "#17b495",
              "line-style": "dashdot"
            }
          },
          "series": []
        }]
    };
  }


  renderFirstPlotInChart = function () {
    myConfig['graphset'][0]["series"] = funnelObject
    myConfig['globals']['subtitle'].text = titleYear
    // myConfig['graphset'][0]["subtitle"]['text'] = wonBidCount
    // myConfig['graphset'][1]["subtitle"]['text'] = lossBidCount
    // myConfig['graphset'][2]["subtitle"]['text'] = noDecisionCount

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
      this.router.navigateByUrl('analysis/funnel'));
  }

}
