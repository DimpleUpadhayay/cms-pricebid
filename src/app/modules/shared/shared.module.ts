import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2OrderModule } from 'ng2-order-pipe';
import { NgxAutoScrollModule } from 'ngx-auto-scroll';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { ToastModule } from 'ng2-toastr';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { DndModule } from 'ng2-dnd';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDialogModule } from '@angular/material';
import { BidDetailsComponent } from '../../components/bid-details/bid-details.component';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { UploadfileComponent } from '../../components/upload-file/upload-file.component';
import { TableofcontentComponent } from "../../components/tableofcontent/tableofcontent.component";
import { DownloadComponent } from '../../components/download/download.component';
import { ParsingUploadComponent } from '../../components/parsing-upload/parsing-upload.component';
import { SolutionCellsComponent } from '../../components/solution-cells/solution-cells.component';
import { solutionCellsDownlaoadComponent } from '../../components/solution-cells-download/solution-cells-downlaod.component';
import { BidAccountInfoComponent } from '../../components/BidAccountInfo/bidAccountInfo.component';
import { CompAccountInfoComponent } from '../../components/compAccountInfo/compAccountInfo.component';
import { ViewAssignSheetComponent } from '../../components/view-assign-sheet/view-assign-sheet.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe, SafePipe, CommentPipe, NotificationPipe, searchPipe } from '../../libraries/bid.pipe';
import { CustomPipe, ReversePipe } from '../../libraries/custompipe';
import { SolutionCategoryComponent } from '../bid-development/pricing/solution-category/solution-category.component';
import { SubmissionDateComponent } from '../../components/submission-date/submission-date.component';
import { ClonecategoryComponent } from '../bid-development/clonecategory/clonecategory.component';
import { DeleteuserComponent } from '../bid/deleteuser/deleteuser.component';
import { DropbidComponent } from '../dashboard/dropbid/dropbid.component';
import { DeleteReviewerComponent } from '../bid/delete-reviewer/delete-reviewer.component';
import { DeleteUserCompanyAdminComponent } from '../user-management/delete-user-company-admin/delete-user-company-admin.component';
import { ReassignCownerCreateBidComponent } from '../bid/reassign-cowner-create-bid/reassign-cowner-create-bid.component';
import { DeleteSalesManagerComponent } from '../bid/delete-sales-manager/delete-sales-manager.component';
import { ApprovalDeleteUserComponent } from '../bid/approval-delete-user/approval-delete-user.component';
import { BidTimelineReportComponent } from '../bid-development/bid-timeline-report/bid-timeline-report.component';


export const MY_MOMENT_FORMATS = {
  parseInput: 'l LT',
  fullPickerInput: 'DD-MM-YYYY',
  datePickerInput: 'l',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedRoutingModule,
    NgxPaginationModule,
    Ng2OrderModule,
    NgxAutoScrollModule,
    NgMultiSelectDropDownModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ToastModule.forRoot(),
    TabsModule.forRoot(),
    DndModule.forRoot(),
    NgSelectModule,
    MatDialogModule
  ],

  declarations: [BidDetailsComponent, AlertComponent,
    UploadfileComponent, DownloadComponent, SolutionCategoryComponent, ParsingUploadComponent, SolutionCellsComponent, solutionCellsDownlaoadComponent, BidAccountInfoComponent, CompAccountInfoComponent, ViewAssignSheetComponent, TableofcontentComponent,
    FilterPipe,
    SafePipe,
    CustomPipe,
    ReversePipe,
    CommentPipe,
    searchPipe,
    NotificationPipe,
    SubmissionDateComponent,
    ClonecategoryComponent,
    DropbidComponent,
    DeleteuserComponent,
    DeleteReviewerComponent,
    DeleteSalesManagerComponent,
    DeleteUserCompanyAdminComponent,
    ReassignCownerCreateBidComponent,
    ApprovalDeleteUserComponent,
    BidTimelineReportComponent,
  ],
  entryComponents: [
    UploadfileComponent, DownloadComponent, SolutionCategoryComponent, ClonecategoryComponent,DropbidComponent, DeleteuserComponent, ParsingUploadComponent, SolutionCellsComponent, solutionCellsDownlaoadComponent, BidAccountInfoComponent, CompAccountInfoComponent, ViewAssignSheetComponent, SubmissionDateComponent
    , TableofcontentComponent,DeleteReviewerComponent, DeleteUserCompanyAdminComponent,ReassignCownerCreateBidComponent,DeleteSalesManagerComponent,ApprovalDeleteUserComponent,BidTimelineReportComponent
  ],
  exports: [
    CommonModule,
    SharedRoutingModule,
    NgxPaginationModule,
    Ng2OrderModule,
    NgxAutoScrollModule,
    NgMultiSelectDropDownModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ToastModule,
    TabsModule,
    DndModule,
    NgSelectModule,
    MatDialogModule,
    BidDetailsComponent,
    AlertComponent,
    UploadfileComponent, DownloadComponent, SolutionCategoryComponent, ParsingUploadComponent, SolutionCellsComponent, solutionCellsDownlaoadComponent, BidAccountInfoComponent, CompAccountInfoComponent, ViewAssignSheetComponent,
    FilterPipe,
    SafePipe,
    CustomPipe,
    ReversePipe,
    CommentPipe,
    searchPipe,
    NotificationPipe,
    SubmissionDateComponent,
    DeleteUserCompanyAdminComponent,
    ReassignCownerCreateBidComponent,
    ApprovalDeleteUserComponent,
    BidTimelineReportComponent
  ],
  providers: [
    { provide: OWL_DATE_TIME_LOCALE, useValue: MY_MOMENT_FORMATS }
  ]
})
export class SharedModule { }