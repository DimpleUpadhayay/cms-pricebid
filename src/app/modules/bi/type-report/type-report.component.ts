import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { Router } from '@angular/router';

declare var zingchart: any;
var rootScope;
var originalConfig;

@Component({
  selector: 'app-type-report',
  templateUrl: './type-report.component.html',
  styleUrls: ['./type-report.component.css'],
  providers: [BidService, UsersService]
})

export class TypeReportComponent implements OnInit {
  data;
  gridData;
  user;
  obj;
  status = ["Won", "Live", "Dropped", "Lost"]
  colours = ["blue", "yellow", "purple", "grey"];
  zingGridFlag = false;
  zingChartFlag = true;
  filterFlag = true;
  loader = false;

  @ViewChild(AlertComponent) alert: AlertComponent;

  selectedBUs = [];
  selectedTerritories = [];
  selectedTypes = [];
  selectedCategories = [];
  dropdownBUSettings;
  dropdownTerritorySettings;
  dropdownTypesSettings;
  dropdownCategorySettings;
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
    // sample request object to get response
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();
    if (month < 3) {
      year = (new Date()).getFullYear() - 1;
    }
    this.start = new Date("04/01/" + year);
    this.end = new Date(new Date().setDate(new Date().getDate()));
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
      "sales_person": ""
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
    this.dropdownTypesSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'type_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 0
    };
    this.dropdownCategorySettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'category_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 0
    };
    this.getBuTerritories();
    this.getTypes();
    this.getCategoryData();
    this.getCompanyUser();
  }


  ngOnInit() {
    this.loader = true;
    rootScope = this;
    this.getValues();
   
    // Configuration for bar chart
    originalConfig = {
      "type": "pie",
      // "legend": {
      //   'highlight-plot': true
      // },
      "title": { 
        // "text": 'Deals by Type',
        'font-family': "Helvetica Neue, Helvetica, Arial, sans- serif",
      },
      "plot": {
        "detach": false,
        "cursor": "hande",
        "shadow": 8,
        "value-box": {
          "placement": "out",
          // "text": "%t: %v (%npv%)",
          "border-radius": 5
        },
      },
      // "plotarea": {
      //   "margin": "0 0 0 0"
      // },
      "tooltip": {
        "text": "%t: %v (%npv%)",
        "border-radius": 5
      },
      legend: {
      },
      "series": []
    }

    /*
    * Built in zingchart API event used to capture node click events.
    * Starting from this scope you will handle drilldown functionality.
    */
    zingchart.node_click = function (p) {
      // You could use this data to help construct drilldown graphs check it out...
      rootScope.gridData = { "bids": [] };
      let i = 1;
      rootScope.data.bidTypesData[p.plotindex]['bid'].forEach(element => {
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
      rootScope.gridData['filename'] = "Deals by Type";
      // console.log(rootScope.gridData)
      zingchart.exec('myChart', 'destroy');
      rootScope.filterFlag = false;
      rootScope.zingGridFlag = true;
      rootScope.zingChartFlag = false;
    }
  }

  // Get response
  getValues() {
    this.obj.bu_ids = this.user.bu_ids;
    this.obj.territory_ids = this.user.territory_ids;
    this.getResult();
  }

  getResult() {

    this._bidService.gettypesOpportunity(this.obj).subscribe(resp => {
      this.data = resp['data'];
      this.totalBids = this.data.totalBidCount;
      this.totalBidValue = this.data.totalBidValue;
      this.loader = false;
      this.plotPieChart();
    }, err => {
      this.loader = false;
    });
  }

  plotPieChart() {
    originalConfig.series = rootScope.data.typesArray;
    // originalConfig.title.text='Deals by Type';
    this.render();
  }

  render() {
    zingchart.render({
      id: 'myChart',
      data: originalConfig,
      height: 400,
      width: "100%"
    });
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

  // get type response
  getTypes() {
    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE',
    }
    this._bidService.readType(obj).subscribe(resp => {
      if (resp['data'] == null) {
        return;
      }
      this.types = resp['data']['type_data']
    }, error => {
    })
  }

  // get category response
  getCategoryData() {
    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE',
    }
    this._bidService.readCategory(obj).subscribe(resp => {
      if (resp['data'] == null) {
        return;
      }
      this.category = resp['data']['category_data']
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
    if (this.selectedTypes.length != 0) {
      this.obj.type_ids = [];
      this.selectedTypes.forEach(element => {
        this.obj.type_ids.push(element._id);
      });
    } else {
      this.obj.type_ids = [];
    }
    if (this.selectedCategories.length != 0) {
      this.obj.category_ids = [];
      this.selectedCategories.forEach(element => {
        this.obj.category_ids.push(element._id);
      });
    } else {
      this.obj.category_ids = [];
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
    this.selectedTypes = [];
    this.selectedCategories = [];
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
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();
    if (month < 3) {
      year = (new Date()).getFullYear() - 1;
    }
    this.start = new Date("04/01/" + year);
    this.end = new Date(new Date().setDate(new Date().getDate()));
    this.getValues();
  }

  // on refresh method
  onReload() {
    this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
      this.router.navigateByUrl('analysis/types'));
  }

}