import { Component, ViewChild } from '@angular/core';
import { SharedService } from './services/shared.service';
import { Router } from '@angular/router';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
const swal: SweetAlert = _swal as any;

@Component({
  selector: 'ej-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  hide;
  route;
  connection: boolean = false;
  key = false;

  constructor(public _shared: SharedService, public router: Router) {

    _shared.hideFooter.subscribe(data => {
      this.hide = data.hide ? data.hide : false;
    })

    var IDLE_TIMEOUT = 1800; //seconds
    var _idleSecondsTimer = null;
    var _idleSecondsCounter = 0;

    document.onclick = function () {
      _idleSecondsCounter = 0;
    };

    document.onmousemove = function () {
      _idleSecondsCounter = 0;
    };

    document.onkeypress = function () {
      _idleSecondsCounter = 0;
    };

    _idleSecondsCounter = window.setInterval(CheckIdleTime, 1000);

    function CheckIdleTime() {
      // // console.log(navigator.onLine)
      if (!navigator.onLine && !this.connection) {
        this.connection = true;
      }
      if (navigator.onLine && this.connection) {
        // swal("Internet connection has come");
        this.connection = false;
        this.key = false;
      }
      if (this.connection && !this.key) {
        swal("Please check Your internet connection")
          .then((value) => {
            // swal(`The returned value is: ${value}`);
            this.key = true;
          });
      }
      _idleSecondsCounter++;
      var oPanel = document.getElementById("SecondsUntilExpire");
      if (oPanel)
        oPanel.innerHTML = (IDLE_TIMEOUT - _idleSecondsCounter) + "";
      if (_idleSecondsCounter >= IDLE_TIMEOUT) {
        window.clearInterval(_idleSecondsCounter);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(["/login"]);
        _idleSecondsCounter = 0;
      }
    }

  }

}
