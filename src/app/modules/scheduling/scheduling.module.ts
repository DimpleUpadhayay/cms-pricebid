import { NgModule } from '@angular/core';
import { SchedulingRoutingModule } from './scheduling-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

import { SchedulingComponent } from './scheduling/scheduling.component';

@NgModule({
  imports: [
    SchedulingRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [SchedulingComponent]
})
export class SchedulingModule { }
