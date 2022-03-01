import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { BidService } from '../../services/bid.service';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css'],
  providers: [HttpService, BidService]
})

export class UploadfileComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  selectedFile: File = null;
  uploadArray = [];
  files = [{
    "description": "",
    "disable": false,
    "isPublic": false
  }];
  flag = true;
  description: string;
  bidData;
  disableFlag = false;
  user;
  level;
  isPublic = false;
  loader = false;
  bid_id: any;

  constructor(public dialogRef: MatDialogRef<UploadfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public httpService: HttpService,
    private _bidService: BidService, private _activeRoute: ActivatedRoute) {
    dialogRef.disableClose = true;
    this.bid_id = this.data.bid_id;
    this.bidData = JSON.parse(localStorage.getItem("bidData"));
    this.user = JSON.parse(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user'))['data']['user'] : ""; // user details

  }

  ngOnInit() {
  }

  onAdd() {
    let obj = {
      "description": "",
      "disable": false,
      "isPublic": false
    };
    this.files.push(obj);
    this.flag = true;
  }

  onSave() {
    // close popup and send attachment details to respective components
    this.dialogRef.close(this.uploadArray);
    this.uploadArray = [];
  }

  // delete uploaded file
  onRemove(index) {
    if (this.uploadArray.length == 0) {
      return;
    } else if (this.uploadArray.length == index) {
      this.files.pop();
      this.flag = false;
    }
    let obj = {
      "attachment_id": this.uploadArray[index].attachment_id,
      "status": "INACTIVE"
    }
    this.alert.deleted("").then(success => {
      this._bidService.deleteUploadedFile(obj).subscribe(resp => {
        this.alert.sweetSuccess("Attachment deleted successfully")
        this.files.splice(index, 1);
        this.uploadArray.splice(index, 1);
        if (this.uploadArray.length == 0)
          this.onAdd()
      }, error => {
        this.alert.sweetError("Failed to delete attachment");
      });
    }, error => {
      return;
    });
  }

  onFileSelected(event, index) {
    this.selectedFile = <File>event.target.files[0];
  }

  //doc_version = "0";
  onUpload(index) {
    this.loader = true;
    if (this.selectedFile) {
      let data = this.files[index];
      const fd = new FormData();
      let bidID = this.bid_id == "" ? "createBid" : this.bid_id;
      fd.append("pdf", this.selectedFile);
      fd.append("bid_id", bidID);
      fd.append("description", data.description);
      fd.append("doc_version", this.data.doc_version ? this.data.doc_version : "0");
      fd.append("revision", this.data.doc_version ? "true" : "false");
      fd.append("isPublic", data.isPublic ? "false" : "true");
      switch (this.user.user_type) {
        case "APPROVER": this.level = 1; break;
        case "REVIEWER": this.level = 2; break;
        case "BID_OWNER": this.level = 3; break;
        case "CONTRIBUTOR": this.level = 4; break;
      }
      fd.append("level", this.level);
      // to know that, attached doc belongs to which module
      if (this.data.type == "review") {
        fd.append("type", "BID_DEV_REVIEW")
      } else if (this.data.type == "solution") {
        fd.append("type", "BID_DEV_SOLUTION")
      } else if (this.data.type == "main") {
        fd.append("type", "BID_DEV_MAIN")
      } else if (this.data.type == "approvalReq") {
        fd.append("type", "BID_DEV_APPROVAL")
      } else if (this.data.type == "BID_CREATION") {
        fd.append("type", "BID_CREATION")
      } else if (this.data.type == "RFI") {
        fd.append("type", "BID_DEV_RFI")
      } else if (this.data.type == "project_scope") {
        fd.append("type", "BID_PROJECT_SCOPE")
      } else if (this.data.type == "risk-assessment") {
        fd.append("type", "BID_DEV_RISK")
      } else if (this.data.type == "docReq") {
        fd.append("type", "BID_DEV_DOCREQ")
      } else if (this.data.type == "solution-new") {
        fd.append("type", "BID_DEV_TECHSOL")
      } else if (this.data.type == "solution-new-review") {
        fd.append("type", "BID_DEV_TECHSOL_REVIEW")
      } else if (this.data.type == "proposal") {
        fd.append("type", "BID_DEV_PROPOSAL")
      } else if (this.data.type == "proposal-review") {
        fd.append("type", "BID_DEV_PROPOSAL_REVIEW")
      } else if (this.data.type == "legal") {
        fd.append("type", "BID_DEV_LEGAL")
      } else if (this.data.type == "legal-review") {
        fd.append("type", "BID_DEV_LEGAL_REVIEW")
      } else if (this.data.type == "WIN_LOSS_SUMMARY") {
        fd.append("type", "WIN_LOSS_SUMMARY")
      } else {
        fd.append("type", this.data.type);
        fd.append("parent_id", this.data.attachment_id);
      }
      this.httpService.upload(fd).subscribe((resp) => {
        this.loader = false;
        this.alert.sweetSuccess("File uploaded successfully");
        this.selectedFile = null;
        this.flag = false;
        this.files.forEach(item => {
          item.disable = true;
        })
        this.uploadArray.push(resp['data']);
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

}
