import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpService } from '../../services/http.service';
import { BidService } from '../../services/bid.service';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../libraries/alert/alert.component';


@Component({
  selector: 'app-solution-cell-file',
  templateUrl: './solution-cells.component.html',
  styleUrls: ['./solution-cells.component.css'],
  providers: [HttpService, BidService]
})
export class SolutionCellsComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  selectedFile: File = null;
  uploadArray = [];
  files = [{
    "cellRange": "",
    "description": "",
    "disable": false
  }];
  flag = true;
  description: string;
  bid_id;
  user; userType;
  bidData;
  disableFlag = false;
  loader = false;

  constructor(public dialogRef: MatDialogRef<SolutionCellsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public httpService: HttpService, private _bidService: BidService,
    private _activeRoute: ActivatedRoute) {
    dialogRef.disableClose = true;
    this.bid_id = localStorage.getItem("bid_id");
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.userType = this.user.user_type;
    this.bidData = JSON.parse(localStorage.getItem("bidData"));
  }

  ngOnInit() {
  }

  onAdd() {
    let obj = {
      "description": "",
      cellRange: "",
      "disable": false
    };
    this.files.push(obj);
    this.flag = true;
  }

  onSave() {
    this.dialogRef.close(this.uploadArray);
    this.uploadArray = [];
  }
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
    this._bidService.deleteUploadedFile(obj).subscribe(resp => {
      this.files.splice(index, 1);
      this.uploadArray.splice(index, 1);
      if (this.uploadArray.length == 0)
        this.onAdd()
    }, error => {
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
      fd.append("pdf", this.selectedFile);
      fd.append("bid_id", this.bidData.bid_id);
      fd.append("description", data.description);
      fd.append("cellRange", data.cellRange)
      fd.append("doc_version", this.data.doc_version ? this.data.doc_version : "0");
      fd.append("revision", this.data.doc_version ? "true" : "false");
      if (this.data == "review") {
        fd.append("type", "BID_DEV_REVIEW")
      } else if (this.data == "solution") {
        fd.append("type", "BID_DEV_SOLUTION")
      } else if (this.data == "main") {
        fd.append("type", "BID_DEV_MAIN")
      } else if (this.data == "approvalReq") {
        fd.append("type", "BID_DEV_APPROVAL")
      } else if (this.data == "BID_CREATION") {
        fd.append("type", "BID_CREATION")
      } else if (this.data == "RFI") {
        fd.append("type", "BID_DEV_RFI")
      } else if (this.data == "project_scope") {
        fd.append("type", "BID_PROJECT_SCOPE")
      } else {
        fd.append("type", this.data.type);
        fd.append("parent_id", this.data.attachment_id);
      }
      this.httpService.upload(fd).subscribe((resp) => {
        this.loader = false;
        this.alert.sweetSuccess("File uploaded successfully");
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
