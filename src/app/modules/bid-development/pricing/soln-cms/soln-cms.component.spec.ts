import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolnCmsComponent } from './soln-cms.component';

describe('SolnCmsComponent', () => {
  let component: SolnCmsComponent;
  let fixture: ComponentFixture<SolnCmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolnCmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolnCmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
