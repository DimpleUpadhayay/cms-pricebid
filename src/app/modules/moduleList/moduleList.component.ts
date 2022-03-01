import { Component, OnInit } from '@angular/core';
import { AppModuleService } from '../../services/module.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-moduleList',
  templateUrl: './moduleList.component.html',
  styleUrls: ['./moduleList.component.css'],
  providers: [AppModuleService]

})
export class moduleListComponent implements OnInit {

  p = 1; // set current page to 1
  public moduleLists: any[];
  public user;
  filter;
  loader = false;
  // dtOptions: DataTables.Settings = {};
  // dtTrigger: Subject<any> = new Subject();

  constructor(public _moduleListService: AppModuleService, public router: Router,
    public _formBuilder: FormBuilder) {
    this.getAppModules();
  }

  ngOnInit() {
    this.loader = true;
  }

  getAppModules() {
    this._moduleListService.getModules({ parent_module_name: null }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      if (data['code'] == 2000) {
        this.moduleLists = data['data']['modules'];
        this.loader = false;
      }
    },
      err => {
        this.loader = false;
      });
  }

  changeDate(date) {
    return new Date(date).getDay() + '/' + (new Date(date).getMonth() + 1) + '/' + new Date(date).getFullYear();
  }

  getName(id) {
    if (!this.moduleLists || !id || this.moduleLists.length == 0) {
      return 'ROOT';
    }

    if (this.moduleLists.find(a => a._id == id)) {
      return this.moduleLists.find(a => a._id == id).name;
    }

    return 'ROOT';
  }
}
