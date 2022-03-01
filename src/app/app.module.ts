import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthInterceptor } from './services/interseptor.service';
import { HttpService } from './services/http.service';
import { AppRouterModule } from './app.router.module';
import { ToastOptions } from 'ng2-toastr';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { SignUpComponent } from './modules/signup/signup.component';
import { HeaderComponent } from './modules/header/header.component';
import { ResetpasswordComponent } from './modules/resetpassword/resetpassword.component';
import { ForgotpasswordComponent } from './modules/forgotpassword/forgotpassword.component'
import { approvalChainComponent } from './modules/approvalChain/ac.component';
import { approvalChainListComponent } from './modules/approvalChainList/acList.component';
import { AppModuleComponent } from './modules/appModule/appModule.component';
import { moduleListComponent } from './modules/moduleList/moduleList.component';

import 'syncfusion-javascript/Scripts/ej/web/ej.grid.min'

import { A11yModule } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { ObserversModule } from '@angular/cdk/observers';
import { OverlayModule } from '@angular/cdk/overlay';
import { PlatformModule } from '@angular/cdk/platform';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';

import { ApprovalChainViewComponent } from './modules/approval-chain-view/approval-chain-view.component';
import { TimeLine } from './components/bidcreation/timeline/timeline.component';
import { ParsingComponent } from './components/parsing/parsing.component';
import { SalesCreateComponent } from './components/Go-Nogo/sales-create/sales-create.component';
import { BidConfirmationComponent } from './components/Go-Nogo/bid-confirmation/bid-confirmation.component';
import { CompetitorComponent } from './components/Go-Nogo/competitor/competitor.component';
import { IframeComponent } from './components/iframe/iframe.component';
import { SharedService } from './services/shared.service';
import { OutsideDirective } from './outside.directive';
import { HttpModule } from '@angular/http';
import { SharedModule } from './modules/shared/shared.module';
import { CustomOption } from './libraries/alert/alert.component';
import { BidDocumentsComponent } from './modules/bid-development/bid-documents/bid-documents.component';
import { CategoryComponent } from './modules/category/category.component';
import { CategoryListComponent } from './modules/category/categoryList/categoryList.component';
import { CategoryViewComponent } from './modules/category/categoryView/categoryView.component';
import { TypeComponent } from './modules/Type/Types/type.component';
import { TypeViewComponent } from './modules/Type/TypeView/typeview.component';
import { TypeListComponent } from './modules/Type/TypeList/typelist.component';
import { MainComponent } from './modules/bid-development/main/main.component';
import { Routes, RouterModule } from '@angular/router';
import { SofDesignComponent } from './modules/bid-development/sof-design/sof-design.component';
import { EmdDesignComponent } from './modules/bid-development/emd-design/emd-design.component';
import { EoiDesignComponent } from './modules/bid-development/eoi-design/eoi-design.component';




@NgModule({
  exports: [
    A11yModule,
    BidiModule,
    ObserversModule,
    OverlayModule,
    PlatformModule,
    PortalModule,
    ScrollDispatchModule,
    CdkStepperModule,
    CdkTableModule
  ],
  declarations: []
})
export class MaterialModule { }


@NgModule({
  declarations: [
    AppComponent,
    // LoginComponent,
    SignUpComponent,
    HeaderComponent,
    ApprovalChainViewComponent,
    approvalChainComponent,
    CategoryComponent,
    CategoryListComponent,
    TypeComponent,
    TypeViewComponent,
    TypeListComponent,
    approvalChainListComponent,
    moduleListComponent,
    AppModuleComponent,
    CategoryViewComponent,
    BidDocumentsComponent,
    SofDesignComponent,
    ResetpasswordComponent,
    ForgotpasswordComponent,
    TimeLine,
    ParsingComponent,
    SalesCreateComponent,
    BidConfirmationComponent,
    CompetitorComponent,
    IframeComponent,
    OutsideDirective,
    EmdDesignComponent,
    EoiDesignComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    MatDialogModule,
    AppRouterModule,
    NgbModule.forRoot(),
    HttpClientModule,
    HttpModule,
    SharedModule,

  ],
  exports: [HeaderComponent],
  providers: [
    SharedService,
    HttpService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    { provide: ToastOptions, useClass: CustomOption },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
