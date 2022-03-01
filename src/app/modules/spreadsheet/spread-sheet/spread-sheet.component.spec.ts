import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpreadSheetsComponent } from './spread-sheet.component';

describe('SpreadSheetsComponent', () => {
  let component: SpreadSheetsComponent;
  let fixture: ComponentFixture<SpreadSheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpreadSheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpreadSheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
