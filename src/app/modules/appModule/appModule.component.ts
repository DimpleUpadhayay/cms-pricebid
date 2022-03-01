import { Component, OnInit, ViewChild } from '@angular/core';
import { AppModuleService } from '../../services/module.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AppModule } from '../../models/module.model';
import { ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-module',
    templateUrl: './appModule.component.html',
    styleUrls: ['./appModule.component.css'],
    providers: [AppModuleService]

})
export class AppModuleComponent implements OnInit {

    public appModule;
    public user;
    public mainModule = [{ _id: null, module_name: 'ROOT' }];
    module_id;

    constructor(public _appModuleService: AppModuleService, public router: Router,
        public _formBuilder: FormBuilder,
        public _route: ActivatedRoute) {

        this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
        // this.getParentModules();
        this.getModule();
        this.module_id = this._route.snapshot.params['id'];
        if (this.module_id)
            this.getModuleById();

        this.appModule = new AppModule();


    }

    ngOnInit() {

    }

    validate() {
        let validate = true;
        for (var element in this.appModule) {
            this.appModule[element + 'Valid'] = true;
            if (!this.appModule[element]) {
                this.appModule[element + 'Valid'] = false;
                validate = false;
            }
        }

        return validate;
    }


    validateRegex() {
        let validate = true;
        for (var element in this.appModule) {
            this.appModule[element + 'RegexValid'] = true;
            if (this.appModule[element]) {
                this.appModule[element + 'RegexValid'] = false;
                validate = false;
            };
        }

        return validate;
    }

    createModule() {

        /* if (!this.validate()) {
            return;
        } */

        // if (!this.validateRegex()) {
        //     return;
        // }
        this._appModuleService.createAppModule(this.appModule).subscribe((data: any) => {
            if (data.code === 2000) {

                this.router.navigate(['list_module']);
                //this.errorMsg = "";
                //this.users = data;
                // Calling the DT trigger to manually render the table
                //this.dtTrigger.next();
            } else if (data.code === 3005) {
                //this.errorMsg = "Ohh! It seems you are not connected with us yet";
            } else if (data.code === 401) {
                //this.users = [];
            } else if (data.code === 3012) {
                //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
            } else if (data.code === 3006) {
                //this.errorMsg = "Ohh! Invalid User."; 
            }
            setTimeout(() => {
                //this.errorMsg = "";
            }, 500);
        }, (err) => {

        })
    }

    getModule() {
        this._appModuleService.getModules({ parent_module_name: null }).subscribe(data => {
            if (data['data'] == null || data['data'] == 'null') {
                return;
            }
            if (data['code'] === 2000) {
                this.mainModule = data['data']['modules'];
                this.mainModule = [{ _id: null, module_name: 'ROOT' }, ...this.mainModule]
            }
        }, error =>{
        })
    }

    getModuleById() {
        this._appModuleService.getModuleById(this.module_id).subscribe(data => {
            if (data['data'] == null || data['data'] == 'null') {
                return;
            }
            this.appModule = data['data']['app_module'];
        }, error =>{
        })
    }
    getParentModules() {
        this._appModuleService.getParentAppModules().subscribe(data => {
            if (data['data'] == null || data['data'] == 'null') {
                return;
            }
            if (data['code'] === 2000) {
                this.mainModule = data['data'];
            }
        }, error =>{
        })
    }

}