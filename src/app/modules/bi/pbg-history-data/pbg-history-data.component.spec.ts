import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PbgHistoryDataComponent } from './pbg-history-data.component';

describe('PbgHistoryDataComponent', () => {
  let component: PbgHistoryDataComponent;
  let fixture: ComponentFixture<PbgHistoryDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PbgHistoryDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PbgHistoryDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
