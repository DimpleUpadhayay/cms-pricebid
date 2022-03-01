import { NgModule } from '@angular/core';
import { BusinessUnitRoutingModule } from './business-unit-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { businessUnitComponent } from './businessUnit-list/businessUnit.component';
import { addBusinessUnitComponent } from './addBusinessUnit/addBU.component';
import { BusinessUnitViewComponent } from './viewBusinessUnit/business-unit-view.component';

@NgModule({
  imports: [
    BusinessUnitRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [businessUnitComponent, addBusinessUnitComponent, BusinessUnitViewComponent]
})
export class BusinessUnitModule { }
