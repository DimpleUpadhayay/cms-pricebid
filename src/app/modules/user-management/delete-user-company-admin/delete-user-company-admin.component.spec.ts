import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteUserCompanyAdminComponent } from './delete-user-company-admin.component';

describe('DeleteUserCompanyAdminComponent', () => {
  let component: DeleteUserCompanyAdminComponent;
  let fixture: ComponentFixture<DeleteUserCompanyAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteUserCompanyAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteUserCompanyAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
