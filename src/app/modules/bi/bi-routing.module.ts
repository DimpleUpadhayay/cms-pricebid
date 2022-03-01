import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { analysisComponent } from './Analysis/analysis.component';
import { ReportsComponent } from './reports/reports.component';
import { ValueBubbleReportsComponent } from './value-bubble-report/value-bubble-report.component';
import { funnelComponent } from './funnel/funnel.component';
import { WonLossReportsComponent } from './won-loss-report/won-loss-report.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { CustomRouteGuard } from '../../services/custom-route-gaurd';
import { OpportunityComponent } from './opportunity/opportunity.component';
import { RegionComponent } from './region/region.component';
import { ProductivityComponent } from './productivity/productivity.component';
import { PendingTaskReportComponent } from './pending-task-report/pending-task-report.component';
import { TypeReportComponent } from './type-report/type-report.component';
import { CategoryReportComponent } from './category-report/category-report.component';
import { PresalesProductivityComponent } from './presales-productivity/presales-productivity.component';
import { PbgHistoryDataComponent } from './pbg-history-data/pbg-history-data.component';
import { FilterEoiComponent } from './filter-eoi/filter-eoi.component';
import { FilterSofComponent } from './filter-sof/filter-sof.component';


const routes: Routes = [
  {
    path: '', component: analysisComponent,
    children: [{
      path: '',
      redirectTo: 'funnel',
      pathMatch: 'full'
    },
    { path: 'bidVolumeAnalysis', component: ReportsComponent },
    { path: 'bidsByStage', component: ValueBubbleReportsComponent },
    { path: 'funnel', component: funnelComponent },
    { path: 'wonlossreport', component: WonLossReportsComponent },
    { path: 'opportunity', component: OpportunityComponent },
    { path: 'region', component: RegionComponent },
    { path: 'productivity', component: ProductivityComponent },
    { path: 'pending-task-report', component: PendingTaskReportComponent },
    { path: 'types', component: TypeReportComponent },
    { path: 'categories', component: CategoryReportComponent },
    { path: 'presales-productivity', component: PresalesProductivityComponent },
    { path: 'pbg-historyData', component: PbgHistoryDataComponent },
    { path: 'filterSOF', component: FilterSofComponent },
    { path: 'filterEOI', component: FilterEoiComponent },

  ], canActivate: [LoginRouteGuard, CustomRouteGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BiRoutingModule { }
