import { NgModule } from '@angular/core';
import { BidDevelopmentRoutingModule } from './bid-development-routing.module';
import { SharedModule } from '../shared/shared.module';

import { FormsModule } from '@angular/forms';
import { MainComponent } from './main/main.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ApprovalRequiredComponent } from './approval-required/approval-required.component';
import { RfiComponent } from './rfi/rfi.component';
import { BidDevelopmentComponent } from './bid-development.component';
import { DiscussionBoardsComponent } from './discussion-boards/discussion-boards.component';
import { RiskAssessmentComponent } from './risk-assessment/risk-assessment.component';
import { ProposalComponent } from './proposal/proposal.component';
import { DocsRequiredComponent } from './docs-required/docs-required.component';
import { SolutionNewComponent } from './solution-new/solution-new.component';
import { SolutionNewReviewComponent } from './solution-new-review/solution-new-review.component';
import { ProposalReviewComponent } from './proposal-review/proposal-review.component';
import { SolnCmsComponent } from './pricing/soln-cms/soln-cms.component';
import { CorporateComponent } from './corporate/corporate.component';
import { DealSummaryComponent } from './deal-summary/deal-summary.component';
import { LegalReviewComponent } from './legal-review/legal-review.component';
import { LegalComponent } from './legal/legal.component';

@NgModule({
  imports: [
    BidDevelopmentRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [MainComponent, CorporateComponent, DealSummaryComponent, SolnCmsComponent, ReviewsComponent, ApprovalRequiredComponent, RfiComponent, BidDevelopmentComponent, DiscussionBoardsComponent/* , SpreadSheetsComponent, EJ_SPREADSHEET_COMPONENTS */, RiskAssessmentComponent, ProposalComponent, DocsRequiredComponent, SolutionNewComponent, SolutionNewReviewComponent, ProposalReviewComponent, LegalComponent, LegalReviewComponent],
  // exports: [SpreadSheetsComponent, EJ_SPREADSHEET_COMPONENTS]
  exports: [MainComponent, CorporateComponent, DealSummaryComponent, SolnCmsComponent, ReviewsComponent, ApprovalRequiredComponent, RfiComponent, BidDevelopmentComponent]
})
export class BidDevelopmentModule { }
