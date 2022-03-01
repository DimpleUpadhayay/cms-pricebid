import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresalesProductivityComponent } from './presales-productivity.component';

describe('PresalesProductivityComponent', () => {
  let component: PresalesProductivityComponent;
  let fixture: ComponentFixture<PresalesProductivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresalesProductivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresalesProductivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
