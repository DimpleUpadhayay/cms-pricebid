import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeReportComponent } from './type-report.component';

describe('TypeReportComponent', () => {
  let component: TypeReportComponent;
  let fixture: ComponentFixture<TypeReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
