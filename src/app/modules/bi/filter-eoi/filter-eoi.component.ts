import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { EmdService } from '../../../services/emd.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UsersService } from '../../../services/users.service';
import { TerritoryService } from "../../../services/territories.service";
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';


@Component({
  selector: 'app-filter-eoi',
  templateUrl: './filter-eoi.component.html',
  styleUrls: ['./filter-eoi.component.css'],
  providers: [EmdService, UsersService, TerritoryService,HttpService]
})

export class FilterEoiComponent implements OnInit {

  @ViewChild(AlertComponent) alert: AlertComponent;
  @ViewChild('multiSelect') multiSelect;

  user;
  role;
  historyData;
  zgRef;
  myResult = [];
  loader = false;
  DataLength = 0;
  excelData;
  count = 1;
  pageCount = 0;
  Filterobj;
  pageNo = 1;
  totalRecords;
  dateTimeRange = [null, null];
  searchDataCust = [];
  searchDataCust2 = [];
  searchDataSales = [];
  searchDataSales2 = [];
  dropdownTerritorySettings;
  territories;
  territory_ids = [];
  locations1 = [];
  filterTerritory = [];
  access;
  isViewer = false; 
  start: Date;
  end: Date;

  @HostListener('window:keyup', ['$event'])

  // This will be invoking on keyboard event. (when you press any key on key board)
  keyEvent(event: KeyboardEvent, pageNo) {
    // this is to indicate you have pressed ENTER key in keyboard (to ENTER Page Number in pagination)
    if (event.keyCode == 13 && event.target['id'] == "myInput") {    // this is to indicate you have pressed ENTER key in keyboard
      event.stopImmediatePropagation(); // sometimes two immediate event trigger on pressing ENTER key once, to void this event twice.
      if ((pageNo == 0) || pageNo < 0 || (pageNo > this.pageCount) || (pageNo == undefined || pageNo == 'e' || pageNo == '-' || pageNo == '--' ||
        pageNo > this.pageCount || pageNo == '' || pageNo == null)) {
        this.alert.sweetError("Please enter valid page number");
        return;
      } else {
        this.myResult = [];
        this.count = (pageNo * 10) - 9;
        // console.log(this.count)
        this.loader = true;
        this.filterEOIData(pageNo);
      }
    }
    // this is to indicate you have given keyboard input in place of CustomerName field in filter Section
    if (event.target && event.target['id'] == "customer" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8)) {
      this.showResultsCustomer(event);
    }
    // this is to indicate you have given keyboard input in place of SalesPerson field in filter Section
    if (event.target && event.target['id'] == "sales_person" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8)) {
      this.showResultsSales(event);
    }
  }

  constructor(private EmdService: EmdService, private _userService: UsersService, 
    private territoryService: TerritoryService, private router: Router,private _httpService: HttpService) {
    // Current user data
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.getTerritories();
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();
    if (month < 3) {
      year = (new Date()).getFullYear() - 1;
    }
    this.start = new Date("04/01/" + year);
    this.end = new Date(new Date().setDate(new Date().getDate()));
    // object to pass to backend
    this.Filterobj = {
          "locations": [],
          "customerName": "",
          "eoiRequestId": "",
          "accountManager": "",
          "lastDateForSubmissionOfEoi": "",
          "start_date": this.start,
          "end_date": this.end,
          // "territoryList": this.filterTerritory,
          // "salesPersonId": "",
    };
    
    // this condition indicates, current user is Sales Manager
    if (this.user.user_type == "BID_OWNER" && this.user.user_subtype == "Sales") {
      this.role = "Sales Manager"
      this.Filterobj.role = "Sales Manager"
      // this.Filterobj.salesPersonId = this.user.user_id;
    }

    this.filterEOIData(this.DataLength);
    this.dropdownTerritorySettings = {
      singleSelection: false,
      idField: 'territory_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 1
    };

    this._httpService.accessControl({
      "module": "dashboard",
      "user_id": this.user.user_id
    }).subscribe(response => {
      this.access = response['data'];
      // this.user_type = this.access.userTypes[0].user_type;
      // this.user_subtype = this.access.userTypes[0].user_subtype;
      this.isViewer = (this.access.userTypes.filter(a => a.user_type == 'VIEWER' || a.user_type == 'ACCOUNTS_EXE_TREASURY' || a.user_type == 'FINANCE_CONTROLLER')).length > 0 ? true : false;
      // console.log(this.access);
    }, error => {
      console.log(error);
    });

  }
  ngOnInit() {
    this.loader = true;
    this.zgRef = document.querySelector('zing-grid');
    // window.onload event for Javascript to run after HTML because this Javascript is injected into the document head
    window.addEventListener('load', () => {
      // content after DOM load
    });
    this.zgRef = document.querySelector('zing-grid');

    // this is to open new window on clicking one row.
    this.zgRef.addEventListener('record:click', (e) => {
      localStorage.setItem('EOIId', e.detail.ZGData.data['Tender Fee No'])
      e.detail.ZGData.data['Tender Fee No'];
      // destruct e.detail object for ZingGrid information
      // const { ZGData, ZGEvent, ZGTarget } = e.detail;
      // this.router.navigateByUrl('/EOI/'+ e.detail.ZGData.data.bid_id)
      window.open('/EOI/'+ e.detail.ZGData.data.bid_id);

    });
  }

  // Get all Territories for Dropdown list in filters
  getTerritories() {
    this._userService.getCompanyDetails({ "user_id": this.user.user_id }).subscribe(res => {
      this.territories = res['data']['user']['territory'];
      this.territories.forEach(element => {
        this.filterTerritory.push(element.territory_id);
      });
    }, error => {
    })
  }
  
  // To get complete PBG Records and to get Records on filters. Also consists of pagination logic. (This bring only 10 records on each call)
  filterEOIData(pageNo) {
    if (pageNo == 0) {
      this.Filterobj.pageNo = this.pageNo;
    } else {
      this.Filterobj.pageNo = this.pageNo;
    }
    this.Filterobj.skipDocs = 10;
    this.EmdService.filterEOIData(this.Filterobj).subscribe(data => {
      if (data['data']['EOIRecords'].length == 0 || data['data'] == null) {
        this.totalRecords = 0;
        this.historyData = [];
        this.alert.sweetError("No Data Found");
        this.loader = false
      } else {
        this.historyData = data['data']['EOIRecords'];
        this.totalRecords = data['data']['totalcount']; // Total Records count
        this.pageCount = Math.ceil(this.totalRecords / 10); // to count how many pages will be taken for result records, if each page consists of 10 records
        this.historyData.forEach(element => {
          // Data modification ----> if data is empty replacing data with "N/A"
          if (element.lastDateForSubmissionOfEoi == undefined || element.lastDateForSubmissionOfEoi == null) {
            element.lastDateForSubmissionOfEoi = "N/A"
          } else {
            // to format the date
            let res = element.lastDateForSubmissionOfEoi.toString().split('T');
            let res1 = res[0].toString().split('-');
            let temp = res1[0];
            res1[0] = res1[2];
            res1[2] = temp;
            element.lastDateForSubmissionOfEoi = res1[0] + '/' + res1[1] + '/' + res1[2]
          }
          if (element.tenderDate == undefined || element.tenderDate == null || element.tenderDate == "N/A") {
            element.tenderDate = "N/A"
          } else {
            let res = element.tenderDate.toString().split('T');
            let res1 = res[0].toString().split('-');
            let temp = res1[0];
            res1[0] = res1[2];
            res1[2] = temp;
            element.tenderDate = res1[0] + '/' + res1[1] + '/' + res1[2]
          }
          if (element.eoiAmount == undefined || element.eoiAmount == null) {
            element.eoiAmount = "N/A"
          }

          if (element.SalesManagerInfo.length) {
            if ((element.SalesManagerInfo[0].fullname == undefined || element.SalesManagerInfo[0].fullname == null || element.SalesManagerInfo[0].fullname == "")) {
              var SalesPerson = "N/A"
            } else {
              SalesPerson = element.SalesManagerInfo[0].fullname
            }
          } else {
            var SalesPerson = "N/A"
          }
          if (element.CustomerNameInfo.length) {
            if ((element.CustomerNameInfo[0].account_name == undefined || element.CustomerNameInfo[0].account_name == null || element.CustomerNameInfo[0].account_name == "")) {
              var Customer = "N/A"
            } else {
              Customer = element.CustomerNameInfo[0].account_name
            }
          } else {
            var Customer = "N/A"
          }
          if (element.tenderNumber == undefined || element.tenderNumber == null || element.tenderNumber == "N/A") {
            element.tenderNumber = "N/A"
          }
          if (element.payableAt == undefined || element.payableAt == null) {
            element.payableAt = "N/A"
          }
          if (element.modeOfPayment == undefined || element.modeOfPayment == null || element.customerName == "N/A") {
            element.modeOfPayment = "N/A"
          }
          if (element.eoiInFavourOf == undefined || element.eoiInFavourOf == null || element.tenderNumber == "N/A") {
            element.eoiInFavourOf = "N/A"
          }
          if (element.orderType == undefined || element.orderType == null) {
            element.orderType = "N/A"
          }
          if (element.orderValue == undefined || element.orderValue == null) {
            element.orderValue = "N/A"
          }
          // Mapping the data of API Response to the HTML Fields (KEYS - HTML Fields) and (VALUES - backend response)
          var result = {
            "Srl": this.count++,
            "Tender Fee No": element.eoiRequestId,
            "Amount": element.eoiAmount,
            "Sales Manager": SalesPerson,
            "Customer Name": Customer,
            "Tender Number": element.tenderNumber,
            "Tender Date": element.tenderDate,
            "Tender Fee in favour of": element.eoiInFavourOf,
            "Payable At": element.payableAt,
            "Mode of Payment": element.modeOfPayment,
            "Last Date for Submission": element.lastDateForSubmissionOfEoi,
            "Order Type": element.orderType,
            "Order Value": element.orderValue,
            "Status": element.approval_status,
            "bid_id": element.bid_id
          }
          this.myResult.push(result);
        },
          this.loader = false);
      }
    })
  }
  // get list of users on keyboard input of CustomerName field in filter Section
  showResultsCustomer(event) {
    var obj = {
      CustomerName: this.Filterobj.CustomerName,
      status: 'ACTIVE'
    }
    var searchText = this.Filterobj.CustomerName;
    if (searchText.length == 0) {
      this.searchDataCust = undefined;
      this.searchDataCust = [];
      this.searchDataCust2.length = 1;
      $("#showResultsCustomer").hide();
      return;
    }
    this.EmdService.getAccountByName(obj).subscribe(response => {
      if (response['data'] == null) {
        this.searchDataCust = [];
        this.searchDataCust2 = [];
        return;
      }
      if (response && response['data']) {
        this.searchDataCust = response['data']['accountName'].length > 0 ? response['data']['accountName'] : undefined;
        this.searchDataCust2 = response['data']['accountName'].length > 0 ? response['data']['accountName'] : undefined;
        $("#showResultsCustomer").show();
      } else {
        this.searchDataCust = [];
      }
    }, error => {
      this.searchDataCust = [];
      this.searchDataCust2 = [];
    })
  }
  // Set Customer name in the CustomerName field
  setDataCustomer(user_id, name) {
    $("#showResultsCustomer").hide();
    this.Filterobj.CustomerName = name;
    this.Filterobj.CustomerId = user_id;
    // this.obj.sales_person = user_id;
  }
  // get list of users on keyboard input of SalesPerson field in filter Section
  showResultsSales(event) {
    var obj = {
      username: this.Filterobj.orderBookedPersonName,
      status: 'ACTIVE'
    }
    var searchText = this.Filterobj.orderBookedPersonName;
    if (searchText.length == 0) {
      this.searchDataSales = undefined;
      this.searchDataSales = [];
      this.searchDataSales2.length = 1;
      $("#showResultsSales").hide();
      return;
    }
    this._userService.getCompanyUserData(obj).subscribe((response: any) => {
      if (response['data'] == null) {
        this.searchDataSales = [];
        this.searchDataSales2 = [];
        return;
      }
      if (response && response['data'] && response['data']['users']) {
        let data = response['data']['users'];
        this.searchDataSales = [];
        data.forEach(element => {
          element.userTypes.filter(a => {
            if (a.user_type == "BID_OWNER" && a.user_subtype == 'Sales') {
              this.searchDataSales.push(element)
            }
          });
        })
        // this.searchDataSales = response['data']['users'].length > 0 ? response['data']['users'] : undefined;
        // this.searchDataSales2 = response['data']['users'].length > 0 ? response['data']['users'] : undefined;
        $("#showResultsSales").show();
      } else {
        this.searchDataSales = [];
      }
    }, error => {
      this.searchDataSales = [];
      this.searchDataSales2 = [];
    })
  }
  // Set Customer name in the SalesPerson field
  setDataSales(user_id, name) {
    $("#showResultsSales").hide();
    this.Filterobj.username = user_id;
    this.Filterobj.orderBookedPersonName = name;
    // this.obj.sales_person = user_id;
  }
  // On search by filters
  onSubmit() {
    this.count = 1
    this.pageNo = 1;
    this.DataLength = 0;
    this.loader = true;
    this.myResult = [];
    this.Filterobj.pageNo = this.pageNo;
    // this.Filterobj.salesPersonId = this.user.user_id;
    // this.Filterobj.territoryList = this.filterTerritory;
    this.filterEOIData(this.DataLength);
  }
  // To clear all filters
  onClear() {
    this.pageNo = 1;
    this.count = 1;
    // empty all filter fields and filter data
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();
    if (month < 3) {
      year = (new Date()).getFullYear() - 1;
    }
    this.start = new Date("04/01/" + year);
    this.end = new Date(new Date().setDate(new Date().getDate()));
    this.Filterobj = {
      "customerName": "",
      "eoiRequestId": "",
      "accountManager": "",
      "lastDateForSubmissionOfEoi": "",
      "locations": [],
      "pageNo": 1,
      "skipDocs": 10,
      "start_date": this.start,
      "end_date": this.end
    }
   
    this.dateTimeRange = [null, null];
    this.DataLength = 0;
    this.loader = true;
    this.myResult = [];
    this.searchDataCust = [];
    this.searchDataCust2 = [];
    this.searchDataSales = []
    this.searchDataSales2 = [];
    this.loader = true;
    // this.Filterobj.salesPersonId = this.user.user_id;
    // this.Filterobj.territoryList = this.filterTerritory;
    this.filterEOIData(this.DataLength);
    this.locations1 = [];
  }
  // Select any item on date selection Dropdown
  public onItemSelectDate(item: any) {
    this.Filterobj.start_date = this.dateTimeRange[0] ? this.dateTimeRange[0] : "";
    this.Filterobj.end_date = this.dateTimeRange[1] ? this.dateTimeRange[1] : "";
    this.start = this.Filterobj.start_date;
    this.end = this.Filterobj.end_date;
  }
  // Selection and De-Selection of items on ngMultiSelect Dropdown (location)
  public onItemSelect(item: any, type) {
    this.Filterobj.locations.push(item.territory_id);
  }
  public onDeSelect(item: any, type) {
    for (let i = 0; i < this.Filterobj.locations.length; i++) {
      if (this.Filterobj.locations[i] == item.territory_id) {
        this.Filterobj.locations.splice(i, 1);
      }
    }
  }
  public onSelectAll(items: any, type) {
  }
  public onDeSelectAll(items: any, type) {
  }
  // On NEXT and PREVIOUS buttons of pagination
  pagination(type) {
    this.loader = true;
    this.myResult = [];
    this.historyData = [];
    if (type == 'Next') {
      if (this.pageNo > this.pageCount) {
        this.alert.sweetError("Please enter valid page number");
        this.loader = false
        return;
      } else {
        this.pageNo++;
        // this.count=this.count+10
        this.count = (this.pageNo * 10) - 9;
        this.DataLength = this.DataLength + 10;
        this.Filterobj.pageNo = this.pageNo;
        this.filterEOIData(this.DataLength)
      }
    } else if (type == 'Previous') {
      if ((this.pageNo == 0) || this.pageNo < 0 || (this.pageNo > this.pageCount) || (this.pageNo == undefined ||
        this.pageNo > this.pageCount || this.pageNo == null)) {
        this.alert.sweetError("Please enter valid page number");
        return;
      } else {
        this.pageNo--;
        this.count = (this.pageNo * 10) - 9;
        // this.count=this.count-20;
        this.DataLength = this.DataLength - 10;
        this.Filterobj.pageNo = this.pageNo;
        this.filterEOIData(this.DataLength)
        this.loader = true
      }
    }
  }
  // Export data
  getData() {
    this.excelData.forEach(element => {
      delete element['path'];
    });
    this.JSONToCSVConvertor(this.excelData, "PBG History Data", true);
  }
  // Convert file to CSV (EXCEL CONVERSION)
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

}
