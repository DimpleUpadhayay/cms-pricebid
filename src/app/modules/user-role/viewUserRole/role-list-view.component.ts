import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { AppModuleService } from '../../../services/module.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';

@Component({
  selector: 'app-role-list-view',
  templateUrl: './role-list-view.component.html',
  styleUrls: ['./role-list-view.component.css'],
  providers: [UsersService, AppModuleService]
})

export class RoleListViewComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  formSubmitted: boolean = false;
  role: any;
  moduleList: any;
  tags: any;
  user;
  role_id;

  constructor(public router: Router, public _moduleListService: AppModuleService, public _route: ActivatedRoute,
    public _UsersService: UsersService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.getAppModules();
    this.getRoleTags();
    this.role_id = this._route.snapshot.params['id'];
    if (this.role_id)
      this.getRoleById();
  }

  ngOnInit() {

  }

  getAppModules() {
    this._moduleListService.getModules({ parent_module_name: null }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        return;
      }
      if (data['code'] == 2000) {
        this.moduleList = data['data']['modules'];
        this.role.module_list = this.moduleList;
        this.role.module_list.map(data => {
          data['module_name'] = data.module_name;
          data.flag = true;
          data.read = true;
          data.write = false;
        });
      }
    });
  }

  getRoleModuleMapping(role_id) {
    let role_type = this.tags && this.tags.length > 0 ? this.tags.find(a => a.role_id == role_id).name : '';
    this.role['role_type'] = role_type;
    this._moduleListService.getRoleModuleMapping({ role_id: role_id, company_id: '0' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        return;
      }
      this.role.module_list = data['data']['role_module_mapping'];
      this.role.module_list.map(data => {
        data['module_name'] = data.module_name;
        data.flag = true;
        data.read = data.action && data.action.read ? data.action.read : data.read || false;
        data.write = data.action && data.action.write ? data.action.write : data.write || false;
        data.action = undefined;
      });
    })
  }

  getRoleById() {
    this._UsersService.getUserRoleById(this.role_id).subscribe(data => {
      this.role = data['data']['role'];
      if (this.role && this.role.role_type_id) {
        this.getRoleModuleMapping(this.role.role_type_id)
      }
      else {
        this.getRoleModuleMapping(this.role.role_id);
      }
    })
  }

  getRoleTags() {
    this._UsersService.getDefaultRoles({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        return;
      }
      this.tags = data['data']['roles'];
    })
  }

}