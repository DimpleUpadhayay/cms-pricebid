import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingTaskReportComponent } from './pending-task-report.component';


describe('PendingTaskReportComponent', () => {
  let component: PendingTaskReportComponent;
  let fixture: ComponentFixture<PendingTaskReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PendingTaskReportComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingTaskReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
