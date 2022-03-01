import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EmdService } from '../../../services/emd.service';
import { BidService } from '../../../services/bid.service';
import { HttpService } from '../../../services/http.service';
import { TerritoryService } from '../../../services/territories.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import * as moment from 'moment';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-eoi-design',
  templateUrl: './eoi-design.component.html',
  styleUrls: ['./eoi-design.component.css'],
  providers: [EmdService, BidService, HttpService, TerritoryService]
})

export class EoiDesignComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  @ViewChild('myInput') myInputVariable: ElementRef;

  eoidetails: any;
  bidId: any;
  attachment_details = [];
  locations = ['East', 'West', 'North', 'South'];
  orders = ['Services', 'SI', 'Products'];
  payments = ['type1', 'type2'];
  files = [{
    "cellRange": "",
    "description": "",
    "disable": false,
  }];
  eoiId: any;
  bid: any;
  bidStatus: any;
  bidData: any;
  selectedFile: File = null;
  loader = false;
  formSubmitted: boolean;
  flag: any;
  user_subtype;
  user;
  uploadAttachments = [];
  accountManagerName;
  name = [];
  territoryData = [];
  readTerritory = [];
  territoryList = []
  customerLocation;
  approvalChainLength;
  attData;
  UploadAttachLength = 0;
  attachments;
  customerName: any;
  formFilled = false;
  approvalFlag = false;
  completedFlag;
  approvaluniqueRole;
  approvalFullName;
  approvalUserID;
  ac_comment = [{
    "comment": "",
    "disableFlag": false
  }]
  approvalStatusArray = [];
  user_type;
  access;
  salesPersonId;
  estimatedValueData;
  eoiNumber = "";
  selectedEOI: any;
  allEOI = [];
  multipleEOIFlag = false;
  createAddEOIResp: any;
  allEOIData: any;
  biEoiId= '';
  bidVersionStatus: any;
  NoDataMultipleEOIFlag = true;

  constructor(private router: Router, private EmdService: EmdService, private _activeRoute: ActivatedRoute,
    public _territoryService: TerritoryService, public _bidService: BidService, private _httpService: HttpService) {
      this.biEoiId = localStorage.getItem('EOIId');
    this.bidId = _activeRoute.snapshot.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.accessControl();
    this.readAllEOI()
    this.readEoi(this.eoiNumber);
    if(this.biEoiId != "") {
      this.eoiNumber = this.biEoiId; 
      this.readEoi(this.eoiNumber);
    } else {
      this.readEoi(this.eoiNumber);
    } 
    this.getTerritories();
    this.getBidById();
  }
 
  readAllEOI() {
    let obj = {
      "eoiRequestId": "",
      "bid_id": this.bidId,
      "company_id": this.user.company_id,
    } 
    this.EmdService.readMultipleEOI(obj).subscribe(resp => {
      this.formSubmitted = false;
      if (this.user_type == "BID_OWNER" && this.user_subtype == "Sales" && this.access.writeAccess) {
        this.allEOI = resp['data']['read_data'];
      }
      if (!this.access.writeAccess) {
        this.allEOIData = resp['data']['read_data'];
        this.allEOI = []
        this.allEOIData.forEach(result => {
          if (result.isSubmittedStatus == "Submitted" || result.isSubmittedStatus == "Draft") {
            this.allEOI.push(result);
          }
        })
        if(this.allEOI.length == 0){
          this.NoDataMultipleEOIFlag = false;
        }
      }
      if (this.allEOI.length > 0) {
        let lastElement = this.allEOI && this.allEOI[this.allEOI.length - 1];
        this.selectedEOI = lastElement.eoiRequestId;
        this.multipleEOIFlag = true
        // this.readEoi(this.selectedEOI);
        if(this.biEoiId == "" || this.biEoiId == null) {
          this.readEoi(this.selectedEOI);
          } else { 
            this.readEoi(this.eoiNumber);
          }
          localStorage.removeItem("EOIId");        
        }
    })
  }

  readCallAddButton(result) {
    let obj = {
      "eoiRequestId": "",
      "bid_id": this.bidId,
      "company_id": this.user.company_id,
    }
    this.EmdService.readMultipleEOI(obj).subscribe(resp => {
      this.formSubmitted = false;
      if (this.user_type == "BID_OWNER" && this.user_subtype == "Sales" && this.access.writeAccess) {
        this.allEOI = resp['data']['read_data'];
      } else {
        this.allEOI = []
        this.allEOIData = resp['data']['read_data'];
        this.allEOIData.forEach(result => {
          if (result.isSubmittedStatus == "Submitted" || result.isSubmittedStatus == "Draft" ) {
            this.allEOI.push(result);
          }
        })
        if(this.allEOI.length == 0){
          this.multipleEOIFlag = false;
          this.NoDataMultipleEOIFlag = false;
        }
      }
      this.selectedEOI = result
    }, error => {

    })
  }

  ngOnInit() {

  }

  onAddNewEOI() {
    let obj = {
      "eoiRequestId": "",
      "bid_id": this.bidId,
      "company_id": this.bid.company_id,
    }
    this.alert.emdPbgSofAlert("Are you sure you want to create new Tender Fee?", "This cannot be un-done").then(success => {
      this.EmdService.createMultipleEOI(obj).subscribe(resp => {
        this.createAddEOIResp = resp['data'];
        this.formSubmitted = false;
        this.alert.sweetSuccess("New Tender Fee created successfully");
        console.log(this.eoiNumber)
        this.readAllEOI();
        this.readEoi(this.createAddEOIResp.eoiRequestId);
        this.selectDropdown();
      }, error => {
      })
    }, cancel => {
      return;
    });
  }

  //////////////////////////////////////////// EOI DATA ////////////////////////////////////////
  // ACCESS CONTROL (to find whether current user has access right or not)
  accessControl() {
    this._httpService.accessControl({
      "module": "eoi",
      "user_id": this.user.user_id,
      "bid_id": this.bidId,
      "isInApprovalProcess": false
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
    }, error => {
    });
  }

  // PRICEBID DATA (getting the customer location data)
  getTerritories() {
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
      if (territories['code'] === 2000) {
        this.territoryData = territories['data'];
        this.territoryData.forEach(element => {
          if (element.name != 'National') {
            this.territoryList.push(element);
          }
        })
        return
      }
      this.territoryData = [];
    }, error => {
      this.territoryData = [];
    });
  }

  // PRICEBID DATA (getting the automatic data of the customer and salesManager)
  getBidById() {
    this._bidService.getBidById(this.bidId).subscribe(data => {
      this.bid = data['data']['bid'];
      this.customerName = this.bid.account_name;
      this.estimatedValueData = this.bid.estimatedValue;
      this.bidStatus = this.bid.bidFinalStatus ? this.bid.bidFinalStatus : "";
      this.bidVersionStatus = this.bid.revision_status ? this.bid.revision_status : false;
      this.eoidetails.customerName = this.bid.account_id ? this.bid.account_id._id : this.bid.account_name;
      this.territoryData.forEach(i => {
        this.bid.territory_ids.forEach(element => {
          if (i.territory_id == element) {
            this.customerLocation = i.name;                     // customerLocation name
            this.eoidetails.customerLocation = i.territory_id;  // customerLocation ID
          }
        });
      });
      this.bid.participants.forEach(item => {
        if (item.userTypes[0].user_type == 'BID_OWNER' && item.userTypes[0].user_subtype == "Sales") {
          this.accountManagerName = item.fullname;              // Account Manager Name 
          this.eoidetails.accountManager = item.user_id;        // Account Manager ID
        }
      });
    }, error => {
    });
  }
  // READ CALL EOI (Get the data which has posted)
  readEoi(dataa) {
    // this.loader = true;
    let obj = {};
    this.eoiNumber = dataa
    if (dataa == "") {
      obj = {
        "bid_id": this.bidId,
      }
    } else {
      obj = {
        "eoiRequestId": dataa,
        "bid_id": this.bidId,
      }
    }
    this.EmdService.readEoiForm(obj).subscribe(data => {
      if (data['data'] == null) {
        this.firstTimeReadData();
        this.approvalChainLength = 0;
        this.loader = false;
        return;
      }

      this.eoidetails = data['data'];
      // console.log(this.eoiNumber)
      this.eoiId = data['data']['eoiId'];
      this.multipleEOIFlag = true
      // this.eoiId = ""
      this.eoiNumber = this.eoidetails.eoiRequestId
      this.uploadAttachments = data['data']['attachment_data'];
      this.UploadAttachLength = this.uploadAttachments.length;
      this.approvalStatusArray = this.eoidetails.approval_process;
      this.approvalChainLength = this.eoidetails.approval_process.length;
      this.salesPersonId = this.eoidetails.salesPersonId;
      this.uploadAttachments.forEach(element => {
        if (element.description == "") {
          element.description = 'N/A'
        }
        if (element.cellRange == "") {
          element.cellRange = 'Others Document'
        }
      });
      if (this.eoidetails && this.eoidetails.regionalSalesHead) {  // if current user_id matches with the regionalSalesHead assign it to approvaluniqueRole
        this.eoidetails.regionalSalesHead.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id;
            this.approvaluniqueRole = "RegionalSalesHead"
            this.approvalFullName = item.fullname;
          }
        })
      }
      if (this.eoidetails && this.eoidetails.salesHead) { // if current user_id matches with the salesHead assign it to approvaluniqueRole
        this.eoidetails.salesHead.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id
            this.approvaluniqueRole = item.userTypes[0].user_type;
            this.approvalFullName = item.fullname;
          }
        })
      }
      if (this.eoidetails && this.eoidetails.financeController) { // if current user_id matches with the financeController assign it to approvaluniqueRole
        this.eoidetails.financeController.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id
            this.approvaluniqueRole = item.userTypes[0].user_type;
            this.approvalFullName = item.fullname;
          }
        })
      }
      if (this.eoidetails && this.eoidetails.accountsExeTreasury) { // if current user_id matches with the accountsExeTreasury assign it to approvaluniqueRole
        this.eoidetails.accountsExeTreasury.find(item => {
          if (item.user_id == this.user.user_id) {
            this.approvalUserID = item.user_id
            this.approvaluniqueRole = item.userTypes[0].user_type;
            this.approvalFullName = item.fullname;
          }
        })
      }
      this.approvalComment();
      this.readCallAddButton(this.eoiNumber)
      this.getTerritories();
      this.getBidById();
    });
  }

  selectDropdown() {
    var link = document.getElementById('first_tab');
    link.click();
  }

  firstTimeReadData() {
    this.eoidetails = {
      "bid_id": this.bidId,
      "eoiId": "",
      "accountManager": "",
      "accountManagerCode": "",
      "orderType": "",
      "tenderNumber": "",
      "tenderDate": "",
      "eoiAmount": "",
      "eoiInFavourOf": "",
      "modeOfPayment": "",
      "payableAt": "",
      "orderValue": "",
      "lastDateForSubmissionOfEoi": "",
      "remarks": "",
      "isSubmittedStatus": "DraftEOI",
      "attachment_data": [],
      "approval_status": "",
      "approval_process": []
    }
  }

  // ON SAVE OR NEXT OF EOI (posting data)
  onSaveEoi(buttontype) {
    var obj = {
      "bid_id": this.bidId,
      "eoiId": this.eoiId, 
      "eoiRequestId": this.eoidetails.eoiRequestId,
      "accountManager": this.eoidetails.accountManager,
      "accountManagerCode": this.eoidetails.accountManagerCode,
      "customerName": this.eoidetails.customerName,
      "customerLocation": this.eoidetails.customerLocation,
      "orderType": this.eoidetails.orderType,
      "orderValue": this.bid.estimatedValue,
      "tenderNumber": this.eoidetails.tenderNumber,
      "tenderDate": this.eoidetails.tenderDate,
      "eoiAmount": this.eoidetails.eoiAmount,
      "eoiInFavourOf": this.eoidetails.eoiInFavourOf,
      "modeOfPayment": this.eoidetails.modeOfPayment,
      "payableAt": this.eoidetails.payableAt,
      "lastDateForSubmissionOfEoi": this.eoidetails.lastDateForSubmissionOfEoi,
      "remarks": this.eoidetails.remarks,
      "approval_status": "Draft"
    }
    if (buttontype == 'next') {
      this.formFilled = true;
      this.formSubmitted = true;
      if (this.eoidetails.orderType == "" || this.eoidetails.orderType == null ||
        this.eoidetails.tenderNumber == "" || this.eoidetails.tenderNumber == null ||
        this.eoidetails.tenderDate == "" || this.eoidetails.tenderDate == null ||
        this.eoidetails.eoiAmount == "" || this.eoidetails.eoiAmount == null ||
        this.eoidetails.eoiInFavourOf == "" || this.eoidetails.eoiInFavourOf == null ||
        this.eoidetails.payableAt == "" || this.eoidetails.payableAt == null ||
        this.eoidetails.lastDateForSubmissionOfEoi == "" || this.eoidetails.lastDateForSubmissionOfEoi == null ||
        this.eoidetails.modeOfPayment == "" || this.eoidetails.modeOfPayment == null) {
        this.alert.sweetError("Please enter mandatory fields");
        this.formFilled = false;
        return;
      }
    }
    if (this.eoiId == null || this.eoiId == undefined) {  // POST data - when saving or clicking next button for the 1st time 
      if (buttontype == 'next') {
        obj['isSubmittedStatus'] = "EOISubmitted"
      }
      if (buttontype == 'save') {
        obj['isSubmittedStatus'] = "DraftEOI"
      }
      this.EmdService.createEoiForm(obj).subscribe(data => {
        console.log(this.eoiNumber)
        this.readEoi(this.eoiNumber);
        if (buttontype == 'save') {
          this.formSubmitted = false;
          this.alert.sweetSuccess("Data Saved Successfully");
        } else {
          this.formSubmitted = false;
          this.alert.sweetSuccess("Tender Fee completed Successfully");
          var link = document.getElementById('second_tab_eoi');
          link.click();
        }
      });
    } if (this.eoiId != null || this.eoiId != undefined) { // UPDATE data - when saving or clicking next button for other than 1st time
      if (buttontype == 'next') {
        obj['isSubmittedStatus'] = "EOISubmitted"
      }
      if (buttontype == 'save') {
        this.formSubmitted = false;
        obj['isSubmittedStatus'] = "DraftEOI"
      }
      this.EmdService.createEoiForm(obj).subscribe(data => {
        this.eoiNumber = data['data']['eoiRequestId']
        console.log(this.eoiNumber)
        this.readEoi(this.eoiNumber);
        if (buttontype == 'save') {
          this.alert.sweetSuccess("Data Saved Successfully");
        } else {
          this.formSubmitted = false;
          this.alert.sweetSuccess("Tender Fee completed Successfully");
          var link = document.getElementById('second_tab_eoi');
          link.click();
        }
      });
    }
  }
  // ON RESET EOI
  resetFormEoi() {
    this.formSubmitted = false;
    this.eoidetails = {
      "bid_id": this.bidId,
      "eoiId": this.eoiId, 
      "eoiRequestId": this.eoidetails.eoiRequestId,
      "accountManagerCode": "",
      "orderType": "",
      "tenderNumber": "",
      "tenderDate": "",
      "eoiAmount": "",
      "eoiInFavourOf": "",
      "modeOfPayment": "",
      "payableAt": "",
      "lastDateForSubmissionOfEoi": "",
      "remarks": "",
    }
    this.saveSubmitEOI('reset')  
  }
  // On Submit button of EOI (UPDATING data on submit button in attachments tab)
  finalSubmitEOI(type) {
    if (type == 'submit') {
      if (this.selectedFile) {
        this.alert.sweetError("Please upload a file");
        return;
      }
      this.alert.customConfirmation("Are you sure you want to submit Tender Fee for processing?",
        "You will not be able to make any further changes.").then(success => {
          this.formFilled = false;
          this.eoidetails.approval_status = "Pending With GL";
          this.eoidetails.isSubmittedStatus = "Submitted";
          this.eoidetails.salesPersonId = this.salesPersonId;
          let date = moment().format();
          let obj = {
            "action": `Submitted Tender Fee`,
            "Date": date,
            "comments": "NA",
            "fullname": this.user.fullname,
            "user_id": this.user.user_id,
            "approvedBy": this.user_type,
            "rejectedBy": this.user_type,
            "disableFlag": true
          }
          this.eoidetails.approval_process.push(obj)
          this.saveSubmitEOI('submit');
          // this.getEoiAttachments();
        })
    }
  }
  // On Save or Upload of EOI Attachments with appropriate alert messages on each option
  saveSubmitEOI(type) {
    this.eoidetails.eoiId = this.eoiId;
    this.EmdService.createEoiForm(this.eoidetails).subscribe(data => {
      if (type == 'upload') {
        this.alert.sweetSuccess("Uploaded Successfully");
      } else if (type == 'save') {
        this.alert.sweetSuccess("Data Saved Successfully");
      } else if (type == 'approve') {
        this.alert.sweetSuccess("Approved Successfully");
      } else if (type == 'reject') {
        this.alert.sweetSuccess("Rejection Completed");
      } else if (type == 'complete') {
        this.alert.sweetSuccess("Process Completed Successfully");
      }
      console.log(this.eoiNumber)
      this.readEoi(this.eoiNumber);
      this.approvalFlag = false;
    });
  }
  ///////////////////////////////////////////// ATTACHMENTS /////////////////////////////////////////////
  // choose file event in eoi attachment
  onFileSelected(event, index) {
    this.selectedFile = <File>event.target.files[0];
  }
  // reset the attachment data
  resetAttachmentFile() {
    this.files.forEach(element => {
      element.cellRange = "",
        element.description = ""
    })
    this.selectedFile = null;
    this.myInputVariable.nativeElement.value = "";
  }
  // upload file
  onUpload(index) {
    this.loader = true;
    if (this.selectedFile) {
      let data = this.files[index];
      const fd = new FormData();
      fd.append("pdf", this.selectedFile);
      fd.append("bid_id", this.bidId);
      fd.append("cellRange", data.cellRange);
      fd.append("description", data.description);
      fd.append("doc_version", "0");
      fd.append("revision", "false");
      fd.append("isPublic", "true"); // data.isPublic ? "false" : "true"
      fd.append("type", "EOI_ATTACH");
      this._httpService.upload(fd).subscribe((resp) => {
        this.loader = false;
        this.alert.sweetSuccess("File uploaded successfully");
        this.selectedFile = null;
        this.flag = false;
        this.files.forEach(element => {
          element.cellRange = "",
            element.description = ""
        })
        this.eoidetails.attachment_data.push(resp['data']);
        this.UploadAttachLength = this.uploadAttachments.length;
        this.uploadAttachments.forEach(element => {
          if (element.description == "") {
            element.description = 'N/A'
          }
          if (element.cellRange == "") {
            element.cellRange = 'Others Document'
          }
        });
        this.saveSubmitEOI('upload');
        this.resetAttachmentFile();
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

  onDownload(index) {
    this.attData = this.uploadAttachments[index];
    this._bidService.downloadFile({ attachment_id: this.attData.attachment_id, responseType: 'blob' }).subscribe(data => {
      const blob = new Blob([data], { type: data.type }),
        url = window.URL.createObjectURL(blob);
      saveAs(url, this.attData.original_name ? this.attData.original_name : this.attData.attachment_n);
    });

  }
  // Delete attachment
  onRemoveUploadFile(index) {
    if (!this.access.writeAccess) {
      this.alert.sweetError("Sorry, You are not authorised to delete")
      return
    }
    if (this.eoidetails.isSubmittedStatus == 'Submitted' || this.bidStatus == 'DROPPED' || this.bidVersionStatus) {
      return
    }
    let obj = {
      "eoiRequestId": this.eoidetails.eoiRequestId,
      "attachment_id": this.eoidetails.attachment_data[index].attachment_id,
      "status": "INACTIVE",
      "bid_id": this.bidId,
    }
    this.alert.deleted("").then(success => {
      this.EmdService.deleteEoiAttachment(obj).subscribe(response => {
        this.eoidetails.attachment_data.splice(index, 1);
        this.UploadAttachLength = this.uploadAttachments.length;
        this.alert.sweetSuccess("Attachment deleted successfully");
      }, error => {
        this.alert.sweetError("Failed to delete attachment");
      });
    }, error => {
      return;
    });
  }
  // To hide the button section for roles other than salesManager
  hideButtonPlusDiv() {
    let flag = false;
    if (this.user_type == 'BID_OWNER' && this.user_subtype == 'Sales') {
      flag = true;
    }
    if ((this.user_type == 'BID_OWNER' && this.user_subtype == 'Sales') && (this.eoidetails && this.eoidetails.isSubmittedStatus == 'Submitted')) {
      flag = false;
    }
    return flag;
  }
  // On approve or reject button of user for roles other than salesManager
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
      this.eoidetails.approval_process.push(found);
      if (type == 'APPROVED') {
        if (this.approvaluniqueRole == 'RegionalSalesHead') {
          this.eoidetails.approval_status = "Pending With Sales Head"
        }
        if (this.approvaluniqueRole == 'SALES_HEAD') {
          this.eoidetails.approval_status = "Pending With Finance Controller"
        }
        if (this.approvaluniqueRole == "FINANCE_CONTROLLER") {
          this.eoidetails.approval_status = "Pending With Accounts Exe-Treasury"
        }
        if (this.approvaluniqueRole == "ACCOUNTS_EXE_TREASURY") {
          this.eoidetails.approval_status = "Request Processed"
        }
        this.saveSubmitEOI('approve');
      }
      if (type == 'REJECTED') {
        if (this.approvaluniqueRole == 'RegionalSalesHead' || this.approvaluniqueRole == 'SALES_HEAD' ||
          this.approvaluniqueRole == "FINANCE_CONTROLLER") {
          this.eoidetails.approval_status = "Draft"
          this.eoidetails.isSubmittedStatus = 'Draft'
        }
        this.saveSubmitEOI('reject');
      }
      if (type == 'COMPLETED') {
        if (this.approvaluniqueRole == 'ACCOUNTS_EXE_TREASURY') {
          this.eoidetails.approval_status = "Request Processed"
        }
        this.saveSubmitEOI('complete');
      }
      this.approvalComment();
      this.approvalFlag = false;
      this.completedFlag = false;
    }, cancel => {
      return false;
    });
  }

  approvalComment() {
    this.approvalFlag = false;
    this.completedFlag = false;
    this.ac_comment = [{
      "comment": "",
      "disableFlag": false
    }]
    let lastElement = this.eoidetails.approval_process && this.eoidetails.approval_process[this.eoidetails.approval_process.length - 1];
    if (lastElement && lastElement.action == 'Submitted Tender Fee' && this.approvaluniqueRole === 'RegionalSalesHead') {
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
    if (lastElement && lastElement.action == 'APPROVED' && lastElement.user_id != this.user.user_id && lastElement.approvedBy == "FINANCE_CONTROLLER" && this.approvaluniqueRole === 'ACCOUNTS_EXE_TREASURY') {
      this.approvalFlag = false;
      this.completedFlag = true;
      return
    }
  }
}
