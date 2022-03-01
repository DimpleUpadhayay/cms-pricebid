import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterEoiComponent } from './filter-eoi.component';

describe('FilterEoiComponent', () => {
  let component: FilterEoiComponent;
  let fixture: ComponentFixture<FilterEoiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterEoiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterEoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
