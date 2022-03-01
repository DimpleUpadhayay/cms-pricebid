import { Injectable, EventEmitter } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReturnStatement } from '@angular/compiler';

@Injectable()
export class BidService {
  read: boolean = false;

  statusUpdated = new EventEmitter<object>();
  rfiUpdated = new EventEmitter<object>();
  searchUpdated = new EventEmitter<object>();
  disableHeader = new EventEmitter<object>();

  private messageSource = new BehaviorSubject<string>("default msg");
  currentMessage = this.messageSource.asObservable();

  constructor(private _httpService: HttpService, public route: Router) {

  }

  isLoggedIn() {
    if (localStorage.getItem('token')) {
      return true;
    } else {
      return false;
    }
  }
  getBidData(data) {

    return this._httpService.doPost("bid/getBid", data)
  }
  getReponseReviewStatus(data) {
    return this._httpService.doPost("bid/getReponseReviewStatus", data)
  }
  getPreviousBidOfBid(data) {
    return this._httpService.doPost("bid/getPreviousBidOfBid", data)
  }
  createBid(data) {
    return this._httpService.doPost("bid/createBid", { bid_payload: data });
  }
  createBidRevision(data) {
    return this._httpService.doPost("bid/createBidRevision", { bid_payload: data });
  }
  updateBid(data) {
    return this._httpService.doPost("bid/updateBid", { bid_payload: data });
  }
  updateSubmissionDate(data) {
    return this._httpService.doPost("bid/updateSubmissionDate", { bid_payload: data });
  }
  deleteBidAttachment(data) {
    return this._httpService.doPost("bid/removedoc", data);
  }
  getBidById(id) {
    return this._httpService.doPost("bid/getBidById", { bid_id: id })
  }
  clone(data) {
    return this._httpService.doPost("bid/cloneBid", { bid_id: data.bid_id, name: data.name, bid_number: data.bid_number });
  }
  getMainData(data) {
    return this._httpService.doPost("bidDevMain/readMain", data);
  }
  searchAccount(data) {
    return this._httpService.doPost("accountInfo/read", data);
  }
  createMainData(data) {
    return this._httpService.doPost("bidDevMain/createMain", data);
    // return this._httpService.doPost("maintabbiddev/create", data);
  }
  saveMainData(data) {
    return this._httpService.doPost("bidDevMain/saveMain", data);
  }
  submitMainData(data) {
    return this._httpService.doPost("bidDevMain/submitMain", data);
  }
  removeMainData(data) {
    return this._httpService.doPost("bidDevMain/removeItem", data);
  }
  deleteMainAttachment(data) {
    return this._httpService.doPost("bidDevMain/removedocument", data)
  }
  getSolutionData(data) {
    // return this._httpService.doPost("solutionbid/readlist", data);
    return this._httpService.doPost("bidDevSolution/readSolution", data);
  }
  createSolutionData(data) {
    return this._httpService.doPost("bidDevSolution/createSolution", data);
  }
  saveSolutionData(data) {
    return this._httpService.doPost("bidDevSolution/saveAsDraft", data);
  }
  updateSolutionAttachment(data) {
    return this._httpService.doPost("bidDevSolution/submitSolution", data);
  }
  deleteSolutionData(data) {
    return this._httpService.doPost("bidDevSolution/removeItem", data);
  }
  deleteSolutionAttachment(data) {
    return this._httpService.doPost("bidDevSolution/removedocument", data);
  }
  deleteSolutionCategory(data) {
    return this._httpService.doPost("solutionbid/deleteCategory", data);
  }
  savePricingRevoke(data) {
    return this._httpService.doPost("bidDevSolution/saveRevoke", data);
  }
  submitPricingRevoke(data) {
    return this._httpService.doPost("bidDevSolution/submitRevoke", data);
  }
  getReviewData(data) {
    return this._httpService.doPost("bidDevReview/readReview", data);
  }
  postReviewData(data) {
    return this._httpService.doPost("bidDevReview/submitForReview", data);
  }
  saveAsDraftReview(data) {
    return this._httpService.doPost("bidDevReview/saveAsDraft", data);
  }
  submitReview(data) {
    return this._httpService.doPost("bidDevReview/submitReview", data);
  }

