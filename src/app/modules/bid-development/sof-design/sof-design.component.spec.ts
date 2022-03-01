import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SofDesignComponent } from './sof-design.component';

describe('SofDesignComponent', () => {
  let component: SofDesignComponent;
  let fixture: ComponentFixture<SofDesignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SofDesignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SofDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
