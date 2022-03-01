import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalDeleteUserComponent } from './approval-delete-user.component';

describe('ApprovalDeleteUserComponent', () => {
  let component: ApprovalDeleteUserComponent;
  let fixture: ComponentFixture<ApprovalDeleteUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovalDeleteUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalDeleteUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
