import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityRecordCreateComponent } from './authority-record-create.component';

describe('AuthorityRecordCreateComponent', () => {
  let component: AuthorityRecordCreateComponent;
  let fixture: ComponentFixture<AuthorityRecordCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorityRecordCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityRecordCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
