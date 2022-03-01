import { NgModule } from '@angular/core';
import { CompanyRoutingModule } from './company-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { companyComponent } from './companyList/company.component';
import { addCompanyComponent } from './addCompany/addCompany.component';
import { CompanyViewComponent } from '../company-profile/company-view/company-view.component';

@NgModule({
  imports: [
    CompanyRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [companyComponent, addCompanyComponent, CompanyViewComponent],
  exports: [CompanyViewComponent]
})
export class CompanyModule { }
