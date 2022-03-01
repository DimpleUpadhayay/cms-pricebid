import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UsersService } from '../../../services/users.service';
import { Router } from '@angular/router';

import _ = require('lodash');

declare var zingchart: any;
var myConfig;
var rootScope;
var originalConfig;
@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.css'],
  providers: [BidService, UsersService]
})
export class RegionComponent implements OnInit {
  data;
  gridData;
  user;
  obj;
  zingGridFlag = false;
  zingChartFlag = true;
  filterFlag = true;
  loader = false;

  @ViewChild(AlertComponent) alert: AlertComponent;

  selectedBUs = [];
  selectedTerritories = [];
  dropdownBUSettings;
  dropdownTerritorySettings;
  business_units = [];
  territories = [];
  types;
  category;
  dateTimeRange = [null, null];
  start; end;
  pendTaskData = [];
  totalBids = "";
  totalBidValue = "";

  // serach by user name
  searchUser = "";
  searchDataArray = [];
  searchDataArray2 = [];

  // keyboard even on "user name" filter
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.target && event.target['id'] == "sales_person" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8)) {
      this.showResults(event);
    }
  }

  constructor(private _bidService: BidService, public _userService: UsersService, public router: Router) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();
    if (month < 3) {
      year = (new Date()).getFullYear() - 1;
    }
    this.start = new Date("04/01/" + year);
    this.end = new Date(new Date().setDate(new Date().getDate()));
    // sample request object to get response
    this.obj = {
      "status": 'ACTIVE',
      "user_id": this.user.user_id,
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start),
      "end_value": parseFloat(this.end),
      "territory_ids": [],
      "bu_ids": [],
      "type_ids": [],
      "category_ids": [],
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : this.start,
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : this.end,
      "multiflagTerritory": "All",
      "multiflagBu": "All",
      "multiflagTypes": "All",
      "multiflagCategories": "All",
      "bid_name": "",
      "sales_person": "",
      "isFilter": false
    }
    // Setting for multi dropdown
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
    this.getCompanyUser();
  }

  ngOnInit() {
    this.loader = true;
    rootScope = this;
    this.getValues();
    originalConfig = {
      type: 'bar',
      /* globals: {
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans- serif"
      }, */
      /* title: {
        text: 'Territory wise opportunity',
        'font-family': "Helvetica Neue, Helvetica, Arial, sans- serif"
      }, */
      plot: {
        // barWidth: 50,
        "value-box": {
          // "placement": "out",
          "text": "%data-sub-rating",
          "border-radius": 5
        },
        tooltip: {
          text: '%v',
          borderWidth: '0px',
          fontSize: '18px',
          shadow: true,
          shadowAlpha: 0.5,
          shadowBlur: 2,
          shadowColor: '#c4c4c4',
          shadowDistance: 3
        }/* ,
        animation: {
          // delay: 10,
          effect: 'ANIMATION_EXPAND_BOTTOM',
          method: 'ANIMATION_BACK_EASE_OUT',
          sequence: 'ANIMATION_BY_PLOT_AND_NODE',
          speed: '200'
        } */
      },
      plotarea: {
        margin: 'dynamic'
      },
      scaleX: {
        values: [],
        item: {
          color: '#555',
          fontSize: '12px',
          // maxChars: 9
        },
        label: {
          text: 'Territories',
          color: '#555',
          fontSize: '16px',
          fontWeight: 'none'
        },
        lineColor: '#555',
        tick: {
          lineColor: '#555'
        }
      },
      legend: {
        // toggleAction: 'remove',
        "adjust-layout": true
        // margin: "93% auto auto auto"
      },
      scaleY: {
        guide: {
          visible: false
        },
        item: {
          color: '#555',
          fontSize: '12px'
        },
        label: {
          text: 'No. of Bids',
          color: '#555',
          fontSize: '16px',
          fontWeight: 'none'
        },
        lineColor: '#555',
        tick: {
          lineColor: '#555'
        },
        "decimals": 0,
        "step": 5,
        // values: "0:50:1"
      },
      series: [
        {
          values: [],
          text: "Dropped",
          backgroundColor: "Blue"
        },
        {
          values: [],
          text: "Live",
          backgroundColor: "#FFA500"
        },
        {
          values: [],
          text: "Lost",
          backgroundColor: "Red"

        },
        {
          values: [],
          text: "Won",
          backgroundColor: "Green"
        }
      ]
    };

    /*
    * Built in zingchart API event used to capture node click events.
    * Starting from this scope you will handle drilldown functionality.
    */
    zingchart.node_click = function (p) {
      // You could use this data to help construct drilldown graphs check it out...
      let status;
      switch (p.plotindex) {
        case 0: status = "totalDroppedBidsList"; break;
        case 1: status = "totalLiveBidsList"; break;
        case 2: status = "totalLostBidsList"; break;
        case 3: status = "totalWonBidsList"; break;
        default: status = "totalLiveBidsList"
      }
      let data = [];
      if (p.scaletext != "Total") {
        data = rootScope.data.bidData.filter(a => {
          return p.scaletext == a.territory_name;
        });
      } else {
        data = [{}];
        let arr = [];
        rootScope.data.bidData.forEach(element => {
          arr.push(element[status])
        });
        data[0][status] = _.flatten(arr)
      }

      // rootScope.gridData = data[0][status];
      rootScope.gridData = { "bids": [] };
      let i = 1;
      data[0][status].forEach(element => {
        let obj = {
          "Sr No": i,
          "Bid Name": element.bid_name,
          "Bid Number": element.bid_number,
          "ACV (in Mn)": element.bid_value,
          "Bid Status": element.bidFinalStatus,
          "path": `bid-development/${element.bid_id}/mains`
        }
        rootScope.gridData.bids.push(obj);
        i++;
      });
      rootScope.gridData['filename'] = "Territory wise Report";
      zingchart.exec('myChart', 'destroy');
      rootScope.filterFlag = false;
      rootScope.zingGridFlag = true;
      rootScope.zingChartFlag = false;
    }
  }

  getValues() {
    this.obj.bu_ids = this.user.bu_ids;
    this.obj.territory_ids = this.user.territory_ids;
    this._bidService.bidsOpportunity(this.obj).subscribe(resp => {
      this.data = resp['data'];
      this.loader = false;
      this.plotBarChart();
    }, err => {
      this.loader = false;
    });
  }

  // Get response
  getResult() {
    this.obj.isFilter = true;
    this._bidService.bidsOpportunity(this.obj).subscribe(resp => {
      this.data = resp['data'];
      this.loader = false;
      this.plotBarChart();
    }, err => {
      this.loader = false;
    });
  }

  // plot Bar Graph
  plotBarChart() {
    originalConfig.series[0].values = this.data.totalDroppedBids;
    originalConfig.series[1].values = this.data.totalLivedBids;
    originalConfig.series[2].values = this.data.totalLostBids;
    originalConfig.series[3].values = this.data.totalWonBids;
    originalConfig.scaleY.values = "0:" + this.data.maxYaxis + ":1"
    originalConfig.scaleX.values = this.data.bidLabel;

    /* var valueTextArray = [];
    each(originalConfig.series[0].values, function (n) {
      valueTextArray.push("₹");
    }); */
    // originalConfig.series[0]['data-sub-text'] = valueTextArray;
    originalConfig.series[0]['data-sub-rating'] = this.data.totalDroppedBidsValue;
    // originalConfig.series[1]['data-sub-text'] = valueTextArray;
    originalConfig.series[1]['data-sub-rating'] = this.data.totalLiveBidsValue;
    // originalConfig.series[2]['data-sub-text'] = valueTextArray;
    originalConfig.series[2]['data-sub-rating'] = this.data.totalLostBidsValue;
    // originalConfig.series[4]['data-sub-text'] = valueTextArray;
    originalConfig.series[3]['data-sub-rating'] = this.data.totalWonBidsValue;

    zingchart.render({
      id: 'myChart',
      data: originalConfig,
      height: '100%',
      width: '100%'
    });

  }

  render() {
    rootScope.zingChartFlag = true;
    rootScope.filterFlag = false;
    rootScope.zingGridFlag = false;
    zingchart.render({
      id: 'myChart',
      data: originalConfig,
      height: '100%',
      width: "100%"
    });
  }

  // on refresh method
  onReload() {
    this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
      this.router.navigateByUrl('analysis/region'));
  }

  // Convert date of response in DD/MM/YYYY format
  getDate(date) {
    var today = new Date(date);
    var dd: any = today.getDate();
    var mm: any = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return dd + '/' + mm + '/' + yyyy;
  }

  // get BU and territorries details
  getBuTerritories() {
    this._userService.getCompanyDetails({ "user_id": this.user.user_id }).subscribe(res => {
      this.business_units = res['data']['user']['bussiness_unit']
      this.territories = res['data']['user']['territory']
    }, error => {
    })
  }

  // Get list of company users
  getCompanyUser() {
    let obj = { status: "ACTIVE" }
    this._userService.getCompanyUserData(obj).subscribe((resp: any) => {
      if (resp['data'] == null) {
        return;
      }
      this.searchDataArray2 = resp['data']['users'].length > 0 ? resp['data']['users'] : undefined;
    }, error => {
    })
  }

  // get list of users on keyboard input
  showResults(event) {
    var searchText = this.searchUser;
    if (searchText.length == 0) {
      this.searchDataArray = undefined;
      this.searchDataArray = [];
      this.searchDataArray2.length = 1;
      this.obj.sales_person = "";
      $("#showResults").hide();
      return;
    }
    let obj = {
      "company_id": this.user.company_id,
      "username": searchText,
      status: 'ACTIVE'
    }
    this._userService.getCompanyUserData(obj).subscribe(response => {
      if (response['data'] == null) {
        this.searchDataArray = [];
        this.searchDataArray2 = [];
        return;
      }
      if (response && response['data']) {
        this.searchDataArray = response['data']['users'].length > 0 ? response['data']['users'] : undefined;
        this.searchDataArray2 = response['data']['users'].length > 0 ? response['data']['users'] : undefined;
        $("#showResults").show();
      } else {
        this.searchDataArray = [];
      }
    }, error => {
      this.searchDataArray = [];
      this.searchDataArray2 = [];
    })
  }

  // set user name
  setData(user_id, name) {
    $("#showResults").hide();
    this.searchUser = name;
    this.obj.sales_person = user_id;
  }

  // Method on filter change
  onItemSelect(item: any) {
    if (this.selectedBUs.length != 0) {
      this.obj.bu_ids = [];
      this.selectedBUs.forEach(element => {
        this.obj.bu_ids.push(element.bu_id);
      });
    } else {
      this.obj.bu_ids = this.user.bu_ids;
    }
    if (this.selectedTerritories.length != 0) {
      this.obj.territory_ids = [];
      this.selectedTerritories.forEach(element => {
        this.obj.territory_ids.push(element.territory_id);
      });
    } else {
      this.obj.territory_ids = this.user.territory_ids;
    }
    this.obj.start_date = this.dateTimeRange[0] ? this.dateTimeRange[0] : "";
    this.obj.end_date = this.dateTimeRange[1] ? this.dateTimeRange[1] : "";
    this.obj.start_value = parseFloat(this.obj.start_date);
    this.obj.end_value = parseFloat(this.obj.end_date);
    if(this.obj.start_date)
      this.start=this.obj.start_date
    if(this.obj.end_date)
      this.end=this.obj.end_date
  }

  // Method on select all
  onSelectAll(item: any) {
    if (item[0].bu_id) {
      this.obj.bu_ids = [];
      item.forEach(element => {
        this.obj.bu_ids.push(element.bu_id);
      });
    }
    if (item[0].territory_id) {
      this.obj.territory_ids = [];
      item.forEach(element => {
        this.obj.territory_ids.push(element.territory_id);
      });
    }
    if (item[0].type_name) {
      this.obj.type_ids = [];
      item.forEach(element => {
        this.obj.type_ids.push(element._id);
      });
    }
    if (item[0].category_name) {
      this.obj.category_ids = [];
      item.forEach(element => {
        this.obj.category_ids.push(element._id);
      });
    }
  }

  // Method on deselect all
  onDeSelectAll(item, type) {
    if (type == 'BU') {
      this.obj.bu_ids = this.user.bu_ids;
    }
    if (type == 'Territory') {
      this.obj.territory_ids = this.user.territory_ids;
    }
    if (type == 'Types') {
      this.obj.type_ids = [];
    }
    if (type == 'Category') {
      this.obj.category_ids = [];
    }
  }

  // To clear all filters
  onClear() {
    this.selectedBUs = [];
    this.selectedTerritories = [];
    this.dateTimeRange = [null, null];
    this.searchUser = "";
    this.searchDataArray = [];
    this.searchDataArray2.length = 1;
    this.obj.type_ids = [];
    this.obj.category_ids = [];
    this.obj.start_value = '';
    this.obj.end_value = '';
    this.obj.start_date = "";
    this.obj.end_date = "";
    this.obj.multiflagTerritory = "All";
    this.obj.multiflagBu = "All";
    this.obj.multiflagTypes = "All";
    this.obj.multiflagCategories = "All";
    this.obj.bid_name = "";
    this.obj.sales_person = "";
    this.obj.isFilter = false;
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();
    if (month < 3) {
      year = (new Date()).getFullYear() - 1;
    }
    this.start = new Date("04/01/" + year);
    this.end = new Date(new Date().setDate(new Date().getDate()));
    this.getValues();
  }

}