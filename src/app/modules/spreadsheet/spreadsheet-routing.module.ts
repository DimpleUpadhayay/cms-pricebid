import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpreadSheetsComponent } from './spread-sheet/spread-sheet.component';

const routes: Routes = [
  { path: "", component: SpreadSheetsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpreadsheetRoutingModule { }
