import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { BiRoutingModule } from './bi-routing.module';
import { SharedModule } from '../shared/shared.module';
import { analysisComponent } from './Analysis/analysis.component';
import { ReportsComponent } from './reports/reports.component';
import { ValueBubbleReportsComponent } from './value-bubble-report/value-bubble-report.component';
import { funnelComponent } from './funnel/funnel.component';
import { WonLossReportsComponent } from './won-loss-report/won-loss-report.component';
import { FormsModule } from '@angular/forms';
import { OpportunityComponent } from './opportunity/opportunity.component';
import { RegionComponent } from './region/region.component';
import { ProductivityComponent } from './productivity/productivity.component';
import { PendingTaskReportComponent } from './pending-task-report/pending-task-report.component';
import { TypeReportComponent } from './type-report/type-report.component';
import { CategoryReportComponent } from './category-report/category-report.component';
import { PresalesProductivityComponent } from './presales-productivity/presales-productivity.component';
import { ZingGridTableComponent } from './zing-grid-table/zing-grid-table.component';
import { PbgHistoryDataComponent } from './pbg-history-data/pbg-history-data.component';
import { FilterSofComponent } from './filter-sof/filter-sof.component';
import { FilterEoiComponent } from './filter-eoi/filter-eoi.component';

@NgModule({
  imports: [
    BiRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [analysisComponent, ReportsComponent, ValueBubbleReportsComponent, funnelComponent, WonLossReportsComponent, OpportunityComponent, RegionComponent, ProductivityComponent, PendingTaskReportComponent, TypeReportComponent, CategoryReportComponent, PresalesProductivityComponent, ZingGridTableComponent, PbgHistoryDataComponent, FilterSofComponent, FilterEoiComponent, /* ,CustomRouteGuard, LoginRouteGuard */],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BiModule { }
