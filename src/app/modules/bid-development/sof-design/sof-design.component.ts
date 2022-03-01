import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormControl } from '@angular/forms';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { ActivatedRoute } from '@angular/router';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { saveAs } from 'file-saver';
import { HttpService } from '../../../services/http.service';
import { BusinessUnitService } from '../../../services/businessUnit.service';
import { TerritoryService } from '../../../services/territories.service';
import * as validatorCtrl from '../../../libraries/validation';
import * as moment from 'moment';

@Component({
  selector: 'app-sof-design',
  templateUrl: './sof-design.component.html',
  styleUrls: ['./sof-design.component.css'],
  providers: [BidService, UsersService, BusinessUnitService, TerritoryService]
})

export class SofDesignComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  @ViewChild('myInput') myInputVariable: ElementRef;
  bid: any;
  bid_id;
  SalesList: any;
  participants: any;
  territories = [];
  salesOrderId;
  data;
  obj;
  business_units = [];
  selected = new FormControl(0);
  sofSubmitted: boolean = false
  activeTab = 'search';
  searchUser = "";
  Contract_details = [];
  formSubmitted: boolean = false;
  business_type = ["Value", "Volume"]
  product = ["New", "Renewal", "Integration", "Product"]
  attachment_details = [];
  product_details = [];
  sof_details = [];
  booked_by = ["Sales", "Delivery"]
  sof_type = ["Fixed", "Variable"]
  billing_code = ["Yes", "No"]
  quantities = ["12", "4", "2", "1"]
  billingPlanField = ["Monthly Arrears", "Monthly Advance", "Quarterly Arrears", "Quarterly Advance", "Half Yearly Arrears", "Half Yearly Advance", "Yearly Arrears", "Yearly Advance"]
  payments = ["30 Days", "45 Days", "60 Days", "90 Days", "Immediate"]
  tax_types = ["Inclusive", "Exclusive", "Exempted"]
  back_to_back = ["Yes", "No"]
  bookedBy = ['Sales']
  sofData;
  details;
  ContractDetails: any;
  routerType;
  stage;
  result;
  stageNo;
  StageName;
  allStage = "";
  total_acv = 0;
  total_tcv = 0;
  total_contribution = 0;
  sofAttachments: any;
  contractPeriod;
  penalties;
  rfpReviewAttachments = [];
  attachmentSOFData = [];
  multipleCsvData;
  // Trimmedtotal_acv = 0;
  // Trimmedtotal_tcv = 0;
  access;
  user_type;
  user_subtype;
  businessUnits;
  territoryData;
  // bookingRegion = [];
  user;
  name = [];
  accountName;
  attachments = [];
  uploadAttachments = [];
  salesOrderIdStorage;
  files = [{
    "cellRange": "",
    "description": "",
    "disable": false,
  }];
  selectedFile: File = null;
  flag = true;
  loader = false;
  uploadArray = [];
  salesOrderIdAttach = "";
  cellRange = ["RFP Corrigendum", "Purchase Order", "Mail Confimation", "Other Documents"]
  bidStatus = "";
  isB2BFlag = true;
  types;
  regionalSalesHeadName: any;
  productFlag = false;
  approvalStatusArray = []
  ac_comment = [{
    "comment": "",
    "disableFlag": false
  }]
  approvalFlag = false;
  approvalUserID;
  approvaluniqueRole;
  approvalFullName;
  salesPersonId;
  readTerritory = [];
  typeSelected = [];
  ReadAttachLength = 0;
  allSOF = [];
  selectedSOF;
  sofNumber
  UploadAttachLength = 0;
  multipleSOFFlag = false
  createSOFResp: any;
  minDate;
  allSOFData: any;
  biSofId: any;
  bidVersionStatus: any;
  NoDataMultipleSOFFlag = true;

  constructor(private _fb: FormBuilder, public dialog: MatDialog, public _businessUnitService: BusinessUnitService,
    public _territoryService: TerritoryService,
    private _activeRoute: ActivatedRoute, public _bidService: BidService, public _userService: UsersService, private _httpService: HttpService) {
    this.bid_id = _activeRoute.snapshot.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.minDate = new Date();
    this.sofNumber = ""
    this.biSofId = localStorage.getItem('SOFId');
    this.accessControl();
    this.readMultipleSOF();
    this.readSofData(this.sofNumber);
    if(this.biSofId != "") {
      this.sofNumber = this.biSofId; 
      this.getBidById();
      this.readSofData(this.sofNumber);
    } else {
      this.readSofData(this.sofNumber);
    }
    this.readTypeData();
    this.getBusinessUnits();
    this.getTerritories();
    this.getBidById();
    // this.readSofAttachment();
    this.getSalesInfoData();
  }

  // Access Control API for all Users
  accessControl() {
    this._httpService.accessControl({
      "module": "sof",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": false
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
      // console.log(this.access);
    }, error => {
    });
  }

  ngOnInit() {

  }

  onAddNewSOF() {
    let obj = {
      "sofNumber": "",
      "bid_id": this.bid_id,
      "company_id": this.bid.company_id,
    }
    this.alert.emdPbgSofAlert("Are you sure you want to create new SOF?", "This cannot be un-done").then(success => {
      this._bidService.createMultipleSOF(obj).subscribe(resp => {
        this.createSOFResp = resp['data'];
        this.formSubmitted = false;
        this.alert.sweetSuccess("New SOF created successfully");
        this.readMultipleSOF();
        this.getBidById();
        this.readSofData(this.createSOFResp.sofNumber);
        this.selectDropdown();
      }, error => {
      })
    }, cancel => {
      return;
    });
  }
 
  // Get all sofs
  readMultipleSOF() {
    let obj = {
      "bid_id": this.bid_id,
      "company_id": this.user.company_id,
      "sofNumber": "",
    }
    this._bidService.readMultipleSOF(obj).subscribe(resp => {
      this.formSubmitted = false;
      if (this.user_type == "BID_OWNER" && this.user_subtype == "Sales" && this.access.writeAccess) {
        this.allSOF = resp['data']['read_data']; // array of all SOFS
      }
      if (!this.access.writeAccess) {
        this.allSOFData = resp['data']['read_data'];
        this.allSOF = []
        this.allSOFData.forEach(result => {
          if (result.isSubmittedStatus == "Submitted" || result.isSubmittedStatus == "Draft") {
            this.allSOF.push(result);
          }
        })
        if(this.allSOF.length == 0){
          this.NoDataMultipleSOFFlag = false;
        }
      } 
      if (this.allSOF.length > 0) {
        let lastElement = this.allSOF && this.allSOF[this.allSOF.length - 1];
        this.selectedSOF = lastElement.sofNumber;
        this.multipleSOFFlag = true;
        // this.readSofData(this.selectedSOF);
        if(this.biSofId == "" || this.biSofId == null) {
          this.readSofData(this.selectedSOF);
        } else {
            this.readSofData(this.sofNumber);
        }
        localStorage.removeItem("SOFId");      
      }
    })
  }
 
  readCallAddButton(result) {
    let obj = {
      "sofNumber": "",
      "bid_id": this.bid_id,
      "company_id": this.user.company_id,
    }
    this._bidService.readMultipleSOF(obj).subscribe(resp => {
      this.formSubmitted = false;
      if (this.user_type == "BID_OWNER" && this.user_subtype == "Sales" && this.access.writeAccess) {
        this.allSOF = resp['data']['read_data']; // array of all SOFS
      }else{
        this.allSOF = []
        this.allSOFData = resp['data']['read_data'];
        this.allSOFData.forEach(result => {
          if (result.isSubmittedStatus == "Submitted" || result.isSubmittedStatus == "Draft") {
            this.allSOF.push(result);
          }
        })
        if(this.allSOF.length == 0){
          this.multipleSOFFlag = false
          this.NoDataMultipleSOFFlag = false;
        }
      } 
      this.selectedSOF = result
    },error =>{
      
    })
  }

  // Read Call API when Screen loads data fetch for all the Tab
  readSofData(data) {
    console.log("Seleect Hello Data", data)
    let obj = {};
    // console.log(data)
    this.sofNumber = data;
    if (data != "") {
      obj = { "sofNumber": data, "bid_id": this.bid_id }
    } else {
      obj = { "bid_id": this.bid_id }
    }
    console.log(obj)
    this.readTypeData();
    this.getBusinessUnits();
    // this.getTerritories();
    this.getBidById();
    this._bidService.readSofData(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.firstTimeReadData();
        this.firstTimeContractData();
        this.firstTimeProductData();
        return
      }
      this.sofData = resp['data'];
      console.log(this.sofData)
      this.multipleCsvData = resp['data']['csvId'];
      this.multipleSOFFlag = true;
      this.sofData.contactpersonCustomerContactNoRegexValid = true;
      this.sofData.contactPersonEmailRegexValid = true;
      this.uploadAttachments = resp['data']['attachment_data'];
      this.UploadAttachLength = this.uploadAttachments.length;
      this.attachment_details = resp['data']['contractFormId'];
      this.product_details = resp['data']['productFormId'];
      this.salesOrderId = this.sofData.salesOrderId;
      this.salesPersonId = this.sofData.salesPersonId;
      this.sofNumber = this.sofData.sofNumber;
      this.sofData.sofNumber = resp['data']['sofNumber']
      if (this.approvalStatusArray) {
        this.approvalStatusArray = this.sofData.approval_process;
      }
      if (this.sofData && this.sofData.isBackToBackOrder == 'Yes') {
        this.isB2BFlag = false;
      }
      this.total();
      this.totalAcv();
      this.totalTcv();
      if (this.attachment_details && this.attachment_details.length == 0) {
        this.firstTimeContractData();
      }
      if (this.product_details && this.product_details.length == 0) {
        this.firstTimeProductData();
      }
      this.uploadAttachments.forEach(element => {
        if (element.description == "") {
          element.description = 'N/A'
        }
        if (element.cellRange == "") {
          element.cellRange = 'Other Documents'
        }
      });
      if (this.sofData && this.sofData.sofViewer) {
        this.sofData.sofViewer.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id
            this.approvaluniqueRole = item.userTypes[0].user_type;
            this.approvalFullName = item.fullname;
          }
        })
      }

      this.approvalComment();
      this.readCallAddButton(this.sofNumber)
      this.readTypeData();
      this.getBusinessUnits();
      this.getBidById();
      this.getSalesInfoData();
      this.loader = false;
    }, error => {
    })
  } 

  selectDropdown() {
    var link = document.getElementById('first_tab');
    link.click();
  }

  // Regional Sales Head API for showing Name
  regionalHeadName;
  getSalesInfoData() {
    let obj = {
      "bid_id": this.bid_id
    }
    this._bidService.getSalesInfo(obj).subscribe(resp => {
      this.regionalSalesHeadName = resp['data']['RegionalSalesHead'];
      this.regionalSalesHeadName.forEach(element => {
        this.regionalHeadName = element.fullname;
        this.sofData.regionalBusinessHead = element.user_id;
      });
    }, error => {
    })
  }

  // First Time Intializing Object for  Contract details Tab when data is null
  firstTimeContractData() {
    let obj = {
      "bid_id": this.bid_id,
      "business_unit": "",
      "deal_type": "",
      "acv": "",
      "tbd": "",
      "tcv": "",
      "contribution": "",
      "Remark": "",
    }
    this.attachment_details.push(obj)
  }

  // First Time Intializing Object for Product details Tab when data is null
  firstTimeProductData() {
    let obj = {
      "bid_id": this.bid_id,
      "productName": "",
      "productCode": "",
      "quantity": "",
      "unitPrice": "",
      "total": "",
      "isBackToBackOrderProd": "",
      "nameOEMProd": "",
      "Remark": "",
      "disableFlag": true
    }
    this.product_details.push(obj)
  }

  // First Time Intializing Object for SOF Tab when data is null
  firstTimeReadData() {
    this.sofData = {
      "bid_id": this.bid_id,
      "contractFormId": this.attachment_details,
      "productFormId": [],
      "sofNumber": "",
      "customerCode": "",
      "customerPurchaseOrderNo": "",
      "customerPurchaseOrderDate": "",
      "ContactPersonCustomerName": "",
      "contactpersonCustomerContactNo": "",
      "orderBookedBy": "",
      "orderBookedPersonECode": "",
      "orderBookedPersonName": "",
      "regionalBusinessHead": "",
      "sofType": "",
      "bookingLocationName": "",
      "bookingLocationCode": "",
      "billingRegionCode": "",
      "billingRegionName": "",
      "billingStartDate": "",
      "billingPlan": "",
      "contractStartDate": "",
      "contractEndDate": "",
      "contractPeriod": "",
      "totalQuantity": "",
      "paymentTerms": "",
      "taxType": "",
      "grossMarginValue": "",
      "serviceDesciption": "",
      "penaltyPercentage": "",
      "isBackToBackOrder": "",
      "nameOEM": "",
      "contactPersonEmail": "",
      "PreviousReferenceNumber": "",
      "approval_status": "Draft"
    }
  }

  // Read API for Create Bid Proposal and Pricing Attachment and Project Scope Data
  readSofAttachment() {
    let obj = {
      "bid_id": this.bid_id,
      "productFlag": this.productFlag
    }
    this._bidService.readSofAttachment(obj).subscribe(resp => {
      this.rfpReviewAttachments = resp['data']['attachmentData'];
      this.attachmentSOFData = resp['data']['attachmentSOFData'];
      this.ReadAttachLength = this.rfpReviewAttachments.length;
      const found = resp['data']['finaceData'].find(element => {
        if (element.name == 'Penalties') {
          this.sofData.penalty = element.value;
        }
        if (element.name == 'Contract Duration') {
          this.sofData.duration = element.value;
        }
      });

    }, error => {

    })
  }

  // Read API for Fetching all the Business Unit in Pricebid
  getBusinessUnits() {
    this._businessUnitService.getBusinessUnits([]).subscribe(data => {
      if (data['code'] == 2000) {
        this.businessUnits = data['data'];
      }
    }, error => {
    });
  }

  // Read API for Fetching all the Territory in Pricebid
  territoryList = []
  getTerritories() {
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
      if (territories['code'] === 2000) {
        this.territoryData = territories['data'];
        this.territoryData.forEach(element => {
          if (element.name != 'National') {
            this.territoryList.push(element);
          }
        })
        this.getBidById();
        return
      }
      this.territoryData = [];
    }, error => {
      this.territoryData = [];
    });
  }

  // Read API for Fetching all the Types in Pricebid
  readTypeData() {
    this.loader = true
    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      "status": 'ACTIVE',
    }
    this._bidService.readType(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false
        return;
      }
      this.types = resp['data']['type_data']
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // Read API for all the details of BID INFO
  getBidById() {
    this._bidService.getBidById(this.bid_id).subscribe(data => {
      this.bid = data['data']['bid'];
      this.accountName = this.bid.account_id ? this.bid.account_id._id : this.bid.account_name;
      this.bidStatus = this.bid.bidFinalStatus ? this.bid.bidFinalStatus : "";
      this.bidVersionStatus = this.bid.revision_status ? this.bid.revision_status : false;
      this.bid.types.forEach(element => {
        this.types.forEach(item => {
          if (element == item._id) {
            this.typeSelected.push(item);
          }
        });
      });
      this.showProductTab();
      if (this.territoryData) {
        this.territoryData.forEach(i => {
          this.bid.territory_ids.forEach(element => {
            if (i.territory_id == element) {
              this.readTerritory.push(i)
              this.sofData.bookingLocationName = i.territory_id;
            }
          });
        });
      }
      // this.name = this.bid.participants.filter(a => {
      //   return (a.userTypes[0].user_type == 'BID_OWNER' && a.userTypes[0].user_subtype == "Sales") || (a.userTypes[0].user_type == "REVIEWER" && a.userTypes[0].user_subtype == "Delivery");
      // });
      this.bid.participants.forEach(item => {
        if (item.userTypes[0].user_type == 'BID_OWNER' && item.userTypes[0].user_subtype == "Sales") {
          this.name.push(item);
          this.sofData.orderBookedPersonName = item.user_id;
          this.sofData.orderBookedBy = "Sales";
        }
      });
      this.readSofAttachment();
    }, error => {
    });
  }

  // Function for Product Tab when to show and hide
  showProductTab() {
    this.typeSelected.forEach(element => {
      if (element.type_name == "Product") {
        this.productFlag = true;
      }
      if (element.type_name == "System Integration") {
        this.productFlag = true;
      }
    });
  }

  // salesDeliveryList = [];
  // onBookedBy(result) {
  //   console.log("Hello 128", result)
  //   if (result == 'Sales') {
  //     this.bid.participants.forEach(item => {
  //       if (item.userTypes[0].user_type == 'BID_OWNER' && item.userTypes[0].user_subtype == "Sales") {
  //         this.name.push(item);
  //         return this.sofData.orderBookedPersonName = item.user_id;
  //       }
  //     });
  //   }
  //   if (result == 'Delivery') {
  //     this.name = this.bid.participants.filter(a => {
  //       if (a.userTypes[0].user_type == "REVIEWER" && a.userTypes[0].user_subtype == "Delivery") {
  //         this.salesDeliveryList.push((a));
  //         this.sofData.orderBookedPersonName = a.user_id;
  //         return
  //       }
  //     });
  //   }
  // }

  // Function for Billing Plan when user select Biling plan automatic data will enter in Total quantity
  onBillingPlanBy(result) {
    if (result == 'Monthly Arrears' || result == 'Monthly Advance') {
      this.sofData.totalQuantity = "12"
    }
    if (result == 'Quarterly Arrears' || result == 'Quarterly Advance') {
      this.sofData.totalQuantity = "4";
    }
    if (result == 'Half Yearly Arrears' || result == 'Half Yearly Advance') {
      this.sofData.totalQuantity = "2";
    }
    if (result == 'Yearly Arrears' || result == 'Yearly Advance') {
      this.sofData.totalQuantity = "1";
    }
  }

  // Function for B2B when user select Yes Name of Oem is mandatory. if not then name of Oem is not mandatory
  onB2B(result) {
    if (result == 'Yes') {
      this.isB2BFlag = false;
    }
    if (result == 'No') {
      this.isB2BFlag = true;
      this.sofData.nameOEM = "";
    }
  }

  // Validation for Email and Mobile No
  validateRegex(element) {
    let validate = true;
    this.sofData[element + 'RegexValid'] = true;

    switch (element) {
      case 'contactPersonEmail': {
        if (this.sofData[element] && !validatorCtrl.validateEmail(this.sofData[element])) {
          this.sofData[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'contactpersonCustomerContactNo': {
        if (this.sofData[element] && !validatorCtrl.validatePhone(this.sofData[element])) {
          this.sofData[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      default: {
        break;
      }
    }
    return validate;
  }

  // Save function when user select on save IN SOF TAB>> Create Call API
  saveDraftSof() {
    let obj = {
      "sofNumber": this.sofData.sofNumber,
      "bid_id": this.bid_id,
      "company_id": this.user.company_id,
      "customerCode": this.sofData.customerCode,
      "customerName": this.accountName,
      "nameOEM": this.sofData.nameOEM,
      "customerPurchaseOrderNo": this.sofData.customerPurchaseOrderNo,
      "customerPurchaseOrderDate": this.sofData.customerPurchaseOrderDate,
      "bookingLocationCode": this.sofData.bookingLocationCode,
      "bookingLocationName": this.sofData.bookingLocationName,
      "billingRegionCode": this.sofData.billingRegionCode,
      "billingRegionName": this.sofData.billingRegionName,
      "contractStartDate": this.sofData.contractStartDate,
      "contractEndDate": this.sofData.contractEndDate,
      "billingStartDate": this.sofData.billingStartDate,
      "contractPeriod": this.sofData.duration ? this.sofData.duration : 'NA',
      "contractValue": this.sofData.contractValue,
      "sofType": this.sofData.sofType,
      "billingPlan": this.sofData.billingPlan,
      "totalQuantity": this.sofData.totalQuantity,
      "paymentTerms": this.sofData.paymentTerms,
      "taxType": this.sofData.taxType,
      "contractType": this.sofData.contractType,
      "contractCatagory": this.sofData.contractCatagory,
      "isBackToBackOrder": this.sofData.isBackToBackOrder,
      "grossMarginValue": this.sofData.grossMarginValue,
      "serviceDesciption": this.sofData.serviceDesciption,
      "penaltyPercentage": this.sofData.penalty ? this.sofData.penalty : 'NA',
      "ContactPersonCustomerName": this.sofData.ContactPersonCustomerName,
      "contactpersonCustomerContactNo": this.sofData.contactpersonCustomerContactNo,
      "contactPersonEmail": this.sofData.contactPersonEmail,
      "orderBookedBy": this.sofData.orderBookedBy,
      "orderBookedPersonName": this.sofData.orderBookedPersonName,
      "orderBookedPersonECode": this.sofData.orderBookedPersonECode,
      "bussinessSendStatus": this.sofData.bussinessSendStatus,
      "attachment_data": this.sofData.attachment_data,
      "regionalBusinessHead": this.sofData.regionalBusinessHead,
      "PreviousReferenceNumber": this.sofData.PreviousReferenceNumber,
      "isSubmittedStatus": 'saveSOF'
    }
    this._bidService.createSalesOrderForm(obj).subscribe(resp => {
      this.alert.sweetSuccess("Saved as Draft Sucessfully")
      this.readSofData(this.sofData.sofNumber);
    }, error => {

    })
  }

  // Next function when user select on Next IN SOF TAB>> Create Call API
  nextCreateSof() {
    this.formSubmitted = true;
    if (this.sofData.ContactPersonCustomerName == "" || this.sofData.ContactPersonCustomerName == null || this.sofData.billingRegionName == "" || this.sofData.billingRegionName == null || this.sofData.billingStartDate == "" || this.sofData.billingStartDate == null
      || this.sofData.contractStartDate == "" ||
      this.sofData.contractStartDate == null || this.sofData.contractEndDate == "" || this.sofData.contractEndDate == null || this.sofData.customerPurchaseOrderNo == "" || this.sofData.customerPurchaseOrderNo == null || this.sofData.customerPurchaseOrderDate == "" ||
      this.sofData.customerPurchaseOrderDate == null || this.sofData.contactpersonCustomerContactNo == "" || this.sofData.contactpersonCustomerContactNo == null
      || this.sofData.contactPersonEmail == "" || this.sofData.contactPersonEmail == null
      || this.sofData.totalQuantity == null || this.sofData.totalQuantity == "" || this.sofData.paymentTerms == "" || this.sofData.paymentTerms == null || this.sofData.billingPlan == "" || this.sofData.billingPlan == null || this.sofData.taxType == "" ||
      this.sofData.taxType == null || this.sofData.grossMarginValue == "" || this.sofData.grossMarginValue == null || this.sofData.serviceDesciption == "" || this.sofData.serviceDesciption == null) {
      // console.log("Hello Validations", this.sofData);
      this.alert.sweetError("Please enter mandatory fields")
      return;
    }
    if (!this.validateRegex('contactpersonCustomerContactNo')) {
      this.alert.sweetError("Please enter a valid Mobile No/Email Id");
      return;
    }
    if (!this.validateRegex('contactPersonEmail')) {
      this.alert.sweetError("Please enter a valid Mobile No/Email Id");
      return;
    }
    if (this.sofData.isBackToBackOrder == "Yes") {
      if (this.sofData.nameOEM == "" || this.sofData.nameOEM == null) {
        this.alert.sweetError("Please enter 'Name Of OEM' field");
        return;
      }
    }
    let obj = {
      "sofNumber": this.sofData.sofNumber,
      "PreviousReferenceNumber": this.sofData.PreviousReferenceNumber,
      "bid_id": this.bid_id,
      "company_id": this.bid.company_id,
      "customerCode": this.sofData.customerCode,
      "customerName": this.accountName,
      "nameOEM": this.sofData.nameOEM,
      "customerPurchaseOrderNo": this.sofData.customerPurchaseOrderNo,
      "customerPurchaseOrderDate": this.sofData.customerPurchaseOrderDate,
      "bookingLocationCode": this.sofData.bookingLocationCode,
      "bookingLocationName": this.sofData.bookingLocationName,
      "billingRegionCode": this.sofData.billingRegionCode,
      "billingRegionName": this.sofData.billingRegionName,
      "contractStartDate": this.sofData.contractStartDate,
      "contractEndDate": this.sofData.contractEndDate,
      "billingStartDate": this.sofData.billingStartDate,
      "contractPeriod": this.sofData.duration ? this.sofData.duration : 'NA',
      "contractValue": this.sofData.contractValue,
      "sofType": this.sofData.sofType,
      "billingPlan": this.sofData.billingPlan,
      "totalQuantity": this.sofData.totalQuantity,
      "paymentTerms": this.sofData.paymentTerms,
      "taxType": this.sofData.taxType,
      "contractType": this.sofData.contractType,
      "contractCatagory": this.sofData.contractCatagory,
      "isBackToBackOrder": this.sofData.isBackToBackOrder,
      "grossMarginValue": this.sofData.grossMarginValue,
      "serviceDesciption": this.sofData.serviceDesciption,
      "penaltyPercentage": this.sofData.penalty ? this.sofData.penalty : 'NA',
      "ContactPersonCustomerName": this.sofData.ContactPersonCustomerName,
      "contactpersonCustomerContactNo": this.sofData.contactpersonCustomerContactNo,
      "contactPersonEmail": this.sofData.contactPersonEmail,
      "orderBookedBy": this.sofData.orderBookedBy,
      "orderBookedPersonName": this.sofData.orderBookedPersonName,
      "orderBookedPersonECode": this.sofData.orderBookedPersonECode,
      "bussinessSendStatus": this.sofData.bussinessSendStatus,
      "attachment_data": this.sofData.attachment_data,
      "regionalBusinessHead": this.sofData.regionalBusinessHead,
      "isSubmittedStatus": 'SOFSubmitted',
      "approval_status": "Draft",
      "isSOFSubmittedStatus": 'SOFSubmitted',
    }
    this._bidService.createSalesOrderForm(obj).subscribe(resp => {
      this.formSubmitted = false;
      this.alert.sweetSuccess("First step completed succesfully")
      this.readSofData(this.sofNumber);
      var link = document.getElementById('second_tab');
      link.click();
    }, error => {

    })
  }

  // Save and Next function when user select on Save and Next In Contract details TAB>> Create Call API
  saveContractDetails(type) {
    let flag = false;
    if (type == 'Next') {
      this.sofData.contractFormId.forEach(element => {
        if (element.bu_name == "" || element.contribution === "" || element.contribution === null || element.tbd == "" || element.acv === null || element.avc === "" || element.deal_type == "" || element.tcv === "" || element.tcv === null) {
          flag = true;
        }
      })
      if (flag) {
        this.alert.sweetError("Pls fill all fields (only Remarks field can be empty)")
        return
      }
    }
    if (type == 'Next') {
      if (this.total_acv > this.total_tcv) {
        this.alert.sweetError('Total ACV should not be greater than Total TCV');
        return
      }
      if (this.total_contribution != 100) {
        this.alert.sweetError('Total Contribution should be equal to 100');
        return
      }
    }
    if (type == 'Next' || type == 'Save') {
      this.sofData.isSubmittedStatus = "saveSubmitContract";
    }
    this.sofData.contractFormId = this.attachment_details;
    if (type == 'Next') {
      this.sofData.isContractSubmitted = 'ContractFormSubmitted'
    }
    if (this.productFlag == false) {
      this.sofData.productFormId = []
    }
    this._bidService.createSalesOrderForm(this.sofData).subscribe(resp => {
      if (type == 'Save') {
        this.alert.sweetSuccess("Saved as Draft Sucessfully")
        this.readSofData(this.sofNumber);
      }
      if (type == 'Next') {
        this.alert.sweetSuccess("Contract Details completed succesfully")
        this.readSofData(this.sofNumber);
        if (this.productFlag) {
          var link = document.getElementById('third_tab');
          link.click();
        } else {
          var link = document.getElementById('fourth_tab');
          link.click();
        }
      }
      if (type == 'upload') {
        this.readSofData(this.sofNumber);
      }
      if (type == 'actionBtn') {
        this.readSofData(this.sofNumber);
        this.approvalFlag = false;
      }
    }, error => {

    })
  }


  onB2BProductTab(index) {
    let found = this.product_details[index];
    if (found.isBackToBackOrderProd == "Yes") {
      found.disableFlag = false;
    }
    if (found.isBackToBackOrderProd == "No") {
      found.disableFlag = true;
    }
  }

  // Save and Next function when user select on Save and Next In Product details TAB>> Create Call API
  saveProductDetails(type) {
    let flag = false;
    let oemFlag = false
    if (type == 'Next') {
      this.sofData.productFormId.forEach(element => {
        if (element.productName == "" || element.productCode === "" || element.quantity === null || element.quantity === "" || element.unitPrice === "" || element.unitPrice === null || element.isBackToBackOrderProd == "") {
          flag = true;
        }
      })
      this.product_details.forEach(element => {
        if (element.isBackToBackOrderProd == "Yes") {
          if (element.nameOEMProd == "" || element.nameOEMProd == null) {
            oemFlag = true
          }
        }
      })
      if (flag) {
        this.alert.sweetError("Pls fill all fields (only Remarks field can be empty)")
        return
      }
      if (oemFlag) {
        this.alert.sweetError("Please enter 'Name Of OEM' field");
        return
      }
    }
    this.sofData.isSubmittedStatus = "saveSubmitProduct";
    this.sofData.productFormId = this.product_details;
    if (type == 'Next') {
      this.sofData.isProductSubmitted = 'ProductFormSubmitted'
    }
    this._bidService.createSalesOrderForm(this.sofData).subscribe(resp => {
      if (type == 'Save') {
        this.alert.sweetSuccess("Saved as Draft Sucessfully")
        this.readSofData(this.sofNumber);
      }
      if (type == 'Next') {
        this.alert.sweetSuccess("Product Details completed succesfully")
        this.readSofData(this.sofNumber);
        if (this.productFlag) {
          var link = document.getElementById('fourth_tab');
          link.click();
        }
      }
    }, error => {

    })
  }

  // Save function when user click on Save in Attachments TAB>> Create Call API
  finalSaveSof() {
    if (this.productFlag == false) {
      this.sofData.productFormId = []
    }
    this.sofData.isSubmittedStatus = "SubmittedDraft"
    this._bidService.createSalesOrderForm(this.sofData).subscribe(resp => {
      this.alert.sweetSuccess("Saved as Draft Sucessfully")
      this.readSofData(this.sofNumber);
    }, error => {

    })
  }

  // Submit SOF function when user click on Submit in Attachments TAB>> Create Call API  >> Send for Approval Process
  finalSubmitSof() {
    if (this.selectedFile) {
      this.alert.sweetError("Please upload a file");
      return
    }
    if (this.productFlag == false) {
      this.sofData.productFormId = []
    }
    let date = moment().format();
    this.alert.customConfirmation("Are you sure you want to submit SOF for processing?", "You will not be able to make any further changes.").then(success => {
      this.sofData.salesPersonId = this.salesPersonId;
      this.sofData.isSubmittedStatus = "Submitted"
      this.sofData.approval_status = "Submitted SOF"
      let found = {
        "action": `Submitted SOF`,
        "Date": date,
        "comments": "NA",
        "fullname": this.user.fullname,
        "user_id": this.user.user_id,
        "approvedBy": this.user_type,
        "rejectedBy": this.user_type,
        "disableFlag": true
      }
      this.sofData.approval_process.push(found);
      this._bidService.createSalesOrderForm(this.sofData).subscribe(resp => {
        this.readSofData(this.sofNumber);
        this.readSofAttachment();
      }, error => {

      })
    }, cancel => {
      return;
    });
  }

  // Reset Function for SOF TAB
  resetSof() {
    this.formSubmitted = false;
    this.sofData = {
      "customerCode": "",
      "sofNumber": this.sofData.sofNumber,
      "customerPurchaseOrderNo": "",
      "customerPurchaseOrderDate": "",
      "ContactPersonCustomerName": "",
      "contactpersonCustomerContactNo": "",
      "orderBookedBy": this.sofData.orderBookedBy,
      "orderBookedPersonName": this.sofData.orderBookedPersonName,
      "orderBookedPersonECode": "",
      "regionalBusinessHead": this.sofData.regionalBusinessHead,
      "sofType": "",
      "bookingLocationName": this.sofData.bookingLocationName,
      "bookingLocationCode": "",
      "billingRegionCode": "",
      "billingRegionName": "",
      "billingStartDate": "",
      "billingPlan": "",
      "duration": this.sofData.duration,
      "penalty": this.sofData.penalty,
      "contractStartDate": "",
      "contractEndDate": "",
      "totalQuantity": "",
      "paymentTerms": "",
      "taxType": "",
      "grossMarginValue": "",
      "serviceDesciption": "",
      "isBackToBackOrder": "",
      "nameOEM": "",
      "contactPersonEmail": "",
      "PreviousReferenceNumber": "",
      "bid_id": this.bid_id,
      "company_id": this.bid.company_id,
      "isSubmittedStatus": "resetSOF"
    }
    this.saveContractDetails('');
    this.isB2BFlag = true;
  }

  // Reset function for Contract details Tab
  resetContractDetails() {
    this.attachment_details.forEach(element => {
      element.business_unit = "",
        element.deal_type = "",
        element.acv = "",
        element.tbd = "",
        element.tcv = "",
        element.contribution = "",
        element.Remark = ""
    })
    this.total_acv = 0;
    this.total_tcv = 0;
    this.total_contribution = 0;
  }

  // Reset for Product details Tab
  resetProductDetails() {
    this.product_details.forEach(element => {
      element.productName = "",
        element.productCode = "",
        element.quantity = "",
        element.unitPrice = "",
        element.Remark = "",
        element.total = ""
      element.isBackToBackOrderProd = "",
        element.nameOEMProd = ""
      element.disableFlag = true;
    })
  }

  // Add function for Contract details Tab
  add() {
    if (this.sofData.isSubmittedStatus == 'Submitted' || this.sofData.isSOFSubmittedStatus != 'SOFSubmitted' || !this.access.writeAccess || this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    let obj = {
      "bid_id": this.bid_id,
      "business_unit": "",
      "deal_type": "",
      "acv": "",
      "tbd": "",
      "tcv": "",
      "contribution": "",
      "Remark": "",
      "salesOrderId": this.salesOrderId,
    };
    this.attachment_details.push(obj);
  }

  // Add Function for Product detail Tab
  addProduct(index) {
    if (this.sofData.isSubmittedStatus == 'Submitted' || this.sofData.isSOFSubmittedStatus != 'SOFSubmitted'
      || !this.access.writeAccess || this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    let obj = {
      "bid_id": this.bid_id,
      "productName": "",
      "productCode": "",
      "quantity": "",
      "unitPrice": "",
      "total": "",
      "isBackToBackOrderProd": "",
      "nameOEMProd": "",
      "Remark": "",
      "disableFlag": true
    };
    let found = this.product_details[index];
    if (found.isBackToBackOrderProd == 'Yes') {
      if (found.nameOEMProd == "" || found.nameOEMProd == null) {
        this.alert.sweetError("Please enter 'Name Of OEM' field");
        return
      }
    }
    this.product_details.push(obj);
  }

  // Delete function for Contract details tab
  delete(index) {
    if (this.sofData.contractFormId.length == 1 || this.sofData.isSubmittedStatus == 'Submitted'
      || this.sofData.isSOFSubmittedStatus != 'SOFSubmitted'
      || !this.access.writeAccess || this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    this.alert.deleted("").then(success => {
      this.sofData.contractFormId.splice(index, 1);
      this.alert.sweetSuccess("Deleted successfully")
      this.saveContractDetails('');
      this.total();
      this.totalAcv();
      this.totalTcv();
    }, error => {
      return;
    });
  }

  // Delete Function for Product details Tab
  deleteProduct(index) {
    if (this.sofData.productFormId.length == 1 || this.sofData.isSubmittedStatus == 'Submitted'
      || this.sofData.isSOFSubmittedStatus != 'SOFSubmitted' || !this.access.writeAccess
      || this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    this.alert.deleted("").then(success => {
      this.sofData.productFormId.splice(index, 1);
      this.alert.sweetSuccess("Deleted successfully")
      this.saveProductDetails('');
      // this.totalproduct();
    }, error => {
      return;
    });
  }

  // Download Function for Download File in Attachment tab
  attData;
  onDownload(index, type) {
    if (type == 'rfpFile') {
      this.attData = this.rfpReviewAttachments[index];
      if (this.attData.description == 'No Document' || this.attData.original_name == "No File") {
        this.alert.sweetError("No file to download")
        return
      }
    } else {
      this.attData = this.uploadAttachments[index];
    }
    this._bidService.downloadFile({ attachment_id: this.attData.attachment_id, responseType: 'blob' }).subscribe(data => {
      const blob = new Blob([data], { type: data.type }),
        url = window.URL.createObjectURL(blob);
      saveAs(url, this.attData.original_name ? this.attData.original_name : this.attData.attachment_n);
    });
  }


  // Total ACV Function in Contract TAB
  totalAcv() {
    this.total_acv = 0;
    this.attachment_details.forEach(element => {
      this.total_acv += element.acv;
      // this.Trimmedtotal_acv = (this.total_acv).toFixed(2)
    });
  }

  // Total TCV Function in Contract TAB
  totalTcv() {
    this.total_tcv = 0;
    this.attachment_details.forEach(element => {
      this.total_tcv += element.tcv;
      // this.Trimmedtotal_tcv = (this.total_tcv).toFixed(2)
    });
  }

  // Total Contribution Function in Contract TAB
  total() {
    this.total_contribution = 0;
    this.attachment_details.forEach(element => {
      this.total_contribution += element.contribution;
    });
    // if (this.total_contribution != 100) {
    //   this.alert.sweetError('Total Contribution should be equal to 100');
    // }
  }

  // Multiply Quantity and Unit Price Function in Product TAB
  totalproduct(index) {
    let found = this.product_details[index];
    found.total = found.quantity * found.unitPrice;
  }

  // On Add Attachment Function
  onAdd() {
    if (this.sofData.isSubmittedStatus == 'Submitted' || !this.access.writeAccess || this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    let obj = {
      "cellRange": "",
      "description": "",
      "disable": false,
    };
    this.files.push(obj);
    this.flag = true;
  }

  onFileSelected(event, index) {
    this.selectedFile = <File>event.target.files[0];
  }

  // Uploading Attachment API for sales Manager in Attachment Tab
  onUpload(index) {
    if (this.sofData.isSubmittedStatus == 'Submitted' || !this.access.writeAccess || this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    this.loader = true;
    if (this.selectedFile) {
      let data = this.files[index];
      const fd = new FormData();
      fd.append("pdf", this.selectedFile);
      fd.append("bid_id", this.bid_id);
      fd.append("description", data.description);
      fd.append("cellRange", data.cellRange)
      fd.append("doc_version", "0");
      fd.append("revision", "false");
      fd.append("isPublic", "true");
      fd.append("type", "SOF_ATTACH");
      this._httpService.upload(fd).subscribe((resp) => {
        let found = resp['data']
        // console.log("Hwllo 518", found)
        this.loader = false;
        this.alert.sweetSuccess("File uploaded successfully");
        this.selectedFile = null;
        this.flag = false;
        this.files.forEach(element => {
          element.cellRange = "",
            element.description = ""
        })
        this.uploadArray.push(resp['data']);
        this.sofData.attachment_data.push(resp['data']);
        this.UploadAttachLength = this.uploadAttachments.length;
        this.saveContractDetails('upload');
        this.resetAttachment();
      }, (error) => {
        this.loader = false;
        if (error.error.code == 500) {
          this.alert.sweetError(error.error.msg);
        } else if (error.error.code == 400) {
          this.alert.sweetError(error.error.msg);
        } else {
          this.alert.sweetError("File upload failed");
        }
      });
    } else {
      this.loader = false;
      this.alert.sweetError("Please choose a file")
    }
  }

  // Reset Attachment Function in Attachment Tab 
  resetAttachment() {
    // console.log(this.myInputVariable.nativeElement.files);
    this.myInputVariable.nativeElement.value = "";
    // console.log(this.myInputVariable.nativeElement.files);
  }

  // Reset Attachment Function in Attachment Tab 
  resetAttachmentFile() {
    this.files.forEach(element => {
      element.cellRange = "",
        element.description = ""
    })
    this.myInputVariable.nativeElement.value = "";
    this.selectedFile = null;
  }

  // Delete Attachment API when Sales Manager delete document in Attachment Tab
  onRemoveUploadFile(index) {
    if (!this.access.writeAccess) {
      this.alert.sweetError("Sorry, You are not authorised to delete")
      return
    }
    if (this.sofData.isSubmittedStatus == 'Submitted' || this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    let obj = {
      "attachment_id": this.sofData.attachment_data[index].attachment_id,
      "status": "INACTIVE",
      "bid_id": this.bid_id,
    }
    this.alert.deleted("").then(success => {
      this._bidService.deleteSofAttachment(obj).subscribe(response => {
        this.sofData.attachment_data.splice(index, 1);
        this.saveContractDetails('');
        // this.saveDraftSof();
        this.UploadAttachLength = this.uploadAttachments.length;
        this.alert.sweetSuccess("Attachment deleted successfully");
      }, error => {
        this.alert.sweetError("Failed to delete attachment");
      });
    }, error => {
      return;
    });
  }

  // Function for CSV Download after Sales Manager Submit in attachEmbeddedView,ent 
  csvAttach;
  onDownloadCSV() {
    if ((this.attachmentSOFData && this.attachmentSOFData.length == 0) || this.attachmentSOFData == undefined) {
      this.alert.sweetError('Not submitted')
      return
    }

    // this.csvAttach = this.attachmentSOFData;
    //   this.csvAttach.forEach(element => {
    //     this._bidService.downloadFile({ attachment_id: element.attachment_id, responseType: 'blob' }).subscribe(data => {
    //       const blob = new Blob([data], { type: data.type }),
    //         url = window.URL.createObjectURL(blob);
    //       saveAs(url, element.original_name ? element.original_name : element.attachment_n);
    //     });
    //   })
    // }
    this.csvAttach = this.multipleCsvData;
    this.csvAttach.forEach(element => {
      console.log(element)
      this._bidService.downloadFile({ attachment_id: element.attachment_id, responseType: 'blob' }).subscribe(data => {
        const blob = new Blob([data], { type: data.type }),
          url = window.URL.createObjectURL(blob);
        saveAs(url, element.original_name ? element.original_name : element.attachment_n);
      });
    })
  } 
  // Action Button for Sof viewer and Product viewer Make change or completed button
  actionButton(type) {
    if (type == "Make Changes") {
      if (this.ac_comment.findIndex(a => a.comment == '') >= 0) {
        this.alert.sweetError("Please enter comment");
        return
      }
    }
    let msg;
    let message;
    if (type == "Make Changes") {
      msg = "Make Changes"
      message = "Do you want the Sales Manager to Make Changes?"
    }
    if (type == "COMPLETED") {
      msg = "complete"
      message = "Are you sure?"
    }
    this.alert.confirmSofEmd(message).then(succes => {
      let date = moment().format();
      let found = {
        user_id: this.approvalUserID,
        approvalUserType: this.approvaluniqueRole,
        action: type,
        Date: date,
        comments: this.ac_comment[0].comment ? this.ac_comment[0].comment : 'NA',
        fullname: this.approvalFullName,
        approvedBy: this.approvaluniqueRole,
        rejectedBy: this.approvaluniqueRole,
        disableFlag: true
      }
      this.sofData.approval_process.push(found);
      if (type == 'Make Changes') {
        this.sofData.approval_status = "Edit SOF"
        this.sofData.isSubmittedStatus = "Draft"
      }
      if (type == 'COMPLETED') {
        this.sofData.approval_status = "COMPLETED"
      }
      this.saveContractDetails('actionBtn');
      this.approvalComment();
      this.approvalFlag = false;
      // this.completedFlag = false;
    }, cancel => {
      return false;
    });
  }

  // Function for Approval Comment Hide show for SOF and Product Viewer
  approvalComment() {
    this.approvalFlag = false;
    this.ac_comment = [{
      "comment": "",
      "disableFlag": false
    }]
    let lastElement = this.sofData.approval_process && this.sofData.approval_process[this.sofData.approval_process.length - 1];
    if (lastElement && lastElement.action == `Submitted SOF` && this.approvaluniqueRole === 'SOF_VIEWER') {
      this.approvalFlag = true;
      return
    }
    if (lastElement && lastElement.action == `Submitted SOF` && this.approvaluniqueRole === 'SOF_PRODUCT_VIEWER') {
      this.approvalFlag = true;
      return
    }
  }

  // Function for Hide show Save Submit Add delete Button for all Users
  hideButtonPlusDiv() {
    let flag = false;
    if (this.user_type == 'BID_OWNER' && this.user_subtype == 'Sales') {
      flag = true;
    }
    if ((this.user_type == 'BID_OWNER' && this.user_subtype == 'Sales') && (this.sofData && this.sofData.isSubmittedStatus == 'Submitted')) {
      flag = false;
    }
    return flag;
  }

}
