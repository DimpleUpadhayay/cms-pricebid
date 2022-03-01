import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { EmdService } from '../../../services/emd.service';
import { UsersService } from '../../../services/users.service';
import { TerritoryService } from "../../../services/territories.service";
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { BidService } from '../../../services/bid.service';

@Component({
  selector: 'app-filter-sof',
  templateUrl: './filter-sof.component.html',
  styleUrls: ['./filter-sof.component.css'],
  providers: [EmdService, UsersService, TerritoryService, HttpService, BidService]
})
export class FilterSofComponent implements OnInit {

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
  count = 1
  pageCount = 0;
  Filterobj;
  pageNo = 1;
  totalRecords;
  locations1 = [];
  dropdownBUSettings;
  dropdownTerritorySettings;
  dropdownTypesSettings;
  dropdownCategorySettings;
  CustomerName;
  searchDataCust = []
  searchDataCust2 = [];
  searchDataSales = [];
  searchDataPreSales = [];
  bookingLocationName = [];
  searchDataSales2 = [];
  territoryData = [];
  locations = [];
  territory_ids = [];
  territories = [];
  business_units = [];
  selectedTypes = [];
  selectedCategories = [];
  selectedBUs = [];
  selectedTerritories = [];
  access;
  isViewer = false;
  start: Date;
  end: Date;
  types;
  category;
  dateTimeRange = [null, null];

  @HostListener('window:keyup', ['$event'])

