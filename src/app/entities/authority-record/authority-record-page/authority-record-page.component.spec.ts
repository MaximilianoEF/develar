import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityRecordPageComponent } from './authority-record-page.component';

describe('AuthorityRecordPageComponent', () => {
  let component: AuthorityRecordPageComponent;
  let fixture: ComponentFixture<AuthorityRecordPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorityRecordPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityRecordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