  getNonPricingReviewData(data) {
    return this._httpService.doPost("bidDevReviewNonPrice/readReview", data);
  }
  postNonPricingReviewData(data) {
    return this._httpService.doPost("bidDevReviewNonPrice/submitForReview", data);
  }
  saveAsDraftNonPricingReview(data) {
    return this._httpService.doPost("bidDevReviewNonPrice/saveAsDraft", data);
  }
  submitNonPricingReview(data) {
    return this._httpService.doPost("bidDevReviewNonPrice/submitReview", data);
  }
  ApproveReview(data) {
    return this._httpService.doPost("bidDevReviewNonPrice/submitReviewApproval", data);
  }
  // updateReviewData(data) {
  // 	return this._httpService.doPost("reviewtabbiddev/update", data);
  // }
  deleteReviewAttachment(data) {
    return this._httpService.doPost("bidDevReview/removeDocumentReview", data);
  }
  getApprovalData(data) {
    return this._httpService.doPost("approvalReqBidDev/read", data);
  }
  postApprovalData(data) {
    return this._httpService.doPost("approvalReqBidDev/create", data);
  }
  updateApprovalData(data) {
    return this._httpService.doPost("approvalReqBidDev/update", data);
  }
  deleteApprovalReqAttachment(data) {
    return this._httpService.doPost("approvalReqBidDev/removeDoc", data);
  }
  createDiscussionBoard(data) {
    return this._httpService.doPost("discussionBoard/createDiscussionBoard", data)
  }
  updateDiscussionBoard(data) {
    return this._httpService.doPost("discussionBoard/updateDiscussionBoard", data)
  }
  readDiscussionBoard(data) {
    return this._httpService.doPost("discussionBoard/readDiscussionBoard", data)
  }
  deletePSattachment(data) {
    return this._httpService.doPost("projectscope/deleteprojectscope", data);
  }

  getBidAssociatedUser(bidNumber) {
    return this._httpService.doGet("bid/getBidAssociatedUser/" + bidNumber);
  }

  addParticipants(bid_id, sheetIndex, sheetId, obj) {
    return this._httpService.doPost("bid/addParticipants/" + bid_id + "/" + sheetId + "/" + sheetIndex, obj);
  }
  revisedSheet(obj) {
    return this._httpService.doPost('spreadsheet/revisionSheet', obj);
  }

  setCellRange(obj) {
    return this._httpService.doPost("bid/setCellRange/" + obj.bid_id + "/" + obj.sheetId + "/" + obj.activeSheet, { cellRange: obj.cellRange })
  }

  sheetAssignment(bid_id, sheetIndex, sheetId, data) {
    return this._httpService.doPost("spreadsheet/sheetAssignment/" + bid_id + "/" + sheetId + "/" + sheetIndex, data);
  }

  getSheetAssignmentData(bid_id, sheetIndex, sheetId) {
    return this._httpService.doGet("spreadsheet/getSheetAssignmentData/" + bid_id + "/" + sheetId + "/" + sheetIndex);
  }
  getRfi(data) {
    return this._httpService.doPost("approvalComment/read", data)
  }
  updateRfi(data) {
    return this._httpService.doPost("approvalComment/update", data)
  }
  deleteRFIattachment(data) {
    return this._httpService.doPost("approvalReqBidDev/removeDoc", data)
  }
  // getBidDocumentData(data) {
  //   return this._httpService.doPost("BidDocs/lookupdoc", data);
  // }
  getBidDocumentData(data) {
    return this._httpService.doPost("BidDocs/lookupdoc", data);
  }

  postBidDocumentData(data) {
    return this._httpService.doPost("search/searchattachment", data);
  }
  deleteUploadedFile(data) {
    return this._httpService.doPost("uploadfiles/update", data);
  }

  downloadFile(data) {
    return this._httpService.downloadPDF("uploadfiles/download/" + data.attachment_id);
  }

  deleteReviewData(data) {
    return this._httpService.doPost("bidDevReview/removeItemReview", data);
  }
  changeMsg(msg: string) {
    this.messageSource.next(msg);
  }

