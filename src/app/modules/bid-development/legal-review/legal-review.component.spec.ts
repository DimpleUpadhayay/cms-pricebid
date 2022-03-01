import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalReviewComponent } from './legal-review.component';

describe('LegalReviewComponent', () => {
  let component: LegalReviewComponent;
  let fixture: ComponentFixture<LegalReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegalReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
