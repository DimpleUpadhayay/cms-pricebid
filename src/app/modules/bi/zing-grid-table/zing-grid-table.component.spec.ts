import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZingGridTableComponent } from './zing-grid-table.component';

describe('ZingGridTableComponent', () => {
  let component: ZingGridTableComponent;
  let fixture: ComponentFixture<ZingGridTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZingGridTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZingGridTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
