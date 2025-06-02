import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityRecordBrowseComponent } from './authority-record-browse.component';

describe('AuthorityRecordBrowseComponent', () => {
  let component: AuthorityRecordBrowseComponent;
  let fixture: ComponentFixture<AuthorityRecordBrowseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorityRecordBrowseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityRecordBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
