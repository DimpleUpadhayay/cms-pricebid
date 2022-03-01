import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsRequiredComponent } from './docs-required.component';

describe('DocsRequiredComponent', () => {
  let component: DocsRequiredComponent;
  let fixture: ComponentFixture<DocsRequiredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocsRequiredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocsRequiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
