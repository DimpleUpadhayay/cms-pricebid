import { NgModule } from '@angular/core';

import { TerritoryRoutingModule } from './territory-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { territoryComponent } from './territory-list/territory.component';
import { addTerritoryComponent } from './addTerritory/addTerritory.component';
import { TerritoryViewComponent } from './territory-view/territory-view.component';

@NgModule({
  imports: [
    TerritoryRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [territoryComponent, addTerritoryComponent, TerritoryViewComponent]
})
export class TerritoryModule { }
