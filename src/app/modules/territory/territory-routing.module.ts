import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { territoryComponent } from './territory-list/territory.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { AdminRouteGuard } from '../../services/admin-route-guard';
import { addTerritoryComponent } from './addTerritory/addTerritory.component';
import { TerritoryViewComponent } from './territory-view/territory-view.component';

const routes: Routes = [
  { path: 'list', component: territoryComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'create', component: addTerritoryComponent, canActivate: [LoginRouteGuard,] },
  { path: 'update/:id', component: addTerritoryComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'view/:id', component: TerritoryViewComponent, canActivate: [LoginRouteGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TerritoryRoutingModule { }
