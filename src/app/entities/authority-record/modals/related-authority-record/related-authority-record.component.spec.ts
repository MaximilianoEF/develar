import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedAuthorityRecordComponent } from './related-authority-record.component';

describe('RelatedAuthorityRecordComponent', () => {
  let component: RelatedAuthorityRecordComponent;
  let fixture: ComponentFixture<RelatedAuthorityRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatedAuthorityRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedAuthorityRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
