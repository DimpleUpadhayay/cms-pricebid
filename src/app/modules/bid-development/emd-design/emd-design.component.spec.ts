import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmdDesignComponent } from './emd-design.component';

describe('EmdDesignComponent', () => {
  let component: EmdDesignComponent;
  let fixture: ComponentFixture<EmdDesignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmdDesignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmdDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
