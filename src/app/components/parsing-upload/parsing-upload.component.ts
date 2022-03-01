import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { HttpService } from '../../services/http.service';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { ActivatedRoute } from '@angular/router';
import { ProjectScopeService } from '../../services/ps.service';

@Component({
  selector: 'app-parsing-upload',
  templateUrl: './parsing-upload.component.html',
  styleUrls: ['./parsing-upload.component.css'],
  providers: [HttpService]
})
export class ParsingUploadComponent implements OnInit {
  selectedFile;
  @ViewChild(AlertComponent) alert: AlertComponent;
  uploadArray = [];
  bid_id; bidData;
  files = [{
    "description": "",
    "disable": false
  }];
  flag = true;
  loader = false;

  constructor(public dialogRef: MatDialogRef<ParsingUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public httpService: HttpService, private _activeRoute: ActivatedRoute, private _psService: ProjectScopeService) {
    this.bid_id = _activeRoute.snapshot.params['id']
    // this.bidData = JSON.parse(localStorage.getItem("bidData"));
  }

  ngOnInit() {
  }

  onFileSelected(event) {
    this.selectedFile = <File>event.target.files[0];
  }

  onUpload(index) {
    this.loader = true;
    if (this.selectedFile) {
      const fd = new FormData();
      fd.append("pdf", this.selectedFile);
      fd.append("bid_id", this.bid_id);
      this._psService.uploadParsing(fd).subscribe((resp) => {
        this.loader = false;
        this.alert.sweetSuccess("File uploaded successfully");
        this.flag = false;
        this.files.forEach(item => {
          item.disable = true;
        })
        this.uploadArray.push(resp['data']);
        this.dialogRef.close(this.uploadArray);
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

  onSave() {
    this.dialogRef.close();
  }

}
