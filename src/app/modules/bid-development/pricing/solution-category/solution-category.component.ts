import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertComponent } from '../../../../libraries/alert/alert.component';

@Component({
  selector: 'app-solution-category',
  templateUrl: './solution-category.component.html',
  styleUrls: ['./solution-category.component.css']
})
export class SolutionCategoryComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  ViewCh
  solnCat;
  solutionCats;

  constructor(public dialogRef: MatDialogRef<SolutionCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.solutionCats = data;
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  validateCat(result) {
    let validate = true;
    if (this.solutionCats && this.solutionCats.length > 0) {
      this.solutionCats.forEach(element => {
        if (result.toUpperCase() == element.toUpperCase()) {
          validate = false;
        }
      });
    }
    return validate;
  }

  onSave() {
    if (this.solnCat && !this.validateCat(this.solnCat)) {
      this._alert.sweetError("Category name already exist");
      return false;
    } else if (!this.solnCat) {
      this._alert.sweetError("Please enter category name");
      return false;
    } else
      this.dialogRef.close(this.solnCat);
  }

  onClose() {
    this.dialogRef.close();
  }

}
