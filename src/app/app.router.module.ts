import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { SignUpComponent } from './modules/signup/signup.component';
import { LoginService } from './services/login.service';
import { PermissionService } from './services/permission.service';

import { LoginRouteGuard } from './services/login-route-guard';
import { AdminRouteGuard } from './services/admin-route-guard';
import { CustomRouteGuard } from './services/custom-route-gaurd';
import { SupportRouteGaurd } from './services/support-route-gaurd';

import { approvalChainComponent } from './modules/approvalChain/ac.component';
import { approvalChainListComponent } from './modules/approvalChainList/acList.component';
import { AppModuleComponent } from './modules/appModule/appModule.component';
import { moduleListComponent } from './modules/moduleList/moduleList.component';

import { ApprovalChainViewComponent } from './modules/approval-chain-view/approval-chain-view.component';
import { ResetpasswordComponent } from './modules/resetpassword/resetpassword.component';
import { ForgotpasswordComponent } from './modules/forgotpassword/forgotpassword.component'
import { TimeLine } from './components/bidcreation/timeline/timeline.component';
import { ParsingComponent } from './components/parsing/parsing.component';
import { SalesCreateComponent } from './components/Go-Nogo/sales-create/sales-create.component';
import { BidConfirmationComponent } from './components/Go-Nogo/bid-confirmation/bid-confirmation.component';
import { IframeComponent } from './components/iframe/iframe.component';

import { BidDocumentsComponent } from './modules/bid-development/bid-documents/bid-documents.component';
import { CategoryComponent } from './modules/category/category.component';
import { CategoryListComponent } from './modules/category/categoryList/categoryList.component';
import { CategoryViewComponent } from './modules/category/categoryView/categoryView.component';
import { TypeListComponent } from './modules/Type/TypeList/typelist.component';
import { TypeComponent } from './modules/Type/Types/type.component';
import { TypeViewComponent } from './modules/Type/TypeView/typeview.component';
import { CompetitorComponent } from './components/Go-Nogo/competitor/competitor.component';
import { SofDesignComponent } from './modules/bid-development/sof-design/sof-design.component';
import { EmdDesignComponent } from './modules/bid-development/emd-design/emd-design.component';
import { EoiDesignComponent } from './modules/bid-development/eoi-design/eoi-design.component';