  saveExcelAttachment(obj) {
    // console.log(obj);
    return this._httpService.doPost('excelAttachment/create/' + obj.bid_id + "/" + obj.sheet_id + "/" + obj.sheet_index, obj)
  }
  updateExcelAttachment(obj) {

    return this._httpService.doPost('excelAttachment/update/' + obj.bid_id + "/" + obj.sheet_id + "/" + obj.sheet_index, obj)
  }
  getExcelAttachment(obj) {
    // console.log(obj, "aaa")
    return this._httpService.doGet('excelAttachment/read/' + obj.bid_id + "/" + obj.sheet_id + "/" + obj.sheet_index)
  }
  getCompetition(data) {
    return this._httpService.doPost("BidSummary/read", data);
  }

  postCompetition(data) {
    return this._httpService.doPost("BidSummary/create", data);
  }
  updateCompetition(data) {
    return this._httpService.doPost("BidSummary/update", data)
  }
  gettimeline(data) {
    return this._httpService.doPost("search/gettimeline", data)
  }
  gettotalbid_win(data) {
    return this._httpService.doPost("search/gettotalbid_win", data)
  }
  readAccountInfo(data) {
    return this._httpService.doPost("accountInfo/read", data)
  }
  createAccountInfo(data) {
    return this._httpService.doPost("accountInfo/create", data)
  }
  updateAccountInfo(data) {
    return this._httpService.doPost("accountInfo/update", data)
  }
  getAccountById(data) {
    return this._httpService.doPost("accountInfo/getaccountByid", data)
  }
  getNotifications(data) {
    return this._httpService.doPost("notification/getNotifications", data)
  }
  updateNotification(data) {
    return this._httpService.doPost("notification/updateNotification", data)
  }
  updateNotifications(data) {
    return this._httpService.doPost("notification/updateNotifications", data)
  }
  dismissNotification(data) {
    return this._httpService.doPost("notification/dismissNotification", data)
  }
  dismissNotifications(data) {
    return this._httpService.doPost("notification/dismissNotifications", data)
  }
  bidSimilar(data) {
    return this._httpService.doPost("bidAnalysis/bidSimilar", data)
  }
  bidRecent(data) {
    return this._httpService.doPost("bidAnalysis/bidRecent", data)
  }
  competitorRead(data) {
    return this._httpService.doPost("competitior/read", data)
  }
  competitorCreate(data) {
    return this._httpService.doPost("competitior/create", data)
  }
  competitorUpdate(data) {
    return this._httpService.doPost("competitior/update", data)
  }
  getCompetitorById(data) {
    return this._httpService.doPost("competitior/getCopetitorById", data)
  }
  ValueBubbleReport(data) {
    return this._httpService.doPost("bidAnalysis/BidsOngoingBuble", data)
  }
  ValueFunnelReport(data) {
    return this._httpService.doPost("bidAnalysis/FunnelReport", data)
  }
  winLossReport(data) {
    return this._httpService.doPost("bidAnalysis/bidWonLossReportFilter", data)
  }

  getPreviousBids(data) {
    return this._httpService.doPost("bid/getPreviousBids", data)
  }

  afterApproval(data) {
    return this._httpService.doPost("bid/updateApprovalStatus", data);
  }

  refreshContent(data) {
    return this._httpService.doPost("notification/refreshContent", data)
  }

  getAssignmentData(obj) {
    return this._httpService.doPost('spreadsheet/getAssignmentData', obj);
  }

  saveExcelSheet(obj) {
    return this._httpService.doPost('spreadsheet/saveExcelSheet', obj);
  }

  mergeWithMaster(obj) {
    return this._httpService.doPost('spreadsheet/mergeWithMaster', obj);
  }

  renameSheet(obj) {
    return this._httpService.doPost('spreadsheet/renameSheet', obj);
  }

  removeSheet(obj) {
    return this._httpService.doPost('spreadsheet/removeSheet', obj);
  }

