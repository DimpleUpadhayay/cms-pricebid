import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { businessUnitComponent } from './businessUnit.component';

describe('businessUnitComponent', () => {
  let component: businessUnitComponent;
  let fixture: ComponentFixture<businessUnitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ businessUnitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(businessUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
