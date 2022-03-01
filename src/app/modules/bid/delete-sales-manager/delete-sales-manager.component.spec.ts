import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSalesManagerComponent } from './delete-sales-manager.component';

describe('DeleteSalesManagerComponent', () => {
  let component: DeleteSalesManagerComponent;
  let fixture: ComponentFixture<DeleteSalesManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteSalesManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSalesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
