import { NgModule } from '@angular/core';

import { ProjectScopeRoutingModule } from './project-scope-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { psComponent } from './ps/ps.component';
import { psChildComponent } from './ps-child/ps.child.component';

@NgModule({
  imports: [
    FormsModule,
    ProjectScopeRoutingModule,
    SharedModule
  ],
  declarations: [psComponent, psChildComponent ]
})
export class ProjectScopeModule { }
