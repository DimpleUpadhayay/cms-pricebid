import { Component, OnInit, ViewChild } from '@angular/core';
import { ProjectScopeService } from '../../services/ps.service';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-parsing',
  templateUrl: './parsing.component.html',
  styleUrls: ['./parsing.component.css'],
  providers: [ProjectScopeService]
})
export class ParsingComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  data; bid_id;
  other = {
    start_page: "",
    end_page: ""
  }
  loader = false;
  // @ViewChild(psComponent) psComponent: psComponent;

  constructor(private _psService: ProjectScopeService,
    public router: Router, private _activeRoute: ActivatedRoute) {
    this.data = JSON.parse(localStorage.getItem("parsing"));
    this.bid_id = _activeRoute.snapshot.params['id']
  }

  ngOnInit() {
    // this.loader = true;
  }

  changeState() {

  }
  submit() {
    localStorage.removeItem('parsedData');
    this.loader = true;
    delete this.data[0].created_by;
    delete this.data[0].date_created;
    delete this.data[0].date_modified;
    delete this.data[0].rfp_id;
    delete this.data[0]._v;
    delete this.data[0]._id;
    this._psService.extractText(this.data[0]).subscribe(resp => {
      this.loader = false;
      resp['data'].bid_id = this.bid_id;
      // this._psService.parsedData.emit(JSON.stringify(resp['data']));
      //this._psService.changeMsg(JSON.stringify(resp['data']));
      localStorage.setItem("parsedData", JSON.stringify(resp['data']));
      let parsedData = JSON.parse(localStorage.getItem("parsedData"))
      /* this._psService.currentMessage.subscribe(msg => {
        alert(msg);
      }); */
      this.router.navigate(['projectscope', this.bid_id]);
    }, error => {
      this.loader = false;
      this.alert.sweetError("Failed");
    })
  }

}
