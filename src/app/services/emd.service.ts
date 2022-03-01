import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Injectable()
export class EmdService {

  constructor(private _httpService: HttpService, public route: Router) { }

  // Unique Id generation for emd/eoi (CREATE)
  createEmdFormId(data) {
    return this._httpService.doPost("emdForm/createEmdForm", data)
  }

  // EMD Form POST (UPDATE EXISTING)
  updateEmdData(data) {
    return this._httpService.doPost("emdForm/updateEmdForm", data);
  }

  // Read EMD document (GET)
  readEmdData(data) {
    return this._httpService.doPost("emdForm/readEmdForm", data);
  }

  readPbgData(data) {
    return this._httpService.doPost("emdForm/readPbgForm", data);
  }

  getEmdAttachments(data) {
    return this._httpService.doPost("emdForm/getEmdAttachments", data);
  }

  deleteEmdAttachment(data) {
    return this._httpService.doPost("emdForm/deleteEmdAttachments", data);
  }

  getProjectSummaryData(data) {
    return this._httpService.doPost("emdForm/getEmdData", data);
  }

  createEoiForm(data) {
    return this._httpService.doPost("eoiForm/createEoiForm", data);
  }

  readEoiForm(data) {
    return this._httpService.doPost("eoiForm/readEoiForm", data);
  }

  deleteEoiAttachment(data) {
    return this._httpService.doPost("eoiForm/deleteEoiAttachmentsDb", data);
  }

  createMultipleEMD(data) {
    return this._httpService.doPost("emdForm/createMultipleEMD", data);
  }

  readMultipleEMD(data) {
    return this._httpService.doPost("emdForm/readMultipleEMD", data);
  }

  createMultipleEOI(data) {
    return this._httpService.doPost("eoiForm/createMultipleEOI", data);
  }

  readMultipleEOI(data) {
    return this._httpService.doPost("eoiForm/readMultipleEOI", data);
  }

  readPBGHistoryDataForExcel(data) {
    return this._httpService.doPost("emdForm/readPBGHistoryDataForExcel", data);
  }

  filterPBGHistoryData(data) {
    return this._httpService.doPost("emdForm/filterPBGHistoryData", data);
  }

  filterSOFData(data) {
    console.log("im sof service call")
    return this._httpService.doPost("sales/filterSOFData", data);
  }

  getAccountByName(data) {
    return this._httpService.doPost("accountInfo/getaccountByName", data)
  }

  filterEOIData(data) {
    console.log("im sof service call")
    return this._httpService.doPost("eoiForm/filterEOIData", data);
  }

}
