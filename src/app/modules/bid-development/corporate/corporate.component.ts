import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-corporate',
  templateUrl: './corporate.component.html',
  styleUrls: ['./corporate.component.css'],
  providers: []
})

export class CorporateComponent implements OnInit {
  risks = [{
    "riskInput": ""
  }]

  constructor() {

  }
  ngOnInit() {
  }
  trackByFn(index: any, item: any) {
    return index;
  }
  onAdd() {
    let obj = {
      "riskInput": ""
    }
    this.risks.push(obj);
  }
  onDelete(index) {
    if (this.risks.length == 1) {
      return
    }
    this.risks.splice(index, 1);
  }
}
