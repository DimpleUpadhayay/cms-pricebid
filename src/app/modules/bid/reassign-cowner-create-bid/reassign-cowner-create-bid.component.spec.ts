import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignCownerCreateBidComponent } from './reassign-cowner-create-bid.component';

describe('ReassignCownerCreateBidComponent', () => {
  let component: ReassignCownerCreateBidComponent;
  let fixture: ComponentFixture<ReassignCownerCreateBidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReassignCownerCreateBidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReassignCownerCreateBidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
