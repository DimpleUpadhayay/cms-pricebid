import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSofComponent } from './filter-sof.component';

describe('FilterSofComponent', () => {
  let component: FilterSofComponent;
  let fixture: ComponentFixture<FilterSofComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterSofComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterSofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
