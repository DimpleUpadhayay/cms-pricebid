import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClonecategoryComponent } from './clonecategory.component';

describe('ClonecategoryComponent', () => {
  let component: ClonecategoryComponent;
  let fixture: ComponentFixture<ClonecategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClonecategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClonecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
