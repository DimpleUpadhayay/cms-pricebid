import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-productivity',
  templateUrl: './productivity.component.html',
  styleUrls: ['./productivity.component.css'],
  providers: [BidService, UsersService]
})
export class ProductivityComponent implements OnInit {
  user;
  bids = [];
  loader = false;
  zgRef;
  obj;
  @ViewChild(AlertComponent) alert: AlertComponent;

  selectedBUs = [];
  selectedTerritories = [];
  selectedTypes = [];
  selectedCategories = [];
  selectedOpportunityStatus = [];
  selectedBidStage = [];
  dropdownBUSettings;
  dropdownTerritorySettings;
  dropdownTypesSettings;
  dropdownCategorySettings;
  dropdownOpportunityStatusSettings;
  dropdownBidStageSettings;
  business_units = [];
  territories = [];
  types;
  category;
  dateTimeRange = [null, null];
  start; end;
  pendTaskData = [];
  totalBids = "";
  totalBidValue = "";
  opportunity_status = [{ "id": 1, "status": "Dropped" }, { "id": 2, "status": "Live" }, { "id": 3, "status": "Lost" }, { "id": 4, "status": "Won" }];
  bid_stage = [{ "id": 1, "status": "Approved", "value": "bidApproval" }, { "id": 2, "status": "Submitted", "value": "bidSubmit" }];

  
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

  constructor(private _bidService: BidService, public _userService: UsersService) {
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
      "start_date":  this.start,
      "end_date": this.end,
      "multiflagTerritory": "All",
      "multiflagBu": "All",
      "multiflagTypes": "All",
      "multiflagCategories": "All",
      "bid_name": "",
      "sales_person": "",
      "bidFinalStatus": ""
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
    this.dropdownOpportunityStatusSettings = {
      singleSelection: true,
      idField: 'status',
      textField: 'status',
      // selectAllText: 'Select All',
      // unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 0
    };
    this.dropdownBidStageSettings = {
      singleSelection: true,
      idField: 'value',
      textField: 'status',
      allowSearchFilter: false,
      itemsShowLimit: 0
    };
    this.getBids();
    this.getBuTerritories();
    this.getTypes();
    this.getCategoryData();
    this.getCompanyUser();
  }

  ngOnInit() {
    this.loader = true;
    this.zgRef = document.querySelector('zing-grid');
    console.log(this.zgRef)

    // window.onload event for Javascript to run after HTML
    // because this Javascript is injected into the document head
    window.addEventListener('load', () => {
      // content after DOM load
    });
    this.zgRef = document.querySelector('zing-grid');
    this.zgRef.addEventListener('record:click', (e) => {
      // destruct e.detail object for ZingGrid information
      const { ZGData, ZGEvent, ZGTarget } = e.detail;
      // console.log('--- Event Details ---\n', ZGData, ZGEvent, ZGTarget);
      window.open(ZGData.data.path);
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

  bidSubmitted(value) {
    if (value == undefined || value == false) {
      return "No";
    } else if (value == true) {
      return "Yes";
    }
  }

  // Get response
  getBids() {
    this.obj.bu_ids = this.user.bu_ids;
    this.obj.territory_ids = this.user.territory_ids;
    this.getResult();
  }

  getResult() {
    this.loader = true;
    this.bids = [];
    this.obj.start_date = this.start;
    this.obj.end_date = this.end;
    this._bidService.getBIProductivity(this.obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false;
        return;
      }
      var i = 1;
      this.totalBids = resp['data']['totalBidsCount'];
      this.totalBidValue = resp['data']['totalBidsValue'];
      // Convert response to given table format
      resp['data']['totalBids'].forEach(element => {
        let obj = {
          "Sr no": i,
          "Creation Date": this.getDate(element.bidCreatedDate),
          "Business Unit": element.bu_name,
          "Territory": element.territory_name,
          "Type": element.types_name ? element.types_name : "NA",
          "Category": element.category_name ? element.category_name : "NA",
          "Bid Number": element.bid_number,
          "Bid Name": element.bid_name,
          "Account Name": element.account_name,
          "Sales Person": element.SalesName ? element.SalesName.fullname : "NA",
          "Presales Person": element.PresalesName ? element.PresalesName.fullname : "NA",
          "Delivery Reviewer": element.deliveryReviewer ? element.deliveryReviewer : "NA",
          "Finance Reviewer": element.finaceReviewer ? element.finaceReviewer : "NA",
          "Submission Date": this.getDate(element.submit_date),
          "Stage": element.stageNo,
          // "Bid Status": element.stageName,
          "ACV (in Mn)": element.estimatedValue,
          "Task Status": this.getPendingTask(element.pendingTask),
          "Opportunity Status": element.bidFinalStatus,
          "Bid Approval Status": element.bidApprovalStatus,
          "Bid Submitted": this.bidSubmitted(element.bid_submit),
          "path": `bid-development/${element.bid_id}/mains`
        }
        this.bids.push(obj);
        i++;
      });
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  // Pending Task Call Method
  getPendingTask(result) {
    this.pendTaskData = [];
    if (result) {
      result.forEach(item => {
        this.pendTaskData.push(" " + item.name.replace("Pre-Pricing", "Delivery") + " - " + item.progress);
      })
    }
    return this.pendTaskData;
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

  //Export data
  getData() {
    const gridData = this.zgRef.getData();
    gridData.forEach(element => {
      delete element['path'];
    });
    // console.log('--- Getting Data From Grid: ---', gridData);
    this.JSONToCSVConvertor(gridData, `Productivity Report`, true);
  }

  // Convert file to CSV
  JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    var CSV = '';
    //Set Report title in first row or line

    // CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
      var row = "";

      //This loop will extract the label from 1st index of on array
      for (var index in arrData[0]) {

        //Now convert each value to string and comma-seprated
        row += index + ',';
      }

      row = row.slice(0, -1);

      //append Label row with line break
      CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
      var row = "";

      //2nd loop will extract each column and convert it in string comma-seprated
      for (var index in arrData[i]) {
        row += '"' + arrData[i][index] + '",';
      }

      row.slice(0, row.length - 1);

      //add a line break after each row
      CSV += row + '\r\n';
    }

    if (CSV == '') {
      alert("Invalid data");
      return;
    }

    //Generate a file name
    var fileName = "";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle/* .replace(/ /g, "_"); */

    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + encodeURI(CSV);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    // link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    if (this.selectedOpportunityStatus.length != 0) {
      this.obj.bidFinalStatus = this.selectedOpportunityStatus[0];
    } else {
      this.obj.bidFinalStatus = "";
    }
    if (this.selectedBidStage.length != 0) {
      this.obj.bidFilter = this.selectedBidStage[0].value;
    } else {
      this.obj.bidFilter = "";
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
    this.selectedBidStage = [];
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
    this.obj.bidFinalStatus = "";
    this.selectedOpportunityStatus = [];
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();
    if (month < 3) {
      year = (new Date()).getFullYear() - 1;
    }
    this.start = new Date("04/01/" + year);
    this.end = new Date(new Date().setDate(new Date().getDate()));
    this.getBids();
  }

}