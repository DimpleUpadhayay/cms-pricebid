import { NgModule } from '@angular/core';
import { CompetitorRoutingModule } from './competitor-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

import { CompetitorDetailComponent } from './competitorDetail/competitor-detail.component';
import { AddcompetitorDetailComponent } from './addCompetitorDetail/addcompetitor-detail.component';
import { ViewCompetitorDetailComponent } from './viewCompetitorDetail/view-competitor-detail.component';

@NgModule({
  imports: [
    CompetitorRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [CompetitorDetailComponent, AddcompetitorDetailComponent, ViewCompetitorDetailComponent],
  exports: [CompetitorDetailComponent, AddcompetitorDetailComponent, ViewCompetitorDetailComponent]
})
export class CompetitorModule { }
