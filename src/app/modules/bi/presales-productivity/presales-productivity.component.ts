import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-presales-productivity',
  templateUrl: './presales-productivity.component.html',
  styleUrls: ['./presales-productivity.component.css'],
  providers: [BidService, UsersService]
})
export class PresalesProductivityComponent implements OnInit {
  user;
  data = [];
  loader = false;
  zgRef;
  zgRefFlag;
  obj;
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
    this.getPresalesProductivityData();
    this.getBuTerritories();
    this.getTypes();
    this.getCategoryData();
    this.getCompanyUser();
  }

  ngOnInit() {
    this.data.push({
      "Sr No": "",
      "Pre Sales Team Member": "",
      "Grand Total": "",
      "ACV Won (Mn)": "",
      "Won": "",
      "Dropped": "",
      "Live": "",
      "Lost": "",
      // "No Update": element.totalNodecisionBidsCount
    });
    this.zgRef = document.querySelector('zing-grid');
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
    })
  }

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

  getPresalesProductivityData() {
    this.obj.bu_ids = this.user.bu_ids;
    this.obj.territory_ids = this.user.territory_ids,
      this.getResult();
  }

  getResult() {
    this.loader = true;
    this.data = [];
    this._bidService.getPresaleBids(this.obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false;
        return;
      }
      var i = 1;
      this.data = [];
      resp['data'].forEach(element => {
        let obj = {
          "Sr No": i,
          "Pre Sales Team Member": element.fullname,
          "Grand Total": element.totalBidsCount,
          "ACV Won (Mn)": element.totalWonBidsValue,
          "Won": element.totalWonBidsCount,
          "Dropped": element.totalDroppedBidsCount,
          "Live": element.totalLiveBidsCount,
          "Lost": element.totalLostBidsCount,
          // "No Update": element.totalNodecisionBidsCount
        }
        this.data.push(obj);
        i++;
        if (resp['data'].length == i && !this.zgRefFlag) {
          this.zgRef = document.querySelector('zing-grid');
          this.zgRefFlag = true;
        }
      });
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  // Pending Task Call Method
  getPendingTask(result) {
    this.pendTaskData = [];
    result.forEach(item => {
      this.pendTaskData.push(" " + item.name + " - " + item.progress);
    })
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
      if (response && response['data'] && response['data']['users']) {
        let data = response['data']['users'];
        this.searchDataArray = [];
        data.forEach(element => {
          element.userTypes.filter(a => {
            if (a.user_type == "BID_OWNER" && a.user_subtype == 'Presales') {
              this.searchDataArray.push(element)
            }
          });
        })
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
    this.JSONToCSVConvertor(gridData, "Presales Productivity Report", true);
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
    this.getPresalesProductivityData();
  }

  onReload() {
    this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
      this.router.navigateByUrl('analysis/presales-productivity'));
  }

}
