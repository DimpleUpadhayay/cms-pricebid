import { Component, OnInit, ViewChild, HostListener } from '@angular/core';

import { AlertComponent } from '../../../libraries/alert/alert.component';

import { UsersService } from '../../../services/users.service';
import { BidService } from '../../../services/bid.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-pending-task-report',
  templateUrl: './pending-task-report.component.html',
  styleUrls: ['./pending-task-report.component.css'],
  providers: [BidService, UsersService]
})
export class PendingTaskReportComponent implements OnInit {
  data = [];
  user;
  zgRef;
  obj;
  access;
  @ViewChild(AlertComponent) alert: AlertComponent;

  loader = false;
  isViewer = false;

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
  searchBid = "";
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

  constructor(private _bidService: BidService, public _userService: UsersService,
    private _httpService: HttpService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    // sample request object to get response
    this.obj = {
      "status": 'ACTIVE',
      "user_id": this.user.user_id,
      "company_id": this.user.company_id,
      "start_value": parseFloat(this.start),
      "end_value": parseFloat(this.end),
      "territory_ids": [],
      "bu_ids": [],
      "start_date": this.dateTimeRange[0] ? this.dateTimeRange[0] : "",
      "end_date": this.dateTimeRange[1] ? this.dateTimeRange[1] : "",
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
    this._httpService.accessControl({
      "module": "dashboard",
      "user_id": this.user.user_id
    }).subscribe(response => {
      this.access = response['data'];
      // this.user_type = this.access.userTypes[0].user_type;
      // this.user_subtype = this.access.userTypes[0].user_subtype;
      this.isViewer = (this.access.userTypes.filter(a => a.user_type == 'VIEWER')).length > 0 ? true : false;
      this.getBids();
      this.getBuTerritories();
      this.getTypes();
      this.getCategoryData();
      this.getCompanyUser();
      // console.log(this.access);
    }, error => {
      console.log(error);
    });
  }

  ngOnInit() {
    this.loader = true;
    this.zgRef = document.querySelector('zing-grid');
    // window.onload event for Javascript to run after HTML
    // because this Javascript is injected into the document head
    window.addEventListener('load', () => {
      // content after DOM load
      // th
    })
  }

  // Get response
  getBids() {
    this.obj.bu_ids = this.user.bu_ids;
    this.obj.territory_ids = this.user.territory_ids;
    if (!this.isViewer) {
      this.obj.sales_person = this.user.user_id;
    }
    this.obj.bid_name=this.searchBid
    this.getResult();
  }

  getResult() {
    this.loader = true;
    this.obj.bid_name=this.searchBid;
    this._bidService.getUserProductivity(this.obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false;
        return;
      }
      this.data = [];
      let i = 1;
      // Convert response to given table format
      resp['data']['user_list'].forEach(element => {
        let obj = {
          "Sr no": i,
          "User Name": element.username,
          // "Tasks Not Assigned": element.taskNotAssign,
          "Tasks Not Assigned": element.taskNotassigBidNumber || "-",
          // "Tasks Not Completed": element.taskNotCompleted,
          "Tasks Not Completed": element.bidDevlopmentTasknotCompletedName || "-",
          "EMD": element.bid_numberEmd || "-",
          "PBG": element.bid_numberPbg || "-",
          // "Pending to Submit for Pricing Review": element.pendingSendReview,
          // "Pending to Submit for Pricing Review": element.sendReviewBidNumber || "-",
          // "Review Pending": element.reviewPending,
          "Review Pending": element.reviewTaskPendingBidNumber || "-",
          // "Pending to Submit for Approval": element.approvalSendPending,
          "Pending to Submit for Approval": element.sendApprovalBidNumber || "-",
          // "Approval Pending": element.approvalPending,
          "Approval Pending": element.approvalTaskPendingBidNumber || "-",
          // "Approval Completed": element.approvalCompleted,
          "Total": element.totalValue || "-",
          "Bid Number": element.bid_number ? element.bid_number : "NA"
        }
        i++;
        this.data.push(obj);
      });
      // this.zgRef.setAttribute('data', JSON.stringify(this.data));
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  // getIncompleteTasks(pricing, proposal, solution, legal, docsRequired) {
  //   let data = "";
  //   if (!pricing && !proposal && !solution && !legal && !docsRequired) {
  //     data = "-"
  //   } else {
  //     if (pricing) {
  //       data = data + pricing;
  //     }
  //     if (proposal) {
  //       // data = data + "," + proposal;
  //       data = data + proposal;
  //     }
  //     if (solution) {
  //       data = data + ", " + solution;
  //     }
  //     if (legal) {
  //       data = data + ", " + legal;
  //     }
  //     if (docsRequired) {
  //       data = data + ", " + docsRequired;
  //     }
  //     data = data.replace(", ", "");
  //   }
  //   return data;
  // }


  // get BU and territorries details
  getBuTerritories() {
    this._userService.getCompanyDetails({ "user_id": this.user.user_id }).subscribe(res => {
      this.business_units = res['data']['user']['bussiness_unit']
      this.territories = res['data']['user']['territory']
    }, error => {
    })
  }

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
    // console.log('--- Getting Data From Grid: ---', gridData);
    this.JSONToCSVConvertor(gridData, "Pending Task Report", true);
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
    this.obj.start_value = parseFloat(this.start);
    this.obj.end_value = parseFloat(this.end);
    this.obj.start_date = this.dateTimeRange[0] ? this.dateTimeRange[0] : "";
    this.obj.end_date = this.dateTimeRange[1] ? this.dateTimeRange[1] : "";
    this.obj.bid_name=this.searchBid;
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
    this.start = '';
    this.end = '';
    this.dateTimeRange = [null, null];
    this.searchUser = "";
    this.searchBid = "";
    this.obj.bu_ids = [];
    this.obj.territory_ids = [];
    this.obj.type_ids = [];
    this.obj.category_ids = [];
    this.obj.multiflagBu = "All";
    this.obj.multiflagTerritory = "All";
    this.obj.multiflagTypes = "All";
    this.obj.multiflagCategories = "All";
    this.obj.start_value = '';
    this.obj.end_value = '';
    this.obj.start_date = "";
    this.obj.end_date = "";
    this.obj.bid_name = "";
    this.obj.sales_person = "";
    this.getBids();
  }

}