  // This will be invoking on keyboard event. (when you press any key on key board)
  keyEvent(event: KeyboardEvent, pageNo) {
    // alert(pageNo);
    // if(event.target['id'] == "myInput" && Number(event.key)>this.pageCount) {
    //   this.alert.sweetError("Please enter valid page number");
    // }
    // this is to indicate you have pressed ENTER key in keyboard (to ENTER Page Number in pagination)
    if (event.keyCode == 13 && event.target['id'] == "myInput") {
      event.stopImmediatePropagation(); // sometimes two immediate event trigger on pressing ENTER key once, to void this event twice.
      if ((pageNo == 0) || pageNo < 0 || (pageNo > this.pageCount) || (pageNo == undefined || pageNo == 'e' || pageNo == '-' || pageNo == '--' ||
        pageNo > this.pageCount || pageNo == '' || pageNo == null)) {
        // event.preventDefault();
        this.alert.sweetError("Please enter valid page number");
        return;
      } else {
        this.myResult = [];
        this.count = (pageNo * 10) - 9;
        this.loader = true;
        this.filterSOFData(pageNo);
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
    // this is to indicate you have given keyboard input in place of SalesPerson field in filter Section
    if (event.target && event.target['id'] == "presales_person" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8)) {
      this.showResultsPreSales(event);
    }
  }

  constructor(private EmdService: EmdService, private _userService: UsersService,
    private territoryService: TerritoryService, private _bidService: BidService,
    private router: Router, private _httpService: HttpService) {
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
    // object to be passed to backend
    this.Filterobj = {
      "locations": [],
      "bookingLocationName": [],
      "sofNumber": "",
      "CustomerName": "",
      "CustomerId": "",
      "orderBookedPersonName": "",
      "username": "",
      "role": "",
      "start_date": this.start,
      "end_date": this.end,
      "category": [],
      "types": [],
      "bu_ids": [],
      "coOwner": "",
      "coOwnerTypes": "",
      // "salesPersonId": ""
    };
    // this condition indicates, current user is Sales Manager
    if (this.user.user_type == "BID_OWNER" && this.user.user_subtype == "Sales") {
      this.role = "Sales Manager"
      this.Filterobj.role = "Sales Manager"
      // this.Filterobj.salesPersonId = this.user.user_id;
    }
    this.filterSOFData(this.DataLength);
    //  this is ngMultiSelect dropdown options
    this.dropdownTerritorySettings = {
      singleSelection: false,
      idField: 'territory_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 1
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
    this.dropdownBUSettings = {
      singleSelection: false,
      idField: 'bu_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 0,
    };

    this._httpService.accessControl({
      "module": "dashboard",
      "user_id": this.user.user_id
    }).subscribe(response => {
      this.access = response['data'];
      // this.user_type = this.access.userTypes[0].user_type;
      // this.user_subtype = this.access.userTypes[0].user_subtype;
      this.isViewer = (this.access.userTypes.filter(a => a.user_type == 'VIEWER' || a.user_type == 'SOF_VIEWER' || a.user_type == 'SOF_PRODUCT_VIEWER')).length > 0 ? true : false;
      // console.log(this.access);
    }, error => {
      console.log(error);
    });
    this.getTypes();
    this.getCategoryData();
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
      localStorage.setItem('SOFId', e.detail.ZGData.data['SOF Number'])
      console.log(e.detail.ZGData.data['SOF Number']);
      // this.router.navigateByUrl('/salesOrderForm/'+ e.detail.ZGData.data.bid_id)
      window.open('/salesOrderForm/' + e.detail.ZGData.data.bid_id);
    });
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

  // Get all Territories for Dropdown list in filters
  getTerritories() {
    this._userService.getCompanyDetails({ "user_id": this.user.user_id }).subscribe(res => {
      this.territories = res['data']['user']['territory']
      this.business_units = res['data']['user']['bussiness_unit']
    }, error => {
    })
  }

  // get list of users on keyboard input of CustomerName field in filter Section
  showResultsCustomer(event) {
    var obj = {
      CustomerName: this.Filterobj.CustomerName,
      status: 'ACTIVE'
    }
    var searchText = this.Filterobj.CustomerName;
    if (searchText && searchText.length == 0) {
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
  // >>> Co-owner Data field >>>>>
  // get list of users on keyboard input of SalesPerson field in filter Section
  showResultsPreSales(event) {
    var obj = {
      username: this.Filterobj.coOwnerTypes,
      status: 'ACTIVE'
    }
    var searchText = this.Filterobj.coOwnerTypes;
    if (searchText.length == 0) {
      this.searchDataPreSales = undefined;
      this.searchDataPreSales = [];
      $("#showResultsPreSales").hide();
      return;
    }
    this._userService.getCompanyUserData(obj).subscribe((response: any) => {
      if (response['data'] == null) {
        this.searchDataPreSales = [];
        return;
      }
      if (response && response['data'] && response['data']['users']) {
        let data = response['data']['users'];
        this.searchDataPreSales = [];
        data.forEach(element => {
          element.userTypes.filter(a => {
            if (a.user_type == "BID_OWNER" && a.user_subtype == 'Presales') {
              this.searchDataPreSales.push(element)
            }
          });
        })
        $("#showResultsPreSales").show();
      } else {
        this.searchDataPreSales = [];
      }
    }, error => {
      this.searchDataPreSales = [];
    })
  }
  // Set Customer name in the SalesPerson field
  setDataPreSales(user_id, name) {
    $("#showResultsPreSales").hide();
    this.Filterobj.coOwner = user_id;
    this.Filterobj.coOwnerTypes = name;
  }


  // To get complete PBG Records and to get Records on filters. Also consists of pagination logic. (This bring only 10 records on each call)
  filterSOFData(pageNo) {
    if (pageNo == 0) {
      this.Filterobj.pageNo = this.pageNo;
    } else {
      this.Filterobj.pageNo = this.pageNo;
    }
    this.Filterobj.skipDocs = 10;
    this.EmdService.filterSOFData(this.Filterobj).subscribe(data => {
      if (data['data'] == null || data['data']['pbgRecords'].length == 0) {
        this.totalRecords = 0;
        this.historyData = [];
        this.alert.sweetError("No Data Found");
        this.loader = false
      } else {
        this.historyData = data['data']['pbgRecords'];
        this.totalRecords = data['data']['totalcount']; // Total Records count
        this.pageCount = Math.ceil(this.totalRecords / 10); // to count how many pages will be taken for result records, if each page consists of 10 records
        this.historyData.forEach(element => {
          console.log(element.approval_process)
          if (element.approval_status == "COMPLETED") {
            if (element.approval_process.length) {
              if (element.approval_process[element.approval_process.length - 1].Date == undefined || element.approval_process[element.approval_process.length - 1].Date == null) {
                element.approval_process[element.approval_process.length - 1].Date = "N/A"
              } else {
                // to format the date
                let res = element.approval_process[element.approval_process.length - 1].Date.toString().split('T');
                let res1 = res[0].toString().split('-');
                let temp = res1[0];
                res1[0] = res1[2];
                res1[2] = temp;
                element.approval_process[0].Date = res1[0] + '/' + res1[1] + '/' + res1[2]
                var sofSubmitDate = element.approval_process[0].Date
              }
            }
          } else {
            sofSubmitDate = "NA"
          }
          // Data modification ----> if data is empty replacing data with "N/A"
          if (element.customerPurchaseOrderDate == undefined || element.customerPurchaseOrderDate == null) {
            element.customerPurchaseOrderDate = "N/A"
          } else {
            // to format the date
            let res = element.customerPurchaseOrderDate.toString().split('T');
            let res1 = res[0].toString().split('-');
            let temp = res1[0];
            res1[0] = res1[2];
            res1[2] = temp;
            element.customerPurchaseOrderDate = res1[0] + '/' + res1[1] + '/' + res1[2]
          }
          if (element.contractStartDate == undefined || element.contractStartDate == null) {
            element.contractStartDate = "N/A"
          } else {
            // to format the date
            let res = element.contractStartDate.toString().split('T');
            let res1 = res[0].toString().split('-');
            let temp = res1[0];
            res1[0] = res1[2];
            res1[2] = temp;
            element.contractStartDate = res1[0] + '/' + res1[1] + '/' + res1[2]
          }
          if (element.contractEndDate == undefined || element.contractEndDate == null) {
            element.contractEndDate = "N/A"
          } else {
            // to format the date
            let res = element.contractEndDate.toString().split('T');
            let res1 = res[0].toString().split('-');
            let temp = res1[0];
            res1[0] = res1[2];
            res1[2] = temp;
            element.contractEndDate = res1[0] + '/' + res1[1] + '/' + res1[2]
          }
          if (element.billingStartDate == undefined || element.billingStartDate == null) {
            element.billingStartDate = "N/A"
          } else {
            // to format the date
            let res = element.billingStartDate.toString().split('T');
            let res1 = res[0].toString().split('-');
            let temp = res1[0];
            res1[0] = res1[2];
            res1[2] = temp;
            element.billingStartDate = res1[0] + '/' + res1[1] + '/' + res1[2]
          }
          if (element && element.RegionalSalesHead) {
            if (element && (element.RegionalSalesHead[0].fullname == undefined || element.RegionalSalesHead[0].fullname == null || element.RegionalSalesHead[0].fullname == "")) {
              var RegSales = "N/A"
            } else {
              RegSales = element.RegionalSalesHead[0].fullname
            }
          } else {
            RegSales = "N/A"
          }

          // console.log(element.CustomerNameInfo)

          if (element.CustomerNameInfo.length) {
            if ((element.CustomerNameInfo[0].account_name == undefined || element.CustomerNameInfo[0].account_name == null || element.CustomerNameInfo[0].account_name == "")) {
              var CusName = element.account_name;
            } else {
              CusName = element.CustomerNameInfo[0].account_name
            }
          } else {
            CusName = element.account_name;
          }
          if (element.billingRegionNameTerritory.length) {
            if ((element.billingRegionNameTerritory[0].territory_number == undefined || element.billingRegionNameTerritory[0].territory_number == null || element.billingRegionNameTerritory[0].territory_number == "")) {
              var BillReg = "N/A"
            } else {
              BillReg = element.billingRegionNameTerritory[0].territory_number
            }
          } else {
            BillReg = "N/A"
          }
          if (element.orderBookedByUser.length) {
            if ((element.orderBookedByUser[0].fullname == undefined || element.orderBookedByUser[0].fullname == null || element.orderBookedByUser[0].fullname == "")) {
              var BookedPer = "N/A"
            } else {
              BookedPer = element.orderBookedByUser[0].fullname
            }
          } else {
            BookedPer = "N/A"
          }
          if (element.customerPurchaseOrderNo == undefined || element.customerPurchaseOrderNo == null || element.customerPurchaseOrderNo == "") {
            element.customerPurchaseOrderNo = "N/A"
          }
          if (element.customerPurchaseOrderDate == undefined || element.customerPurchaseOrderDate == null || element.customerPurchaseOrderDate == "") {
            element.customerPurchaseOrderDate = "N/A"
          }
          if (element.bookingLocationName == undefined || element.bookingLocationName == null || element.bookingLocationName == "") {
            element.bookingLocationName = "N/A"
          }
          if (element.billingRegionName == undefined || element.billingRegionName == null || element.billingRegionName == "") {
            element.billingRegionName = "N/A"
          }
          if (element.contractStartDate == undefined || element.contractStartDate == null || element.contractStartDate == "") {
            element.contractStartDate = "N/A"
          }
          if (element.contractEndDate == undefined || element.contractEndDate == null || element.contractEndDate == "") {
            element.contractEndDate = "N/A"
          }
          console.log(element.approval_process)
          // Mapping the data of API Response to the HTML Fields (KEYS - HTML Fields) and (VALUES - backend response)
          var result = {
            "Srl": this.count++,
            "SOF Number": element.sofNumber,
            "Customer Name": CusName,
            "Purchase Order Number": element.customerPurchaseOrderNo,
            "Purchase Order Date": element.customerPurchaseOrderDate,
            "SOF Completed Date": sofSubmitDate,
            "Booking Location": element.bookingLocationNameTerritory[0].territory_number,
            "Billing Region": BillReg,
            "Contract Start Date": element.contractStartDate,
            "Contract End Date": element.contractEndDate,
            "Billing Start Date": element.billingStartDate,
            "Contract Period": element.contractPeriod,
            "SOF Type": element.sofType,
            "Billing Plan": element.billingPlan,
            "Total Quantity": element.totalQuantity,
            "Payment Terms": element.paymentTerms,
            "Tax Type": element.taxType,
            "Gross Margin": element.grossMarginValue,
            "Service Description": element.serviceDesciption,
            "Penalty %": element.penaltyPercentage,
            "Sales Manager": BookedPer,
            "Co-owner" : element.coOwnerTypes,
            "Regional Business Head": RegSales,
            "bid_id": element.bid_id,
            "Status": element.approval_status
            // "": element.percentageMarginForTheOrder
          }
          this.myResult.push(result);
        },
          this.loader = false);
      }
    })
  }
  // On search button in filter section
  onSubmit() {
    this.count = 1
    this.pageNo = 1;
    this.DataLength = 0;
    this.loader = true;
    this.myResult = [];
    // this.Filterobj.salesPersonId = this.user.user_id;
    this.Filterobj.pageNo = this.pageNo;
    this.filterSOFData(this.DataLength);
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
      "locations": [],
      "CustomerName": "",
      "CustomerId": "",
      "orderBookedPersonName": "",
      "bookingLocationName": "",
      "sofNumber": "",
      "pageNo": 1,
      "skipDocs": 10,
      "start_date": this.start,
      "end_date": this.end,
      "category": [],
      "types": [],
      "bu_ids": [],
      "coOwner": "",
      "coOwnerTypes": "",
    }
    this.DataLength = 0;
    this.loader = true;
    this.myResult = [];
    this.searchDataCust = [];
    this.searchDataCust2 = [];
    this.searchDataSales = []
    this.searchDataPreSales = [];
    this.searchDataSales2 = [];
    this.selectedBUs = [];
    this.selectedTerritories = [];
    this.selectedTypes = [];
    this.selectedCategories = [];
    this.loader = true;
    this.dateTimeRange = [null, null];
    // this.Filterobj.salesPersonId = this.user.user_id;
    this.filterSOFData(this.DataLength);
    this.locations1 = [];
  }
  // Selection and De-Selection of items on ngMultiSelect Dropdown (location)
  public onItemSelect(item: any) {
    if (this.selectedTerritories.length != 0) {
      this.Filterobj.locations = [];
      this.selectedTerritories.forEach(element => {
        this.Filterobj.locations.push(element.territory_id);
      });
    } else {
      this.Filterobj.locations = this.user.territory_ids;
    }
    if (this.selectedTypes.length != 0) {
      this.Filterobj.types = [];
      this.selectedTypes.forEach(element => {
        this.Filterobj.types.push(element._id);
      });
    } else {
      this.Filterobj.types = [];
    }
    if (this.selectedCategories.length != 0) {
      this.Filterobj.category = [];
      this.selectedCategories.forEach(element => {
        this.Filterobj.category.push(element._id);
      });
    } else {
      this.Filterobj.category = [];
    }
    if (this.selectedBUs.length != 0) {
      this.Filterobj.bu_ids = [];
      this.selectedBUs.forEach(element => {
        this.Filterobj.bu_ids.push(element.bu_id);
      });
    } else {
      this.Filterobj.bu_ids = this.user.bu_ids;
    }
  }
  public onDeSelect(item: any) {
    for (let i = 0; i < this.Filterobj.locations.length; i++) {
      if (this.Filterobj.locations[i] == item.territory_id) {
        this.Filterobj.locations.splice(i, 1);
      }
    }
  }
  public onSelectAll(item: any) {
    if (item[0].bu_id) {
      this.Filterobj.bu_ids = [];
      item.forEach(element => {
        this.Filterobj.bu_ids.push(element.bu_id);
      });
    }
    if (item[0].territory_id) {
      this.Filterobj.locations = [];
      item.forEach(element => {
        this.Filterobj.locations.push(element.territory_id);
      });
    }
    if (item[0].type_name) {
      this.Filterobj.types = [];
      item.forEach(element => {
        this.Filterobj.types.push(element._id);
      });
    }
    if (item[0].category_name) {
      this.Filterobj.category = [];
      item.forEach(element => {
        this.Filterobj.category.push(element._id);
      });
    }
  }
  public onDeSelectAll(items: any, type) {
    if (type == 'BU') {
      this.Filterobj.bu_ids = this.user.bu_ids;
    }
    if (type == 'Territory') {
      this.Filterobj.locations = this.user.territory_ids;
    }
    if (type == 'Types') {
      this.Filterobj.types = [];
    }
    if (type == 'Category') {
      this.Filterobj.category = [];
    }
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
        this.filterSOFData(this.DataLength)
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
        this.filterSOFData(this.DataLength)
        this.loader = true
      }
    }
  }
  // Select any item on date selection Dropdown
  public onItemSelectDate(item: any) {
    this.Filterobj.start_date = this.dateTimeRange[0] ? this.dateTimeRange[0] : "";
    this.Filterobj.end_date = this.dateTimeRange[1] ? this.dateTimeRange[1] : "";
    this.start = this.Filterobj.start_date;
    this.end = this.Filterobj.end_date;
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
