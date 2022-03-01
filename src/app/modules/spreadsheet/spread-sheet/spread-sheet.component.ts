import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { each, find, isEmpty, uniqBy, filter } from "lodash";
import { Compiler } from '@angular/core';
import { Router } from "@angular/router";
import { BidService } from '../../../services/bid.service';
import { AppModuleService } from '../../../services/module.service';
import { UsersService } from '../../../services/users.service';
import { PocDashboardService } from '../../../services/poc.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { SharedService } from '../../../services/shared.service';
import { SolutionCellsComponent } from '../../../components/solution-cells/solution-cells.component';
import { solutionCellsDownlaoadComponent } from '../../../components/solution-cells-download/solution-cells-downlaod.component';
import { HttpService } from '../../../services/http.service';
// import _ = require('lodash');

declare var $: any;
var rootScope;


@Component({
  selector: 'app-spread-sheet',
  templateUrl: './spread-sheet.component.html',
  styleUrls: ['./spread-sheet.component.css'],
  providers: [BidService, AppModuleService, UsersService, PocDashboardService]
})

export class SpreadSheetsComponent implements OnInit {

  @ViewChild(AlertComponent) _alert: AlertComponent;

  //varibles
  rootScope;
  user;
  userType;
  bidInfo;
  reviewData;
  reviewFlag = true;
  userID;
  productType;
  bid_id;
  sheetId;
  spreadsheet;
  importSettings = {};
  exportSettings = {};
  poc;
  counter = 0;
  activeSheet;
  sheetActive = true;
  lockSheetFlag = false;
  participants = [];
  assignmentData = [{ 'user_id': undefined, sheetIndex: undefined, sourceSheetName: undefined, isConfirm: undefined, isWorkDone: undefined, userType: undefined, isShow: true }];
  excelAttachment = {};
  excelAttachmentData;
  attachment_data = [];
  attachment = false;

  obj;
  isSheetInfoUndefined = false;
  runLoadComplete = false;
  showSpreadSheet = false;
  storeEvent;
  errorMessage;
  bid_owner;
  mySubscription;
  hiddenSheets = [];
  loader = false;
  //Constructor
  constructor(
    private _compiler: Compiler,
    private router: Router,
    private _sharedService: SharedService,
    public _bidService: BidService,
    public _shared: SharedService,
    public _pocService: PocDashboardService,
    public dialog: MatDialog,

    private httpService: HttpService
  ) {
    // console.log("level 2");
    this._compiler.clearCache();
    rootScope = this;

    rootScope.router = router;
    rootScope.bidInfo = JSON.parse(localStorage.getItem('bidData'));
    rootScope.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    rootScope.bid_id = rootScope.bidInfo.bid_id;

    let accessControl = new Promise((resolve, reject) => {
      this.httpService.accessControl({
        "module": "pricing",
        "user_id": rootScope.user.user_id,
        bid_id: rootScope.bid_id
      }).subscribe(data => {
        resolve(data);
      }, error => {
        reject(error);
      })
    });

    Promise.all([accessControl]).then(finalData => {
      rootScope.user = finalData[0]['data'].participants[0];
      // this.user_type = this.access.participants[0].userTypes[0].user_type;
      // this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
      //Get bid info from backend
      rootScope._bidService.getBidById(rootScope.bid_id).subscribe(data => {
        rootScope.bidInfo = data['data']['bid'];
        each(rootScope.bidInfo.sheetIds, function (n) {
          if (n.userType == "BID_OWNER") {
            rootScope.masterSheetId = n.sheetId;
            return false;
          }
        })

        var userSheetData = find(rootScope.bidInfo.sheetIds, function (n) {
          return n.user_id == rootScope.user.user_id;
        });

        this.loader = true;

        if (isEmpty(userSheetData)) {
          /**
           * This logic for contributors, initially when bid created at that moment
           * contributors won't have access to any sheet, therefore we are passing the
           * approvals id and sheetId so that contributor can view sheet but won't be
           * able to edit that sheet. This logic will also work even if logged in user is does
           * not belong to current bid.
           */
          var approvalData = find(rootScope.bidInfo.sheetIds, function (n) {
            return n.userType == "APPROVER";
          });
          if (!isEmpty(approvalData)) {
            rootScope.sheetId = approvalData.sheetId;
            rootScope.getAssignmentData(rootScope.sheetId, approvalData.user_id, rootScope.bid_id);
            rootScope.showSpreadSheet = true;
            rootScope.loadPrerequisites();
          } else {
            // alert("Handle approval-contributor case");
            this.errorMessage = "Something went wrong!"
            this._alert.sweetError("Something went wrong");
          }
        } else if (!isEmpty(userSheetData)) {
          rootScope.sheetId = userSheetData.sheetId;
          rootScope.getAssignmentData(rootScope.sheetId, rootScope.user.user_id, rootScope.bid_id);
          rootScope.showSpreadSheet = true;
          rootScope.loadPrerequisites();
        }
        this.loader = false;


        this._shared.hideFooter.emit({ hide: true, bid: this.bidInfo });
      });
    })



  };

