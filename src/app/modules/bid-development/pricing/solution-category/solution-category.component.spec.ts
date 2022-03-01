import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionCategoryComponent } from './solution-category.component';

describe('SolutionCategoryComponent', () => {
  let component: SolutionCategoryComponent;
  let fixture: ComponentFixture<SolutionCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
