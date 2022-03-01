import { Component, OnInit } from '@angular/core';
import { UploadfileComponent } from '../../upload-file/upload-file.component';
import { MatDialog } from '@angular/material';
import { DownloadComponent } from '../../download/download.component';
import { variable } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-sales-create',
  templateUrl: './sales-create.component.html',
  styleUrls: ['./sales-create.component.css']
})
export class SalesCreateComponent implements OnInit {

  sales;
  attractiveness = [{
    "attract": ""
  }]
  flag = true;
  challenges = [{
    "challengeInput": ""
  }]
  formSubmitted: boolean = false;
  userType = 'SALES';

  constructor(public dialog: MatDialog, ) {
    this.sales = {
      "leadName": "",
      "leadNo": "",
      "custName": "",
      "estimateDeal": "",
      "subDate": "",
      "tenderDoc": "",
      "consultant": "",
      "territory": "",
      "buUnit": "",
      "bManager": "",
      "desc": "",
      "attach": []
    }
  }

  ngOnInit() {
  }
  onParsingDialog(): void {
    //   const dialogRef = this.dialog.open( ,{

    //   })
  }

  openDialog(): void {
    let attachment = [];
    const dialogRef = this.dialog.open(UploadfileComponent, {
      height: '300px',
       width: '850px',
    });
  }
  onDownloadDialog(): void {
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '300px',
       width: '850px',
    });
  }


  onSave() {
    this.formSubmitted = true;

  }
  onAdd() {
    let obj = {
      "attract": ""
    }
    this.attractiveness.push(obj);
  }
  onDelete(i) {
    this.attractiveness.splice(i, 1);
  }
  onAddChallenges() {
    let obj = {
      "challengeInput": ""
    }
    this.challenges.push(obj);
  }
  onDeleteChallenges(index) {
    this.challenges.splice(index, 1);
  }




}
