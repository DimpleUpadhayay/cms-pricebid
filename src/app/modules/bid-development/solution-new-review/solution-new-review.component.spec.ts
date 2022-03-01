import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionNewReviewComponent } from './solution-new-review.component';

describe('SolutionNewReviewComponent', () => {
  let component: SolutionNewReviewComponent;
  let fixture: ComponentFixture<SolutionNewReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionNewReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionNewReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
