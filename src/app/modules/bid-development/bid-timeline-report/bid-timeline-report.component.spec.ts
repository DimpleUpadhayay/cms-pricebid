import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidTimelineReportComponent } from './bid-timeline-report.component';

describe('BidTimelineReportComponent', () => {
  let component: BidTimelineReportComponent;
  let fixture: ComponentFixture<BidTimelineReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidTimelineReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidTimelineReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