  // Proposal Tab Starts Here
  getProposalData(data) {
    return this._httpService.doPost("bidDevProposal/readProposal", data);
  }
  createProposalData(data) {
    return this._httpService.doPost("bidDevProposal/createProposal", data);
  }
  saveProposalData(data) {
    return this._httpService.doPost("bidDevProposal/saveAsDraft", data);
  }
  updateProposalAttachment(data) {
    return this._httpService.doPost("bidDevProposal/submitProposal", data);
  }
  deleteProposalData(data) {
    return this._httpService.doPost("bidDevProposal/removeItem", data);
  }
  saveProposalRevoke(data) {
    return this._httpService.doPost("bidDevProposal/saveRevoke", data);
  }
  submitProposalRevoke(data) {
    return this._httpService.doPost("bidDevProposal/submitRevoke", data);
  }
  // Not done >>>> COPY FROM SOLUTION
  deleteProposalAttachment(data) {
    return this._httpService.doPost("bidDevProposal/removedocument", data);
  }
  deleteProposalCategory(data) {
    return this._httpService.doPost("bidDevProposal/deleteCategory", data);
  }
  // Proposal-Review Tab Starts Here
  getProposalReviewData(data) {
    return this._httpService.doPost("bidDevProposalReview/readProposalReview", data);
  }
  createProposalReview(data) {
    return this._httpService.doPost("bidDevProposalReview/createProposalReview", data);
  }
  saveAsDraftProposalReview(data) {
    return this._httpService.doPost("bidDevProposalReview/saveAsDraftProposalReview", data);
  }
  submitProposalReview(data) {
    return this._httpService.doPost("bidDevProposalReview/submitProposalReview", data);
  }
  submitApprovalProposalReview(data) {
    return this._httpService.doPost("bidDevProposalReview/submitApprovalProposalReview", data);
  }
  removeItemProposalReview(data) {
    return this._httpService.doPost("bidDevProposalReview/removeItemProposalReview", data);
  }
  deleteProposalReviewAttachment(data) {
    return this._httpService.doPost("bidDevProposalReview/removedocument", data);
  }
  // TechnicalSolution Tab Starts Here
  getTechSolutionData(data) {
    return this._httpService.doPost("bidDevTechSolution/readTechSolutionDb", data);
  }
  createTechSolutionData(data) {
    return this._httpService.doPost("bidDevTechSolution/createTechSolution", data);
  }
  saveTechSolutionData(data) {
    return this._httpService.doPost("bidDevTechSolution/saveAsDraftTechSolution", data);
  }
  updateTechSolutionAttachment(data) {
    return this._httpService.doPost("bidDevTechSolution/submitTechSolution", data);
  }
  deleteTechSolutionData(data) {
    return this._httpService.doPost("bidDevTechSolution/removeItemTechSolution", data);
  }
  deleteTechSolutionAttachment(data) {
    return this._httpService.doPost("bidDevTechSolution/removedocument", data);
  }
  deleteTechSolutionCategory(data) {
    return this._httpService.doPost("bidDevTechSolution/deleteCategory", data);
  }
  saveSolutionRevoke(data) {
    return this._httpService.doPost("bidDevTechSolution/saveRevoke", data);
  }
  submitSolutionRevoke(data) {
    return this._httpService.doPost("bidDevTechSolution/submitRevoke", data);
  }
  // Technical Solution ends here
  // Risk Assessment
  createRiskAssessment(data) {
    return this._httpService.doPost("bidDevRiskAssemnet/createRiskAssement", data);
  }
  saveAsDraftRiskAssessment(data) {
    return this._httpService.doPost("bidDevRiskAssemnet/savAsDraftRiskAssement", data);
  }
  submitRiskAssessment(data) {
    return this._httpService.doPost("bidDevRiskAssemnet/submitRiskAssement", data);
  }
  removeItemRiskAssessment(data) {
    return this._httpService.doPost("bidDevRiskAssemnet/removeItemRiskAssement", data);
  }
  deleteRiskAssessmentAttachment(data) {
    return this._httpService.doPost("bidDevRiskAssemnet/removedocument", data);
  }
  readRiskAssessment(data) {
    return this._httpService.doPost("bidDevRiskAssemnet/readRiskAssement", data);
  }
  // Technical-Solution-Review Starts here
  getTechSolutionReviewData(data) {
    return this._httpService.doPost("bidDevTechSolutionReview/readTechSolutionReview", data);
  }
  createSolutionReviewData(data) {
    return this._httpService.doPost("bidDevTechSolutionReview/createTechSolReview", data);
  }
  saveAsDraftTechSolutionReview(data) {
    return this._httpService.doPost("bidDevTechSolutionReview/saveAsDraftTechSolutionReview", data);
  }
  submitTechSolutionReview(data) {
    return this._httpService.doPost("bidDevTechSolutionReview/submitTechSolution", data);
  }
  submitApprovalTechSolution(data) {
    return this._httpService.doPost("bidDevTechSolutionReview/submitApprovalTechSolution", data);
  }
  deleteTechSolutionReviewAttachment(data) {
    return this._httpService.doPost("bidDevTechSolutionReview/removedocument", data);
  }
  deleteTechSolutionReview(data) {
    return this._httpService.doPost("bidDevTechSolutionReview/removeItemTechSolReview", data);
  }
  // Technical-Solution-Review Ends here
  // Docs Required Starts Here
  getDocsRequiredData(data) {
    return this._httpService.doPost("bidDevDocRequired/read", data);
  }
  createDocsRequiredData(data) {
    return this._httpService.doPost("bidDevDocRequired/create", data);
  }
  saveAsDraftDocsRequired(data) {
    return this._httpService.doPost("bidDevDocRequired/saveAsDraft", data);
  }
  submitDocsRequired(data) {
    return this._httpService.doPost("bidDevDocRequired/submit", data);
  }
  deleteDocsRequired(data) {
    return this._httpService.doPost("bidDevDocRequired/removeItem", data);
  }
  deleteDocsRequiredAttachment(data) {
    return this._httpService.doPost("bidDevDocRequired/removedocument", data);
  }
  findManager(data) {
    return this._httpService.doPost('user/findManager', data);
  }
  addSheet(obj) {
    return this._httpService.doPost('spreadsheet/addSheet', obj);
  }

