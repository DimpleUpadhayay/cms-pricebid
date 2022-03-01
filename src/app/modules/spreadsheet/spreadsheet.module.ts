import { NgModule } from '@angular/core';


// import 'syncfusion-javascript/Scripts/ej/web/ej.grid.min'
import { SpreadsheetRoutingModule } from './spreadsheet-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SpreadSheetsComponent } from './spread-sheet/spread-sheet.component';
import 'jsrender';
import 'syncfusion-javascript/Scripts/ej/web/ej.grid.min'

import { EJ_SPREADSHEET_COMPONENTS } from 'ej-angular2/src/ej/spreadsheet.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    SpreadsheetRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [SpreadSheetsComponent, EJ_SPREADSHEET_COMPONENTS]
})
export class SpreadsheetModule { }