  ngOnInit() {

    //primary function call after contrustor loaded
    this.primaryFunctionsCall();
    var url = rootScope.router.url;
    this.mySubscription = this._shared.newData.subscribe(a => {
      if (a.data == "review" || a.data == "rfi") {
        rootScope.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
          rootScope.router.navigate([url]));
      }
    });
  };

  ngOnDestroy() {
    this._shared.hideFooter.emit({ hide: false, bid: this.bidInfo });
    this.mySubscription.unsubscribe();
  }

  bid;
  getBidById() {
    return new Promise((resolve, reject) => {
      this._bidService.getBidById(this.bid_id).subscribe(data => {
        this.bid = data['data']['bid'];
        if (this.bid.currentParticipants) {
          this.currentParticipants = this.bid.currentParticipants;
        }
        resolve(true);
      })
    })
  }

  primaryFunctionsCall = function () {

    if (!isEmpty(this.bidInfo)) {
      this.bid_id = this.bidInfo.bid_id;

      if (this.bidInfo.participants) {
        this.participants = this.bidInfo.participants.filter(a => {
          return a.userTypes[0].user_type == 'CONTRIBUTOR'
        });
        this.participants = uniqBy(this.participants, "user_id");
      }

      // this._header.setBidData(this.bidInfo);

    }

    if (!isEmpty(this.user)) {
      this.userType = this.user.userTypes[0].user_type;
      this.userID = this.user.user_id;
      rootScope.userID = this.user.user_id;
      // this.productType = this.user.product_type;
    }
    // rootScope.loadPrerequisites();
  };



  //function to load spreadsheet prerequisites
  loadPrerequisites = function () {
    //Import and export options
    this.importSettings = {
      'importMapper': "https://dotnet2.pricebid.co/Home/Import",
      // 'importMapper': "https://9cfbac1f.ngrok.io/Home/Import",
      'importOnLoad': "true",
      'importUrl': "https://dotnet2.pricebid.co/Home/OpenXLFileInSpreadsheet/" + this.sheetId
      // "importUrl": "https://09894323.ngrok.io/Home/OpenXLFileInSpreadsheet/" + this.sheetId
    }

    this.exportSettings = {
      enableFormulaCalculation: true,
      'excelUrl': "https://js.syncfusion.com/demos/ejservices/api/Spreadsheet/ExcelExport",
      'csvUrl': "https://js.syncfusion.com/demos/ejservices/api/Spreadsheet/CsvExport",
      'pdfUrl': "https://js.syncfusion.com/demos/ejservices/api/Spreadsheet/PdfExport"
    }
  };

  //While loading the spreadsheet
  load = function (event) {
    // console.log("load", event);
    //find out if there is any space in between to words
    // if (this.userType == "CONTRIBUTOR" || this.userType == "REVIEWER" || rootScope.lockSheetFlag == true)
    event.lockWorkbookCells = true;
    // this.sheetInfo = event.model.sheets;
    if (this.userType != 'BID_OWNER') {
      $('#spreadsheet_AddSheet').attr('style', 'display: none');
      $("#spreadsheet").data("ejSpreadsheet").XLRibbon.hideMenu()
    }

  };


  //call loadcomplete function after excel gets loaded
  loadComplete = function (event) {

    rootScope.storeEvent = event;
    if (rootScope.runLoadComplete == true && event) {
      this.sheetInfo = event.model.sheets;
      this.spreadsheet = ej.Spreadsheet;
      this.excelObj = $("#spreadsheet").data("ejSpreadsheet");
      // console.log("*************** ready for setWorkbookForUser **********", this.excelObj);
      // console.log("rootScope.sheetInfo######################", rootScope.sheetInfo);
      rootScope.activeSheet = this.excelObj.getActiveSheetIndex();
      // if (rootScope.isSheetInfoUndefined == true) {
      //   rootScope.setWorkbookForUser();
      // }
      rootScope.setWorkbookForUser();
      if (this.userType == 'BID_OWNER' && this.counter == 0) {
        this.setWorkbookForBidOwner();
      }
      // console.log(this.counter);
      if (this.counter == 0) {
        this.addTabsInRibbon();
        this.counter++;
      }

      this.getAllSheetNames();
      rootScope.excelObj.XLFreeze.unfreezePanes();
    }


  };

  //call whenever sheet changes or new sheet added
  // pagerClick=function(event){
  //   this.activeSheet = event.activeSheet;
  // };


  actionComplete = function (event) {
    // console.log("*************** event ***********", event);
    // if (!isEmpty(rootScope.assignmentData)) {
    //   var hideMenu = false;

    //   if (rootScope.bidInfo && rootScope.bidInfo.revision_status == true && rootScope.bidInfo.parent == false) {
    //     each(rootScope.assignmentData, function (n) {
    //       if (n.userType == "CONTRIBUTOR" && n.isConfirm == true) {
    //         hideMenu = true;
    //       }
    //     });
    //   } else {
    //     each(rootScope.assignmentData, function (n) {
    //       if (n.userType == "CONTRIBUTOR") {
    //         hideMenu = true;
    //       }
    //     });
    //   }

    //   if (hideMenu) {
    //     $('li#DeleteSheet.e-list').attr('style', 'display: none !important');
    //     $('li#RenameSheet.e-list').attr('style', 'display: none !important');
    //     $('li#MoveorCopy.e-list').attr('style', 'display: none !important');
    //     $('li#InsertSheet.e-list').attr('style', 'display: none !important');
    //     $('li#HideSheet.e-list').attr('style', 'display: none !important');
    //     $('li#UnhideSheet.e-list').attr('style', 'display: none !important');
    //   }
    // }
    $('li#ProtectSheet.e-list').attr('style', 'display: none !important');
    if (event.reqType == "gotoSheet" && event.type == "actionComplete") {
      this.activeSheet = event.gotoSheetIndex;
      rootScope.openAssignModal();
      if (rootScope.sheetInfo[this.activeSheet].isSheetProtected == true) {
        $('li#DeleteSheet.e-list').attr('style', 'display: none !important');
        $('li#RenameSheet.e-list').attr('style', 'display: none !important');
        $('li#MoveorCopy.e-list').attr('style', 'display: none !important');
        $('li#InsertSheet.e-list').attr('style', 'display: none !important');
        $('li#HideSheet.e-list').attr('style', 'display: none !important');
        $('li#UnhideSheet.e-list').attr('style', 'display: none !important');
        rootScope.disableCustomRibbonMenu(true);
      } else if (rootScope.sheetInfo[this.activeSheet].isSheetProtected == false) {
        $('li#DeleteSheet.e-list').attr('style', 'display: block !important');
        $('li#RenameSheet.e-list').attr('style', 'display: block !important');
        $('li#MoveorCopy.e-list').attr('style', 'display: block !important');
        $('li#InsertSheet.e-list').attr('style', 'display: block !important');
        $('li#HideSheet.e-list').attr('style', 'display: block !important');
        $('li#UnhideSheet.e-list').attr('style', 'display: block !important');
        rootScope.disableCustomRibbonMenu(false);
        // rootScope.lockSheetAfterConfirm();
      }
    }
    if (event.isNewSheet == true || event.reqType == "remove-sheet" || event.reqType == "renameSheet" || event.reqType == "moveSheet") {

      if (event.reqType == "renameSheet") {
        rootScope.renameSheet();
      }

      if (event.reqType == "remove-sheet") {
        rootScope.removeSheet(event.sheetIndex);
      }

      if (event.reqType == "gotoSheet" && event.isNewSheet == true && event.action == undefined) {
        rootScope.addSheet(event.model.sheets);
      }

      if (event.reqType == "moveSheet") {
        // console.log("event.isCopy", event.isCopy);
        if (event.isCopy == true) {
          rootScope.copyAndMoveSheet(event.fromSheetIndex, event.toSheetIndex, event.model.sheets)
        } else if (event.isCopy == false) {
          // console.log("event.isCopy----------------1");
          rootScope.moveSheet(event.fromSheetIndex, event.toSheetIndex);
        }
      }

      rootScope.sheetNamesArray = [];
      rootScope.getAllSheetNames();
    }

  };

  //Open assignment modal and only bid ower will have this right
  openAssignModal() {
    $("#assign a").click(() => {
      $('#myModal').modal('show');
    });
  };

  //In this required changes will be made in workbook as per bid owners rights
  setWorkbookForBidOwner = function () {
    // this.spreadsheet = ej.Spreadsheet;
    this.getAllSheetNames();
    this.excelObj.XLCMenu.addItem(this.spreadsheet.ContextMenu.Cell, [
      { "text": "Assign", "id": "assign", "onclick": rootScope.openAssignModal(), "spriteCssClass": "e-icon assign e-ss-copy" }
    ], 'insertbefore', 2);
    rootScope.openAssignModal();
  };


  // this.renderer.listen(addOns, 'click', (event) => {
  //   this.addTab(event);
  // })

  // add custom tabs in ribbon
  addTabsInRibbon = function () {

    var tabGroup = [{
      alignType: ej.Ribbon.AlignType.Rows, text: "Custom Tab Group", content:
        [{
          groups: [{
            id: "save", text: "SAVE", toolTip: "Save",
            buttonSettings: {
              contentType: ej.ContentType.TextAndImage,
              imagePosition: ej.ImagePosition.ImageTop,
              prefixIcon: "e-icon e-save",
              click: function (args) {
                rootScope.saveOrConfirmExcel('saveAsDraft');
              }
            }
          }],
          defaults: { type: ej.Ribbon.Type.Button, width: 60, height: 70 }
        }]
    }];
    this.excelObj.XLRibbon.addTab("SAVE", tabGroup, 2);

    if (this.user && rootScope.userType == 'CONTRIBUTOR') {
      var tabGroup = [{
        alignType: ej.Ribbon.AlignType.Rows, text: "CONFIRM", content:
          [{
            groups: [{
              id: "CONFIRM", text: "CONFIRM", toolTip: "CONFIRM",
              buttonSettings: {
                contentType: ej.ContentType.TextAndImage,
                imagePosition: ej.ImagePosition.ImageTop,
                prefixIcon: "e-icon e-save",
                click: function (args) {
                  // rootScope.submitFile();
                  rootScope.confirmSubmit();
                }
              }
            }],
            defaults: { type: ej.Ribbon.Type.Button, width: 60, height: 70 }
          }]
      }];
      this.excelObj.XLRibbon.addTab("CONFIRM", tabGroup, 3);
    }

    var grabGroup = [{
      alignType: ej.Ribbon.AlignType.Rows, text: "Custom Tab Group", content:
        [{
          groups: [{
            id: "upload", text: "Upload", toolTip: "Upload File",
            buttonSettings: {
              contentType: ej.ContentType.TextAndImage,
              imagePosition: ej.ImagePosition.ImageTop,
              prefixIcon: "e-icon e-upload",
              click: function (args) {
                rootScope.openPricingDialog();
              }
            }
          }, {
            id: "download", text: "Download", toolTip: "Download",
            buttonSettings: {
              contentType: ej.ContentType.TextAndImage,
              imagePosition: ej.ImagePosition.ImageTop,
              prefixIcon: "e-icon e-download",
              click: function (args) {
                rootScope.openPricingDownload();
              }
            }
          }],
          defaults: { type: ej.Ribbon.Type.Button, width: 60, height: 70 }
        }]
    }];
    this.excelObj.XLRibbon.addTab("ATTACHMENTS", grabGroup, 8);

    if (rootScope.userType == 'BID_OWNER') {
      var grabGroup = [{
        alignType: ej.Ribbon.AlignType.Rows, text: "Custom Tab Group", content:
          [{
            groups: [{
              id: "submitReview", text: "Submit for Review", toolTip: "Submit for Review",
              buttonSettings: {
                contentType: ej.ContentType.TextAndImage,
                imagePosition: ej.ImagePosition.ImageTop,
                // prefixIcon: "e-icon e-upload",
                prefixIcon: "e-icon fa fa-dollar",
                click: function (args) {
                  rootScope.submitForReview();
                }
              }
            }],
            defaults: { type: ej.Ribbon.Type.Button, width: 60, height: 70 }
          }]
      }];
      this.excelObj.XLRibbon.addTab("Submit for Review", grabGroup, 8);
    }

    var ribbonGrp = {
      text: "Sync", alignType: ej.Ribbon.AlignType.Rows, content: [{
        groups: [{
          id: "sync", text: "Sync", buttonSettings: {
            contentType: ej.ContentType.TextAndImage,
            imagePosition: ej.ImagePosition.ImageTop,
            prefixIcon: "e-icon e-reload",
            click: function (args) {
              rootScope.sync();
            }
          }
        }], defaults: { type: ej.Ribbon.Type.Button, width: 60, height: 70 }
      }]
    };
    this.excelObj.XLRibbon.addTabGroup(1, ribbonGrp, 7);

    if (this.userType == 'BID_OWNER') {
      this.excelObj.XLRibbon.removeTab(6, true)
    } else if (this.userType == 'CONTRIBUTOR') {
      this.excelObj.XLRibbon.removeTab(7, true)
    } else {
      this.excelObj.XLRibbon.removeTab(6, true)
    }

    if (rootScope.lockSheetFlag == true) {
      rootScope.disableCustomRibbonMenu(true);
    } else {
      if (rootScope.sheetInfo[this.activeSheet].isSheetProtected == true) {
        rootScope.disableCustomRibbonMenu(true);
      } else if (rootScope.sheetInfo[this.activeSheet].isSheetProtected == false) {
        rootScope.disableCustomRibbonMenu(false);
        // rootScope.lockSheetAfterConfirm();
      }
    }

  };

  // Approval section to check flag
  process = [];


  // ////////// pricing attachment seciton /////////

  // to upload file

  //  open uplaod section
  openPricingDialog(index, temp): void {
    // let allowIndex = this.currentAssignedUser.findIndex(a => a.sourceSheetId == this.activeSheet);
    // if (allowIndex == -1 && this.userType == "CONTRIBUTOR") {
    //   this._alert.sweetError("You are not allowed to upload this attachment for this sheet!");
    //   return;
    // }

    this.excelAttachment['sheet_id'] = rootScope.sheetId;
    this.excelAttachment['sheet_index'] = rootScope.activeSheet;
    this.excelAttachment['bid_id'] = rootScope.bid_id;
    this.getExcelAttachment().then(a => {
      if (this.excelAttachmentData) {
        this.attachment_data = this.excelAttachmentData['attachment_data'] ? this.excelAttachmentData['attachment_data'] : [];
      }

      const dialogRef = this.dialog.open(SolutionCellsComponent, {
        height: '300px',
        width: '850px',
        data: this.versionAttachData ? this.versionAttachData : "solution"
      });

      dialogRef.afterClosed().subscribe(result => {
        this.versionAttachData = undefined;
        if (!result || result.length == 0) {
          return
        }
        for (var i = 0; i < result.length; i++) {
          let obj = {
            "attachment_id": "",
            "attachment_n": "",
            "attachment_path": "",
            "cellRange": "",
            "description": "",
            "type": "BID_DEV_TECHSOL",
            "doc_version": result[i].doc_version,
            "user_id": result[i].user_id,
            "revision": result[i].revision ? result[i].revision : false,
            "flag": result[i].flag,
            "isPublic": result[i].isPublic,
            "level": result[i].level
          }
          obj.attachment_id = result[i].uuid;
          obj.attachment_n = result[i].original_name;
          obj.attachment_path = result[i].filename;
          obj.description = result[i].description;
          obj.cellRange = result[i].cellRange;
          this.attachment_data.push(obj);
        }
        this.excelAttachment['attachment_data'] = this.attachment_data;
        if (this.attachment_data.length > 0) {
          this.attachment ? this.updateExcelAttachment() : this.createExcelAttachment(this.excelAttachment);
        }
        this.attachment_data = [];

      });
    })
  }


  // To Download attachments

  versionAttachData;
  downloadIndex;
  downloadTemp;
  openPricingDownload(index, temp) {
    // let allowIndex = this.currentAssignedUser.findIndex(a => a.sourceSheetId == this.activeSheet);
    // if (allowIndex == -1 && this.userType == "CONTRIBUTOR") {
    //   this._alert.sweetError("You are not allowed to view this sheet attachment!");
    //   return;
    // }
    this.excelAttachment['sheet_id'] = this.sheetId;
    this.excelAttachment['sheet_index'] = this.activeSheet;
    this.excelAttachment['bid_id'] = this.bid_id;
    this.downloadIndex = index;
    this.downloadTemp = temp;
    // this.excelAttachment['user'] = rootScope.currentAssignedUser;
    this.getExcelAttachment().then(a => {
      if (this.excelAttachmentData.length == 0) {
        this._alert.sweetNoAttachments();
        return false;
      } else {
        const dialogRef = this.dialog.open(solutionCellsDownlaoadComponent, {
          height: '323px',
          width: '570px',
          data: this.excelAttachmentData ? this.excelAttachmentData : [],

        });
        dialogRef.afterClosed().subscribe(result => {
          this.versionAttachData = result;
          if (result) {
            this.openPricingDialog(this.downloadIndex, this.downloadTemp);
          }
        });
      }
    });
  }

  // Get upload section
  getExcelAttachment() {

    this.excelAttachment['sheet_id'] = this.sheetId;
    this.excelAttachment['sheet_index'] = this.activeSheet;
    this.excelAttachment['bid_id'] = this.bid_id;
    return new Promise((resolve, reject) => {

      this._bidService.getExcelAttachment(this.excelAttachment).subscribe(a => {
        if (a && a['data'] && a['data'].length > 0) {
          if (a['data'][0]['attachment_data']) {
            this.attachment = true;
            resolve(this.excelAttachmentData = a['data'][0]);
          } else {
            this.attachment = false;

            resolve(this.excelAttachmentData = []);
          }
        } else {
          this.attachment = false;
          resolve(this.excelAttachmentData = []);
        }
      });
    })
  }

  createExcelAttachment(excelAttachment) {
    this._bidService.saveExcelAttachment(excelAttachment).subscribe(a => {
      this.getExcelAttachment();
    })
  }


  updateExcelAttachment() {
    this._bidService.updateExcelAttachment(this.excelAttachment).subscribe(a => {
      this.getExcelAttachment();
    })
  }



  currentAssignedUser = [];

  sendNotification() {
    let index = this.currentParticipants.findIndex(a => a.userId == this.user.user_id);
    if (index != -1) {

    }
  }

  // ================= save excel file logic ==============//

  saveOrConfirmExcel(action) {
    this.loader = true;
    var dotNetUrl;
    each(rootScope.sheetInfo, function (n, i) {
      if (!isEmpty(n))
        rootScope.lockOrUnlockSheet(i, false);
    });
    rootScope.excelObj = $("#spreadsheet").data("ejSpreadsheet");
    var exportProps = rootScope.excelObj.XLExport.getExportProps();
    // var assignedSheetNames = "3";
    var reqObj = {
      userSheetId: rootScope.sheetId + '.xlsx',
      sheetModel: exportProps.model,
      sheetData: exportProps.data,
      sheetIndex: undefined,
      masterSheetId: undefined,
      assignedSheetNames: undefined,
      action: action,
      userType: rootScope.userType,
      allSheetName: undefined
    };

    if (rootScope.masterSheetId) {
      reqObj.masterSheetId = rootScope.masterSheetId + '.xlsx';
    }

    if (rootScope.userType == "CONTRIBUTOR") {
      reqObj.sheetIndex = parseInt(rootScope.activeSheet);
      var assignedSheetNames = undefined;
      each(rootScope.assignmentData, function (n) {
        if (assignedSheetNames == undefined) {
          assignedSheetNames = n.sourceSheetName
        } else {
          assignedSheetNames = assignedSheetNames + "," + n.sourceSheetName
        }
      });
      reqObj.assignedSheetNames = (assignedSheetNames).toString();
    }

    // console.log("just above user typ bidonwer ------>", rootScope.userType);
    // if (rootScope.userType == "BID_OWNER") {
    if (rootScope.userType != "CONTRIBUTOR") {
      // console.log("insode user typ bidonwer ------>");
      reqObj.sheetIndex = rootScope.activeSheet;
      var assignedSheetNames = undefined;

      var isContributorData = find(rootScope.assignmentData, function (n) {
        return n.userType == "CONTRIBUTOR";
      });

      if (isEmpty(isContributorData)) {
        each(rootScope.sheetInfo, function (n, i) {
          if (!isEmpty(n)) {
            if (assignedSheetNames == undefined) {
              assignedSheetNames = n.sheetInfo.text
            } else {
              assignedSheetNames = assignedSheetNames + "," + n.sheetInfo.text
            }
          }

        });
      } else {
        var sheetInfoLength = rootScope.sheetInfo.length;
        each(rootScope.sheetInfo, function (n, i) {
          if (!isEmpty(n)) {

            var cntr = i + 1;
            var temp = find(rootScope.assignmentData, function (m) {
              return n.sheetInfo.text == m.sourceSheetName;
            })

            if (temp != undefined && cntr < sheetInfoLength) {
              if (temp.isConfirm == true) {
                assignedSheetNames = assignedSheetNames ? assignedSheetNames + "," + temp.sourceSheetName : n.sheetInfo.text;
              }
            } else if (cntr < sheetInfoLength) {
              assignedSheetNames = assignedSheetNames ? assignedSheetNames + "," + n.sheetInfo.text : n.sheetInfo.text;
            }

          }

        });
      }
      reqObj.assignedSheetNames = assignedSheetNames;
    }


    if (action == "sync") {
      var allSheetName;
      each(rootScope.sheetInfo, function (n) {
        if (!isEmpty(n)) {
          if (allSheetName == undefined) {
            allSheetName = n.sheetInfo.text
          } else {
            allSheetName = allSheetName + "," + n.sheetInfo.text
          }
        }
      });
      reqObj.allSheetName = allSheetName;
      rootScope._bidService.syncSpreadsheet(reqObj).subscribe(data => {
        this.loader = false;
        if (!isEmpty(data.data)) {
          var url = rootScope.router.url;
          this._alert.sweetSuccess("File synced successfully");
          rootScope.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
            rootScope.router.navigate([url])
          );
          this._sharedService.reviewType.emit({
            type: 'new-pricing',
          });
        } else {
          this.loader = false;
          this._alert.sweetError("Unable to sync file");
        }
      }, err => {
        this.loader = false;
        this._alert.sweetError("Unable to sync file");
      });
    } else {
      rootScope._bidService.saveExcelSheet(reqObj).subscribe(data => {
        this.loader = false;
        console.log(data, "12");
        if (!isEmpty(data.data)) {
          var url = rootScope.router.url;
          // this._alert.sweetSuccess(data.message);
          if (action == "sync") {
            this._alert.sweetSuccess("File synced successfully");
          } else {
            this._alert.sweetSuccess("File saved successfully");
          }
          this._sharedService.reviewType.emit({
            type: 'new-pricing'
          });
          rootScope.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
            rootScope.router.navigate([url])
          );
        } else {
          this.loader = false;
          if (action == "sync") {
            this._alert.sweetError("Unable to sync file");
          } else {
            this._alert.sweetError("Unable to save file");
          }
        }
      }, err => {
        console.log(err, "Ee");
        this.loader = false;
        if (action == "sync") {
          this._alert.sweetError("Unable to sync file");
        } else {
          this._alert.sweetError("Unable to save file");
        }
      });
    }


  };

  confirmSubmit() {
    this._alert.confirmed("").then(success => {
      this.loader = true;

      each(rootScope.sheetInfo, function (n, i) {
        if (!isEmpty(n))
          rootScope.lockOrUnlockSheet(i, false);
      });
      rootScope.excelObj = $("#spreadsheet").data("ejSpreadsheet");
      var exportProps = rootScope.excelObj.XLExport.getExportProps();
      // var assignedSheetNames = "3";
      var reqObj = {
        userSheetId: rootScope.sheetId + '.xlsx',
        sheetModel: exportProps.model,
        sheetData: exportProps.data,
        sheetIndex: undefined,
        masterSheetId: undefined,
        assignedSheetNames: undefined,
        // action: action,
        userType: rootScope.userType,
        company_id: rootScope.bidInfo.company_id,
        bid_id: rootScope.bidInfo.bid_id,
        name: rootScope.bidInfo.name,
        contributor: rootScope.user.username,
        bid_owner: rootScope.bidInfo.user_id,
        user_id: rootScope.user.user_id
      };

      if (rootScope.masterSheetId) {
        reqObj.masterSheetId = rootScope.masterSheetId + ".xlsx";
      }

      if (rootScope.userType == "CONTRIBUTOR") {
        reqObj.sheetIndex = rootScope.activeSheet;
        var assignedSheetNames = undefined;
        each(rootScope.assignmentData, function (n) {
          if (assignedSheetNames == undefined && n.isConfirm == false) {
            assignedSheetNames = n.sourceSheetName
          } else {
            if (n.isConfirm == false)
              assignedSheetNames = assignedSheetNames + "," + n.sourceSheetName
          }
        });
        reqObj.assignedSheetNames = (assignedSheetNames).toString();
      }
      rootScope._bidService.mergeWithMaster(reqObj).subscribe(data => {
        this.loader = false;
        if (!isEmpty(data.data)) {
          var url = rootScope.router.url;
          // this._alert.sweetSuccess(data.message);
          this._alert.sweetSuccess("File saved successfully");
          rootScope.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
            rootScope.router.navigate([url]));
          // notify other users
          var refreshObj = {
            company_id: this.user.company_id,
            bid_id: this.bid_id,
            module: undefined,
            sub_module: "SOLUTION_PRICING",
            page: "sheet"
          }
          this._sharedService.reviewType.emit({
            type: 'new-pricing'
          });
          // this._sharedService.reloadSheet.emit({reload:true});
          // this._bidService.refreshContent(refreshObj).subscribe(resp => {
          // }, cancel => {
          // });
        } else {
          this.loader = false;
          this._alert.sweetError("Unable to save file");
        }
      }, err => {
        this.loader = false;
        this._alert.sweetError("Unable to save file");
      });
    }, cancel => {
      return false;
    })

  }


  // ================= save excel file logic ends ===========//

  //---------- sheet assignment logic -----------------//

  sheetNamesArray = [];
  getAllSheetNames() {
    rootScope.sheetNamesArray = [];
    each(rootScope.sheetInfo, function (n) {
      if (!isEmpty(n)) {
        rootScope.sheetNamesArray.push(n.sheetInfo.text);
      }
    });
  };

  //Add contributor
  addAssignRow() {
    this.assignmentData.push({ 'user_id': undefined, sheetIndex: undefined, sourceSheetName: undefined, isConfirm: undefined, isWorkDone: undefined, userType: undefined, isShow: true });
  };

  //Remove contributor
  deleteAssignRow(i) {
    // let index = this.assignmentData.indexOf(i);
    this.assignmentData.splice(i, 1);
  }
  // validateAssignment(assignmentData) {
  //   let validate = true;
  //   assignmentData.forEach(element => {
  //     if (element.sourceSheetName == undefined ||
  //       element.user_id == undefined) {
  //       validate = false;
  //     }
  //   });
  //   return validate;
  // }


  //sheet assignment
  assignSheet = function (assignmentData) {
    this._alert.added("").then(success => {
      // if (!this.validateAssignment(assignmentData)) {
      //   this._alert.sweetError("Please enter mandatory fields");
      //   return false;
      // }
      $('#myModal').modal('hide');
      this.loader = true;
      //create assigned sheet and copy sheet data from source to newly created sheet

      each(assignmentData, function (m) {
        each(rootScope.sheetInfo, function (n, i) {
          if (!isEmpty(n) && n.sheetInfo.text == m.sourceSheetName) {
            m.sheetIndex = i;
            m.isConfirm = false;
            m.userType = "CONTRIBUTOR";
            m.isWorkDone = false;
          }
        });
      });
      /**
       * need to write the code after sheetassignment
       */

      //API call for to save sheet assignment data in data base
      var exportProps = rootScope.excelObj.XLExport.getExportProps();
      var reqObj = {
        assignmentData: assignmentData,
        excelObj: {
          sheetModel: exportProps.model,
          sheetData: exportProps.data,
          masterSheetId: rootScope.masterSheetId + '.xlsx',
          userSheetId: rootScope.sheetId + '.xlsx',
        }
      }
      this._bidService.sheetAssignment(this.bid_id, rootScope.activeSheet, rootScope.sheetId, reqObj).subscribe((response) => {
        this.assignmentData = [{ 'user_id': undefined, sheetIndex: undefined, sourceSheetName: undefined, isConfirm: undefined, isWorkDone: undefined, userType: undefined, isShow: true }];
        //rootScope.saveAsFile();
        this.loader = false;
        var url = rootScope.router.url;
        rootScope.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
          rootScope.router.navigate([url]));
        // notify other users
        var refreshObj = {
          company_id: this.user.company_id,
          bid_id: this.bid_id,
          module: undefined,
          sub_module: "SOLUTION_PRICING",
          page: "sheet"
        }
        // this._sharedService.reloadSheet.emit({reload:true});
        // this._bidService.refreshContent(refreshObj).subscribe(resp => {
        // }, cancel => {
        // });
      })
    }, (error) => {
      this.loader = false;
    });

  };


  //get sheet assignment data
  lockSheetArray = [];
  currentParticipants = [];
  getSheetAssignmentData = function () {
    // console.log("rootScope.activeSheet", rootScope.activeSheet);
    var activeSheet;
    if (rootScope.activeSheet) {
      activeSheet = rootScope.activeSheet;
    } else {
      activeSheet = 1;
    }

    this._bidService.getSheetAssignmentData(this.bid_id, activeSheet, this.sheetId).subscribe((response: any) => {
      var currentSheet = this.activeSheet;
      this.excelAttachment['sheet_index'] = this.activeSheet;

      if (response.data) {
        if (response.data && response.data.cell) {
          // rootScope.assignmentData = response.data.cell;
        }

        // console.log("ootScope.assignmentData", rootScope.assignmentData);
        if (rootScope.userType == "CONTRIBUTOR" && rootScope.assignmentData.length > 0) {
          each(rootScope.assignmentData, function (n) {
            if (n.user_id == rootScope.userID) {
              rootScope.currentAssignedUser.push(n);
            }
            rootScope.lockSheetArray.push({ sheetIndex: n.sourceSheetId, user_id: n.user_id });
          });
        }
        rootScope.runLoadComplete = true;
        // console.log("rootScope.storeEvent", rootScope.storeEvent);
        rootScope.loadComplete(rootScope.storeEvent);
      } else {
        rootScope.runLoadComplete = true;
        // console.log("rootScope.storeEvent", rootScope.storeEvent);
        rootScope.loadComplete(rootScope.storeEvent);
      }
    }, (error) => {
      rootScope.runLoadComplete = true;
      // console.log("rootScope.storeEvent", rootScope.storeEvent);
      rootScope.loadComplete(rootScope.storeEvent);
    })
  }

  //Set up workbook for contributor i.e. give access to only assigned sheet otherwise lock
  setWorkbookForUser = function () {
    var sheetInfoLength = rootScope.sheetInfo.length;

    each(rootScope.sheetInfo, function (n, i) {
      if (!isEmpty(n)) {

        if (rootScope.userType == "CONTRIBUTOR") {
          var isExist = find(rootScope.assignmentData, function (p) {
            return p.sheetIndex == i;
          });
          if (isEmpty(isExist)) {
            rootScope.lockOrUnlockSheet(i, true);
            rootScope.sheetInfo[i]._showLockCellAlert = true;
            rootScope.excelObj.refreshSpreadsheet();
          } else if (!isEmpty(isExist)) {
            if (isExist.isConfirm) {
              rootScope.lockOrUnlockSheet(i, true);
              rootScope.sheetInfo[i]._showLockCellAlert = true;
              rootScope.excelObj.refreshSpreadsheet();
            } else {
              rootScope.lockOrUnlockSheet(i, false);
              rootScope.sheetInfo[i]._showLockCellAlert = false;
            }
          }
        } else if (rootScope.userType == "BID_OWNER") {
          var isLocked = false;
          if (rootScope.bidOwnerData && rootScope.bidOwnerData.isConfirm) {
            isLocked = rootScope.bidOwnerData.isConfirm;
          }

          if (isLocked == true) {
            // return false;
            rootScope.lockOrUnlockSheet(i, true);
            rootScope.sheetInfo[i]._showLockCellAlert = true;
            rootScope.excelObj.refreshSpreadsheet();
          } else {
            var isExist = find(rootScope.assignmentData, function (p) {
              return p.sheetIndex == i;
            });
            if (isEmpty(isExist)) {
              rootScope.lockOrUnlockSheet(i, false);
              rootScope.sheetInfo[i]._showLockCellAlert = false;
              rootScope.excelObj.refreshSpreadsheet();
            } else if (!isEmpty(isExist)) {
              if (isExist.isConfirm) {
                rootScope.lockOrUnlockSheet(i, false);
                rootScope.sheetInfo[i]._showLockCellAlert = false;
                rootScope.excelObj.refreshSpreadsheet();
              } else {
                rootScope.lockOrUnlockSheet(i, true);
                rootScope.sheetInfo[i]._showLockCellAlert = true;
              }
            }
          }
        } else { //For other Users
          // console.log("*************** Inside setworkbook **********");
          rootScope.lockOrUnlockSheet(i, true);
          rootScope.sheetInfo[i]._showLockCellAlert = true;
          rootScope.excelObj.refreshSpreadsheet();
        }
        // console.log("hey man!", rootScope.userType);
      }
    });

    if (rootScope.userType == "CONTRIBUTOR") {
      each(rootScope.hiddenSheets, function (n) {
        each(rootScope.sheetInfo, function (m, i) {
          if (!isEmpty(m)) {
            var matchFound = false
            if(n.sourceSheetName == rootScope.sheetInfo[i].sheetInfo.text){
              matchFound = true;
            }
            if (matchFound) {
              if (n.user_id != rootScope.user.user_id) {
                rootScope.sheetInfo[i].sheetInfo.isVisible = false;
              }else{
                rootScope.sheetInfo[i].sheetInfo.isVisible = true;
              }
            }
          }
        });
      });
    }

    // if (rootScope.userType == "CONTRIBUTOR") {
    //   each(rootScope.hiddenSheets, function (n) {
    //     if (n.user_id != rootScope.user.user_id) {
    //       rootScope.excelObj.hideSheet(n.sourceSheetName);
    //       rootScope.excelObj.refreshSpreadsheet();
    //     }
    //   });
    // }
    rootScope.excelObj.refreshSpreadsheet();
  };

  //lock or unlock sheet
  lockOrUnlockSheet = function (i, bool) {
    rootScope.sheetInfo[i].isSheetProtected = bool;
    // console.log("rootScope.sheetInfo[i]", rootScope.sheetInfo[i]);
    rootScope.excelObj.refreshSpreadsheet();
  };

  sync = function () {
    // var url = rootScope.router.url;
    // rootScope.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
    //   rootScope.router.navigate([url]));

    rootScope.saveOrConfirmExcel("sync");
  };

  disableCustomRibbonMenu = function (isDisable) {
    if (isDisable == true) {
      $("button[id=spreadsheet_Ribbon_save]").addClass('e-disable');
      $("button[id=spreadsheet_Ribbon_CONFIRM]").addClass('e-disable');
      $("button[id=spreadsheet_Ribbon_upload]").addClass('e-disable');
      if (rootScope.userType != 'BID_OWNER') {
        $("button[id=spreadsheet_Ribbon_download]").addClass('e-disable');
      }
    } else if (isDisable == false) {
      $("button[id=spreadsheet_Ribbon_save]").removeClass('e-disable');
      $("button[id=spreadsheet_Ribbon_CONFIRM]").removeClass('e-disable');
      $("button[id=spreadsheet_Ribbon_upload]").removeClass('e-disable');
      $("button[id=spreadsheet_Ribbon_download]").removeClass('e-disable');
    }

  }

  bidOwnerData;
  getAssignmentData(sheetId, userId, bid_id) {

    //set user details for header
    localStorage.setItem("pricingUserDetails", JSON.stringify({
      user_id: userId,
      sheetId: sheetId,
      bidId: bid_id,
      userType: rootScope.userType
    }));

    rootScope._bidService.getAssignmentData({
      user_id: userId,
      sheetId: sheetId,
      bidId: bid_id,
      userType: rootScope.userType
    }).subscribe(response => {
      if (response['data'] == null) {
        return;
      }
      rootScope.assignmentData = response.data.assignmentData;
      rootScope.hiddenSheets = response.data.hiddenSheets;

      if (rootScope.userType == "BID_OWNER") {
        rootScope.bidOwnerData = find(rootScope.assignmentData, function (n) {
          return n.userType == "BID_OWNER";
        });
      }
      rootScope.assignmentData = filter(rootScope.assignmentData, function (m) {
        return m.userType == "CONTRIBUTOR";
      });

      if (isEmpty(rootScope.assignmentData)) {
        rootScope.assignmentData = [{ 'user_id': undefined, sheetIndex: undefined, sourceSheetName: undefined, isConfirm: undefined, isWorkDone: undefined, userType: undefined, isShow: true }];
      } else {
        $('li#DeleteSheet.e-list').attr('style', 'display: none !important');
        $('li#RenameSheet.e-list').attr('style', 'display: none !important');
        $('li#MoveorCopy.e-list').attr('style', 'display: none !important');
        $('li#InsertSheet.e-list').attr('style', 'display: none !important');
        $('li#HideSheet.e-list').attr('style', 'display: none !important');
        $('li#UnhideSheet.e-list').attr('style', 'display: none !important');
      }

      this._sharedService.reviewType.emit({
        type: 'new-pricing'
      });

      // console.log(" from backend api", rootScope.assignmentData);
      // console.log(" from backend api hidden", rootScope.hiddenSheets);
      // console.log(" from backend api bid owner", rootScope.bidOwnerData);


      rootScope.runLoadComplete = true;
      rootScope.loadComplete(rootScope.storeEvent);
    }, err => {
      //Handle error part
    });
  };

  renameSheet() {
    var exportProps = rootScope.excelObj.XLExport.getExportProps();
    var reqObj = {
      sheetModel: exportProps.model,
      sheetData: exportProps.data,
      masterSheetId: undefined,
      contributorSheetArray: undefined
    };
    if (rootScope.masterSheetId) {
      reqObj.masterSheetId = rootScope.masterSheetId + '.xlsx';
    }
    var contributorSheetArray = [];
    each(rootScope.bidInfo.sheetIds, function (n) {
      if (n.userType == "CONTRIBUTOR") {
        contributorSheetArray.push(n.sheetId);
      }
    });

    if (!isEmpty(contributorSheetArray)) {
      reqObj.contributorSheetArray = contributorSheetArray;
      rootScope._bidService.renameSheet(reqObj).subscribe(data => {

      }, err => {

      });
    } else {
      reqObj.contributorSheetArray = [rootScope.masterSheetId];
      rootScope._bidService.renameSheet(reqObj).subscribe(data => {

      }, err => {

      });
    }
  }


  removeSheet(sheetIndex) {
    var exportProps = rootScope.excelObj.XLExport.getExportProps();
    var reqObj = {
      sheetModel: exportProps.model,
      sheetData: exportProps.data,
      masterSheetId: undefined,
      contributorSheetArray: undefined,
      sheetIndex: sheetIndex - 1
    };
    if (rootScope.masterSheetId) {
      reqObj.masterSheetId = rootScope.masterSheetId + '.xlsx';
    }
    var contributorSheetArray = [];
    each(rootScope.bidInfo.sheetIds, function (n) {
      if (n.userType == "CONTRIBUTOR") {
        contributorSheetArray.push(n.sheetId);
      }
    });


    if (!isEmpty(contributorSheetArray)) {
      reqObj.contributorSheetArray = contributorSheetArray;
      rootScope._bidService.removeSheet(reqObj).subscribe(data => {

      }, err => {
        // console.log("err while remove sheet");
      });
    }
  }

  addSheet(sheetArray) {
    var exportProps = rootScope.excelObj.XLExport.getExportProps();
    var reqObj = {
      sheetModel: exportProps.model,
      sheetData: exportProps.data,
      masterSheetId: undefined,
      contributorSheetArray: undefined,
      newSheetName: undefined
    };
    if (rootScope.masterSheetId) {
      reqObj.masterSheetId = rootScope.masterSheetId + '.xlsx';
    }
    var contributorSheetArray = [];
    each(rootScope.bidInfo.sheetIds, function (n) {
      if (n.userType == "CONTRIBUTOR") {
        contributorSheetArray.push(n.sheetId);
      }
    });
    // console.log("rootScope.sheetNamesArray", rootScope.sheetNamesArray);
    // console.log("sheetArray", sheetArray);
    each(sheetArray, function (n) {
      if (!isEmpty(n)) {
        var sheetName = find(rootScope.sheetNamesArray, function (m) {
          return m == n.sheetInfo.text;
        });

        if (isEmpty(sheetName)) {
          reqObj.newSheetName = n.sheetInfo.text;
        }
      }
    });

    if (!isEmpty(contributorSheetArray)) {
      reqObj.contributorSheetArray = contributorSheetArray;
      rootScope._bidService.addSheet(reqObj).subscribe(data => {

      }, err => {

      });
    }
  }

  copyAndMoveSheet = function (fromSheetIndex, toSheetIndex, sheetArray) {
    var exportProps = rootScope.excelObj.XLExport.getExportProps();
    var reqObj = {
      sheetModel: exportProps.model,
      sheetData: exportProps.data,
      masterSheetId: undefined,
      contributorSheetArray: undefined,
      newSheetName: undefined,
      fromSheetIndex: fromSheetIndex,
      toSheetIndex: toSheetIndex
    };
    if (rootScope.masterSheetId) {
      reqObj.masterSheetId = rootScope.masterSheetId + '.xlsx';
    }
    var contributorSheetArray = [];
    each(rootScope.bidInfo.sheetIds, function (n) {
      if (n.userType == "CONTRIBUTOR") {
        contributorSheetArray.push(n.sheetId);
      }
    });
    // console.log("rootScope.sheetNamesArray", rootScope.sheetNamesArray);
    // console.log("sheetArray", sheetArray);
    each(sheetArray, function (n) {
      if (!isEmpty(n)) {
        var sheetName = find(rootScope.sheetNamesArray, function (m) {
          return m == n.sheetInfo.text;
        });

        if (isEmpty(sheetName)) {
          reqObj.newSheetName = n.sheetInfo.text;
        }
      }
    });

    if (!isEmpty(contributorSheetArray)) {
      reqObj.contributorSheetArray = contributorSheetArray;
      rootScope._bidService.copyAndMoveSheet(reqObj).subscribe(data => {

      }, err => {

      });
    }
  };

  moveSheet = function (fromSheetIndex, toSheetIndex) {
    var exportProps = rootScope.excelObj.XLExport.getExportProps();
    var reqObj = {
      sheetModel: exportProps.model,
      sheetData: exportProps.data,
      masterSheetId: undefined,
      contributorSheetArray: undefined,
      fromSheetIndex: fromSheetIndex,
      toSheetIndex: toSheetIndex
    };
    if (rootScope.masterSheetId) {
      reqObj.masterSheetId = rootScope.masterSheetId + '.xlsx';
    }
    var contributorSheetArray = [];
    each(rootScope.bidInfo.sheetIds, function (n) {
      if (n.userType == "CONTRIBUTOR") {
        contributorSheetArray.push(n.sheetId);
      }
    });

    if (!isEmpty(contributorSheetArray)) {
      reqObj.contributorSheetArray = contributorSheetArray;
      rootScope._bidService.moveSheet(reqObj).subscribe(data => {

      }, err => {

      });
    }
  };

  hideShowToggle = function (event, index) {
    // console.log("************ hide show toggle ***********", event, index);
  }

  submitForReview = function () {
    let obj = {
      "bid_id": this.bid_id,
      "review_add": [],
      // "product_type":"pricing"
    }
    var isAllConfirmed = find(rootScope.assignmentData, function (n) {
      return n.isConfirm == false;
    });

    if (isEmpty(isAllConfirmed)) {
      this._alert.submitForPricingReview("").then(success => {
        this.submitPricingReview(obj);
      }, cancel => {
        return false;
      });
    } else {
      this._alert.submitReview("Pricing").then(success => {
        this.submitPricingReview(obj);
      }).catch(cancel => {
        return false;
      });
    }
  }

  submitPricingReview = function (obj) {
    this.loader = true
    this._bidService.postReviewData(obj).subscribe(response => {
      this.review_flag = false;
      this._shared.submitForReview.emit({ flag: false });
      // this._shared.reloadSheet.emit({reload:true});
      this._shared.mainPlusButton.emit({ reviewFlag: this.review_flag })
      // notify other users
      var refreshObj = {
        company_id: this.user.company_id,
        bid_id: this.bid_id,
        module: undefined,
        sub_module: "REVIEW"
      }
      this.loader = false;
      this._bidService.refreshContent(refreshObj).subscribe(resp => {
      }, cancel => {
      });
    }, error => {
      this.loader = false
    });
  }

}
