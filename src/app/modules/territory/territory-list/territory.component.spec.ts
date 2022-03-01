import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { territoryComponent } from './territory.component';

describe('territoryComponent', () => {
  let component: territoryComponent;
  let fixture: ComponentFixture<territoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ territoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(territoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