  moveSheet(obj) {
    return this._httpService.doPost('spreadsheet/moveSheet', obj);
  }

  copyAndMoveSheet(obj) {
    return this._httpService.doPost('spreadsheet/copyAndMoveSheet', obj);
  }

  syncSpreadsheet(obj) {
    return this._httpService.doPost('spreadsheet/syncSpreadsheet', obj);
  }

  getBidRevisionVersions(obj) {
    return this._httpService.doPost('BidDocs/getBidRevisionVersions', obj);
  }
  // // Public Private File Upload
  // publicPrivateUploadDocument(obj) {
  //   return this._httpService.doPost('uploadfiles/upload', obj);
  // }
  readType(data) {
    return this._httpService.doPost("type/getTypeList", data)
  }
  createType(data) {
    return this._httpService.doPost("type/createType", data)
  }
  updateType(data) {
    return this._httpService.doPost("type/updateType", data)
  }
  getTypeById(data) {
    return this._httpService.doPost("type/getTypeById", data)
  }
  readCategory(data) {
    return this._httpService.doPost("bidCategory/getCategoryList", data)
  }
  createCategory(data) {
    return this._httpService.doPost("bidCategory/createCategory", data)
  }
  updateCategory(data) {
    return this._httpService.doPost("bidCategory/updateCategory", data)
  }
  getCategoryById(data) {
    return this._httpService.doPost("bidCategory/getCategoryById", data)
  }
  getAllAssignmentDataForIndicator(data) {
    return this._httpService.doPost("spreadsheet/getAllAssignmentDataForIndicator", data)
  }
  getClone(data) {
    return this._httpService.doPost("bid/cloneCategories", data)
  }
  getPendingTask(data) {
    return this._httpService.doPost("bid/getPendingTasks", data)
  }

  // Legal Response
  getLegalData(data) {
    return this._httpService.doPost("bidDevLegal/readLegal", data)
  }
  submitLegalData(data) {
    return this._httpService.doPost("bidDevLegal/submit", data)
  }
  saveasDraftLegalData(data) {
    return this._httpService.doPost("bidDevLegal/saveAsDraft", data)
  }
  removeLegalItem(data) {
    return this._httpService.doPost("bidDevLegal/removeItem", data)
  }
  deleteLegalAttachment(data) {
    return this._httpService.doPost("bidDevLegal/removedocument", data)
  }

