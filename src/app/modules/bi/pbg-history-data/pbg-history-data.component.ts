import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { EmdService } from '../../../services/emd.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UsersService } from '../../../services/users.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-pbg-history-data',
  templateUrl: './pbg-history-data.component.html',
  styleUrls: ['./pbg-history-data.component.css'],
  providers: [EmdService, UsersService, HttpService]
})

export class PbgHistoryDataComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  @ViewChild('multiSelect') multiSelect;

  user;
  role;
  historyData;
  zgRef;
  myResult = [];
  loader = false;
  DataLength = 0;
  dropdownLocationSettings;
  excelData;
  count = 1
  // nextCount = 1;
  pageCount = 0;
  // previousCount = 1;
  readFlag = true;
  paginationFlag;
  nextFlag = "visible";
  previousFlag = "hide";
  filterFlag = false;
  Filterobj;
  pageNo = 1;
  totalRecords;
  dateTimeRange = [null, null];
  locations1 = [];
  formFlag = ['EMD', 'PBG'];
  isOld = ['Yes', 'No']
  locations = [
    { item_id: 1, item_text: 'Ahmedabad' },
    { item_id: 2, item_text: 'Bangalore' },
    { item_id: 11, item_text: 'Bhopal' },
    { item_id: 3, item_text: 'Chennai' },
    { item_id: 4, item_text: 'Delhi' },
    { item_id: 5, item_text: 'Hyderabad' },
    { item_id: 6, item_text: 'Lucknow' },
    { item_id: 7, item_text: 'Kolkata' },
    { item_id: 8, item_text: 'Mumbai' },
    { item_id: 9, item_text: 'Pune' },
    { item_id: 10, item_text: 'Srinagar' }

  ];
  approval_status = [
    { item_id: 1, item_text: 'Pending With GL' },
    { item_id: 2, item_text: 'Pending With Sales Head' },
    { item_id: 3, item_text: 'Pending With Finance Controller' },
    { item_id: 4, item_text: 'Pending With CFO' },
    { item_id: 5, item_text: 'Pending With BG Writter' },
    { item_id: 6, item_text: 'Request Processed' },
    { item_id: 7, item_text: 'Draft' },
    { item_id: 8, item_text: 'Rejected' }

  ];
  settings;
  PBGfilterFlag = true;
  access
  start: Date;
  end: Date;

  @HostListener('window:keyup', ['$event'])
  // This will be invoking on keyboard event. (when you press any key on key board)
  keyEvent(event: KeyboardEvent, pageNo) {
    if (event.keyCode == 13) {    // this is to indicate you have pressed ENTER key in keyboard
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
        this.filterPBGHistoryData(pageNo);

      }
    }
  }

  constructor(private EmdService: EmdService, public _UsersService: UsersService, private _httpService: HttpService) {
    // Current user data
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
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
      "formFlag": "",
      "emdReqdInTheFavourOfBeneficary": "",
      "emdRequestNumber": "",
      "approval_status": [],
      "start_date": this.start,
      "end_date":this.end,
      "role": "",
      "salesPersonId": "",
      "isOld": "",
      "isTerritoryHead": "",
      "isBuHead": ""
    };
    // this condition indicates, current user is Sales Manager
    if (this.user.user_type == "BID_OWNER" && this.user.user_subtype == "Sales") {
      this.role = "Sales Manager"
      this.Filterobj.role = "Sales Manager"
      this.Filterobj.salesPersonId = this.user.user_id;
    }
    //  this is ngMultiSelect dropdown options
    this.settings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'De-Select All',
      allowSearchFilter: true,
      limitSelection: -1,
      clearSearchFilter: true,
      maxHeight: 197,
      itemsShowLimit: 1,
      closeDropDownOnSelection: false,
      showSelectedItemsAtTop: false,
      defaultOpen: false
    };
    this._httpService.accessControl({
      "module": "dashboard",
      "user_id": this.user.user_id
    }).subscribe(response => {
      this.access = response['data'];
      // this.user_type = this.access.userTypes[0].user_type;
      // this.user_subtype = this.access.userTypes[0].user_subtype;
      this.PBGfilterFlag = (this.access.userTypes.filter(a => a.user_type == 'VIEWER' || a.user_type == 'ACCOUNTS_EXE_TREASURY' || a.user_type == 'FINANCE_CONTROLLER' || a.user_type == 'EMD_PBG_VIEWER' )).length > 0 ? true : false;
      this.getCompanyDetails();
      // console.log(this.access);
    }, error => {
      console.log(error);
    });

  }


  UserDetails;
  // get company details
  getCompanyDetails() {
    this.loader = true
    this._UsersService.getCompanyDetails({ user_id: this.user.user_id }).subscribe(data => {
      this.UserDetails = data['data']['user'];
      console.log("Hello Data Terr", this.UserDetails.isTerritoryHead)
      console.log("Hello Data Bu", this.UserDetails.isBuHead)
      if (this.UserDetails.isTerritoryHead) {
        this.PBGfilterFlag = false
      }
      this.loader = false
      this.filterPBGHistoryData(this.DataLength);
    }, error => {
      this.loader = false
    })
  }

  ngOnInit() {
    this.loader = true;
    this.zgRef = document.querySelector('zing-grid');
    // console.log(this.zgRef)
    // window.onload event for Javascript to run after HTML
    // because this Javascript is injected into the document head
    window.addEventListener('load', () => {
      // content after DOM load
    });
    this.zgRef = document.querySelector('zing-grid');
    // this is to open new window on clicking one row.
    this.zgRef.addEventListener('record:click', (e) => {
      if (e.detail.ZGData.data.isOld == "no" && e.detail.ZGData.data.formFlag == "EMD") {
        localStorage.setItem('EMDId', e.detail.ZGData.data['EMD/PBG No'])
        // e.detail.ZGData.data['EMD/PBG No'];
        this.zgRef.addEventListener('record:click', (e) => {
          window.open('/EMD/' + e.detail.ZGData.data.bid_id);
        });
      }
      if (e.detail.ZGData.data.isOld == "no" && e.detail.ZGData.data.formFlag == "PBG") {
        localStorage.setItem('EMDId', e.detail.ZGData.data['EMD/PBG No'])
        // e.detail.ZGData.data['EMD/PBG No'];
        this.zgRef.addEventListener('record:click', (e) => {
          window.open('/PBG/' + e.detail.ZGData.data.bid_id);
        });
      }
    })
  }

  // To get complete PBG Records and to get Records on filters. Also consists of pagination logic. (This bring only 10 records on each call)
  filterPBGHistoryData(pageNo) {
    if (this.Filterobj.isOld == "Yes") {
      this.Filterobj.isOld = "yes"
    }
    if (this.Filterobj.isOld == "No") {
      this.Filterobj.isOld = "no"
    }
    console.log(this.Filterobj)
    if (pageNo == 0) {
      this.Filterobj.pageNo = this.pageNo;
    } else {
      this.Filterobj.pageNo = this.pageNo;
    }
    this.Filterobj.skipDocs = 10;
    this.Filterobj.isTerritoryHead = this.UserDetails.isTerritoryHead ? this.UserDetails.isTerritoryHead : false;
    this.Filterobj.isBuHead = this.UserDetails.isBuHead ? this.UserDetails.isBuHead : false;
    // this.Filterobj.reqType = 'filter';
    this.loader = true
    this.EmdService.filterPBGHistoryData(this.Filterobj).subscribe(data => {
      if (data['data'] == null) {
        this.totalRecords = 0;
        this.historyData = [];
        this.alert.sweetError("No Data Found");
        this.loader = false
      } else {
        // this.Filterobj.formFlag = "Select EMD/PBG";
        // this.Filterobj.isOld = "Select History only"
        this.loader = false
        this.historyData = data['data']['pbgRecords'];
        this.totalRecords = data['data']['totalcount']; // Total Records count
        // console.log(this.historyData)
        this.pageCount = Math.ceil(this.totalRecords / 10); // to count how many pages will be taken for result records, if each page consists of 10 records
        this.historyData.forEach(element => {
          if (element.potentialDateOfConversionOfTheTenderToOrder == undefined || element.potentialDateOfConversionOfTheTenderToOrder == null) {
            element.potentialDateOfConversionOfTheTenderToOrder = "N/A"
          } else {
            // to format the date
            let res = element.potentialDateOfConversionOfTheTenderToOrder.toString().split('T');
            let res1 = res[0].toString().split('-');
            let temp = res1[0];
            res1[0] = res1[2];
            res1[2] = temp;
            element.potentialDateOfConversionOfTheTenderToOrder = res1[0] + '/' + res1[1] + '/' + res1[2]
          }
          // if (element.emdRequiredByDate == undefined || element.emdRequiredByDate == null ) {
          //   element.emdRequiredByDate = "N/A"
          // }
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
          if (element.contactPersonsTelephoneNo == undefined || element.contactPersonsTelephoneNo == null) {
            element.contactPersonsTelephoneNo = "N/A"
          }
          if (element.percentageMarginForTheOrder == undefined || element.percentageMarginForTheOrder == null) {
            element.percentageMarginForTheOrder = "N/A"
          }
          if (element.lastDateForClaimOfBankGuarantee == undefined || element.lastDateForClaimOfBankGuarantee == null || element.lastDateForClaimOfBankGuarantee == "N/A") {
            element.lastDateForClaimOfBankGuarantee = "N/A"
          } else {
            let res = element.lastDateForClaimOfBankGuarantee.toString().split('T');
            let res1 = res[0].toString().split('-');
            let temp = res1[0];
            res1[0] = res1[2];
            res1[2] = temp;
            element.lastDateForClaimOfBankGuarantee = res1[0] + '/' + res1[1] + '/' + res1[2]
          }
          console.log(element.emdRequiredByDate)
          if (element.emdRequiredByDate == undefined || element.emdRequiredByDate == null || element.emdRequiredByDate == "N/A") {
            element.emdRequiredByDate = "N/A"
          } else {
            let res = element.emdRequiredByDate.toString().split('T');
            let res1 = res[0].toString().split('-');
            let temp = res1[0];
            res1[0] = res1[2];
            res1[2] = temp;
            element.emdRequiredByDate = res1[0] + '/' + res1[1] + '/' + res1[2]
          }
          // Mapping the data of API Response to the HTML Fields (KEYS - HTML Fields) and (VALUES - backend response)
          var result = {
            "Srl": this.count++,
            "Type": element.formFlag,
            "EMD/PBG No": element.emdRequestNumber,
            "Sales Manager": element.nameOfEmployeeRequestingEmd,
            "Employee Code": element.employeeCode,
            "Last Date to claim": element.lastDateForClaimOfBankGuarantee,
            "Location": element.location,
            "EMD/PBG in Favour of": element.emdReqdInTheFavourOfBeneficary,
            "Status": element.approval_status,
            "Address of Beneficiary": element.addressOfBeneficary,
            "Contact Person Name": element.contactPersonsNameAtCustomersPlace,
            "Contact Person Telephone Number": element.contactPersonsTelephoneNo,
            "Contact Person Email": element.contactPersonsEmailId,
            "Expected Order Value": element.totalExpectedOrderValue,
            "Payment Terms": element.paymentTermsOfExpectedOrder,
            "Location of Installation": element.locationOfInstallation,
            "Scope of Work in Brief": element.scopeOfWorkInBrief,
            "Delivery Terms": element.deliveryTerms,
            "Penalty/LD": element.penaltyLdClauses,
            "Potential Date of Conversion of Tender to Order": element.potentialDateOfConversionOfTheTenderToOrder,
            "Purpose": element.PurposeOfTheEmd,
            "Bank Type": element.BankType,
            "Amount": element.AmountReqdEmd,
            "PBG Req by Date": element.emdRequiredByDate,
            "Tender Number": element.tenderNo,
            "Tender Date": element.tenderDate,
            "Government/Non-Government": element.specifyWhetherGovernmentOrNonGovernment,
            "% Margin for Order": element.percentageMarginForTheOrder,
            "isOld": element.isOld,
            "bid_id": element.bid_id,
            "formFlag": element.formFlag
          }
          this.myResult.push(result);
          this.loader = false
          if (this.Filterobj.isOld == "yes") {
            this.Filterobj.isOld = "Yes"
          }
          if (this.Filterobj.isOld == "no") {
            this.Filterobj.isOld = "No"
          }
        },
          this.loader = false);
      }
      // // To get all data once without pagination, for displaying in Excel sheet
      // this.EmdService.readPBGHistoryDataForExcel(this.Filterobj).subscribe(data => {
      //   var obj = {}
      //   this.excelData = data['data']['read_data']
      //   console.log(data);
      // })
    })
  }

  // On search by filters
  onSubmit() {
    // console.log(this.Filterobj.formFlag)
    if (this.Filterobj.formFlag == "Select EMD/PBG" || this.Filterobj.isOld == "Select History only") {
      this.Filterobj.formFlag = "";
      this.Filterobj.isOld = ""
    }
    this.count = 1
    this.pageNo = 1;
    this.filterFlag = true;
    this.DataLength = 0;
    this.loader = true;
    this.myResult = [];
    this.Filterobj.pageNo = this.pageNo;
    console.log(this.Filterobj.formFlag)
    this.filterPBGHistoryData(this.DataLength);
  }

  // To clear all filters
  onClear() {
    this.pageNo = 1;
    this.count = 1;
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();
    if (month < 3) {
      year = (new Date()).getFullYear() - 1;
    }
    this.start = new Date("04/01/" + year);
    this.end = new Date(new Date().setDate(new Date().getDate()));
    // empty all filter fields and filter data
    this.Filterobj = {
      "approval_status": [],
      "locations": [],
      "formFlag": "",
      "start_date": this.start,
      "end_date":this.end,
      "emdReqdInTheFavourOfBeneficary": "",
      "emdRequestNumber": "",
      "pageNo": 1,
      "skipDocs": 10,
      "isOld": "",
    }
    if (this.role == "Sales Manager") {
      this.Filterobj.salesPersonId = this.user.user_id;
    }
    this.dateTimeRange = [null, null];
    this.DataLength = 0;
    this.loader = true;
    this.myResult = [];
    this.loader = true;
    this.filterPBGHistoryData(this.DataLength);
    this.locations1 = [];
    if (this.Filterobj.formFlag == "" || this.Filterobj.isOld == "") {
      // this.Filterobj.formFlag = "Select EMD/PBG";
      // this.Filterobj.isOld = "Select History only"
    }
    // this.settings.itemsShowLimit = "";
  }

  //  Select any item on ngMultiSelect Dropdown
  public onItemSelect(item: any, type) {
    if (item.item_text == "Ahmedabad") {
      item.item_text = "Ahemedabad";
      this.Filterobj.locations.push(item.item_text);
      this.Filterobj.locations.push('Ahmedabad')
    }
    else {
      this.Filterobj.locations.push(item.item_text);
    }
  }

  //  Select any item on date selection Dropdown
  public onItemSelectDate(item: any) {
    this.Filterobj.start_date = this.dateTimeRange[0] ? this.dateTimeRange[0] : "";
    this.Filterobj.end_date = this.dateTimeRange[1] ? this.dateTimeRange[1] : "";
    this.start = this.Filterobj.start_date;
    this.end = this.Filterobj.end_date;
  }

  //  Select any item on ngMultiSelect Dropdown (status)
  public onItemSelectStatus(item: any) {
    this.Filterobj.approval_status.push(item.item_text);
  }

  //  Select any item on ngMultiSelect Dropdown (location)
  public onDeSelect(item: any, type) {
    for (let i = 0; i < this.Filterobj.locations.length; i++) {
      if (this.Filterobj.locations[i] == item.item_text) {
        this.Filterobj.locations.splice(i, 1);
      }
    }
  }

  // DeSelect any item on ngMultiSelect Dropdown (status)
  public onDeSelectStatus(item: any, type) {
    for (let i = 0; i < this.Filterobj.approval_status.length; i++) {
      if (this.Filterobj.approval_status[i] == item.item_text) {
        this.Filterobj.approval_status.splice(i, 1);
      }
    }
  }

  // Select all item on ngMultiSelect Dropdown ()
  public onSelectAll(items: any, type) {
  }

  public onSelectAllStatus(items: any, type) {
  }

  public onDeSelectAll(items: any, type) {
  }

  public onDeSelectAllStatus(items: any, type) {
  }

  // On NEXT and PREVIOUS buttons of pagination
  pagination(type) {
    this.loader = true;
    this.myResult = [];
    this.historyData = [];
    if (type == 'Next' && this.readFlag) {
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
        this.filterPBGHistoryData(this.DataLength)
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
        this.filterPBGHistoryData(this.DataLength)
        this.loader = true
      }
    }
  }


  // //Export data
  getData() {
    // const gridData = this.zgRef.getData();
    this.excelData.forEach(element => {
      delete element['path'];
    });
    // console.log('--- Getting Data From Grid: ---', gridData);
    this.JSONToCSVConvertor(this.excelData, "PBG History Data", true);
  }

  //  EXCEL CONVERSION
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


}