const appRoutes: Routes = [
  {
    path: 'login',
    loadChildren: "./modules/login/login.module#LoginModule"
    // component: LoginComponent
  },
  { path: 'signup', component: SignUpComponent },
  {
    path: 'dashboard',
    loadChildren: "./modules/dashboard/dashboard.module#DashboardModule"
    // () => import('./modules/dashboard/dashboard.module').then(mod => mod.DashboardModule)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: "competitor",
    loadChildren: "./modules/competitor/competitor.module#CompetitorModule"
    // () => import('./modules/competitor/competitor.module').then(mod => mod.CompetitorModule)
  },
  { path: 'list_module', component: moduleListComponent, canActivate: [LoginRouteGuard, SupportRouteGaurd] },
  { path: 'view/:id', component: IframeComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  {
    path: "account",
    loadChildren: "./modules/account/account.module#AccountModule"
    // () => import('./modules/account/account.module').then(mod => mod.AccountModule)
  },

  {
    path: "",
    loadChildren: "./modules/approval-dashboard/approval-dashboard.module#ApprovalDashboardModule"
    // () => import('./modules/approval-dashboard/approval-dashboard.module').then(mod => mod.ApprovalDashboardModule)
  },
  { path: 'forgotPassword', component: ForgotpasswordComponent },
  { path: 'resetpassword/:id', component: ResetpasswordComponent },
  {
    path: 'bid',

    loadChildren: "./modules/bid/bid.module#BidModule"
    // () => import('./modules/bid/bid.module').then(mod => mod.BidModule)
  },
  {
    path: 'roles',

    loadChildren: "./modules/user-role/user-role.module#UserRoleModule"
    // () => import('./modules/user-role/user-role.module').then(mod => mod.UserRoleModule)
  },
  {
    path: 'projectscope',
    loadChildren: "./modules/project-scope/project-scope.module#ProjectScopeModule"
    // () => import('./modules/project-scope/project-scope.module').then(mod => mod.ProjectScopeModule)
  },
  {
    path: 'scheduling',

    loadChildren: "./modules/scheduling/scheduling.module#SchedulingModule"
    // () => import('./modules/scheduling/scheduling.module').then(mod => mod.SchedulingModule)
  },
  {
    path: "company",
    loadChildren: "./modules/company/company.module#CompanyModule"
    // () => import('./modules/company/company.module').then(mod => mod.CompanyModule)
  },
  {
    path: "viewCompany",
    loadChildren: "./modules/company-profile/company-profile.module#CompanyProfileModule"
    // () => import('./modules/company-profile/company-profile.module').then(mod => mod.CompanyProfileModule)
  },
  {
    path: 'territory',
    loadChildren: "./modules/territory/territory.module#TerritoryModule"
    // () => import('./modules/territory/territory.module').then(mod => mod.TerritoryModule)
  },
  {
    path: 'businessUnit',

    loadChildren: "./modules/business-unit/business-unit.module#BusinessUnitModule"
    // () => import('./modules/business-unit/business-unit.module').then(mod => mod.BusinessUnitModule)
  },

  { path: 'appModule', component: AppModuleComponent, canActivate: [LoginRouteGuard, SupportRouteGaurd] },
  { path: 'appModule/:id', component: AppModuleComponent, canActivate: [LoginRouteGuard, SupportRouteGaurd] },

  { path: 'approvalChainList', component: approvalChainListComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'approvalChain', component: approvalChainComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'approvalChain/:id', component: approvalChainComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'viewApprovalChain/:id', component: ApprovalChainViewComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },






  { path: 'bid-documents/:id', component: BidDocumentsComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: 'timeline/:id', component: TimeLine, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: 'parsing/:id', component: ParsingComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: 'salescreate', component: SalesCreateComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: 'bidconfirm', component: BidConfirmationComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: 'salesOrderForm/:id', component: SofDesignComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: 'EMD/:id', component: EmdDesignComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: 'PBG/:id', component: EmdDesignComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: 'EOI/:id', component: EoiDesignComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },


  { path: 'category', component: CategoryComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'category/:id', component: CategoryComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'categoryList', component: CategoryListComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'categoryView/:id', component: CategoryViewComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },

  { path: 'type', component: TypeComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'type/:id', component: TypeComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'typeList', component: TypeListComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'typeView/:id', component: TypeViewComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },

  {
    path: "user",
    loadChildren: "./modules/user-management/user-management.module#UserManagementModule"
    // () => import('./modules/user-management/user-management.module').then(mod => mod.UserManagementModule)
  },
  {
    path: 'bid-development/sheets/:id',
    loadChildren: "./modules/spreadsheet/spreadsheet.module#SpreadsheetModule"
    // () => import('./modules/spreadsheet/spreadsheet.module').then(mod => mod.SpreadsheetModule)
  },
  {
    path: 'bid-summary/:id',
    // loadChildren: "./modules/competitor/competitor.module#CompetitorModule"
    component: CompetitorComponent, canActivate: [LoginRouteGuard, CustomRouteGuard]
  },
  {
    path: 'analysis',

    loadChildren: "./modules/bi/bi.module#BiModule"
    // () => import('./modules/bi/bi.module').then(mod => mod.BiModule)
  },
  {
    path: 'profile',
    loadChildren: "./modules/user-profile/user-profile.module#UserProfileModule"
    // () => import('./modules/user-profile/user-profile.module').then(mod => mod.UserProfileModule)
  },
  {
    path: "bid-development/:id",
    loadChildren: "./modules/bid-development/bid-development.module#BidDevelopmentModule"
    // () => import('./modules/bid-development/bid-development.module').then(mod => mod.BidDevelopmentModule)
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: [LoginRouteGuard, LoginService, PermissionService, AdminRouteGuard, CustomRouteGuard, SupportRouteGaurd]
})
export class AppRouterModule { }
