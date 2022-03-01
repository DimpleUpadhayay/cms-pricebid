import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './main/main.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ApprovalRequiredComponent } from './approval-required/approval-required.component';
import { RfiComponent } from './rfi/rfi.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { CustomRouteGuard } from '../../services/custom-route-gaurd';
import { BidDevelopmentComponent } from './bid-development.component';
import { RiskAssessmentComponent } from './risk-assessment/risk-assessment.component';
import { ProposalComponent } from './proposal/proposal.component';
import { DocsRequiredComponent } from './docs-required/docs-required.component';
import { SolutionNewComponent } from './solution-new/solution-new.component';
import { SolutionNewReviewComponent } from './solution-new-review/solution-new-review.component';
import { ProposalReviewComponent } from './proposal-review/proposal-review.component';
import { SolnCmsComponent } from './pricing/soln-cms/soln-cms.component';
import { LegalComponent } from './legal/legal.component';
import { LegalReviewComponent } from './legal-review/legal-review.component';




const routes: Routes = [
  {
    path: '', component: BidDevelopmentComponent,
    children: [
      {
        path: '',
        redirectTo: 'mains',
        pathMatch: 'full'
      },
      { path: 'mains', component: MainComponent },
      { path: 'solution', component: SolutionNewComponent },
      { path: 'pricing', component: SolnCmsComponent },
      { path: 'pricing-review', component: ReviewsComponent },
      { path: 'solution-review', component: SolutionNewReviewComponent },
      { path: 'proposal-review', component: ProposalReviewComponent },
      {path:'legal',component:LegalComponent},
      {path:'legal-review',component:LegalReviewComponent},
      { path: 'approvalrequired', component: ApprovalRequiredComponent },
      { path: 'rfi', component: RfiComponent },
      { path: 'risk-assessment', component: RiskAssessmentComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
      { path: 'proposal', component: ProposalComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
      { path: 'docs-required', component: DocsRequiredComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
      //{ path: 'discussionBoards', component: DiscussionBoardsComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] }
    ], canActivate: [LoginRouteGuard, CustomRouteGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BidDevelopmentRoutingModule { }
