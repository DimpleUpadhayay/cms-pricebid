import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EmdService } from '../../../services/emd.service';
import { BidService } from '../../../services/bid.service';
import { HttpService } from '../../../services/http.service';
import { UsersService } from '../../../services/users.service';
import * as validatorCtrl from '../../../libraries/validation';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-edm-design',
  templateUrl: './emd-design.component.html',
  styleUrls: ['./emd-design.component.css'],
  providers: [EmdService, HttpService, BidService, UsersService]
})

export class EmdDesignComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  @ViewChild('myInput') myInputVariable: ElementRef;

  emdData;
  files = [{
    "cellRange": "",
    "description": "",
    "disable": false,
  }];
  emdPaymentType = ['DD', 'Cheque', 'NEFT', 'BG']
  specify = ['Government', 'Non-Government']
  locations = ['Ahmedabad', 'Bangalore', 'Bhopal', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Lucknow', 'Mumbai', 'Pune', 'Srinagar'];
  type: any;
  bid_id: any;
  request_id: any;
  formSubmitted: boolean;
  attachmentArray: any;
  approvalprocess = [];
  formtype: any;
  user: any;
  public href: string = "";
  loader = false;
  selectedFile: File = null;
  flag
  access
  user_type
  user_subtype
  attachment_data
  amount
  displayAttachments;
  salesPersonId;
  madatoryFlag;
  attachment_details_pbg = [];
  bussiness_unit;
  territory;

  // Akash Code Starts Here
  uploadAttachments = [];
  rfpReviewAttachments = [];
  user_id;
  UploadAttachLength = 0;
  bid: any;
  bidStatus: any;
  bidVersionStatus: any;
  projectScopeData: any;
  EMD_Id;
  specimenDraftEMD = ['Specimen Draft of EMD', 'Other Documents'];
  specimenDraftPBG = ['Specimen Draft of PBG', 'Other Documents'];
  specimenDraftBGWriter = ['BG Writer Attachment']
  minDate;
  ac_comment = [{
    "comment": "",
    "disableFlag": false
  }]
  approvalUserID;
  approvaluniqueRole;
  approvalFullName;
  approvalStatusArray = []
  approvalFlag = false;
  completedFlag = false;
  ReadAttachLength = 0;
  attData;
  estimatedValueData;
  allEMD = [];
  emdNumber = "";
  selectedEMDPBG: any;
  multipleEMDFlag = false;
  allEMDPBGData: any;
  biReportEMDId = '';
  NoDataMultipleEMDFlag = true;

  constructor(private router: Router, private EmdService: EmdService, public _UsersService: UsersService,
    public _bidService: BidService, private _activeRoute: ActivatedRoute, private _httpService: HttpService) {
    this.biReportEMDId = localStorage.getItem('EMDId');
    this.bid_id = _activeRoute.snapshot.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.type = window.location.href.split('/');
    this.formtype = this.type[3];
    // console.log("Hello formType", this.formtype)
    this.minDate = new Date();
    this.accessControl();
    this.readAllEmd()
    this.readData(this.emdNumber);
    if (this.biReportEMDId != "") {
      this.emdNumber = this.biReportEMDId;
      this.readData(this.emdNumber);
    } else {
      this.readData(this.emdNumber);
    }
    this.getBidById();
    this.readProjectSummaryData();
    this.getEmdAttachments()
  }

  // Access Control API for all Users
  accessControl() {
    this._httpService.accessControl({
      "module": "emd",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id,
      "isInApprovalProcess": false
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
    }, error => {
    });
  }

  ngOnInit() {

  }

  // Read API for all the details of BID INFO
  // nameOfEmployeeRequestingEmdPbg;
  getBidById() {
    this._bidService.getBidById(this.bid_id).subscribe(data => {
      this.bid = data['data']['bid'];
      this.bidStatus = this.bid.bidFinalStatus ? this.bid.bidFinalStatus : "";
      this.bidVersionStatus = this.bid.revision_status ? this.bid.revision_status : false;
      this.estimatedValueData = this.bid.estimatedValue;
      this.emdData.totalExpectedOrderValue = this.bid.estimatedValue;
      this.bid.participants.forEach(item => {
        if (item.userTypes[0].user_type == 'BID_OWNER' && item.userTypes[0].user_subtype == "Sales") {
          this.emdData.nameOfEmployeeRequestingEmd = item.fullname;
          // this.nameOfEmployeeRequestingEmdPbg = item.fullname;
        }
      });
    }, error => {
    });
  }

  createEMDPBGResp;
  onAddNewEMD() {
    let obj = {
      "emdRequestNumber": "",
      "bid_id": this.bid_id,
      "company_id": this.bid.company_id,
      "formFlag": this.formtype
    }
    this.alert.emdPbgSofAlert("Are you sure you want to create new " + this.formtype + "?", "This cannot be un-done").then(success => {
      this.EmdService.createMultipleEMD(obj).subscribe(resp => {
        this.createEMDPBGResp = resp['data'];
        this.formSubmitted = false;
        this.alert.sweetSuccess("New " + this.formtype + " created successfully");
        this.readAllEmd()
        this.readData(this.createEMDPBGResp.emdRequestNumber)
        this.selectDropdown();
      }, error => {
      })
    }, cancel => {
      return;
    });
  }

  readAllEmd() {
    let obj = {
      "bid_id": this.bid_id,
      "company_id": this.user.company_id,
      "formFlag": this.formtype,
      "emdRequestNumber": "",
    }
    this.EmdService.readMultipleEMD(obj).subscribe(resp => {
      this.formSubmitted = false;
      if (this.user_type == "BID_OWNER" && this.user_subtype == "Sales" && this.access.writeAccess) {
        this.allEMD = resp['data']['read_data']
      }
      if (!this.access.writeAccess) {
        this.allEMD = []
        this.allEMDPBGData = resp['data']['read_data'];
        this.allEMDPBGData.forEach(result => {
          if (result.isSubmittedStatus == "Submitted" || result.isSubmittedStatus == "Draft") {
            this.allEMD.push(result);
          }
        })
        if (this.allEMD.length == 0) {
          this.NoDataMultipleEMDFlag = false;
        }
      }
      if (this.allEMD.length > 0) {
        let lastElement = this.allEMD && this.allEMD[this.allEMD.length - 1];
        this.selectedEMDPBG = lastElement.emdRequestNumber;
        this.multipleEMDFlag = true
        // this.readData(this.selectedEMDPBG)
        if (this.biReportEMDId == "" || this.biReportEMDId == null) {
          this.readData(this.selectedEMDPBG);
        } else {
          this.readData(this.emdNumber);
        }
        localStorage.removeItem("EMDId");
        console.log("Dropdown", this.selectedEMDPBG)
      }
    })
  }

  readCallAddButton(result) {
    let obj = {
      "bid_id": this.bid_id,
      "company_id": this.user.company_id,
      "formFlag": this.formtype,
      "emdRequestNumber": "",
    }
    this.EmdService.readMultipleEMD(obj).subscribe(resp => {
      this.formSubmitted = false;
      if (this.user_type == "BID_OWNER" && this.user_subtype == "Sales" && this.access.writeAccess) {
        this.allEMD = resp['data']['read_data']
      } else {
        this.allEMD = []
        this.allEMDPBGData = resp['data']['read_data'];
        this.allEMDPBGData.forEach(result => {
          if (result.isSubmittedStatus == "Submitted" || result.isSubmittedStatus == "Draft") {
            this.allEMD.push(result);
          }
        })
        if (this.allEMD.length == 0) {
          this.multipleEMDFlag = false
          this.NoDataMultipleEMDFlag = false;
        }
      }
      this.selectedEMDPBG = result
    }, error => {

    })
  }

  // Read Call API when Screen loads data fetch for all the Tab. Using "FormFlag" we are defining it is PBG OR EMD
  readData(data) {
    this.loader = true;
    let obj = {};
    this.emdNumber = data;
    console.log("ReadCall", data)
    if (data == "") {
      obj = {
        "bid_id": this.bid_id,
        "formFlag": this.formtype,
      }
    } else {
      obj = {
        "emdRequestNumber": data,
        "bid_id": this.bid_id,
        "formFlag": this.formtype,
      }
    }
    this.EmdService.readEmdData(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.firstTimeReadData();
        this.multipleEMDFlag = false;
        this.loader = false;
        return;
      }
      this.emdData = resp['data'];
      this.multipleEMDFlag = true;
      this.emdNumber = this.emdData.emdRequestNumber;
      console.log("Response Read Call", this.emdNumber)
      this.EMD_Id = this.emdData.emdId;
      this.emdData.contactPersonsTelephoneNoRegexValid = true;
      this.emdData.contactPersonsEmailIdRegexValid = true;
      this.uploadAttachments = resp['data']['attachment_data'];
      this.UploadAttachLength = this.uploadAttachments.length;
      this.salesPersonId = this.emdData.salesPersonId;
      if (this.approvalStatusArray) {
        this.approvalStatusArray = this.emdData.approval_process;
      }
      this.uploadAttachments.forEach(element => {
        if (element.description == "") {
          element.description = 'N/A'
        }
        if (element.cellRange == "") {
          element.cellRange = 'Other Documents'
        }
      });
      if (this.emdData && this.emdData.regionalSalesHead) {
        this.emdData.regionalSalesHead.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id
            this.approvaluniqueRole = "RegionalSalesHead"
            this.approvalFullName = item.fullname;
          }
        })
      }
      if (this.emdData && this.emdData.salesHead) {
        this.emdData.salesHead.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id
            this.approvaluniqueRole = item.userTypes[0].user_type;
            this.approvalFullName = item.fullname;
          }
        })
      }
      if (this.emdData && this.emdData.financeController) {
        this.emdData.financeController.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id
            this.approvaluniqueRole = item.userTypes[0].user_type;
            this.approvalFullName = item.fullname;
          }
        })
      }
      if (this.emdData && this.emdData.cfo) {
        this.emdData.cfo.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id
            this.approvaluniqueRole = item.userTypes[0].user_type;
            this.approvalFullName = item.fullname;
          }
        })
      }
      if (this.emdData && this.emdData.bgWriter) {
        this.emdData.bgWriter.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id
            this.approvaluniqueRole = item.userTypes[0].user_type;
            this.approvalFullName = item.fullname;
          }
        })
      }
      // console.log("Helllo approvaluniqueRole", this.approvaluniqueRole)
      this.approvalComment();
      this.readCallAddButton(this.emdNumber)
      this.getBidById();
      this.readProjectSummaryData();
      this.getEmdAttachments()
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }

  selectDropdown() {
    var link = document.getElementById('first_tab_emd');
    link.click();
  }

  // Project Summary automatic data API 
  readProjectSummaryData() {
    let obj = {
      "bid_id": this.bid_id
    }
    this.EmdService.getProjectSummaryData(obj).subscribe(resp => {
      this.projectScopeData = resp['data'];
      this.emdData.deliveryTerms = this.projectScopeData.deliveryTerms ? this.projectScopeData.deliveryTerms : 'NA';
      this.emdData.paymentTermsOfExpectedOrder = this.projectScopeData.paymentTermsOfExpectedOrder ? this.projectScopeData.paymentTermsOfExpectedOrder : 'NA';
      this.emdData.penaltyLdClauses = this.projectScopeData.penaltyLdClauses ? this.projectScopeData.penaltyLdClauses : 'NA';
    })
  }

  // Read API for Create Bid Attachment in Attachment TAB 
  getEmdAttachments() {
    let obj = {
      "bid_id": this.bid_id,
    }
    this.EmdService.getEmdAttachments(obj).subscribe(resp => {
      this.rfpReviewAttachments = resp['data']['attachmentData'];
      this.ReadAttachLength = this.rfpReviewAttachments.length;
    }, error => {

    })
  }

  // First Time Intializing Object for EMD/PBG Tab when data is null
  // Using "FormFlag" we are defining it is PBG OR EMD
  firstTimeReadData() {
    this.emdData = {
      "formFlag": this.formtype,
      "bid_id": this.bid_id,
      "emdRequestNumber": "",
      "nameOfEmployeeRequestingEmd": "",
      "employeeCode": "",
      "emdReqdInTheFavourOfBeneficary": "",
      "payableAt": "",
      "AmountReqdEmd": "",
      "PurposeOfTheEmd": "",
      "emdPaymentType": "",
      "BankType": "",
      "specimenDraftOfEmd": "",
      "contactPersonsNameAtCustomersPlace": "",
      "addressOfBeneficary": "",
      "location": "",
      "contactPersonsTelephoneNo": "",
      "contactPersonsEmailId": "",
      "lastInstallationDate": "",
      "lastDateForClaimOfBankGuarantee": "",
      "emdRequiredByDate": "",
      "tenderDueDate": "",
      "tenderNo": "",
      "tenderDate": "",
      "specifyWhetherGovernmentOrNonGovernment": "",
      "percentageMarginForTheOrder": "",
      "totalExpectedOrderValue": "",
      "paymentTermsOfExpectedOrder": "",
      "deliveryTerms": "",
      "penaltyLdClauses": "",
      "locationOfInstallation": "",
      "scopeOfWorkInBrief": "",
      "potentialDateOfConversionOfTheTenderToOrder": "",
      "documentsToBeEnclosedWithEmdRequistionsForm": "",
      "statusOfEmdRequest": "",
      "attachment_data": []
    }
  }

  // Validation for Email and Mobile No
  validateRegex(element) {
    let validate = true;
    this.emdData[element + 'RegexValid'] = true;
    switch (element) {
      case 'contactPersonsEmailId': {
        if (this.emdData[element] && !validatorCtrl.validateEmail(this.emdData[element])) {
          this.emdData[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'contactPersonsTelephoneNo': {
        if (this.emdData[element] && !validatorCtrl.validatePhone(this.emdData[element])) {
          this.emdData[element + 'RegexValid'] = false;
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

  // Reset button Function when sales manager click on reset in EMD/PBG TAB>> Create Call API
  // Using "FormFlag" we are defining it is PBG OR EMD
  resetEmdForm() {
    this.formSubmitted = false;
    this.emdData = {
      "formFlag": this.formtype,
      "bid_id": this.bid_id,
      "emdRequestNumber": this.emdData.emdRequestNumber,
      "nameOfEmployeeRequestingEmd": this.emdData.nameOfEmployeeRequestingEmd,
      "employeeCode": "",
      "emdReqdInTheFavourOfBeneficary": "",
      "payableAt": "",
      "AmountReqdEmd": "",
      "PurposeOfTheEmd": "",
      "emdPaymentType": "",
      "BankType": "",
      "specimenDraftOfEmd": "",
      "contactPersonsNameAtCustomersPlace": "",
      "addressOfBeneficary": "",
      "contactPersonsTelephoneNo": "",
      "location": "",
      "contactPersonsEmailId": "",
      "lastInstallationDate": "",
      "lastDateForClaimOfBankGuarantee": "",
      "emdRequiredByDate": "",
      "tenderDueDate": "",
      "tenderNo": "",
      "tenderDate": "",
      "specifyWhetherGovernmentOrNonGovernment": "",
      "percentageMarginForTheOrder": "",
      "totalExpectedOrderValue": this.bid.estimatedValue,
      "paymentTermsOfExpectedOrder": this.emdData.paymentTermsOfExpectedOrder,
      "deliveryTerms": this.emdData.deliveryTerms,
      "penaltyLdClauses": this.emdData.penaltyLdClauses,
      "locationOfInstallation": "",
      "scopeOfWorkInBrief": "",
      "potentialDateOfConversionOfTheTenderToOrder": ""
    }
    this.saveSubmitFinalEMD();
  }

  // Save button Function when sales manager click on save in EMD/PBG TAB>> Create Call API
  // Using "FormFlag" we are defining it is PBG OR EMD
  saveDraftEmd(type) {
    let obj = {
      // "attachment_data": [],
      "formFlag": this.formtype,
      "bid_id": this.bid_id,
      "emdRequestNumber": this.emdData.emdRequestNumber,
      "nameOfEmployeeRequestingEmd": this.emdData.nameOfEmployeeRequestingEmd,
      "employeeCode": this.emdData.employeeCode,
      "emdReqdInTheFavourOfBeneficary": this.emdData.emdReqdInTheFavourOfBeneficary,
      "payableAt": this.emdData.payableAt,
      "AmountReqdEmd": this.emdData.AmountReqdEmd,
      "PurposeOfTheEmd": this.emdData.PurposeOfTheEmd,
      "emdPaymentType": this.emdData.emdPaymentType,
      "BankType": this.emdData.BankType,
      "specimenDraftOfEmd": this.emdData.specimenDraftOfEmd,
      "contactPersonsNameAtCustomersPlace": this.emdData.contactPersonsNameAtCustomersPlace,
      "addressOfBeneficary": this.emdData.addressOfBeneficary,
      "location": this.emdData.location,
      "contactPersonsTelephoneNo": this.emdData.contactPersonsTelephoneNo,
      "contactPersonsEmailId": this.emdData.contactPersonsEmailId,
      "lastInstallationDate": this.emdData.lastInstallationDate,
      "lastDateForClaimOfBankGuarantee": this.emdData.lastDateForClaimOfBankGuarantee,
      "emdRequiredByDate": this.emdData.emdRequiredByDate,
      "tenderDueDate": this.emdData.tenderDueDate,
      "tenderNo": this.emdData.tenderNo,
      "tenderDate": this.emdData.tenderDate,
      "specifyWhetherGovernmentOrNonGovernment": this.emdData.specifyWhetherGovernmentOrNonGovernment,
      "percentageMarginForTheOrder": this.emdData.percentageMarginForTheOrder,
      "totalExpectedOrderValue": this.bid.estimatedValue,
      "paymentTermsOfExpectedOrder": this.emdData.paymentTermsOfExpectedOrder,
      "deliveryTerms": this.emdData.deliveryTerms,
      "penaltyLdClauses": this.emdData.penaltyLdClauses,
      "locationOfInstallation": this.emdData.locationOfInstallation,
      "scopeOfWorkInBrief": this.emdData.scopeOfWorkInBrief,
      "potentialDateOfConversionOfTheTenderToOrder": this.emdData.potentialDateOfConversionOfTheTenderToOrder,
      "documentsToBeEnclosedWithEmdRequistionsForm": this.emdData.documentsToBeEnclosedWithEmdRequistionsForm,
      "statusOfEmdRequest": this.emdData.statusOfEmdRequest,
      "approvalStatus": "Draft",
      "isSubmittedStatus": type == 'next' ? 'EMDSubmmited' : 'DraftEMDPBG',
      "attachment_data": this.emdData.attachment_data,
      "emdId": this.emdData.emdId ? this.emdData.emdId : ''
    }
    if (this.EMD_Id == null || this.EMD_Id == undefined) {
      this.loader = true;
      this.EmdService.createEmdFormId(obj).subscribe(resp => {
        this.loader = false;
        this.readData(this.emdNumber);
        if (type == 'save') {
          this.alert.sweetSuccess("Data Saved Successfully");
        }
        if (type == 'next') {
          this.formSubmitted = false;
          this.loader = false;
          this.alert.sweetSuccess("First step completed succesfully");
          var link = document.getElementById('second_tab_emd');
          link.click();
        }
      }, error => {
        this.loader = false;
      })
    }
    if (this.EMD_Id != null || this.EMD_Id != undefined) {
      this.loader = true;
      this.EmdService.createEmdFormId(obj).subscribe(resp => {
        this.loader = false;
        this.readData(this.emdNumber);
        if (type == 'save') {
          this.alert.sweetSuccess("Data Saved Successfully");
        }
        if (type == 'next') {
          this.formSubmitted = false;
          this.loader = false;
          this.alert.sweetSuccess("First step completed succesfully");
          var link = document.getElementById('second_tab_emd');
          link.click();
        }
      }, error => {
        this.loader = false;
      })
    }
  }

  // Next button Function when sales manager click on Save in EMD/PBG TAB>> Create Call API
  // Using "FormFlag" we are defining it is PBG OR EMD
  onNextEmd(type) {
    this.formSubmitted = true;
    if (this.emdData.emdPaymentType == "" || this.emdData.emdPaymentType == null || this.emdData.tenderDueDate == null || this.emdData.tenderDueDate == undefined
      || this.emdData.tenderDate == null || this.emdData.tenderDate == undefined || this.emdData.tenderNo == "" || this.emdData.tenderNo == null
      || this.emdData.percentageMarginForTheOrder == undefined || this.emdData.percentageMarginForTheOrder == null
      || this.emdData.potentialDateOfConversionOfTheTenderToOrder == "" || this.emdData.potentialDateOfConversionOfTheTenderToOrder == null
      || this.emdData.scopeOfWorkInBrief == "" || this.emdData.scopeOfWorkInBrief == null || this.emdData.locationOfInstallation == "" || this.emdData.locationOfInstallation == null
      || this.emdData.emdReqdInTheFavourOfBeneficary == "" || this.emdData.emdReqdInTheFavourOfBeneficary == null || this.emdData.AmountReqdEmd == null || this.emdData.AmountReqdEmd == undefined
      || this.emdData.contactPersonsNameAtCustomersPlace == "" || this.emdData.contactPersonsNameAtCustomersPlace == null || this.emdData.addressOfBeneficary == "" || this.emdData.addressOfBeneficary == null ||
      this.emdData.emdRequiredByDate == null || this.emdData.emdRequiredByDate == "" || this.emdData.location == null || this.emdData.location == "") {
      this.alert.sweetError("Please enter mandatory fields");
      return;
    }
    if (this.formtype == 'PMG') {
      if (this.emdData.lastDateForClaimOfBankGuarantee == "" || this.emdData.lastDateForClaimOfBankGuarantee == null) {
        this.alert.sweetError("Please enter mandatory fields");
        return;
      }
    }
    if (!this.validateRegex('contactPersonsTelephoneNo')) {
      this.alert.sweetError("Please enter a valid Mobile No/Email Id");
      return;
    }
    if (!this.validateRegex('contactPersonsEmailId')) {
      this.alert.sweetError("Please enter a valid Mobile No/Email Id");
      return;
    }
    this.saveDraftEmd(type);
  }

  // Submit EMD/PBG function when user click on Submit in Attachments TAB>> Create Call API  >> Send for Approval Process
  // Using "FormFlag" we are defining it is PBG OR EMD
  finalSaveSubmitEMD(type) {
    if (type == 'save') {
      this.saveSubmitFinalEMD();
      this.alert.sweetSuccess("Data Saved Successfully");
    }
    if (type == 'submit') {
      if (this.selectedFile) {
        this.alert.sweetError("Please upload a file");
        return
      }
      let date = moment().format();
      this.alert.customConfirmation(`Are you sure you want to submit ${this.formtype} for Approval?`, "You will not be able to make any further changes.").then(success => {
        this.emdData.isSubmittedStatus = "Submitted";
        if (this.formtype == 'EMD') {
          this.emdData.approval_status = "Pending With GL";
        }
        if (this.formtype == 'PBG') {
          let FixedDate = "2021-09-22";
          let oldPBGDate =  new Date(this.emdData.date_created);
          let formattedDate = moment(oldPBGDate).format("YYYY-MM-DD");
         // If the PBG is created before 22 Sept 2021 then old Approval Chain will work for PBG 
          if(FixedDate > formattedDate){
            this.emdData.approval_status = "Pending With GL";
          } else {
            this.emdData.approval_status = "Pending With Finance Controller";
          }
        }
        this.emdData.salesPersonId = this.salesPersonId;
        let found = {
          "action": `Submitted ${this.formtype} for Approval`,
          "Date": date,
          "comments": "NA",
          "fullname": this.user.fullname,
          "user_id": this.user.user_id,
          "approvedBy": this.user_type,
          "rejectedBy": this.user_type,
          "disableFlag": true
        }
        this.emdData.approval_process.push(found);
        this.saveSubmitFinalEMD();
        this.getEmdAttachments();
      }, cancel => {
        return;
      });
    }
  }

  // Save function when user click on Save in Attachments TAB>> Create Call API
  // Using "FormFlag" we are defining it is PBG OR EMD
  saveSubmitFinalEMD() {
    this.loader = true;
    this.EmdService.createEmdFormId(this.emdData).subscribe(resp => {
      this.readData(this.emdNumber);
      this.approvalFlag = false;
      this.completedFlag = false;
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }

  resetAttachmentFile() {
    this.files.forEach(element => {
      element.cellRange = "",
        element.description = ""
    })
    this.myInputVariable.nativeElement.value = "";
    this.selectedFile = null;
  }

  // Action Button for for Sales Head, Regional Head, CFO, Finance Controller and BG Writer Make change or completed button
  actionButton(type) {
    if (type == "APPROVED" || type == "REJECTED") {
      if (this.ac_comment.findIndex(a => a.comment == '') >= 0) {
        this.alert.sweetError("Please enter comment");
        return
      }
    }
    let msg;
    if (type == "APPROVED") {
      msg = "approve"
    }
    if (type == "REJECTED") {
      msg = "reject"
    }
    if (type == "COMPLETED") {
      msg = "complete"
    }
    this.alert.confirm(msg).then(succes => {
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
      this.emdData.approval_process.push(found);
      if (type == 'APPROVED') {
        if (this.approvaluniqueRole == 'RegionalSalesHead') {
          this.emdData.approval_status = "Pending With Sales Head"
        }
        if (this.approvaluniqueRole == 'SALES_HEAD') {
          this.emdData.approval_status = "Pending With Finance Controller"
        }
        if (this.approvaluniqueRole == "FINANCE_CONTROLLER") {
          if (this.emdData.AmountReqdEmd >= 1000000) {
            this.emdData.approval_status = "Pending With CFO"
          } else {
            this.emdData.approval_status = "Pending With BG Writter"
          }
        }
        if (this.approvaluniqueRole == 'CFO') {
          this.emdData.approval_status = "Pending With BG Writter"
        }
        if (this.approvaluniqueRole == 'BG_WRITER') {
          this.emdData.approval_status = "Request Processed"
        }
      }
      if (type == 'REJECTED') {
        if (this.approvaluniqueRole == 'RegionalSalesHead') {
          this.emdData.approval_status = "Draft"
          this.emdData.isSubmittedStatus = 'Draft'
        }
        if (this.approvaluniqueRole == 'SALES_HEAD') {
          this.emdData.approval_status = "Draft"
          this.emdData.isSubmittedStatus = 'Draft'
        }
        if (this.approvaluniqueRole == "FINANCE_CONTROLLER") {
          this.emdData.approval_status = "Draft";
          this.emdData.isSubmittedStatus = 'Draft'
        }
        if (this.approvaluniqueRole == "CFO") {
          this.emdData.approval_status = "Draft";
          this.emdData.isSubmittedStatus = 'Draft'
        }
        if (this.approvaluniqueRole == "BG_WRITER") {
          this.emdData.approval_status = "Draft";
          this.emdData.isSubmittedStatus = 'Draft'
        }
      }
      if (type == 'COMPLETED') {
        if (this.approvaluniqueRole == 'BG_WRITER') {
          this.emdData.approval_status = "Request Processed"
        }
      }
      this.saveSubmitFinalEMD();
      this.approvalComment();
      this.approvalFlag = false;
      this.completedFlag = false;
    }, cancel => {
      return false;
    });
  }

  // Function for Approval Comment Hide show for Sales Head, Regional Head, CFO, Finance Controller and BG Writer
  approvalComment() {
    this.approvalFlag = false;
    this.completedFlag = false;
    this.ac_comment = [{
      "comment": "",
      "disableFlag": false
    }]
    let lastElement = this.emdData.approval_process && this.emdData.approval_process[this.emdData.approval_process.length - 1];
    if (this.formtype == 'EMD') {
      if (lastElement && lastElement.action == `Submitted ${this.formtype} for Approval` && this.approvaluniqueRole === 'RegionalSalesHead') {
        this.approvalFlag = true;
        return
      }
      if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && lastElement.approvedBy == "RegionalSalesHead" && this.approvaluniqueRole === 'SALES_HEAD') {
        this.approvalFlag = true;
        return
      }
      if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && lastElement.approvedBy == "SALES_HEAD" && this.approvaluniqueRole === 'FINANCE_CONTROLLER') {
        this.approvalFlag = true;
        return
      }
      if (this.emdData.AmountReqdEmd >= 1000000) {
        if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && lastElement.approvedBy == "FINANCE_CONTROLLER" && this.approvaluniqueRole === 'CFO') {
          this.approvalFlag = true;
          return
        }
      }
      if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && ((lastElement.approvedBy == "FINANCE_CONTROLLER" && this.emdData.AmountReqdEmd < 1000000) || lastElement.approvedBy == "CFO") && this.approvaluniqueRole === 'BG_WRITER') {
        this.approvalFlag = false;
        this.completedFlag = true;
        return
      }
    }
    if (this.formtype == 'PBG') {
      let FixedDate = "2021-09-22";
      let oldPBGDate =  new Date(this.emdData.date_created);
      let formattedDate = moment(oldPBGDate).format("YYYY-MM-DD");
      // If the PBG is created before 22 Sept 2021 then old Approval Chain will work for PBG 
      if(FixedDate > formattedDate){
        console.log("Approval Chain Old")
        if (lastElement && lastElement.action == `Submitted ${this.formtype} for Approval` && this.approvaluniqueRole === 'RegionalSalesHead') {
          this.approvalFlag = true;
          return
        }
        if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && lastElement.approvedBy == "RegionalSalesHead" && this.approvaluniqueRole === 'SALES_HEAD') {
          this.approvalFlag = true;
          return
        }
        if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && lastElement.approvedBy == "SALES_HEAD" && this.approvaluniqueRole === 'FINANCE_CONTROLLER') {
          this.approvalFlag = true;
          return
        }
        if (this.emdData.AmountReqdEmd >= 1000000) {
          if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && lastElement.approvedBy == "FINANCE_CONTROLLER" && this.approvaluniqueRole === 'CFO') {
            this.approvalFlag = true;
            return
          }
        }
        if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && ((lastElement.approvedBy == "FINANCE_CONTROLLER" && this.emdData.AmountReqdEmd < 1000000) || lastElement.approvedBy == "CFO") && this.approvaluniqueRole === 'BG_WRITER') {
          this.approvalFlag = false;
          this.completedFlag = true;
          return
        }
      } else {
        console.log("Approval Chain New")
        if (lastElement && lastElement.action == `Submitted ${this.formtype} for Approval` && this.approvaluniqueRole === 'FINANCE_CONTROLLER') {
          this.approvalFlag = true;
          return
        }
        if (this.emdData.AmountReqdEmd >= 1000000) {
          if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && lastElement.approvedBy == "FINANCE_CONTROLLER" && this.approvaluniqueRole === 'CFO') {
            this.approvalFlag = true;
            return
          }
        }
        if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && ((lastElement.approvedBy == "FINANCE_CONTROLLER" && this.emdData.AmountReqdEmd < 1000000) || lastElement.approvedBy == "CFO") && this.approvaluniqueRole === 'BG_WRITER') {
          this.approvalFlag = false;
          this.completedFlag = true;
          return
        }
      }
    }
  }

  onFileSelected(event, index) {
    this.selectedFile = <File>event.target.files[0];
  }

  // Uploading Attachment API for sales Manager in Attachment Tab
  onUpload(index) {
    this.loader = true;
    if (this.selectedFile) {
      let data = this.files[index];
      const fd = new FormData();
      fd.append("pdf", this.selectedFile);
      fd.append("bid_id", this.bid_id);
      fd.append("cellRange", data.cellRange)
      fd.append("description", data.description);
      fd.append("doc_version", "0");
      fd.append("revision", "false");
      fd.append("isPublic", "true");
      fd.append("type", this.formtype == 'EMD' ? "EMD_ATTACH" : "PBG_ATTACH");
      this._httpService.upload(fd).subscribe((resp) => {
        this.loader = false;
        this.alert.sweetSuccess("File uploaded successfully");
        this.selectedFile = null;
        this.flag = false;
        this.files.forEach(element => {
          element.cellRange = "",
            element.description = ""
        })
        this.emdData.attachment_data.push(resp['data']);
        this.UploadAttachLength = this.uploadAttachments.length;
        this.uploadAttachments.forEach(element => {
          if (element.description == "") {
            element.description = 'N/A'
          }
          if (element.cellRange == "") {
            element.cellRange = 'Other Documents'
          }
        });
        this.saveSubmitFinalEMD();
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
      this.alert.sweetError("Please choose a file");
    }
  }

  // Reset Attachment Function in Attachment Tab 
  resetAttachment() {
    // console.log(this.myInputVariable.nativeElement.files);
    this.myInputVariable.nativeElement.value = "";
    // console.log(this.myInputVariable.nativeElement.files);
  }

  // Delete Attachment API when Sales Manager delete document in Attachment Tab
  onRemoveUploadFile(index) {
    if (!this.access.writeAccess) {
      this.alert.sweetError("Sorry, You are not authorised to delete")
      return
    }
    if (this.emdData.isSubmittedStatus == 'Submitted' || this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    let obj = {
      "emdRequestNumber": this.emdData.emdRequestNumber,
      "attachment_id": this.emdData.attachment_data[index].attachment_id,
      "status": "INACTIVE",
      "bid_id": this.bid_id,
    }
    this.alert.deleted("").then(success => {
      this.EmdService.deleteEmdAttachment(obj).subscribe(response => {
        this.emdData.attachment_data.splice(index, 1);
        this.UploadAttachLength = this.uploadAttachments.length;
        this.alert.sweetSuccess("Attachment deleted successfully");
      }, error => {
        this.alert.sweetError("Failed to delete attachment");
      });
    }, error => {
      return;
    });
  }

  onRemoveUploadBGWriterFile(index) {
    if (this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    let obj = {
      "emdRequestNumber": this.emdData.emdRequestNumber,
      "attachment_id": this.emdData.attachment_data[index].attachment_id,
      "status": "INACTIVE",
      "bid_id": this.bid_id,
    }
    this.alert.deleted("").then(success => {
      this.EmdService.deleteEmdAttachment(obj).subscribe(response => {
        this.emdData.attachment_data.splice(index, 1);
        this.UploadAttachLength = this.uploadAttachments.length;
        this.alert.sweetSuccess("Attachment deleted successfully");
      }, error => {
        this.alert.sweetError("Failed to delete attachment");
      });
    }, error => {
      return;
    });
  }

  // Function for Hide show Save Submit Add delete Button for all Users
  hideButtonPlusDiv() {
    let flag = false;
    if (this.user_type == 'BID_OWNER' && this.user_subtype == 'Sales') {
      flag = true;
    }
    if ((this.user_type == 'BID_OWNER' && this.user_subtype == 'Sales') && (this.emdData && this.emdData.isSubmittedStatus == 'Submitted')) {
      flag = false;
    }
    return flag;
  }

  hideButtonBGWriter() {
    let flag = false;
    if (this.user_type == 'BG_WRITER' && this.user_subtype == 'All' && (this.emdData && this.emdData.approval_status == 'Pending With BG Writter')) {
      flag = true;
    }
    if ((this.user_type == 'BG_WRITER' && this.user_subtype == 'All') && (this.emdData && this.emdData.approval_status == 'Request Processed')) {
      flag = false;
    }
    return flag;
  }

  // Download Function for Download File in Attachment tab
  onDownload(index, type) {
    // console.log("Hello Tyep", index, type)
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
}
