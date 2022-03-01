import { NgModule } from '@angular/core';
import { BidRoutingModule } from './bid-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BidComponent } from './bid/bid.component';
import { ViewbidComponent } from './viewbid/viewbid.component';

@NgModule({
  imports: [
    BidRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [BidComponent, ViewbidComponent]
})
export class BidModule { }
