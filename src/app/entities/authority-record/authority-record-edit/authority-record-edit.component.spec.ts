import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityRecordEditComponent } from './authority-record-edit.component';

describe('AuthorityRecordEditComponent', () => {
  let component: AuthorityRecordEditComponent;
  let fixture: ComponentFixture<AuthorityRecordEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorityRecordEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityRecordEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
