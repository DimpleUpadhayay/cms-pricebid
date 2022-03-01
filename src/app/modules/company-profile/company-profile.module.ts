import { NgModule } from '@angular/core';
import { CompanyProfileRoutingModule } from './company-profile-routing.module';

import { CompanyModule } from '../company/company.module';

@NgModule({
  imports: [
    CompanyProfileRoutingModule,
    CompanyModule
  ],
  declarations: []
})
export class CompanyProfileModule { }