  // Legal REviewer
  getLegalReviewData(data) {
    return this._httpService.doPost("bidDevLegalReview/readLegalReview", data)
  }
  submitForLegalReview(data) {
    return this._httpService.doPost("bidDevLegalReview/submitForLegalReview", data)
  }
  SubmitLegalReviewData(data) {
    return this._httpService.doPost("bidDevLegalReview/submitLegalReview", data)
  }
  SaveasDraftLegalReviewData(data) {
    return this._httpService.doPost("bidDevLegalReview/saveAsDraft", data)
  }
  removeItemReview(data) {
    return this._httpService.doPost("bidDevLegalReview/removeItemReview", data)
  }
  approvalLegalReviewData(data) {
    return this._httpService.doPost("bidDevLegalReview/submitApproval", data)
  }
  deleteLegalReviewAttachment(data) {
    return this._httpService.doPost("bidDevLegalReview/removeDocumentReview", data)
  }
  getBidResponseWiseContributors(data) {
    return this._httpService.doPost("bid/getBidResponseWiseContributor", data)
  }
  submitMultipleReassignment(data) {
    return this._httpService.doPost("bid/submitMultipleBidResponseTypes", data)
  }
  dropBid(data) {
    return this._httpService.doPost("bid/updateBidDetail", data)
  }

  // BI Productivity
  getBIProductivity(data) {
    return this._httpService.doPost("biProductivity/getBIProductivity", data)
  }
  getUserProductivity(data) {
    return this._httpService.doPost("biProductivity/getUserProductivity", data)
  }
  bidsOpportunity(data) {
    return this._httpService.doPost("businessBiReport/bidsOpportunity", data)
  }
  gettypesOpportunity(data) {
    return this._httpService.doPost("businessBiReport/gettypesOpportunity", data)
  }
  getcategoryOpportunity(data) {
    return this._httpService.doPost("businessBiReport/getcategoryOpportunity", data)
  }
  getPresaleBids(data) {
    return this._httpService.doPost("businessBiReport/getPresaleBids", data)
  }


  // Docuent section

  getDocument(data) {
    return this._httpService.doPost("documentEditor/getDocument", data)
  }
  createDocument(data) {
    return this._httpService.doPost("documentEditor/createDocument", data)
  }

  documentAssignment(bid_id, document_id, page_index, data) {
    return this._httpService.doPost("documentEditor/documentAssignment/" + bid_id + "/" + document_id + "/" + page_index, data);
  }

  getDocumentAssignment(bid_id, document_id, page_index) {
    return this._httpService.doPost("documentEditor/getDocumentAssignment/" + bid_id + "/" + document_id + "/" + page_index, {});
  }
  confirmDocument(data) {
    return this._httpService.doPost("documentEditor/confirm", data);
  }
  saveDocument(bid_id, document_id, documentData) {
    return this._httpService.doPost("documentEditor/save/" + bid_id + "/" + document_id, documentData);
  }

  // Reassignment Reviewer from Create Bid
  submitReviewerReassignment(data) {
    return this._httpService.doPost("taskReassignUsers/submitReviewTasks", data)
  }

  // Reassign ReviewerCompletedList for Solution, Proposal , Pricing and Legal
  getReviewersReassignList(data) {
    return this._httpService.doPost("user/getReviewersReassignList", data)
  }

  readSofData(data) {
    return this._httpService.doPost("bidCategory/salesOrderRead", data);
  }
  createSalesOrderForm(data) {
    return this._httpService.doPost("bidCategory/createSalesOrder", data);
  }
  readSofAttachment(data) {
    return this._httpService.doPost("sales/getSofAttachments", data);
  }
  deleteSofAttachment(data) {
    return this._httpService.doPost("sales/deleteSofAttachments", data);
  }
  getSalesInfo(data) {
    return this._httpService.doPost("sales/getSofInfo", data);
  }
  createMultipleSOF(data) {
    return this._httpService.doPost("sales/createMultipleSOF", data);
  }
  readMultipleSOF(data) {
    return this._httpService.doPost("sales/readMultipleSOF", data);
  }
  // Reassign ReviewerCompletedList for Solution, Proposal , Pricing and Legal
  deleteSalesManager(data) {
    return this._httpService.doPost("taskReassignUsers/bidReassignSalesPerson", data)
  }

  getTimelineData(data){
    return this._httpService.doPost("timeline/gettimeline_data",data);
  }
}
