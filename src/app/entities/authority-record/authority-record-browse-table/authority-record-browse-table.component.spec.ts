import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityRecordBrowseTableComponent } from './authority-record-browse-table.component';

describe('AuthorityRecordBrowseTableComponent', () => {
  let component: AuthorityRecordBrowseTableComponent;
  let fixture: ComponentFixture<AuthorityRecordBrowseTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorityRecordBrowseTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityRecordBrowseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
